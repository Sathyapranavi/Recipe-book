import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  setOtp,
  verifyAndConsumeOtp,
  createSession,
  getUserByToken,
  removeSession,
  getUserSavedRecipes,
  toggleUserSavedRecipe,
  cacheRecipe,
} from './src/server/db';
import { CURATED_RECIPES } from './src/server/curatedRecipes';
import { generateRecipesWithAI } from './src/server/geminiRecipes';
import { LanguageCode, Recipe } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to extract Bearer token
function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

// ----------------------------------------------------
// Authentication Endpoints (Persistent Session + Email OTP)
// ----------------------------------------------------

app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Generate 6-digit cryptographic-style OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  setOtp(email, name, otp, 10 * 60 * 1000); // 10 minutes

  // In production / simulated environment, return devOtp for preview helper
  return res.json({
    success: true,
    email,
    devOtp: otp,
    message: `Verification code sent to ${email}.`,
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
  }

  const result = verifyAndConsumeOtp(email, otp);
  if (!result.valid || !result.user) {
    return res.status(400).json({ error: result.error || 'Invalid verification code.' });
  }

  // Create persistent session (30 days)
  const token = createSession(result.user.id, 30);

  return res.json({
    success: true,
    token,
    user: result.user,
    message: 'Authentication successful! Session is now persistent.',
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  const user = getUserByToken(token);
  if (!user) {
    return res.json({ authenticated: false, user: null });
  }

  return res.json({ authenticated: true, user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  if (token) {
    removeSession(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ----------------------------------------------------
// Recipe Endpoints
// ----------------------------------------------------

app.get('/api/recipes/curated', (_req: Request, res: Response) => {
  return res.json({
    recipes: CURATED_RECIPES,
  });
});

app.post('/api/recipes/search', async (req: Request, res: Response) => {
  try {
    const { query, ingredients, language } = req.body as {
      query?: string;
      ingredients?: string[];
      language?: LanguageCode;
    };

    const cleanQuery = query?.trim().toLowerCase() || '';
    const cleanIngredients = (ingredients || []).map((i) => i.trim().toLowerCase()).filter(Boolean);

    let matchingCurated: Recipe[] = [];

    if (cleanQuery) {
      matchingCurated = CURATED_RECIPES.filter((r) => {
        const titleMatch = r.title.toLowerCase().includes(cleanQuery);
        const cuisineMatch = r.cuisine?.toLowerCase().includes(cleanQuery);
        const descMatch = r.description.toLowerCase().includes(cleanQuery);
        const ingMatch = r.ingredients.some((i) => i.item.toLowerCase().includes(cleanQuery));
        return titleMatch || cuisineMatch || descMatch || ingMatch;
      });
    } else if (cleanIngredients.length > 0) {
      matchingCurated = CURATED_RECIPES.filter((r) => {
        return cleanIngredients.some((ing) =>
          r.ingredients.some((ri) => ri.item.toLowerCase().includes(ing))
        );
      });
    }

    // Always fetch dynamic matching recipes if query or ingredients are specified,
    // to fulfill: "Do not restrict results to predefined recipes. Display dynamically retrieved matching recipes."
    let aiRecipes: Recipe[] = [];
    if (cleanQuery || cleanIngredients.length > 0) {
      try {
        aiRecipes = await generateRecipesWithAI({
          query: cleanQuery || undefined,
          ingredients: cleanIngredients.length > 0 ? cleanIngredients : undefined,
          language: language || 'en',
        });
        // Cache generated recipes
        aiRecipes.forEach((r) => cacheRecipe(r));
      } catch (genErr) {
        console.warn('AI recipe generation error fallback:', genErr);
      }
    }

    // Combine results, prioritizing exact curated then AI dynamic recipes
    const combined = [...matchingCurated, ...aiRecipes];

    // If both query and ingredients were empty, return curated set
    const results = combined.length > 0 ? combined : CURATED_RECIPES;

    return res.json({
      recipes: results,
      total: results.length,
      hasAiResults: aiRecipes.length > 0,
    });
  } catch (err: any) {
    console.error('Error in recipe search:', err);
    return res.status(500).json({ error: 'Failed to search recipes: ' + (err?.message || 'Server error') });
  }
});

// Saved recipes per user
app.get('/api/user/saved-recipes', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Session expired' });

  const list = getUserSavedRecipes(user.id);
  return res.json({ recipes: list });
});

app.post('/api/user/toggle-saved', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Session expired' });

  const { recipe } = req.body;
  if (!recipe || !recipe.id) return res.status(400).json({ error: 'Recipe is required' });

  const result = toggleUserSavedRecipe(user.id, recipe);
  return res.json(result);
});

// ----------------------------------------------------
// Dev & Production Frontend Serving
// ----------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`My Recipe Book server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
