import React, { useState } from 'react';
import { Recipe } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Clock,
  Users,
  Bookmark,
  Share2,
  Printer,
  CheckCircle2,
  ChefHat,
  Timer,
  Flame,
} from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  isSaved = false,
  onToggleSave,
}) => {
  const { t } = useAuth();
  const [portionScale, setPortionScale] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copyFeedback, setCopyFeedback] = useState(false);

  if (!recipe) return null;

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to adjust number in quantity string according to portionScale
  const scaleQuantity = (quantityStr: string, scale: number): string => {
    if (scale === 1) return quantityStr;
    return quantityStr.replace(/(\d+(?:\.\d+)?|\d+\/\d+)/g, (match) => {
      if (match.includes('/')) {
        const [num, den] = match.split('/').map(Number);
        const val = (num / den) * scale;
        return val % 1 === 0 ? val.toString() : val.toFixed(1);
      }
      const val = parseFloat(match) * scale;
      return val % 1 === 0 ? val.toString() : val.toFixed(1);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Modal Header / Close bar */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-bold text-stone-900 tracking-wide">
              {recipe.cuisine || t.brandTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(recipe)}
                className={`p-2 rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                  isSaved
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
                title={isSaved ? t.savedInBook : t.saveToBook}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? t.savedInBook : t.saveToBook}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title={t.shareRecipe}
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Print Recipe"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors cursor-pointer ml-2"
              aria-label={t.closeBtn}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {copyFeedback && (
          <div className="bg-amber-500 text-white text-xs py-1.5 px-4 text-center font-medium animate-in fade-in">
            {t.linkCopied}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Top Hero Section: Title & High-res photo */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 leading-tight">
                {recipe.title}
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                {recipe.description}
              </p>

              {/* Cooking Time Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-400 mb-0.5">
                    <Timer className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t.prepTimeLabel}</span>
                  </div>
                  <span className="text-sm font-bold text-stone-800 tabular-nums">
                    {recipe.prepTime || '15 mins'}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-400 mb-0.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.cookTimeLabel}</span>
                  </div>
                  <span className="text-sm font-bold text-stone-800 tabular-nums">
                    {recipe.cookTime || '25 mins'}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-stone-400 mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-stone-700" />
                    <span>{t.totalTimeLabel}</span>
                  </div>
                  <span className="text-sm font-bold text-stone-900 tabular-nums">
                    {recipe.totalTime || '40 mins'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-100">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/hero_culinary_spread_1794373141298.jpg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-stone-200" />

          {/* Ingredients & Instructions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Ingredients Column (5 cols) */}
            <div className="lg:col-span-5 bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    {t.ingredientsHeader}
                  </h3>
                  <span className="text-xs text-stone-500 tabular-nums">
                    {recipe.ingredients.length} items
                  </span>
                </div>

                {/* Portion Scale Selector */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 text-xs font-semibold">
                  <span className="text-[10px] text-stone-400 px-1">{t.scaleLabel}</span>
                  {[1, 2, 3].map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setPortionScale(scale)}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        portionScale === scale
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {scale}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients List */}
              <ul className="divide-y divide-stone-200/80 text-xs sm:text-sm">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="py-2.5 flex items-baseline justify-between gap-3">
                    <span className="text-stone-800 font-medium">{ing.item}</span>
                    <span className="text-stone-500 tabular-nums text-right shrink-0 font-mono">
                      {scaleQuantity(ing.quantity, portionScale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation Steps Column (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  {t.instructionsHeader}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Click steps as you complete them to track your progress while cooking.
                </p>
              </div>

              <div className="space-y-4">
                {recipe.instructions.map((step, idx) => {
                  const isDone = !!completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3.5 items-start ${
                        isDone
                          ? 'bg-stone-50 border-stone-200 opacity-60'
                          : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-700 border border-stone-300'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </button>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                          {t.stepPrefix} {idx + 1}
                        </span>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isDone ? 'line-through text-stone-500' : 'text-stone-800'
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>{recipe.title}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
