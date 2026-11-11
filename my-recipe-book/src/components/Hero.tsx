import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Sparkles, ChefHat } from 'lucide-react';

interface HeroProps {
  onSearchSubmit: (query: string) => void;
  onExploreClick: () => void;
  onIngredientsClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearchSubmit, onExploreClick, onIngredientsClick }) => {
  const { user, t } = useAuth();
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
    }
  };

  return (
    <section className="relative overflow-hidden bg-stone-100 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-18">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 tracking-wide uppercase">
              <ChefHat className="w-4 h-4 text-amber-700" />
              <span>{user ? `${t.welcomeUser} ${user.name}` : t.heroGreeting}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 leading-[1.15] text-balance">
              {t.heroHeadline}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
              {t.heroSubheadline}
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSubmit} className="relative max-w-xl">
              <div className="relative flex items-center shadow-sm">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t.heroSearchPlaceholder}
                  className="w-full pl-11 pr-28 py-3.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-400"
                />
                <Search className="w-5 h-5 text-stone-400 absolute left-3.5 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t.searchBtn}
                </button>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {t.heroExploreBtn}
              </button>
              <button
                onClick={onIngredientsClick}
                className="px-5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {t.heroByIngredientsBtn}
              </button>
            </div>
          </div>

          {/* Right Column: High-Fidelity Culinary Hero Imagery */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 aspect-4/3 lg:aspect-square bg-stone-200">
              <img
                src="/src/assets/images/hero_culinary_spread_1794373141298.jpg"
                alt="Abundant gourmet culinary spread on rustic table"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-mono tracking-widest uppercase text-amber-200">
                  {t.brandTitle}
                </span>
                <p className="text-sm font-serif italic text-stone-100 mt-1 max-w-sm">
                  {t.brandTagline}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
