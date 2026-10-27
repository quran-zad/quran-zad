import { Ayah, Reciter } from '../types';
import { INITIAL_PAGES_CACHE, PageData } from '../data/quranPagesData';
import { SURAHS_LIST, RECITERS_LIST } from '../data/quranMeta';

const MEMORY_PAGE_CACHE = new Map<number, PageData>(Object.entries(INITIAL_PAGES_CACHE).map(([k, v]) => [Number(k), v]));
const MEMORY_SURAH_CACHE = new Map<number, Ayah[]>();

export const QuranApiService = {
  /**
   * Get audio URL for an entire page (Murtal recitation for page)
   */
  getPageAudioUrl(pageNumber: number, reciterId: string = 'alafasy'): string {
    const reciter = RECITERS_LIST.find(r => r.id === reciterId) || RECITERS_LIST[0];
    const paddedPage = String(pageNumber).padStart(3, '0');
    return `https://everyayah.com/data/${reciter.everyAyahSubfolder}/PageMp3s/Page${paddedPage}.mp3`;
  },

  /**
   * Get fallback audio URL for an entire page using another reciter or mirror
   */
  getPageAudioFallbackUrl(pageNumber: number): string {
    const paddedPage = String(pageNumber).padStart(3, '0');
    return `https://everyayah.com/data/Husary_128kbps/PageMp3s/Page${paddedPage}.mp3`;
  },

  /**
   * Get audio URL for a single Ayah
   */
  getAyahAudioUrl(surahNumber: number, ayahNumberInSurah: number, reciterId: string = 'alafasy'): string {
    const reciter = RECITERS_LIST.find(r => r.id === reciterId) || RECITERS_LIST[0];
    const sStr = String(surahNumber).padStart(3, '0');
    const aStr = String(ayahNumberInSurah).padStart(3, '0');
    return `https://everyayah.com/data/${reciter.everyAyahSubfolder}/${sStr}${aStr}.mp3`;
  },

  /**
   * Get audio URL for a complete Surah
   */
  getSurahAudioUrl(surahNumber: number, reciterId: string = 'alafasy'): string {
    const reciter = RECITERS_LIST.find(r => r.id === reciterId) || RECITERS_LIST[0];
    const paddedSurah = String(surahNumber).padStart(3, '0');
    return `https://server8.mp3quran.net/${reciter.serverKey}/${paddedSurah}.mp3`;
  },

  /**
   * Fetch a specific page with Arabic Uthmani text and Tafsir Al-Muyassar
   */
  async getPage(pageNumber: number, translationId: string = 'en.sahih'): Promise<PageData> {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > 604) pageNumber = 604;

    // Check memory cache
    if (MEMORY_PAGE_CACHE.has(pageNumber)) {
      return MEMORY_PAGE_CACHE.get(pageNumber)!;
    }

    // Check local storage
    try {
      const localData = localStorage.getItem(`quran_page_${pageNumber}`);
      if (localData) {
        const parsed: PageData = JSON.parse(localData);
        MEMORY_PAGE_CACHE.set(pageNumber, parsed);
        return parsed;
      }
    } catch {}

    // Fetch from Al-Quran Cloud API with triple edition (text + muyassar tafsir + translation)
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/page/${pageNumber}/editions/quran-uthmani,ar.muyassar,${translationId}`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const json = await response.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
        const textEdition = json.data[0];
        const tafsirEdition = json.data[1];
        const translationEdition = json.data[2] || null;

        const surahNamesSet = new Set<string>();
        let juzNumber = 1;

        const ayahs: Ayah[] = textEdition.ayahs.map((ayahObj: any, index: number) => {
          const tafsirObj = tafsirEdition.ayahs[index];
          const transObj = translationEdition ? translationEdition.ayahs[index] : null;
          const surahMeta = SURAHS_LIST.find(s => s.id === ayahObj.surah.number);
          const surahName = surahMeta ? surahMeta.name : (ayahObj.surah.name || 'سورة');
          surahNamesSet.add(surahName);
          if (ayahObj.juz) juzNumber = ayahObj.juz;

          return {
            number: ayahObj.number,
            numberInSurah: ayahObj.numberInSurah,
            text: ayahObj.text,
            surahNumber: ayahObj.surah.number,
            page: pageNumber,
            juz: ayahObj.juz || juzNumber,
            hizbQuarter: ayahObj.hizbQuarter,
            tafsir: tafsirObj ? tafsirObj.text : 'التفسير الميسر: جاري تحميل التفسير...',
            translation: transObj ? transObj.text : undefined
          };
        });

        const pageData: PageData = {
          pageNumber,
          juzNumber,
          surahNames: Array.from(surahNamesSet),
          ayahs
        };

        MEMORY_PAGE_CACHE.set(pageNumber, pageData);
        try {
          localStorage.setItem(`quran_page_${pageNumber}`, JSON.stringify(pageData));
        } catch {}

        return pageData;
      }
    } catch (err) {
      console.warn(`Failed to fetch page ${pageNumber} online:`, err);
    }

    // Fallback: If not in cache and network fails, generate a well-formed stub based on Quran metadata
    const surahForPage = SURAHS_LIST.find(s => pageNumber >= s.startPage && pageNumber <= s.endPage) || SURAHS_LIST[0];
    const fallbackData: PageData = {
      pageNumber,
      juzNumber: surahForPage.juzStart,
      surahNames: [surahForPage.name],
      ayahs: [
        {
          number: pageNumber,
          numberInSurah: 1,
          surahNumber: surahForPage.id,
          page: pageNumber,
          juz: surahForPage.juzStart,
          text: `﴿ صفحة ${pageNumber} من سورة ${surahForPage.name} - المصحف المرتل ﴾`,
          tafsir: `صفحة رقم ${pageNumber} من سورة ${surahForPage.name}. استمع إلى القراءة الصوتية المرتلة الكاملة لهذه الصفحة بصوت الشيخ المختار.`,
          translation: `Page ${pageNumber} of Surah ${surahForPage.englishName}.`
        }
      ]
    };
    return fallbackData;
  },

  /**
   * Fetch single ayah translation in a chosen language
   */
  async getAyahTranslation(surahNumber: number, ayahNumberInSurah: number, translationId: string = 'en.sahih'): Promise<string> {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumberInSurah}/${translationId}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (response.ok) {
        const json = await response.json();
        if (json.code === 200 && json.data && json.data.text) {
          return json.data.text;
        }
      }
    } catch (e) {
      console.warn('Ayah translation fetch error:', e);
    }
    return '';
  },

  /**
   * Fetch all ayahs of a specific Surah
   */
  async getSurah(surahNumber: number): Promise<Ayah[]> {
    if (surahNumber < 1) surahNumber = 1;
    if (surahNumber > 114) surahNumber = 114;

    if (MEMORY_SURAH_CACHE.has(surahNumber)) {
      return MEMORY_SURAH_CACHE.get(surahNumber)!;
    }

    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ar.muyassar`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
        const textAyahs = json.data[0].ayahs;
        const tafsirAyahs = json.data[1].ayahs;

        const ayahs: Ayah[] = textAyahs.map((a: any, idx: number) => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: a.text,
          surahNumber,
          page: a.page,
          juz: a.juz,
          tafsir: tafsirAyahs[idx]?.text || ''
        }));

        MEMORY_SURAH_CACHE.set(surahNumber, ayahs);
        return ayahs;
      }
    } catch (e) {
      console.warn(`Surah fetch error for surah ${surahNumber}:`, e);
    }

    // If fetch fails, return initial cache if it covers this surah
    const fallbackAyahs: Ayah[] = [];
    Object.values(INITIAL_PAGES_CACHE).forEach(p => {
      p.ayahs.forEach(a => {
        if (a.surahNumber === surahNumber) fallbackAyahs.push(a);
      });
    });
    return fallbackAyahs;
  },

  /**
   * Fetch all ayahs of a specific Juz (1..30)
   */
  async getJuz(juzNumber: number): Promise<{
    juzNumber: number;
    ayahs: Array<Ayah & { surahName: string; surahEnglishName: string }>;
  }> {
    if (juzNumber < 1) juzNumber = 1;
    if (juzNumber > 30) juzNumber = 30;

    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/juz/${juzNumber}/quran-uthmani`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (response.ok) {
        const json = await response.json();
        if (json.code === 200 && json.data && Array.isArray(json.data.ayahs)) {
          const ayahs = json.data.ayahs.map((a: any) => {
            const surahMeta = SURAHS_LIST.find(s => s.id === a.surah.number);
            return {
              number: a.number,
              numberInSurah: a.numberInSurah,
              text: a.text,
              surahNumber: a.surah.number,
              page: a.page,
              juz: a.juz || juzNumber,
              hizbQuarter: a.hizbQuarter,
              surahName: surahMeta ? surahMeta.name : (a.surah.name || 'سورة'),
              surahEnglishName: surahMeta ? surahMeta.englishName : (a.surah.englishName || 'Surah')
            };
          });

          return {
            juzNumber,
            ayahs
          };
        }
      }
    } catch (e) {
      console.warn(`Error fetching Juz ${juzNumber}:`, e);
    }

    // Fallback: If offline or failed, collect from cached pages
    const fallbackAyahs: Array<Ayah & { surahName: string; surahEnglishName: string }> = [];
    Object.values(INITIAL_PAGES_CACHE).forEach(p => {
      if (p.juzNumber === juzNumber) {
        p.ayahs.forEach(a => {
          const sMeta = SURAHS_LIST.find(s => s.id === a.surahNumber) || SURAHS_LIST[0];
          fallbackAyahs.push({
            ...a,
            surahName: sMeta.name,
            surahEnglishName: sMeta.englishName
          });
        });
      }
    });

    return {
      juzNumber,
      ayahs: fallbackAyahs
    };
  }
};

