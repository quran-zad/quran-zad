import { SearchSummary, SearchMatch } from '../types';
import { SURAHS_LIST } from '../data/quranMeta';
import { INITIAL_PAGES_CACHE } from '../data/quranPagesData';

// Arabic normalizer for diacritic-insensitive search
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // remove diacritics / harakat / Quranic annotation marks
    .replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '')
    // normalize alefs
    .replace(/[إأآٱا]/g, 'ا')
    // normalize taa marbuta
    .replace(/ة/g, 'ه')
    // normalize yaa
    .replace(/[يىئ]/g, 'ي')
    // normalize waw hamza
    .replace(/ؤ/g, 'و')
    .trim()
    .toLowerCase();
}

export const SearchService = {
  /**
   * Perform comprehensive Quran search with match count, locations breakdown, and Tafsir
   */
  async searchQuran(query: string): Promise<SearchSummary> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return { query: trimmed, totalCount: 0, surahsFound: [], results: [] };
    }

    const normQuery = normalizeArabic(trimmed);

    // Try online global search first via Al-Quran Cloud API
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(trimmed)}/all/quran-uthmani`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (response.ok) {
        const json = await response.json();
        if (json.code === 200 && json.data && Array.isArray(json.data.matches)) {
          const matches: SearchMatch[] = json.data.matches.map((m: any) => {
            const surahMeta = SURAHS_LIST.find(s => s.id === m.surah.number);
            const surahName = surahMeta ? surahMeta.name : (m.surah.name || `سورة ${m.surah.number}`);
            const page = m.page || (surahMeta ? surahMeta.startPage : 1);
            const juz = m.juz || (surahMeta ? surahMeta.juzStart : 1);

            return {
              ayahNumber: m.number,
              numberInSurah: m.numberInSurah,
              surahNumber: m.surah.number,
              surahName,
              page,
              juz,
              text: m.text,
              highlightedText: highlightMatch(m.text, trimmed),
              tafsir: `انقر لعرض التفسير الكامل للآية ${m.numberInSurah} من سورة ${surahName} بالصفحة ${page}.`
            };
          });

          // Compute breakdown of locations by surah
          const surahMap = new Map<number, { surahNumber: number; surahName: string; count: number }>();
          matches.forEach(item => {
            const existing = surahMap.get(item.surahNumber);
            if (existing) {
              existing.count += 1;
            } else {
              surahMap.set(item.surahNumber, {
                surahNumber: item.surahNumber,
                surahName: item.surahName,
                count: 1
              });
            }
          });

          return {
            query: trimmed,
            totalCount: matches.length,
            surahsFound: Array.from(surahMap.values()).sort((a, b) => b.count - a.count),
            results: matches
          };
        }
      }
    } catch (e) {
      console.warn('Online search failed, using local offline index:', e);
    }

    // Local fallback search from cached pages and core database
    const localMatches: SearchMatch[] = [];
    Object.values(INITIAL_PAGES_CACHE).forEach(p => {
      p.ayahs.forEach(ayah => {
        const normAyahText = normalizeArabic(ayah.text);
        if (normAyahText.includes(normQuery)) {
          const surahMeta = SURAHS_LIST.find(s => s.id === ayah.surahNumber);
          const surahName = surahMeta ? surahMeta.name : `سورة ${ayah.surahNumber}`;
          localMatches.push({
            ayahNumber: ayah.number,
            numberInSurah: ayah.numberInSurah,
            surahNumber: ayah.surahNumber,
            surahName,
            page: ayah.page,
            juz: ayah.juz,
            text: ayah.text,
            highlightedText: highlightMatch(ayah.text, trimmed),
            tafsir: ayah.tafsir
          });
        }
      });
    });

    const surahMap = new Map<number, { surahNumber: number; surahName: string; count: number }>();
    localMatches.forEach(item => {
      const existing = surahMap.get(item.surahNumber);
      if (existing) {
        existing.count += 1;
      } else {
        surahMap.set(item.surahNumber, {
          surahNumber: item.surahNumber,
          surahName: item.surahName,
          count: 1
        });
      }
    });

    return {
      query: trimmed,
      totalCount: localMatches.length,
      surahsFound: Array.from(surahMap.values()).sort((a, b) => b.count - a.count),
      results: localMatches
    };
  }
};

function highlightMatch(text: string, rawQuery: string): string {
  if (!rawQuery.trim()) return text;
  // Simple highlight attempt or return raw text
  return text;
}
