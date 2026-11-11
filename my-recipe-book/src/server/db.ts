import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { User, Recipe } from '../types';

interface DatabaseSchema {
  users: Record<string, User>; // email -> User
  sessions: Record<string, { token: string; userId: string; expiresAt: number }>; // token -> Session
  otps: Record<string, { otp: string; name?: string; expiresAt: number; attempts: number }>; // email -> OTP
  savedRecipes: Record<string, Recipe[]>; // userId -> Recipe[]
  cachedRecipes: Record<string, Recipe>; // id -> Recipe
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      users: {},
      sessions: {},
      otps: {},
      savedRecipes: {},
      cachedRecipes: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Failed to parse database file, resetting to initial state:', err);
    const initialDb: DatabaseSchema = {
      users: {},
      sessions: {},
      otps: {},
      savedRecipes: {},
      cachedRecipes: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
}

function saveDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// User & OTP helpers
export function setOtp(email: string, name: string | undefined, otp: string, ttlMs = 10 * 60 * 1000): void {
  const db = ensureDbFile();
  const normalizedEmail = email.toLowerCase().trim();
  db.otps[normalizedEmail] = {
    otp,
    name: name?.trim(),
    expiresAt: Date.now() + ttlMs,
    attempts: 0,
  };
  saveDb(db);
}

export function getOtp(email: string): { otp: string; name?: string; expiresAt: number; attempts: number } | null {
  const db = ensureDbFile();
  const normalizedEmail = email.toLowerCase().trim();
  const record = db.otps[normalizedEmail];
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    delete db.otps[normalizedEmail];
    saveDb(db);
    return null;
  }
  return record;
}

export function verifyAndConsumeOtp(email: string, otp: string): { valid: boolean; user?: User; error?: string } {
  const db = ensureDbFile();
  const normalizedEmail = email.toLowerCase().trim();
  const record = db.otps[normalizedEmail];

  if (!record) {
    return { valid: false, error: 'OTP has expired or was not requested. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    delete db.otps[normalizedEmail];
    saveDb(db);
    return { valid: false, error: 'OTP has expired. Please request a new code.' };
  }

  if (record.otp.trim() !== otp.trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      delete db.otps[normalizedEmail];
      saveDb(db);
      return { valid: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
    }
    saveDb(db);
    return { valid: false, error: 'Incorrect verification code. Please check and try again.' };
  }

  // OTP verified! Clean up OTP record
  const userName = record.name || normalizedEmail.split('@')[0] || 'Chef';
  delete db.otps[normalizedEmail];

  let user = db.users[normalizedEmail];
  if (!user) {
    user = {
      id: 'usr_' + crypto.randomUUID().slice(0, 8),
      name: userName,
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    };
    db.users[normalizedEmail] = user;
  } else if (record.name && record.name !== user.name) {
    user.name = record.name;
    db.users[normalizedEmail] = user;
  }

  saveDb(db);
  return { valid: true, user };
}

// Session helpers (Persistent 30 days)
export function createSession(userId: string, ttlDays = 30): string {
  const db = ensureDbFile();
  const token = 'sess_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  db.sessions[token] = { token, userId, expiresAt };
  saveDb(db);
  return token;
}

export function getUserByToken(token: string): User | null {
  if (!token) return null;
  const db = ensureDbFile();
  const session = db.sessions[token];
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    delete db.sessions[token];
    saveDb(db);
    return null;
  }

  const user = Object.values(db.users).find((u) => u.id === session.userId);
  return user || null;
}

export function removeSession(token: string): void {
  const db = ensureDbFile();
  if (db.sessions[token]) {
    delete db.sessions[token];
    saveDb(db);
  }
}

// Saved Recipes helpers
export function getUserSavedRecipes(userId: string): Recipe[] {
  const db = ensureDbFile();
  return db.savedRecipes[userId] || [];
}

export function toggleUserSavedRecipe(userId: string, recipe: Recipe): { isSaved: boolean; list: Recipe[] } {
  const db = ensureDbFile();
  if (!db.savedRecipes[userId]) {
    db.savedRecipes[userId] = [];
  }

  const existingIndex = db.savedRecipes[userId].findIndex((r) => r.id === recipe.id);
  let isSaved = false;
  if (existingIndex >= 0) {
    db.savedRecipes[userId].splice(existingIndex, 1);
    isSaved = false;
  } else {
    db.savedRecipes[userId].unshift({ ...recipe, isSaved: true });
    isSaved = true;
  }

  saveDb(db);
  return { isSaved, list: db.savedRecipes[userId] };
}

// Cached AI recipes
export function cacheRecipe(recipe: Recipe): void {
  const db = ensureDbFile();
  db.cachedRecipes[recipe.id] = recipe;
  saveDb(db);
}

export function getCachedRecipe(id: string): Recipe | null {
  const db = ensureDbFile();
  return db.cachedRecipes[id] || null;
}
