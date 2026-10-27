import React, { useState } from 'react';
import { Search, BookOpen, Volume2, Heart, Eye, ArrowUpLeft } from 'lucide-react';
import { SURAHS_LIST } from '../data/quranMeta';
import { StorageService } from '../services/storageService';
import { normalizeArabic } from '../services/searchService';

interface SurahIndexProps {
  onSelectSurah: (startPage: number, surahNumber: number) => void;
  onPlaySurah: (surahNumber: number) => void;
}

export const SurahIndex: React.FC<SurahIndexProps> = ({ onSelectSurah, onPlaySurah }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'مكية' | 'مدنية'>('all');

  const filteredSurahs = SURAHS_LIST.filter(surah => {
    const matchesFilter = filterType === 'all' || surah.revelationType === filterType;
    if (!matchesFilter) return false;

    if (!searchTerm.trim()) return true;
    const normSearch = normalizeArabic(searchTerm);
    const normName = normalizeArabic(surah.name);
    const normEng = surah.englishName.toLowerCase();
    return normName.includes(normSearch) || normEng.includes(searchTerm.toLowerCase()) || String(surah.id) === searchTerm.trim();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن اسم السورة (مثال: الكهف، يس، البقرة، 67)..."
              className="w-full pr-11 pl-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-700 text-sm font-reading"
            />
          </div>

          {/* Revelation Type Filter Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white dark:bg-stone-700 text-emerald-950 dark:text-amber-200 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              جميع السور (114)
            </button>
            <button
              onClick={() => setFilterType('مكية')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'مكية'
                  ? 'bg-white dark:bg-stone-700 text-emerald-950 dark:text-amber-200 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              السور المكية (86)
            </button>
            <button
              onClick={() => setFilterType('مدنية')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'مدنية'
                  ? 'bg-white dark:bg-stone-700 text-emerald-950 dark:text-amber-200 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              السور المدنية (28)
            </button>
          </div>

        </div>
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah) => {
          const viewCount = StorageService.getViewCount(`surah_${surah.id}`, 'surah', surah.id);
          const likesCount = StorageService.getLikesCount(`surah_${surah.id}`, 'surah', surah.id);

          return (
            <div
              key={surah.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-700/60 dark:hover:border-emerald-600/60 rounded-xl p-4 transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Number Badge */}
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-900 tabular-nums text-sm">
                      {surah.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 dark:text-stone-100 font-reading text-lg group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                        سُورَةُ {surah.name}
                      </h3>
                      <div className="text-xs text-stone-400 font-sans mt-0.5">
                        {surah.englishName} · {surah.englishNameTranslation}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                    {surah.revelationType}
                  </span>
                </div>

                {/* Metadata Row: Clean Unboxed Text with Separators */}
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-4">
                  <span>{surah.numberOfAyahs} آية</span>
                  <span aria-hidden="true">·</span>
                  <span>الجزء {surah.juzStart}</span>
                  <span aria-hidden="true">·</span>
                  <span>الصفحة {surah.startPage}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span className="tabular-nums">{viewCount.toLocaleString('ar-EG')}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 gap-2">
                <button
                  onClick={() => onPlaySurah(surah.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-900 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                  title={`الاستماع لتلاوة سورة ${surah.name}`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>تلاوة</span>
                </button>

                <button
                  onClick={() => onSelectSurah(surah.startPage, surah.id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-900 hover:bg-emerald-800 text-white transition-colors"
                >
                  <span>قراءة في المصحف</span>
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
