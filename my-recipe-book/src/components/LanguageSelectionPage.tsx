import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { LanguageCode } from '../types';
import { Globe2, CheckCircle2, ArrowRight, ChefHat, Sparkles } from 'lucide-react';

interface LanguageSelectionPageProps {
  onContinue: () => void;
}

interface LanguageMetadata {
  code: LanguageCode;
  name: string;
  nativeName: string;
  tagline: string;
  region: string;
}

const LANGUAGE_DETAILS: LanguageMetadata[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    tagline: 'Discover delicious global recipes and step-by-step cooking guides',
    region: 'International',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    tagline: 'రుచికరమైన సాంప్రదాయ మరియు ఆధునిక వంటకాల వివరాలు',
    region: 'ఆంధ్రప్రదేశ్ & తెలంగాణ',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    tagline: 'स्वादिष्ट और प्रामाणिक व्यंजनों की आसान और संपूर्ण विधि',
    region: 'उत्तर व मध्य भारत',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    tagline: 'பாரம்பரிய சுவையும் புதுமையான உணவு குறிப்புகளும்',
    region: 'தமிழ்நாடு',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    tagline: 'ಮನೆಯಲ್ಲಿಯೇ ಸುಲಭವಾಗಿ ತಯಾರಿಸಬಹುದಾದ ಸ್ವಾದಿಷ್ಟ ಅಡುಗೆಗಳು',
    region: 'ಕರ್ನಾಟಕ',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    tagline: 'നാടൻ രുചികളും സ്വാദിഷ്ടമായ പുതിയ പാചക രീതികളും',
    region: 'കേരളം',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    tagline: 'अस्सल घरगुती चव आणि पारंपरिक महाराष्ट्रीयन खाद्यसंस्कृती',
    region: 'महाराष्ट्र',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    tagline: 'জিভে জল আনা খাঁটি ঘরোয়া ও ঐতিহ্যবাহী রান্নার সমাহার',
    region: 'পশ্চিমবঙ্গ ও ত্রিপুরা',
  },
];

export const LanguageSelectionPage: React.FC<LanguageSelectionPageProps> = ({ onContinue }) => {
  const { user, language, setLanguage, t } = useAuth();

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
  };

  const getContinueLabel = () => {
    switch (language) {
      case 'te':
        return 'వంటకాలకు వెళ్లండి';
      case 'hi':
        return 'रेसिपीज की ओर बढ़ें';
      case 'ta':
        return 'சமையல் குறிப்புகளுக்கு செல்க';
      case 'kn':
        return 'ಅಡುಗೆಗಳಿಗೆ ಮುಂದುವರಿಯಿರಿ';
      case 'ml':
        return 'വിഭവങ്ങളിലേക്ക് പോകുക';
      case 'mr':
        return 'पाककृतींकडे पुढे जा';
      case 'bn':
        return 'রেসিপিতে এগিয়ে যান';
      default:
        return 'Continue to Recipes';
    }
  };

  return (
    <div className="min-h-[85vh] bg-stone-100 py-12 md:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        {/* Header Greeting */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <Globe2 className="w-4 h-4 text-amber-700" />
            <span>
              {user ? `Welcome, ${user.name}` : 'Welcome to My Recipe Book'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight text-balance">
            Choose Your Cooking Language
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            Select your preferred language. You can browse authentic recipes, search ingredients, and read cooking instructions in your chosen mother tongue.
          </p>
        </div>

        {/* 8 Language Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LANGUAGE_DETAILS.map((item) => {
            const isSelected = language === item.code;
            return (
              <div
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                  isSelected
                    ? 'bg-white border-stone-900 shadow-md ring-2 ring-stone-900/10'
                    : 'bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white shadow-xs'
                }`}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 text-stone-900">
                    <CheckCircle2 className="w-5 h-5 fill-stone-900 text-white" />
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
                    {item.region}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">
                    {item.nativeName}
                  </h3>
                  <p className="text-xs font-semibold text-stone-500">
                    {item.name}
                  </p>
                </div>

                <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed pt-2 border-t border-stone-100">
                  {item.tagline}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Button & Hint */}
        <div className="text-center pt-4 space-y-3">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
          >
            <span>{getContinueLabel()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-stone-500">
            Selected: <strong className="text-stone-800">{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName}</strong>. You can change this anytime from the top navigation.
          </p>
        </div>
      </div>
    </div>
  );
};
