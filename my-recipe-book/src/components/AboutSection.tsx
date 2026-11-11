import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, HeartHandshake, Globe2, Leaf } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { t } = useAuth();

  return (
    <section id="about-section" className="py-16 md:py-24 bg-stone-100 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-xs font-semibold text-amber-800 tracking-wider uppercase">
            {t.aboutTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight text-balance">
            {t.aboutHeadline}
          </h2>
          <p className="text-base text-stone-600 leading-relaxed pt-2">
            {t.aboutStory1}
          </p>
          <p className="text-sm text-stone-500 leading-relaxed">
            {t.aboutStory2}
          </p>
        </div>

        {/* 3 Strategic Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              {t.feature1Title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t.feature1Desc}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              {t.feature2Title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t.feature2Desc}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-100">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              {t.feature3Title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t.feature3Desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
