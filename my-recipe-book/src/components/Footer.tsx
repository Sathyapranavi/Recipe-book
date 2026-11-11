import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { LanguageCode } from '../types';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useAuth();

  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div>
            <span className="text-xl font-serif font-bold text-white tracking-tight">
              {t.brandTitle}
            </span>
            <p className="text-xs text-stone-400 mt-1 max-w-md">
              {t.brandTagline}
            </p>
          </div>

          {/* Quick navigation */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.navHome}
            </button>
            <button
              onClick={() => onNavigate('search')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.navSearch}
            </button>
            <button
              onClick={() => onNavigate('recipes')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.navRecipes}
            </button>
            <button
              onClick={() => onNavigate('saved')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.navMySaved}
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.navAbout}
            </button>
          </div>
        </div>

        {/* Multilingual language bar in footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('language-select')}
              className="text-stone-300 hover:text-white underline font-medium cursor-pointer"
            >
              {t.navChangeLang}:
            </button>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  language === lang.code
                    ? 'bg-stone-800 text-amber-300 font-semibold'
                    : 'hover:text-stone-200'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-stone-500">
            © {new Date().getFullYear()} {t.brandTitle}. All recipes presented with love and precision.
          </div>
        </div>
      </div>
    </footer>
  );
};
