import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Star, Sparkles, RotateCcw, CheckCircle2, Copy, 
  Share2, Volume2, VolumeX, Shield, Sun, Moon, Compass, 
  Bed, HeartPulse, Home, BookMarked, Layers, X, Check, Heart 
} from 'lucide-react';
import { 
  HISN_DHIKR_LIST, HISN_CATEGORIES, HISN_TASBIH_PRESETS, HisnDhikr 
} from '../data/hisnMuslimData';
import { StorageService } from '../services/storageService';
import { normalizeArabic } from '../services/searchService';

export const HisnMuslimSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('sabah');
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => StorageService.getFavoriteAdhkarIds());
  const [counts, setCounts] = useState<Record<number, number>>(() => StorageService.getDhikrCounts());
  
  // Audio narration state
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Electronic Tasbih widget state
  const [tasbihPresetIndex, setTasbihPresetIndex] = useState<number>(0);
  const [tasbihCount, setTasbihCount] = useState<number>(0);

  // Sync favorites on change
  const handleToggleFavorite = (id: number) => {
    const isNowFav = StorageService.toggleFavoriteDhikr(id);
    setFavoriteIds(prev => isNowFav ? [...prev, id] : prev.filter(x => x !== id));
    triggerToast(isNowFav ? 'تمت إضافة الذكر إلى المفضلة' : 'تمت إزالة الذكر من المفضلة');
  };

  const handleIncrement = (item: HisnDhikr) => {
    const current = counts[item.id] || 0;
    if (current < item.count) {
      const next = current + 1;
      setCounts(prev => ({ ...prev, [item.id]: next }));
      StorageService.saveDhikrCount(item.id, next);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
    }
  };

  const handleResetCount = (id: number) => {
    setCounts(prev => ({ ...prev, [id]: 0 }));
    StorageService.saveDhikrCount(id, 0);
  };

  const handleResetCategoryCounts = () => {
    if (window.confirm('هل تريد إعادة تصفير عدادات أذكار هذا القسم؟')) {
      const updated = { ...counts };
      filteredDhikrList.forEach(item => {
        updated[item.id] = 0;
        StorageService.saveDhikrCount(item.id, 0);
      });
      setCounts(updated);
      triggerToast('تم تصفير عدادات القسم');
    }
  };

  const handleCopyText = (item: HisnDhikr) => {
    const fullText = `${item.title}\n\n${item.text}\n\n(التكرار: ${item.count} مرات)\n${item.reward} - [${item.reference || 'حصن المسلم'}]\n\nعبر تطبيق نور القرآن`;
    navigator.clipboard.writeText(fullText).then(() => {
      triggerToast('تم نسخ الذكر إلى الحافظة');
    });
  };

  const handleShare = async (item: HisnDhikr) => {
    const shareData = {
      title: item.title,
      text: `${item.title}:\n${item.text}\n\n${item.reward}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopyText(item);
    }
  };

  // Text-to-speech for Arabic recitation
  const handleToggleAudio = (item: HisnDhikr) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      triggerToast('الخاصية الصوتية غير مدعومة في هذا المتصفح');
      return;
    }

    if (speakingId === item.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85; // slightly slower for reverent recitation
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(item.id);
    window.speechSynthesis.speak(utterance);
  };

  // Electronic Tasbih
  const handleTasbihTap = () => {
    setTasbihCount(prev => prev + 1);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filtered Dhikr List based on search or category
  const filteredDhikrList = useMemo(() => {
    const query = searchQuery.trim();

    if (query) {
      const normalizedQuery = normalizeArabic(query).toLowerCase();
      return HISN_DHIKR_LIST.filter(item => {
        const textNorm = normalizeArabic(item.text).toLowerCase();
        const titleNorm = normalizeArabic(item.title).toLowerCase();
        const catNorm = normalizeArabic(item.categoryName).toLowerCase();
        const rewardNorm = normalizeArabic(item.reward).toLowerCase();
        return (
          textNorm.includes(normalizedQuery) ||
          titleNorm.includes(normalizedQuery) ||
          catNorm.includes(normalizedQuery) ||
          rewardNorm.includes(normalizedQuery)
        );
      });
    }

    if (selectedCategory === 'favorites') {
      return HISN_DHIKR_LIST.filter(item => favoriteIds.includes(item.id));
    }

    if (selectedCategory === 'all') {
      return HISN_DHIKR_LIST;
    }

    return HISN_DHIKR_LIST.filter(item => item.category === selectedCategory);
  }, [searchQuery, selectedCategory, favoriteIds]);

  // Compute category icon helper
  const renderCategoryIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Star': return <Star className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Bed': return <Bed className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      case 'Home': return <Home className={className} />;
      case 'BookMarked': return <BookMarked className={className} />;
      default: return <Layers className={className} />;
    }
  };

  const currentTasbihPreset = HISN_TASBIH_PRESETS[tasbihPresetIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-amber-200 px-5 py-2.5 rounded-full shadow-xl border border-amber-500/40 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>حِصْنُ المُسْلِمِ مِنْ أَذْكَارِ الكِتَابِ وَالسُّنَّةِ</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-reading text-stone-900 dark:text-stone-100">
          الأذكار اليومية المنسقة والتحصين الشامل
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto font-reading">
          موسوعة أذكار مأثورة ومحققة من حصن المسلم مع عداد إلكتروني تفاعلي، خاصية البحث الفوري، والوصول السريع للأذكار المفضلة.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-5 h-5 text-emerald-700 dark:text-amber-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نصوص الأذكار، العناوين، أو الفضائل (مثال: سيد الاستغفار، الكرب، الصباح)..."
            className="w-full pr-11 pl-10 py-3 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-amber-400 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 hover:text-stone-600"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Access to Favorite Adhkar & Categories Scrollbar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 px-1">
          <span className="font-semibold text-emerald-950 dark:text-amber-300">أقسام حصن المسلم:</span>
          {/* Quick Favorite Adhkar Shortcut Button */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('favorites');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'favorites' && !searchQuery
                ? 'bg-amber-400 text-emerald-950 shadow-xs'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>الأذكار المفضلة ({favoriteIds.length})</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {HISN_CATEGORIES.map((cat) => {
            const isActive = !searchQuery && selectedCategory === cat.id;
            const isFavTab = cat.id === 'favorites';
            const countBadge = isFavTab 
              ? favoriteIds.length 
              : cat.id === 'all' 
              ? HISN_DHIKR_LIST.length 
              : HISN_DHIKR_LIST.filter(d => d.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-emerald-900 dark:bg-emerald-950 text-amber-200 border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-emerald-600/50 hover:text-stone-900'
                }`}
              >
                {renderCategoryIcon(cat.iconName, isActive ? 'w-3.5 h-3.5 text-amber-300' : 'w-3.5 h-3.5 text-stone-400')}
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive 
                    ? 'bg-emerald-800/80 text-amber-200' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}>
                  {countBadge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Electronic Tasbih Interactive Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-800/80 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-amber-300/80">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">المسبحة الإلكترونية المباركة</span>
            </div>
            <button 
              onClick={() => setTasbihCount(0)}
              className="flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer"
              title="إعادة ضبط المسبحة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير</span>
            </button>
          </div>

          <div>
            <h3 className="font-reading text-xl sm:text-2xl font-bold text-amber-200 tracking-wide">
              {currentTasbihPreset.label}
            </h3>
            <p className="text-[11px] text-emerald-300/70 mt-0.5">
              الهدف المستحب: {currentTasbihPreset.target} مرة
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {HISN_TASBIH_PRESETS.map((p, idx) => (
              <button
                key={p.label}
                onClick={() => {
                  setTasbihPresetIndex(idx);
                  setTasbihCount(0);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  tasbihPresetIndex === idx
                    ? 'bg-amber-400 text-emerald-950 font-bold'
                    : 'bg-emerald-800/40 text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Big Tap Button */}
          <div className="pt-1">
            <button
              onClick={handleTasbihTap}
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all select-none border-4 border-amber-300/40 cursor-pointer"
              aria-label="تسبيح"
            >
              <span className="text-3xl font-bold font-mono tabular-nums">
                {tasbihCount}
              </span>
              <span className="text-[10px] font-semibold text-emerald-900 mt-1">
                انقر للتسبيح
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700 dark:text-stone-300">
            {searchQuery 
              ? `نتائج البحث عن «${searchQuery}»:` 
              : selectedCategory === 'favorites' 
              ? 'الأذكار المفضلة لديك:' 
              : HISN_CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-amber-300 font-mono text-[11px]">
            {filteredDhikrList.length} ذكر
          </span>
        </div>

        {filteredDhikrList.length > 0 && (
          <button
            onClick={handleResetCategoryCounts}
            className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>تصفير عدادات المعروض</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredDhikrList.length === 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            {selectedCategory === 'favorites' ? <Star className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm">
              {selectedCategory === 'favorites'
                ? 'لا توجد أذكار في قائمة المفضلة حالياً'
                : 'لم يتم العثور على أذكار مطابقة لبحثك'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {selectedCategory === 'favorites'
                ? 'انقر على رمز النجمة ⭐ بجانب أي ذكر في التطبيق لإضافته إلى قائمة الأذكار المفضلة للوصول السريع.'
                : 'جرّب البحث بكلمة أخرى مثل «استغفار» أو «الكرسي» أو تصفح الأقسام مباشرة.'}
            </p>
          </div>
          {selectedCategory === 'favorites' && (
            <button
              onClick={() => setSelectedCategory('sabah')}
              className="px-4 py-2 rounded-xl bg-emerald-900 text-amber-200 text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
            >
              تصفح أذكار الصباح
            </button>
          )}
        </div>
      )}

      {/* Dhikr Cards List */}
      <div className="space-y-4">
        {filteredDhikrList.map((item) => {
          const currentCount = counts[item.id] || 0;
          const isDone = currentCount >= item.count;
          const isFav = favoriteIds.includes(item.id);
          const isPlayingThis = speakingId === item.id;
          const progressPercent = Math.min(100, Math.round((currentCount / item.count) * 100));

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-stone-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isDone
                  ? 'border-emerald-300 dark:border-emerald-900/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-stone-200 dark:border-stone-800 hover:border-emerald-700/40'
              }`}
            >
              {/* Progress bar line */}
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-1">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isDone ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                
                {/* Card Top Row: Category tag, Title, Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-emerald-900 dark:text-emerald-300">
                        {item.categoryName}
                      </span>
                      {isDone && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اكتمل الورد</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-reading text-base sm:text-lg font-bold text-emerald-950 dark:text-amber-200">
                      {item.title}
                    </h3>
                  </div>

                  {/* Right Actions: Favorite, Audio, Copy, Share */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleFavorite(item.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isFav
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                          : 'text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى الأذكار المفضلة'}
                      aria-label="المفضلة"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleToggleAudio(item)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isPlayingThis
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                          : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title={isPlayingThis ? 'إيقاف الاستماع' : 'استماع للذكر'}
                      aria-label="استماع"
                    >
                      {isPlayingThis ? <VolumeX className="w-4 h-4 text-amber-500 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleCopyText(item)}
                      className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="نسخ الذكر"
                      aria-label="نسخ"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="مشاركة الذكر"
                      aria-label="مشاركة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dhikr Arabic Calligraphy Text */}
                <div 
                  onClick={() => handleIncrement(item)}
                  className={`p-4 rounded-xl font-reading text-lg sm:text-xl leading-[2.4] text-stone-900 dark:text-stone-100 text-justify cursor-pointer transition-colors border select-text ${
                    isDone
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-[#faf7ee]/60 dark:bg-stone-950/40 border-[#dfd6be]/60 dark:border-stone-800 hover:border-amber-400/50'
                  }`}
                  title="انقر على نص الذكر لتسجيل التكرار"
                >
                  {item.text}
                </div>

                {/* Virtue & Reward / Hadith Reference */}
                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>فضل الذكر وثوابه:</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 font-reading leading-relaxed">
                    {item.reward}
                  </p>
                  {item.reference && (
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-sans pt-0.5">
                      المصدر: {item.reference}
                    </div>
                  )}
                </div>

                {/* Counter & Action Bottom Bar */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  
                  {/* Reset count */}
                  <button
                    onClick={() => handleResetCount(item.id)}
                    disabled={currentCount === 0}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="تصفير عداد هذا الذكر"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تصفير</span>
                  </button>

                  {/* Interactive Big Tap Counter Button */}
                  <button
                    onClick={() => handleIncrement(item)}
                    disabled={isDone}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer select-none active:scale-95 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                        : 'bg-emerald-900 hover:bg-emerald-800 text-amber-200 border border-emerald-800'
                    }`}
                  >
                    <span>
                      {isDone ? 'اكتمل التكرار' : 'انقر للعد'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 font-mono tabular-nums text-xs">
                      {currentCount} / {item.count}
                    </span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
