import React from 'react';
import { Recipe } from '../types';
import { useAuth } from '../context/AuthContext';
import { Clock, Users, Bookmark, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  isSaved?: boolean;
  onToggleSave?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  isSaved = false,
  onToggleSave,
}) => {
  const { t } = useAuth();

  return (
    <article className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Recipe Food Image with fallback */}
      <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // graceful fallback to hero culinary spread if individual dish photo fails
            (e.target as HTMLImageElement).src = '/src/assets/images/hero_culinary_spread_1794373141298.jpg';
          }}
        />

        {/* Save to Recipe Book Button */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(recipe);
            }}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-xs ${
              isSaved
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-stone-900/40 text-white hover:bg-stone-900/60'
            }`}
            title={isSaved ? t.savedInBook : t.saveToBook}
            aria-label={isSaved ? t.savedInBook : t.saveToBook}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Cuisine overlay tag (pure geographic/style origin, NEVER meal category) */}
        {recipe.cuisine && (
          <div className="absolute bottom-2.5 left-3 px-2 py-0.5 bg-stone-900/60 backdrop-blur-xs text-[11px] font-medium text-white rounded-md">
            {recipe.cuisine}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Metadata: Cooking time & Servings (clean unboxed text with separator) */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{recipe.totalTime || recipe.cookTime}</span>
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>{recipe.servings} {t.servingsLabel.toLowerCase()}</span>
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="tabular-nums">
              {recipe.ingredients.length} items
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
            {recipe.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => onSelect(recipe)}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>{t.viewRecipe}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
