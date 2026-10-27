import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, ChevronLeft, Layers, Loader2, Sparkles } from 'lucide-react';
import { SearchService } from '../services/searchService';
import { SearchSummary, SearchMatch } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (page: number, surahNumber: number, ayahNumberInSurah: number) => void;
  onOpenTafsir: (match: SearchMatch) => void;
}

const POPULAR_SEARCHES = ['الجنة', 'الصبر', 'الرحمة', 'التقوى', 'الصلاة', 'الهدى', 'الاستغفار', 'النور'];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  onOpenTafsir
}) => {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [selectedSurahFilter, setSelectedSurahFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Auto-focus search input
  }, [isOpen]);

  const handleSearch = async (term: string) => {
    if (!term.trim() || term.trim().length < 2) return;
    setIsSearching(true);
    setSelectedSurahFilter(null);
    try {
      const res = await SearchService.searchQuran(term);
      setSummary(res);
    } catch (e) {
      console.warn('Search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  if (!isOpen) return null;

  // Filtered results if user clicks a specific surah filter
  const displayedResults = summary?.results.filter(r => 
    selectedSurahFilter ? r.surahNumber === selectedSurahFilter : true
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-12 sm:pt-16 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40">
          <form onSubmit={onSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute right-4 text-emerald-800 dark:text-emerald-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن أي كلمة أو آية (مثال: إِنَّ مَعَ الْعُسْرِ يُسْرًا، الصبر، الرحمة)..."
              className="w-full pr-12 pl-24 py-3.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm md:text-base font-reading"
              autoFocus
            />
            <div className="absolute left-2 flex items-center gap-1.5">
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بحث'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="إغلاق البحث"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Quick Suggestions */}
          {!summary && (
            <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-stone-500">
              <span className="font-medium text-stone-600 dark:text-stone-400">كلمات شائعة:</span>
              {POPULAR_SEARCHES.map(item => (
                <button
                  key={item}
                  onClick={() => {
                    setQuery(item);
                    handleSearch(item);
                  }}
                  className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 rounded-md transition-colors font-reading"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Metadata Summary: العدد والمواقع */}
        {summary && (
          <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950 dark:text-emerald-300 font-reading text-sm">
                نتائج البحث عن: «{summary.query}»
              </span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-600 dark:text-stone-300 font-semibold">
                العدد الإجمالي: <strong className="text-emerald-800 dark:text-emerald-400 tabular-nums">{summary.totalCount}</strong> موضعاً
              </span>
            </div>

            {/* Filter by Surah */}
            {summary.surahsFound.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-stone-500 whitespace-nowrap">المواقع:</span>
                <button
                  onClick={() => setSelectedSurahFilter(null)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                    selectedSurahFilter === null
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  الكل ({summary.totalCount})
                </button>
                {summary.surahsFound.slice(0, 6).map(s => (
                  <button
                    key={s.surahNumber}
                    onClick={() => setSelectedSurahFilter(s.surahNumber === selectedSurahFilter ? null : s.surahNumber)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                      selectedSurahFilter === s.surahNumber
                        ? 'bg-emerald-800 text-white font-bold'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {s.surahName} ({s.count})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isSearching && (
            <div className="py-16 text-center text-stone-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
              <p className="text-sm font-reading">جاري فحص آيات القرآن الكريم وإحصاء المواقع والعدد...</p>
            </div>
          )}

          {!isSearching && summary && summary.totalCount === 0 && (
            <div className="py-16 text-center text-stone-500">
              <p className="text-base font-reading mb-1">لم يتم العثور على نتائج مطابقة لكلمة «{summary.query}»</p>
              <p className="text-xs text-stone-400">تأكد من كتابة الكلمة بشكل صحيح، أو جرب البحث بكلمة مرادفة.</p>
            </div>
          )}

          {!isSearching && summary && summary.totalCount > 0 && (
            <div className="space-y-3">
              {displayedResults.map((item, idx) => (
                <div
                  key={`${item.ayahNumber}-${idx}`}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-700/60 dark:hover:border-emerald-600 bg-white dark:bg-stone-850 hover:bg-amber-50/20 dark:hover:bg-stone-800/60 transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="font-bold text-emerald-900 dark:text-emerald-400 font-reading text-sm">
                        سورة {item.surahName}
                      </span>
                      <span>·</span>
                      <span>الآية {item.numberInSurah}</span>
                      <span>·</span>
                      <span>الجزء {item.juz}</span>
                      <span>·</span>
                      <span>الصفحة {item.page}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenTafsir(item)}
                        className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-emerald-900 hover:bg-emerald-100/60 dark:hover:bg-emerald-950 font-reading text-xs transition-colors"
                      >
                        عرض التفسير
                      </button>
                      <button
                        onClick={() => {
                          onSelectResult(item.page, item.surahNumber, item.numberInSurah);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-900 hover:bg-emerald-800 text-white rounded font-medium text-xs transition-colors"
                      >
                        <span>الانتقال للمصحف</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="font-quran text-lg md:text-xl text-stone-800 dark:text-stone-200 leading-loose text-right">
                    {item.text}
                    <span className="inline-block mx-1.5 text-amber-700 dark:text-amber-400 font-reading text-base">
                      ﴿{item.numberInSurah}﴾
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {!isSearching && !summary && (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <BookOpen className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 stroke-1" />
              <p className="text-sm font-reading text-stone-600 dark:text-stone-400">
                ابحث في القرآن الكريم كاملاً بدقة عالية مع إحصاء المواقع والتفاسير
              </p>
              <p className="text-xs text-stone-400">
                يدعم البحث بالحركات أو بدونها، ويظهر عدد مرات الورود وتوزيعها على السور والصفحات.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
