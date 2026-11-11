export type LanguageCode = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'mr' | 'bn';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  preferredLanguage?: LanguageCode;
}

export interface Ingredient {
  item: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  cuisine?: string; // e.g. "South Indian", "Italian", "Mughlai" - NEVER meal category
  difficulty?: 'Easy' | 'Medium' | 'Advanced';
  ingredients: Ingredient[];
  instructions: string[];
  matchedIngredients?: string[];
  source?: 'curated' | 'ai';
  isSaved?: boolean;
}

export interface SearchParams {
  query?: string;
  ingredients?: string[];
  language?: LanguageCode;
}
