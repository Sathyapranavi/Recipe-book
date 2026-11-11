/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SearchSection } from './components/SearchSection';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { LanguageSelectionPage } from './components/LanguageSelectionPage';
import { Recipe } from './types';
import { Sparkles, Bookmark, ChefHat, RefreshCw, AlertCircle } from 'lucide-react';

const LOCAL_SAVED_KEY = 'recipe_book_saved_local';

function MainAppContent() {
  const { user, token, isAuthenticated, language, openAuthModal, t } = useAuth();

  const [activeSection, setActiveSection] = useState<'home' | 'search' | 'recipes' | 'saved' | 'about' | 'language-select'>('home');
  const [curatedRecipes, setCuratedRecipes] = useState<Recipe[]>([]);
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // 1. Fetch initial curated recipes
  useEffect(() => {
    async function loadCurated() {
      try {
        const res = await fetch('/api/recipes/curated');
        const data = await res.json();
        if (data.recipes) {
          setCuratedRecipes(data.recipes);
          setRecipesList(data.recipes);
        }
      } catch (err) {
        console.error('Failed to load curated recipes:', err);
      }
    }
    loadCurated();
  }, []);

  // 2. Load saved recipes for user (or from localStorage for guests)
  useEffect(() => {
    async function loadSaved() {
      if (isAuthenticated && token) {
        try {
          const res = await fetch('/api/user/saved-recipes', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.recipes) {
            setSavedRecipes(data.recipes);
            return;
          }
        } catch (err) {
          console.error('Failed to load server saved recipes:', err);
        }
      }

      // Fallback local saved
      try {
        const local = localStorage.getItem(LOCAL_SAVED_KEY);
        if (local) {
          setSavedRecipes(JSON.parse(local));
        }
      } catch (e) {
        console.error('Failed to load local saved recipes:', e);
      }
    }
    loadSaved();
  }, [isAuthenticated, token]);

  // Handle Recipe Search (by name or by ingredients)
  const handleSearch = async (params: { query?: string; ingredients?: string[] }) => {
    setIsLoading(true);
    setErrorMessage('');
    setHasSearched(true);
    setActiveSection('search');

    try {
      const res = await fetch('/api/recipes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: params.query,
          ingredients: params.ingredients,
          language: language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to search recipes.');
      }

      setRecipesList(data.recipes || []);
    } catch (err: any) {
      console.error('Search failed:', err);
      setErrorMessage(err.message || 'Unable to load recipes right now.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Save Recipe in personal book
  const handleToggleSave = async (recipe: Recipe) => {
    const isCurrentlySaved = savedRecipes.some((r) => r.id === recipe.id);
    let updated: Recipe[] = [];

    if (isCurrentlySaved) {
      updated = savedRecipes.filter((r) => r.id !== recipe.id);
    } else {
      updated = [{ ...recipe, isSaved: true }, ...savedRecipes];
    }
    setSavedRecipes(updated);
    localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(updated));

    // If authenticated, sync with server
    if (isAuthenticated && token) {
      try {
        await fetch('/api/user/toggle-saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipe }),
        });
      } catch (err) {
        console.error('Server sync error for saved recipe:', err);
      }
    } else if (!isCurrentlySaved) {
      // Gently remind user they can register/sign in for permanent cloud sync
      // but their recipe is still safely saved locally!
    }
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-200">
      {/* Header */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        savedCount={savedRecipes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: HOME */}
        {activeSection === 'home' && (
          <div className="space-y-12">
            <Hero
              onSearchSubmit={(query) => handleSearch({ query })}
              onExploreClick={() => {
                const el = document.getElementById('featured-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onIngredientsClick={() => {
                const el = document.getElementById('search-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <SearchSection
              onSearch={handleSearch}
              isLoading={isLoading}
              activeIngredients={activeIngredients}
              setActiveIngredients={setActiveIngredients}
            />

            {/* Featured Recipes Section */}
            <section id="featured-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                    {t.curatedHeading}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                    {t.curatedSubheading}
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('recipes')}
                  className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline self-start sm:self-auto cursor-pointer"
                >
                  {t.heroExploreBtn} &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {curatedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={(r) => setSelectedRecipe(r)}
                    isSaved={savedRecipes.some((s) => s.id === recipe.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            </section>

            <AboutSection />
          </div>
        )}

        {/* VIEW 2: SEARCH */}
        {activeSection === 'search' && (
          <div className="space-y-12 pb-16">
            <SearchSection
              onSearch={handleSearch}
              isLoading={isLoading}
              activeIngredients={activeIngredients}
              setActiveIngredients={setActiveIngredients}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Results Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-stone-200">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    {t.resultsTitle}
                  </h2>
                  <span className="text-xs text-stone-500 tabular-nums">
                    ({recipesList.length} {t.resultsCount})
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-stone-700 animate-spin mx-auto" />
                  <p className="text-sm font-medium text-stone-700">{t.searchingMsg}</p>
                </div>
              )}

              {/* Recipe Results Grid */}
              {!isLoading && recipesList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-8">
                  {recipesList.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onSelect={(r) => setSelectedRecipe(r)}
                      isSaved={savedRecipes.some((s) => s.id === recipe.id)}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              )}

              {/* No Results Fallback */}
              {!isLoading && recipesList.length === 0 && (
                <div className="py-16 text-center max-w-md mx-auto space-y-3">
                  <ChefHat className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="text-lg font-serif font-bold text-stone-800">
                    {t.noResultsTitle}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t.noResultsSubtitle}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: ALL RECIPES */}
        {activeSection === 'recipes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="border-b border-stone-200 pb-6">
              <h2 className="text-3xl font-serif font-bold text-stone-900">
                {t.navRecipes}
              </h2>
              <p className="text-sm text-stone-600 mt-1 max-w-2xl">
                Explore our entire library of culinary recipes with authentic cooking steps, ingredients, and flavor profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {recipesList.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={(r) => setSelectedRecipe(r)}
                  isSaved={savedRecipes.some((s) => s.id === recipe.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: SAVED RECIPES */}
        {activeSection === 'saved' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-serif font-bold text-stone-900">
                  {t.navMySaved}
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  Your hand-picked collection of recipes saved for quick access anytime.
                </p>
              </div>

              {!isAuthenticated && (
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Sign In to Sync Across Devices
                </button>
              )}
            </div>

            {savedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {savedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={(r) => setSelectedRecipe(r)}
                    isSaved={true}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center max-w-md mx-auto space-y-4">
                <Bookmark className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-stone-800">
                  No saved recipes yet
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Browse our recipes and click the bookmark icon on any dish to save it here for easy reference in your kitchen.
                </p>
                <button
                  onClick={() => handleNavigate('recipes')}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {t.heroExploreBtn}
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: ABOUT */}
        {activeSection === 'about' && (
          <div>
            <AboutSection />
          </div>
        )}

        {/* VIEW 6: LANGUAGE SELECTION PAGE (Immediately after login or when Change Language is clicked) */}
        {activeSection === 'language-select' && (
          <LanguageSelectionPage
            onContinue={() => {
              setActiveSection('recipes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        isSaved={selectedRecipe ? savedRecipes.some((s) => s.id === selectedRecipe.id) : false}
        onToggleSave={handleToggleSave}
      />

      {/* Auth Modal (One-time registration & OTP verification) */}
      <AuthModal
        onLoginSuccess={() => {
          setActiveSection('language-select');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
