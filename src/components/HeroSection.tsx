import React from 'react';
import { Search, Volume2, BookOpen, Sparkles, Heart, Eye, ArrowUpLeft } from 'lucide-react';

interface HeroSectionProps {
  onOpenSearch: () => void;
  onStartReading: (page?: number) => void;
  onPlayPageAudio: (page: number) => void;
  onOpenAdhkar?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenSearch,
  onStartReading,
  onPlayPageAudio,
  onOpenAdhkar
}) => {
  return (
    <div className="relative overflow-hidden border-b border-stone-200 dark:border-stone-800 bg-stone-900 text-white">
      {/* Background Image Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/quran_hero_banner_1792090374242.jpg"
          alt="المصحف الشريف المضيء"
          className="w-full h-full object-cover object-center opacity-30 select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-stone-900/60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center space-y-6">
        
        {/* Editorial Subtitle */}
        <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-reading font-medium">
          <Sparkles className="w-4 h-4" />
          <span>المصحف الشريف المرتل كاملاً · تلاوة وبحث وتفسير</span>
        </div>

        {/* Primary Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-reading tracking-tight text-amber-100 max-w-3xl mx-auto leading-tight" style={{ textWrap: 'balance' }}>
          ﴿ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ ﴾
        </h1>

        <p className="text-stone-300 max-w-2xl mx-auto text-sm sm:text-base font-reading leading-relaxed">
          اقرأ واستمع لكتاب الله عز وجل صفحة بصفحة وسورة بسورة بأعذب الأصوات المرتلة، مع محرك بحث قرآني دقيق يحدد المواقع وعدد مرات الورود والتفسير الميسر المعتمد.
        </p>

        {/* Quick Search Action Bar */}
        <div className="max-w-xl mx-auto pt-2">
          <button
            onClick={onOpenSearch}
            className="w-full py-3.5 px-5 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-between text-stone-300 hover:text-white transition-all shadow-lg group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-reading">ابحث عن أي كلمة أو آية وتفسيرها...</span>
            </div>
            <span className="text-xs px-2.5 py-1 bg-white/15 rounded-lg text-amber-200">
              بحث قرآني
            </span>
          </button>
        </div>

        {/* Quick Highlights / Shortcuts */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2 text-xs">
          {onOpenAdhkar && (
            <button
              onClick={onOpenAdhkar}
              className="px-3.5 py-2 rounded-xl bg-amber-400 text-emerald-950 font-bold border border-amber-300 shadow-md hover:bg-amber-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-900" />
              <span>أذكار الصباح والمساء</span>
            </button>
          )}

          <button
            onClick={() => onStartReading(1)}
            className="px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 font-semibold border border-emerald-600/40 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>سورة الفاتحة</span>
          </button>
          <button
            onClick={() => onStartReading(293)}
            className="px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
          >
            سورة الكهف (ص 293)
          </button>
          <button
            onClick={() => onStartReading(440)}
            className="px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
          >
            سورة يس (ص 440)
          </button>
          <button
            onClick={() => onStartReading(562)}
            className="px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
          >
            سورة الملك (ص 562)
          </button>
          <button
            onClick={() => onStartReading(604)}
            className="px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
          >
            المعوذات والإخلاص
          </button>
        </div>

        {/* Quran Statistics: Clean Unboxed Separators */}
        <div className="pt-4 flex items-center justify-center gap-4 sm:gap-8 text-xs text-stone-400 font-sans border-t border-white/10 max-w-lg mx-auto">
          <span>114 سورة</span>
          <span aria-hidden="true">·</span>
          <span>6236 آية</span>
          <span aria-hidden="true">·</span>
          <span>604 صفحة</span>
          <span aria-hidden="true">·</span>
          <span>30 جزءاً</span>
        </div>

      </div>
    </div>
  );
};
