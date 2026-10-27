export interface SurahMeta {
  id: number;
  name: string; // e.g. الفاتحة
  englishName: string; // e.g. Al-Fatihah
  englishNameTranslation: string; // The Opening
  revelationType: 'مكية' | 'مدنية';
  numberOfAyahs: number;
  startPage: number;
  endPage: number;
  juzStart: number;
}

export interface Ayah {
  number: number; // Global number 1..6236
  numberInSurah: number;
  text: string;
  simpleText?: string; // stripped of diacritics for fast search
  surahNumber: number;
  page: number;
  juz: number;
  hizbQuarter?: number;
  tafsir?: string;
  translation?: string;
  audio?: string;
}

export interface TranslationLanguage {
  id: string; // e.g. 'en.sahih'
  name: string; // e.g. 'الإنجليزية (صحيح إنترناشونال)'
  nativeName: string;
  language: string;
  direction: 'ltr' | 'rtl';
  translator: string;
}

export interface Reciter {
  id: string;
  name: string;
  style: string;
  serverKey: string;
  everyAyahSubfolder: string;
  photo?: string;
}

export interface SearchMatch {
  ayahNumber: number;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
  page: number;
  juz: number;
  text: string;
  highlightedText: string;
  tafsir?: string;
}

export interface SearchSummary {
  query: string;
  totalCount: number;
  surahsFound: {
    surahNumber: number;
    surahName: string;
    count: number;
  }[];
  results: SearchMatch[];
}

export interface Bookmark {
  id: string;
  type: 'page' | 'ayah';
  pageNumber: number;
  surahNumber: number;
  ayahNumber?: number;
  surahName: string;
  timestamp: number;
  note?: string;
}

export interface PrayerTimeItem {
  id: string;
  nameAr: string;
  nameEn: string;
  time: string;
  isNext?: boolean;
}

export interface KhatmahHistoryItem {
  date: string; // YYYY-MM-DD
  pagesRead: number;
  pageReached: number;
}

export interface KhatmahPlan {
  id: string;
  title: string;
  planMode: 'days' | 'pages'; // Planning by total days OR by daily page count
  targetDays: number;
  startDate: number;
  startPage: number;
  currentPage: number;
  dailyPagesTarget: number;
  todayPagesRead: number;
  lastReadDateString: string; // YYYY-MM-DD
  status: 'active' | 'completed';
  
  // Daily notification & reminder configuration
  reminderEnabled?: boolean;
  reminderTime?: string; // HH:mm format, e.g. "20:00"
  reminderLabel?: string;
  
  // Today's prayers distribution checkmarks
  completedPrayersToday?: string[]; // e.g. ['fajr', 'dhuhr']
  
  // Streak tracking & reading history
  streakDays?: number;
  history?: KhatmahHistoryItem[];
}

export interface DhikrDailyStats {
  date: string; // YYYY-MM-DD
  repetitions: Record<number, number>; // dhikrId -> total repetitions clicked today
  completedRounds: Record<number, number>; // dhikrId -> how many times target was finished today
  totalRepetitionsToday: number;
}

