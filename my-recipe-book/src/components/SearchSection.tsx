import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, X, Sparkles, ChefHat, RefreshCw } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (params: { query?: string; ingredients?: string[] }) => void;
  isLoading: boolean;
  activeIngredients: string[];
  setActiveIngredients: React.Dispatch<React.SetStateAction<string[]>>;
}

const COMMON_PANTRY_INGREDIENTS = [
  'Tomato',
  'Onion',
  'Garlic',
  'Potato',
  'Ginger',
  'Paneer',
  'Rice',
  'Spinach',
  'Cheese',
  'Chicken',
  'Egg',
  'Mushroom',
  'Cumin',
  'Butter',
];

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  isLoading,
  activeIngredients,
  setActiveIngredients,
}) => {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState<'name' | 'ingredients'>('name');
  const [dishQuery, setDishQuery] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');

  const handleDishSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dishQuery.trim()) {
      onSearch({ query: dishQuery.trim() });
    }
  };

  const handleAddIngredient = (ingName?: string) => {
    const target = (ingName || ingredientInput).trim();
    if (!target) return;
    if (!activeIngredients.some((i) => i.toLowerCase() === target.toLowerCase())) {
      const updated = [...activeIngredients, target];
      setActiveIngredients(updated);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    const updated = activeIngredients.filter((i) => i.toLowerCase() !== ing.toLowerCase());
    setActiveIngredients(updated);
  };

  const handleIngredientSearch = () => {
    if (activeIngredients.length > 0) {
      onSearch({ ingredients: activeIngredients });
    }
  };

  const handleClear = () => {
    setDishQuery('');
    setActiveIngredients([]);
    onSearch({});
  };

  return (
    <section id="search-section" className="py-12 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            {t.searchTitle}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {t.searchSubtitle}
          </p>
        </div>

        {/* Tab Controls (Segmented Control) */}
        <div className="max-w-md mx-auto mb-8 p-1 bg-stone-100 rounded-xl flex items-center border border-stone-200/80">
          <button
            onClick={() => setActiveTab('name')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'name'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.tabByName}
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ingredients'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.tabByIngredients}
          </button>
        </div>

        {/* Tab 1: Search by Recipe Name */}
        {activeTab === 'name' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <form onSubmit={handleDishSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={dishQuery}
                  onChange={(e) => setDishQuery(e.target.value)}
                  placeholder={t.searchByNamePlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-400"
                />
                <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              <button
                type="submit"
                disabled={isLoading || !dishQuery.trim()}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>{t.searchBtn}</span>
                )}
              </button>
            </form>

            {/* Quick dish inspiration pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
              <span className="text-stone-400 font-medium">{t.popularIngredients}</span>
              {['Chicken Biryani', 'Creamy Pasta', 'Masala Dosa', 'Paneer Butter Masala', 'Thai Green Curry', 'Dal Tadka'].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setDishQuery(item);
                      onSearch({ query: item });
                    }}
                    className="px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer border border-stone-200"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Ingredient-Based Search */}
        {activeTab === 'ingredients' && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Input & Add Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                  placeholder={t.searchByIngPlaceholder}
                  className="w-full pl-4 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-400"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddIngredient()}
                disabled={!ingredientInput.trim()}
                className="px-5 py-3 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 border border-stone-300 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addIngredientBtn}</span>
              </button>
            </div>

            {/* Popular Ingredients Quick Add */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-stone-500">{t.popularIngredients}</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PANTRY_INGREDIENTS.map((ing) => {
                  const isSelected = activeIngredients.some(
                    (i) => i.toLowerCase() === ing.toLowerCase()
                  );
                  return (
                    <button
                      key={ing}
                      type="button"
                      onClick={() => handleAddIngredient(ing)}
                      disabled={isSelected}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1 border ${
                        isSelected
                          ? 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Plus className="w-3 h-3 text-stone-400" />
                      <span>{ing}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Ingredients Tags */}
            {activeIngredients.length > 0 && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    {t.ingredientsSelected} ({activeIngredients.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveIngredients([])}
                    className="text-stone-500 hover:text-stone-900 underline cursor-pointer"
                  >
                    {t.clearBtn}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeIngredients.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-medium"
                    >
                      <span>{ing}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing)}
                        className="p-0.5 hover:text-amber-300 rounded cursor-pointer"
                        aria-label={`Remove ${ing}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleIngredientSearch}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.searchingMsg}</span>
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4" />
                        <span>{t.searchBtn}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="py-3 px-4 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {t.clearBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Non-restrictive dynamic search note */}
        <div className="max-w-xl mx-auto mt-6 text-center">
          <p className="text-[11px] text-stone-400 italic">
            {t.searchAnyFoodNote}
          </p>
        </div>
      </div>
    </section>
  );
};
