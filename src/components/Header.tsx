import React from 'react';
import { 
  BookOpen, Search, Bookmark, Moon, Sun, Volume2, 
  Compass, Radio, Heart, Tv, Sparkles, Download 
} from 'lucide-react';
import { UserPrefs } from '../services/storageService';

export type AppTab = 'page' | 'surahs' | 'khatmah' | 'search' | 'adhkar' | 'prayer' | 'qibla' | 'radio' | 'duaa' | 'live';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenTasbih: () => void;
  onOpenDownload?: () => void;
  onContinueReading: () => void;
  onNavigateToFatihah?: () => void;
  prefs: UserPrefs;
  onToggleTheme: () => void;
  lastReadTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenBookmarks,
  onOpenTasbih,
  onOpenDownload,
  onContinueReading,
  onNavigateToFatihah,
  prefs,
  onToggleTheme,
  lastReadTitle
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-colors shadow-xs">
      {/* Dedication Banner - صدقة جارية */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-100 py-2 px-4 text-center border-b border-amber-500/30 text-xs sm:text-sm font-reading shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-3 leading-relaxed">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-amber-400 font-bold">﴿ صَدَقَةٌ جَارِيَةٌ ﴾</span>
            <span className="font-semibold text-amber-200">هذا الموقع صدقة جارية عن روح والدي وأخي، رحمهما الله.</span>
          </div>
          <span className="hidden lg:inline text-amber-400/50">·</span>
          <div className="flex items-center flex-wrap justify-center gap-2 text-stone-200">
            <span>
              نرجو قراءة سورة الفاتحة على روح والدي المرحوم <strong className="text-amber-300 font-bold">سليم بركات</strong>، وأخي المرحوم <strong className="text-amber-300 font-bold">محمود سليم بركات</strong>، سائلين الله أن يتغمدهما بواسع رحمته، ويسكنهما فسيح جناته.
            </span>
            {onNavigateToFatihah && (
              <button
                onClick={onNavigateToFatihah}
                className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-[11px] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                title="الانتقال لسورة الفاتحة"
              >
                <span>قراءة الفاتحة ﴿١﴾</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('duaa')}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-[11px] transition-colors"
            >
              <Heart className="w-3 h-3 text-red-400 fill-current" />
              <span>أدعية المتوفى والختم</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('page')}
            className="flex items-center gap-2 text-right group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center shadow-xs border border-emerald-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold font-reading tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors whitespace-nowrap">
                نُورُ القُرْآنِ
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs xl:text-sm font-medium text-stone-600 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('page')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              activeTab === 'page'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            المصحف
          </button>

          <button
            onClick={() => setActiveTab('surahs')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              activeTab === 'surahs'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            السور
          </button>

          <button
            onClick={() => setActiveTab('khatmah')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              activeTab === 'khatmah'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            ختمة القرآن
          </button>

          <button
            onClick={() => setActiveTab('adhkar')}
            className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1 border-b-2 ${
              activeTab === 'adhkar'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>أذكار الصباح والمساء</span>
          </button>

          <button
            onClick={() => setActiveTab('prayer')}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              activeTab === 'prayer'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            مواقيت الصلاة
          </button>

          <button
            onClick={() => setActiveTab('qibla')}
            className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1 border-b-2 ${
              activeTab === 'qibla'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>القبلة</span>
          </button>

          <button
            onClick={() => setActiveTab('radio')}
            className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1 border-b-2 ${
              activeTab === 'radio'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-700" />
            <span>إذاعات القرآن والأذان</span>
          </button>

          <button
            onClick={() => setActiveTab('duaa')}
            className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1 border-b-2 ${
              activeTab === 'duaa'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-red-500" />
            <span>الأدعية والرقية</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`whitespace-nowrap flex items-center gap-1 transition-colors py-1 border-b-2 ${
              activeTab === 'live'
                ? 'text-emerald-900 border-emerald-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-emerald-700" />
            <span>بث الحرمين</span>
          </button>
        </nav>

        {/* Zone 3: Action Buttons & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Tasbih Launcher Button */}
          <button
            onClick={onOpenTasbih}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors"
            title="فتح المسبحة الإلكترونية"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">السبحة</span>
          </button>

          {/* Quick Quran Download Launcher Button */}
          {onOpenDownload && (
            <button
              onClick={onOpenDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer"
              title="تحميل أي جزء من القرآن كملف Word أو PDF"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">تحميل جزء</span>
            </button>
          )}

          <button
            onClick={onOpenSearch}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            title="بحث في القرآن"
            aria-label="بحث في القرآن"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenBookmarks}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            title="العلامات المرجعية"
            aria-label="العلامات المرجعية"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            title={prefs.theme === 'night' ? 'الوضع النهاري' : 'الوضع الليلي'}
            aria-label="تبديل المظهر"
          >
            {prefs.theme === 'night' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onContinueReading}
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>متابعة القراءة</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Scrolling Nav Bar */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700">
        <button
          onClick={() => setActiveTab('page')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'page' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          المصحف
        </button>
        <button
          onClick={() => setActiveTab('surahs')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'surahs' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          السور
        </button>
        <button
          onClick={() => setActiveTab('khatmah')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'khatmah' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          ختمة القرآن
        </button>
        <button
          onClick={() => setActiveTab('adhkar')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'adhkar' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          أذكار الصباح والمساء
        </button>
        <button
          onClick={() => setActiveTab('prayer')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'prayer' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          مواقيت الصلاة
        </button>
        <button
          onClick={() => setActiveTab('qibla')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'qibla' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          القبلة
        </button>
        <button
          onClick={() => setActiveTab('radio')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'radio' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          الإذاعات والأذان
        </button>
        <button
          onClick={() => setActiveTab('duaa')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'duaa' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          الأدعية والرقية
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'live' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
          }`}
        >
          بث الحرمين
        </button>
        <button
          onClick={onOpenTasbih}
          className="px-3 py-1.5 rounded-lg font-bold whitespace-nowrap shrink-0 bg-amber-100 text-amber-950 border border-amber-300"
        >
          السبحة
        </button>
      </div>
    </header>
  );
};
