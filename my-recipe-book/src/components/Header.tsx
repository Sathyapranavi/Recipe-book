import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { Globe, User as UserIcon, LogOut, Bookmark, Menu, X, ChevronDown } from 'lucide-react';
import { LanguageCode } from '../types';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, savedCount }) => {
  const { user, isAuthenticated, language, setLanguage, logout, openAuthModal, t } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleNavClick = (section: string) => {
    onNavigate(section);
    setIsMobileMenuOpen(false);
  };

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-2xl font-serif font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-amber-700 transition-colors cursor-pointer text-left"
        >
          {t.brandTitle}
        </button>

        {/* Zone 2: Navigation Links (Single-line, quiet typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => handleNavClick('home')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeSection === 'home' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            {t.navHome}
          </button>
          <button
            onClick={() => handleNavClick('search')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeSection === 'search' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            {t.navSearch}
          </button>
          <button
            onClick={() => handleNavClick('recipes')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeSection === 'recipes' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            {t.navRecipes}
          </button>
          <button
            onClick={() => handleNavClick('language-select')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeSection === 'language-select' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>{t.navChangeLang}</span>
          </button>
          <button
            onClick={() => handleNavClick('saved')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeSection === 'saved' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{t.navMySaved}</span>
            {savedCount > 0 && (
              <span className="text-xs bg-stone-200 text-stone-800 rounded-full px-1.5 py-0.2 font-mono">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeSection === 'about' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : 'hover:text-stone-900'
            }`}
          >
            {t.navAbout}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 border border-stone-200"
              title={t.navChangeLang}
              aria-label={t.navChangeLang}
            >
              <Globe className="w-3.5 h-3.5 text-stone-600" />
              <span>{currentLang.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {isLangOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setIsLangOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                  {t.navChangeLang}
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        language === lang.code
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-[11px] text-stone-400">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Profile / Sign In */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-stone-900 truncate max-w-[130px]">
                  {user.name}
                </span>
                <span className="text-[11px] text-stone-500 truncate max-w-[130px]">
                  {user.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                title={t.navSignOut}
                aria-label={t.navSignOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t.navSignIn}</span>
            </button>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-5 space-y-2 animate-in fade-in">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'home' ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t.navHome}
          </button>
          <button
            onClick={() => handleNavClick('search')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'search' ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t.navSearch}
          </button>
          <button
            onClick={() => handleNavClick('recipes')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'recipes' ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t.navRecipes}
          </button>
          <button
            onClick={() => handleNavClick('language-select')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'language-select' ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t.navChangeLang}
          </button>
          <button
            onClick={() => handleNavClick('saved')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
              activeSection === 'saved' ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>{t.navMySaved}</span>
            {savedCount > 0 && (
              <span className="text-xs bg-stone-300 text-stone-800 rounded-full px-2 py-0.5 font-mono">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeSection === 'about' ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t.navAbout}
          </button>
        </div>
      )}
    </header>
  );
};
