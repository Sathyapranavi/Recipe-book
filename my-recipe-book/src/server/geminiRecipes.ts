import { GoogleGenAI, Type } from '@google/genai';
import { Recipe, LanguageCode } from '../types';
import crypto from 'node:crypto';

// Server-side initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  te: 'Telugu (తెలుగు)',
  hi: 'Hindi (हिन्दी)',
  ta: 'Tamil (தமிழ்)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
};

// Curated high quality food photos for dish families to ensure 100% reliable, zero broken images
const DISH_IMAGE_MAP: Record<string, string> = {
  biryani: '/src/assets/images/featured_biryani_pot_1794373141234.jpg',
  pasta: '/src/assets/images/featured_fresh_pasta_1794373142655.jpg',
  dosa: '/src/assets/images/featured_crispy_dosa_1794373141938.jpg',
  curry: '/src/assets/images/hero_culinary_spread_1794373141298.jpg',
  paneer: '/src/assets/images/hero_culinary_spread_1794373141298.jpg',
  dal: '/src/assets/images/hero_culinary_spread_1794373141298.jpg',
  default: '/src/assets/images/hero_culinary_spread_1794373141298.jpg',
};

function selectFoodImage(title: string, cuisine?: string): string {
  const lower = (title + ' ' + (cuisine || '')).toLowerCase();
  if (lower.includes('biryani') || lower.includes('pulao') || lower.includes('rice')) {
    return DISH_IMAGE_MAP.biryani;
  }
  if (lower.includes('pasta') || lower.includes('noodle') || lower.includes('spaghetti') || lower.includes('fettuccine')) {
    return DISH_IMAGE_MAP.pasta;
  }
  if (lower.includes('dosa') || lower.includes('crepe') || lower.includes('cheela') || lower.includes('roti') || lower.includes('bread')) {
    return DISH_IMAGE_MAP.dosa;
  }
  if (lower.includes('curry') || lower.includes('paneer') || lower.includes('gravy') || lower.includes('masala') || lower.includes('korma')) {
    return DISH_IMAGE_MAP.curry;
  }
  return DISH_IMAGE_MAP.default;
}

export async function generateRecipesWithAI(params: {
  query?: string;
  ingredients?: string[];
  language?: LanguageCode;
}): Promise<Recipe[]> {
  const { query, ingredients, language = 'en' } = params;
  const langName = LANGUAGE_NAMES[language] || 'English';

  const userPrompt = [
    query ? `Dish or food search query: "${query}"` : '',
    ingredients && ingredients.length > 0 ? `Available ingredients: ${ingredients.join(', ')}` : '',
    `Target Language for recipe title, description, ingredients, quantities, and instructions: ${langName}`,
  ]
    .filter(Boolean)
    .join('\n');

  const systemInstruction = `
You are a master world-class chef and culinary encyclopedia.
The user wants complete, authentic, gourmet recipes matching their food query or available pantry ingredients.

CRITICAL INSTRUCTIONS:
1. Provide 2 to 4 distinct, authentic recipes that either match the requested dish or make creative, delicious use of the provided ingredients.
2. Every recipe must have:
   - title: Name of the dish (in ${langName}).
   - description: 1-2 mouth-watering sentences describing texture, aroma, and flavor.
   - prepTime: e.g. "15 mins"
   - cookTime: e.g. "25 mins"
   - totalTime: e.g. "40 mins"
   - servings: realistic integer number of servings (e.g. 2, 3, or 4).
   - cuisine: Regional or style heritage (e.g. "Italian", "Mughlai", "South Indian", "Mexican", "Lebanese").
   - difficulty: "Easy", "Medium", or "Advanced".
   - ingredients: List of all ingredients with accurate culinary quantities (grams, ml, cups, tsp, tbsp, pieces).
   - instructions: Clear, sequential numbered step-by-step preparation steps explaining cooking technique, heat level, and visual cues.
3. STRICT POLICY: NEVER display or include any meal-category labels such as "breakfast", "lunch", "dinner", "brunch", or "supper" in any property.
4. Output must be in ${langName}. If ${langName} is not English, write the recipe title, ingredient names, quantities, and steps naturally and elegantly in that native script (${langName}).
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              cookTime: { type: Type.STRING },
              totalTime: { type: Type.STRING },
              servings: { type: Type.INTEGER },
              cuisine: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                  },
                  required: ['item', 'quantity'],
                },
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'description', 'prepTime', 'cookTime', 'totalTime', 'servings', 'ingredients', 'instructions'],
          },
        },
      },
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text) as Array<{
      title: string;
      description: string;
      prepTime: string;
      cookTime: string;
      totalTime: string;
      servings: number;
      cuisine?: string;
      difficulty?: 'Easy' | 'Medium' | 'Advanced';
      ingredients: Array<{ item: string; quantity: string }>;
      instructions: string[];
    }>;

    return parsed.map((item, idx) => {
      const id = 'gen_' + crypto.randomUUID().slice(0, 8);
      return {
        id,
        title: item.title,
        description: item.description,
        prepTime: item.prepTime || '15 mins',
        cookTime: item.cookTime || '25 mins',
        totalTime: item.totalTime || '40 mins',
        servings: item.servings || 4,
        cuisine: item.cuisine || 'Home Cooking',
        difficulty: item.difficulty || 'Easy',
        ingredients: item.ingredients || [],
        instructions: item.instructions || [],
        imageUrl: selectFoodImage(item.title, item.cuisine),
        source: 'ai',
      };
    });
  } catch (err) {
    console.error('Error generating recipes via Gemini:', err);
    return [];
  }
}
