import React, { useState, useEffect } from 'react';
import { 
  Heart, Share2, Eye, Bookmark, Volume2, BookOpen, 
  ChevronRight, ChevronLeft, Type, Copy, Check, Info, Languages 
} from 'lucide-react';
import { Ayah } from '../types';
import { PageData } from '../data/quranPagesData';
import { QuranApiService } from '../services/quranApi';
import { StorageService, UserPrefs } from '../services/storageService';
import { KhatmahReminderService } from '../services/khatmahReminderService';
import { SURAHS_LIST, JUZ_NAMES, TRANSLATIONS_LIST } from '../data/quranMeta';

interface QuranPageViewProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  onOpenTafsir: (ayah: Ayah) => void;
  onPlayPageAudio: () => void;
  onNavigateToKhatmah?: () => void;
  reciterId: string;
  prefs: UserPrefs;
  onUpdatePrefs: (prefs: Partial<UserPrefs>) => void;
  highlightAyahNumber?: number;
}

export const QuranPageView: React.FC<QuranPageViewProps> = ({
  currentPage,
  onPageChange,
  onOpenTafsir,
  onPlayPageAudio,
  onNavigateToKhatmah,
  reciterId,
  prefs,
  onUpdatePrefs,
  highlightAyahNumber
}) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [jumpPageInput, setJumpPageInput] = useState<string>(String(currentPage));
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [pageLiked, setPageLiked] = useState<boolean>(false);
  const [pageLikesCount, setPageLikesCount] = useState<number>(0);
  const [pageViewsCount, setPageViewsCount] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<string | null>(null);
  const [khatmahPlan, setKhatmahPlan] = useState(() => StorageService.getKhatmahPlan());

  // Sync jump input
  useEffect(() => {
    setJumpPageInput(String(currentPage));
  }, [currentPage]);

  // Load page data and update views
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const pageKey = `page_${currentPage}`;
    const pageViewKey = `page_view_${currentPage}`;

    // Record view for page
    const vCount = StorageService.recordView(pageViewKey, 'page', currentPage);
    setPageViewsCount(vCount);

    // Get likes
    const liked = StorageService.isLiked(pageKey);
    const lCount = StorageService.getLikesCount(pageKey, 'page', currentPage);
    setPageLiked(liked);
    setPageLikesCount(lCount);

    // Check bookmarks
    const bmarks = StorageService.getBookmarks();
    setIsBookmarked(bmarks.some(b => b.pageNumber === currentPage));

    QuranApiService.getPage(currentPage, prefs.translationId).then((data) => {
      if (!isCancelled) {
        setPageData(data);
        setIsLoading(false);

        // Update last read position in storage
        const primarySurahMeta = SURAHS_LIST.find(s => s.name === data.surahNames[0]) || SURAHS_LIST[0];
        StorageService.setLastRead({
          pageNumber: currentPage,
          surahNumber: primarySurahMeta.id,
          title: `صفحة ${currentPage} - سورة ${data.surahNames.join(' و ')}`
        });

        // Update active Khatmah plan progress
        const updatedKhatmah = StorageService.updateKhatmahProgress(currentPage);
        if (updatedKhatmah) {
          setKhatmahPlan(updatedKhatmah);
          if (updatedKhatmah.todayPagesRead >= updatedKhatmah.dailyPagesTarget) {
            KhatmahReminderService.triggerCompletionCelebration(updatedKhatmah, (msg) => {
              setShowShareToast(msg);
              setTimeout(() => setShowShareToast(null), 6000);
            });
          }
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, prefs.translationId]);

  const handleTogglePageLike = () => {
    const pageKey = `page_${currentPage}`;
    const res = StorageService.toggleLike(pageKey, 'page', currentPage);
    setPageLiked(res.isLiked);
    setPageLikesCount(res.count);
  };

  const handleToggleBookmark = () => {
    const bmarks = StorageService.getBookmarks();
    const existing = bmarks.find(b => b.pageNumber === currentPage);
    if (existing) {
      StorageService.removeBookmark(existing.id);
      setIsBookmarked(false);
      triggerToast('تمت إزالة العلامة المرجعية');
    } else {
      const primarySurahMeta = pageData ? SURAHS_LIST.find(s => s.name === pageData.surahNames[0]) || SURAHS_LIST[0] : SURAHS_LIST[0];
      StorageService.saveBookmark({
        id: `bm_page_${currentPage}`,
        type: 'page',
        pageNumber: currentPage,
        surahNumber: primarySurahMeta.id,
        surahName: pageData ? pageData.surahNames[0] : 'سورة',
        timestamp: Date.now()
      });
      setIsBookmarked(true);
      triggerToast('تم حفظ الصفحة كعلامة مرجعية لمتابعة القراءة');
    }
  };

  const triggerToast = (msg: string) => {
    setShowShareToast(msg);
    setTimeout(() => setShowShareToast(null), 2500);
  };

  const handleSharePage = async () => {
    const primarySurah = pageData ? pageData.surahNames.join(' و ') : '';
    const shareData = {
      title: `الصفحة ${currentPage} من القرآن الكريم`,
      text: `أدعوك لقراءة واستماع الصفحة ${currentPage} من القرآن الكريم [سورة ${primarySurah}] عبر تطبيق نور القرآن`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopyShareLink();
      }
    } else {
      handleCopyShareLink();
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast('تم نسخ رابط الصفحة لمشاركتها');
  };

  const handleCopyAyah = (ayah: Ayah) => {
    const surahMeta = SURAHS_LIST.find(s => s.id === ayah.surahNumber);
    const surahName = surahMeta ? surahMeta.name : '';
    navigator.clipboard.writeText(`﴿ ${ayah.text} ﴾ [سورة ${surahName}: ${ayah.numberInSurah}]`);
    setCopiedAyah(ayah.number);
    triggerToast(`تم نسخ الآية ${ayah.numberInSurah} بنجاح`);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      onPageChange(p);
    }
  };

  // Find Juz data
  const juzInfo = JUZ_NAMES.find(j => j.page <= currentPage && (!JUZ_NAMES[j.juz] || JUZ_NAMES[j.juz].page > currentPage)) || JUZ_NAMES[0];

  return (
    <div className="w-full pb-24">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-amber-200 px-4 py-2.5 rounded-xl shadow-xl border border-amber-400/40 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{showShareToast}</span>
        </div>
      )}

      {/* Page Utility Bar: Stats, Likes, Audio Trigger, Theme and Settings */}
      <div className="max-w-4xl mx-auto mb-4 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left/Start: Views & Likes Counter */}
        <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 font-medium">
          <div className="flex items-center gap-1.5" title="عدد مشاهدات وقراءات هذه الصفحة">
            <Eye className="w-4 h-4 text-stone-400" />
            <span className="tabular-nums font-semibold">{pageViewsCount.toLocaleString('ar-EG')} مشاهدة</span>
          </div>

          <span>·</span>

          <button
            onClick={handleTogglePageLike}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              pageLiked 
                ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-800' 
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:text-stone-900'
            }`}
            title="إعجاب بالصفحة"
          >
            <Heart className={`w-3.5 h-3.5 ${pageLiked ? 'fill-current text-red-500' : ''}`} />
            <span className="tabular-nums">{pageLikesCount.toLocaleString('ar-EG')} إعجاب</span>
          </button>

          <span>·</span>

          <button
            onClick={handleSharePage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:text-stone-900 transition-colors"
            title="مشاركة الصفحة"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span>مشاركة</span>
          </button>
        </div>

        {/* Right/End: Quick Audio Play for Page + Bookmark + Font size */}
        <div className="flex items-center gap-2">
          {/* Translation Toggle & Language Selector */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdatePrefs({ showTranslation: !prefs.showTranslation })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                prefs.showTranslation
                  ? 'bg-amber-100 dark:bg-emerald-950/80 border-amber-400 dark:border-emerald-700 text-amber-900 dark:text-amber-200'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
              title={prefs.showTranslation ? 'إخفاء الترجمة' : 'إظهار ترجمة معاني الآيات بلغات العالم'}
            >
              <Languages className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{prefs.showTranslation ? 'الترجمة: مفعّلة' : 'الترجمة'}</span>
            </button>

            {prefs.showTranslation && (
              <select
                value={prefs.translationId}
                onChange={(e) => onUpdatePrefs({ translationId: e.target.value })}
                className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {TRANSLATIONS_LIST.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Audio recitation button for page */}
          <button
            onClick={onPlayPageAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-200 font-medium shadow-xs transition-colors"
            title="تشغيل التلاوة المرتلة الكاملة لهذه الصفحة"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>تلاوة الصفحة</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-800 dark:text-amber-300'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 hover:text-stone-900'
            }`}
            title={isBookmarked ? 'علامة القراءة محفوظة' : 'حفظ كفاصل قراءة'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Font Size Adjusters */}
          <div className="hidden sm:flex items-center bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-0.5">
            <button
              onClick={() => onUpdatePrefs({ fontSize: Math.max(18, prefs.fontSize - 2) })}
              className="px-2 py-1 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-900"
              title="تصغير الخط"
            >
              A-
            </button>
            <span className="text-[10px] text-stone-400 px-1 tabular-nums">{prefs.fontSize}</span>
            <button
              onClick={() => onUpdatePrefs({ fontSize: Math.min(36, prefs.fontSize + 2) })}
              className="px-2 py-1 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-900 font-bold"
              title="تكبير الخط"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Khatmah Daily Progress Banner if plan is active */}
      {khatmahPlan && (
        <div className="max-w-4xl mx-auto mb-3 px-2 sm:px-4">
          <div className="p-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <span className="font-bold font-reading text-emerald-900 dark:text-amber-300">خطة الختمة:</span>
              <span>ورد اليوم: <strong className="font-bold tabular-nums text-emerald-800 dark:text-emerald-300">{khatmahPlan.todayPagesRead || 0}</strong> من <strong>{khatmahPlan.dailyPagesTarget}</strong> صفحة</span>
              <span className="text-stone-400 hidden sm:inline">·</span>
              <span className="text-stone-500 dark:text-stone-400 hidden sm:inline">متبقي {khatmahPlan.targetDays} يوماً للختم</span>
            </div>
            {onNavigateToKhatmah && (
              <button
                onClick={onNavigateToKhatmah}
                className="font-bold text-emerald-800 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>متابعة الخطة</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Mushaf Page Presentation Container */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div 
          className={`relative rounded-2xl shadow-xl transition-all border-2 ${
            prefs.theme === 'night'
              ? 'bg-[#0f1d19] border-emerald-900/60 text-stone-100 shadow-emerald-950/20'
              : prefs.theme === 'sepia'
              ? 'bg-[#f4ecd8] border-[#d8c8a8] text-[#2c2416] shadow-amber-900/10'
              : 'bg-[#faf7ee] border-[#dfd6be] text-stone-900 shadow-stone-300/40'
          }`}
          style={{ minHeight: '620px' }}
        >
          {/* Authentic Mushaf Top Header Frame */}
          <div className="px-6 py-3.5 border-b border-[#dfd6be]/80 dark:border-emerald-900/50 flex items-center justify-between font-reading text-sm sm:text-base">
            {/* Surah Name */}
            <div className="flex items-center gap-2">
              <span className="text-amber-800 dark:text-amber-400 font-bold">
                {pageData?.surahNames.map(s => `سُورَةُ ${s}`).join(' و ') || 'القرآن الكريم'}
              </span>
            </div>

            {/* Page number badge */}
            <div className="px-3 py-0.5 rounded-full border border-amber-600/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold text-xs tabular-nums">
              صفحة {currentPage}
            </div>

            {/* Juz Name */}
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">
              <span>الجزء {juzInfo.juz} ({juzInfo.name})</span>
            </div>
          </div>

          {/* Page Quranic Verses Content */}
          <div className="p-6 sm:p-10 md:p-12">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4 text-stone-500">
                <div className="w-10 h-10 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                <p className="font-reading text-base">جاري تحميل صفحة المصحف الشريف والتفاسير...</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Surah Title Frame if page has the start of a Surah */}
                {pageData?.ayahs.some(a => a.numberInSurah === 1) && (
                  <div className="my-4 p-3 rounded-xl border-2 border-double border-amber-600/40 bg-amber-500/5 text-center">
                    <h2 className="font-quran text-2xl text-emerald-950 dark:text-amber-200 font-bold">
                      {pageData.ayahs.find(a => a.numberInSurah === 1)?.surahNumber === 1 
                        ? 'سُورَةُ الفَاتِحَةِ' 
                        : `سُورَةُ ${SURAHS_LIST.find(s => s.id === pageData.ayahs.find(a => a.numberInSurah === 1)?.surahNumber)?.name || ''}`}
                    </h2>
                    {/* Bismillah (except for Surah At-Tawbah 9) */}
                    {pageData.ayahs.find(a => a.numberInSurah === 1)?.surahNumber !== 9 && (
                      <p className="font-quran text-lg text-stone-700 dark:text-stone-300 mt-2">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                    )}
                  </div>
                )}

                {/* Verses Flow Rendering */}
                <div 
                  className="font-quran text-justify leading-[2.6] select-text"
                  style={{ fontSize: `${prefs.fontSize}px` }}
                >
                  {pageData?.ayahs.map((ayah) => {
                    const isSelected = selectedAyah?.number === ayah.number;
                    const isHighlightedFromSearch = highlightAyahNumber === ayah.numberInSurah;

                    return (
                      <span 
                        key={ayah.number}
                        onClick={() => setSelectedAyah(isSelected ? null : ayah)}
                        className={`inline transition-all cursor-pointer rounded-md px-1 py-0.5 mx-0.5 ${
                          isSelected
                            ? 'bg-amber-300/40 dark:bg-emerald-800/60 ring-2 ring-amber-500/50'
                            : isHighlightedFromSearch
                            ? 'bg-emerald-200/50 dark:bg-emerald-900/50 ring-1 ring-emerald-500'
                            : 'hover:bg-amber-200/30 dark:hover:bg-emerald-900/30'
                        }`}
                        title="انقر لعرض التفسير والاستماع للآية"
                      >
                        {ayah.text}
                        {/* Quranic Ayah Number Sign */}
                        <span 
                          className="inline-flex items-center justify-center mx-1.5 text-amber-800 dark:text-amber-400 font-reading select-none text-[0.8em]"
                          aria-label={`آية رقم ${ayah.numberInSurah}`}
                        >
                          ﴿{ayah.numberInSurah}﴾
                        </span>
                      </span>
                    );
                  })}
                </div>

                {/* Translation List for the Page if enabled */}
                {prefs.showTranslation && (
                    <div className="mt-8 pt-6 border-t border-[#dfd6be] dark:border-emerald-900/40 space-y-3 font-sans">
                      <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 pb-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950 dark:text-emerald-300">
                          <Languages className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                          <span>ترجمة معاني آيات الصفحة ({TRANSLATIONS_LIST.find(l => l.id === prefs.translationId)?.name || 'الإنجليزية'})</span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-sans">
                          {TRANSLATIONS_LIST.find(l => l.id === prefs.translationId)?.translator}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {pageData?.ayahs.map((ayah) => {
                          const langObj = TRANSLATIONS_LIST.find(l => l.id === prefs.translationId);
                          return (
                            <div 
                              key={`page-trans-${ayah.number}`}
                              onClick={() => setSelectedAyah(selectedAyah?.number === ayah.number ? null : ayah)}
                              className={`p-3 rounded-xl border transition-all text-xs sm:text-sm cursor-pointer ${
                                selectedAyah?.number === ayah.number
                                  ? 'bg-amber-100/70 dark:bg-emerald-950/60 border-amber-400 dark:border-emerald-700'
                                  : 'bg-white/60 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800/60 hover:bg-white dark:hover:bg-stone-850'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                                <span className="font-semibold text-emerald-900 dark:text-emerald-400">
                                  الآية ﴿{ayah.numberInSurah}﴾
                                </span>
                                <span className="text-[10px] text-stone-400">انقر لعرض التفسير والمشاركة</span>
                              </div>
                              <p 
                                className={`leading-relaxed text-stone-800 dark:text-stone-200 ${
                                  langObj?.direction === 'rtl' ? 'text-right font-reading' : 'text-left font-serif'
                                }`}
                                dir={langObj?.direction || 'ltr'}
                              >
                                {ayah.translation || 'جاري تحميل الترجمة المعتمدة...'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
            )}
          </div>

          {/* Selected Ayah Quick Utility Drawer / Action Bar */}
          {selectedAyah && (
            <div className="border-t border-[#dfd6be] dark:border-emerald-900/50 bg-amber-50/95 dark:bg-stone-900/95 p-4 rounded-b-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1 max-w-sm sm:max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-reading text-emerald-950 dark:text-amber-300">
                    الآية {selectedAyah.numberInSurah}:
                  </span>
                  <span className="text-xs text-stone-600 dark:text-stone-300 line-clamp-1 font-reading">
                    {selectedAyah.text}
                  </span>
                </div>
                {selectedAyah.translation && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 italic font-sans" dir="auto">
                    «{selectedAyah.translation}»
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                {/* View Tafsir & Translation */}
                <button
                  onClick={() => onOpenTafsir(selectedAyah)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 text-white font-medium hover:bg-emerald-800 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>التفسير والترجمة</span>
                </button>

                {/* Copy Ayah */}
                <button
                  onClick={() => handleCopyAyah(selectedAyah)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="نسخ الآية"
                >
                  {copiedAyah === selectedAyah.number ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAyah === selectedAyah.number ? 'تم النسخ' : 'نسخ'}</span>
                </button>

                {/* Close Ayah Bar */}
                <button
                  onClick={() => setSelectedAyah(null)}
                  className="px-2 py-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Authentic Bottom Page Number & Juz marker */}
          <div className="px-6 py-3 border-t border-[#dfd6be]/80 dark:border-emerald-900/50 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-reading">
            <span>{juzInfo.startSurah}</span>
            <span className="font-bold text-amber-800 dark:text-amber-400 tabular-nums text-sm">
              - {currentPage} -
            </span>
            <span>الحزب {Math.ceil(juzInfo.juz * 2)}</span>
          </div>
        </div>

        {/* Page Navigation Controls: Next / Previous / Jump Slider */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          {/* Previous Page (RTL: right side is previous) */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-900 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:pointer-events-none font-medium text-xs transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الصفحة السابقة ({Math.max(1, currentPage - 1)})</span>
          </button>

          {/* Direct Page Jump Input & Slider */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
              <span className="text-xs text-stone-500">انتقال لصفحة:</span>
              <input
                type="number"
                min={1}
                max={604}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-16 px-2 py-1 text-center bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md text-xs font-bold tabular-nums focus:outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-emerald-900 text-white rounded-md text-xs hover:bg-emerald-800 transition-colors"
              >
                انتقال
              </button>
            </form>
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(Math.min(604, currentPage + 1))}
            disabled={currentPage >= 604}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-900 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:pointer-events-none font-medium text-xs transition-colors"
          >
            <span>الصفحة التالية ({Math.min(604, currentPage + 1)})</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
