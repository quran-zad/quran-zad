import { Bookmark, KhatmahPlan, DhikrDailyStats } from '../types';

const LIKES_KEY = 'nur_quran_likes_v1';
const VIEWS_KEY = 'nur_quran_views_v1';
const BOOKMARKS_KEY = 'nur_quran_bookmarks_v1';
const LAST_READ_KEY = 'nur_quran_last_read_v1';
const PREFS_KEY = 'nur_quran_prefs_v1';
const KHATMAH_KEY = 'nur_quran_khatmah_v1';
const FAV_ADHKAR_KEY = 'nur_quran_fav_adhkar_v1';
const DHIKR_COUNTS_KEY = 'nur_quran_dhikr_counts_v1';
const DHIKR_DAILY_STATS_KEY = 'nur_quran_dhikr_daily_stats_v1';

export interface UserPrefs {
  theme: 'mushaf' | 'sepia' | 'night';
  reciterId: string;
  fontSize: number; // 20 to 36
  autoPlayNextPage: boolean;
  playbackRate: number;
  translationId: string;
  showTranslation: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  theme: 'mushaf',
  reciterId: 'alafasy',
  fontSize: 24,
  autoPlayNextPage: false,
  playbackRate: 1.0,
  translationId: 'en.sahih',
  showTranslation: false,
};

// Seed realistic view counts based on item ID so it looks vibrant from first load
function getBaseViewCount(prefix: string, id: number | string): number {
  const numId = typeof id === 'number' ? id : parseInt(id.toString().replace(/\D/g, '') || '1', 10);
  if (prefix === 'surah') {
    // Fatihah, Baqarah, Yasin, Kahf, Mulk have higher counts
    if (numId === 1) return 148200;
    if (numId === 2) return 112450;
    if (numId === 18) return 98600;
    if (numId === 36) return 89400;
    if (numId === 67) return 94200;
    return 12000 + ((numId * 137 + 540) % 25000);
  }
  if (prefix === 'page') {
    if (numId === 1) return 82400;
    if (numId === 2) return 64100;
    if (numId === 604) return 71200;
    return 4800 + ((numId * 97 + 120) % 18000);
  }
  return 1200 + ((Number(numId) * 31) % 4000);
}

function getBaseLikesCount(prefix: string, id: number | string): number {
  const baseViews = getBaseViewCount(prefix, id);
  return Math.floor(baseViews * 0.08) + 12;
}

export const StorageService = {
  // Likes
  getUserLikes(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(LIKES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  isLiked(key: string): boolean {
    const likes = this.getUserLikes();
    return !!likes[key];
  },

  toggleLike(key: string, prefix: string, id: number | string): { isLiked: boolean; count: number } {
    const likes = this.getUserLikes();
    const currentlyLiked = !!likes[key];
    const newLiked = !currentlyLiked;
    likes[key] = newLiked;
    try {
      localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    } catch (e) {
      console.warn('Storage quota', e);
    }

    const currentCount = this.getLikesCount(key, prefix, id);
    const updatedCount = currentCount + (newLiked ? 1 : -1);
    this.setLikesCount(key, updatedCount);

    return { isLiked: newLiked, count: updatedCount };
  },

  getLikesCount(key: string, prefix: string, id: number | string): number {
    try {
      const countsRaw = localStorage.getItem(`${LIKES_KEY}_counts`);
      const counts = countsRaw ? JSON.parse(countsRaw) : {};
      if (counts[key] !== undefined) {
        return counts[key];
      }
    } catch {}
    const base = getBaseLikesCount(prefix, id);
    const userLikes = this.getUserLikes();
    return userLikes[key] ? base + 1 : base;
  },

  setLikesCount(key: string, count: number): void {
    try {
      const countsRaw = localStorage.getItem(`${LIKES_KEY}_counts`);
      const counts = countsRaw ? JSON.parse(countsRaw) : {};
      counts[key] = count;
      localStorage.setItem(`${LIKES_KEY}_counts`, JSON.stringify(counts));
    } catch {}
  },

  // Views
  recordView(key: string, prefix: string, id: number | string): number {
    let localViews: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(VIEWS_KEY);
      if (raw) localViews = JSON.parse(raw);
    } catch {}

    const base = getBaseViewCount(prefix, id);
    const existingDelta = localViews[key] || 0;
    const newDelta = existingDelta + 1;
    localViews[key] = newDelta;

    try {
      localStorage.setItem(VIEWS_KEY, JSON.stringify(localViews));
    } catch {}

    return base + newDelta;
  },

  getViewCount(key: string, prefix: string, id: number | string): number {
    let localViews: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(VIEWS_KEY);
      if (raw) localViews = JSON.parse(raw);
    } catch {}
    const base = getBaseViewCount(prefix, id);
    return base + (localViews[key] || 0);
  },

  // Bookmarks
  getBookmarks(): Bookmark[] {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveBookmark(bookmark: Bookmark): void {
    const bookmarks = this.getBookmarks().filter(b => b.id !== bookmark.id);
    bookmarks.unshift(bookmark);
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks.slice(0, 50)));
    } catch {}
  },

  removeBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch {}
  },

  // Last Read Position
  getLastRead(): { pageNumber: number; surahNumber: number; ayahNumber?: number; title: string; timestamp: number } {
    try {
      const raw = localStorage.getItem(LAST_READ_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      pageNumber: 1,
      surahNumber: 1,
      ayahNumber: 1,
      title: 'سورة الفاتحة - الصفحة 1',
      timestamp: Date.now()
    };
  },

  setLastRead(pos: { pageNumber: number; surahNumber: number; ayahNumber?: number; title: string }): void {
    try {
      localStorage.setItem(LAST_READ_KEY, JSON.stringify({ ...pos, timestamp: Date.now() }));
    } catch {}
  },

  // User Prefs
  getPrefs(): UserPrefs {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_PREFS;
  },

  savePrefs(prefs: Partial<UserPrefs>): UserPrefs {
    const current = this.getPrefs();
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  // Khatmah Tracking
  getKhatmahPlan(): KhatmahPlan | null {
    try {
      const raw = localStorage.getItem(KHATMAH_KEY);
      if (!raw) return null;
      const plan: KhatmahPlan = JSON.parse(raw);
      
      // Ensure defaults for backward compatibility
      if (!plan.planMode) plan.planMode = 'days';
      if (!plan.completedPrayersToday) plan.completedPrayersToday = [];
      if (plan.streakDays === undefined) plan.streakDays = 1;
      if (!plan.history) plan.history = [];
      if (plan.reminderTime === undefined) plan.reminderTime = '20:00';
      if (plan.reminderEnabled === undefined) plan.reminderEnabled = true;

      // Check if it's a new day to reset today's counters
      const today = new Date().toISOString().slice(0, 10);
      if (plan.lastReadDateString !== today) {
        // If yesterday they reached their goal, maintain/increment streak
        if (plan.todayPagesRead >= plan.dailyPagesTarget) {
          plan.streakDays = (plan.streakDays || 0) + 1;
        }
        plan.todayPagesRead = 0;
        plan.completedPrayersToday = [];
        plan.lastReadDateString = today;
        localStorage.setItem(KHATMAH_KEY, JSON.stringify(plan));
      }
      return plan;
    } catch {
      return null;
    }
  },

  saveKhatmahPlan(plan: KhatmahPlan): void {
    try {
      localStorage.setItem(KHATMAH_KEY, JSON.stringify(plan));
    } catch {}
  },

  createKhatmahPlan(
    targetDaysOrOptions: number | {
      planMode: 'days' | 'pages';
      targetDays?: number;
      dailyPagesTarget?: number;
      startPage?: number;
      title?: string;
      reminderEnabled?: boolean;
      reminderTime?: string;
    }, 
    startPage: number = 1, 
    title: string = 'ختمة القرآن الكريم'
  ): KhatmahPlan {
    const today = new Date().toISOString().slice(0, 10);

    let planMode: 'days' | 'pages' = 'days';
    let targetDays = 30;
    let dailyTarget = 20;
    let validStart = 1;
    let planTitle = title;
    let reminderEnabled = true;
    let reminderTime = '20:00';

    if (typeof targetDaysOrOptions === 'object') {
      planMode = targetDaysOrOptions.planMode || 'days';
      validStart = Math.min(604, Math.max(1, targetDaysOrOptions.startPage || 1));
      planTitle = targetDaysOrOptions.title || 'ختمة القرآن الكريم';
      reminderEnabled = targetDaysOrOptions.reminderEnabled ?? true;
      reminderTime = targetDaysOrOptions.reminderTime || '20:00';

      const remainingPages = 604 - validStart + 1;

      if (planMode === 'pages') {
        dailyTarget = Math.max(1, targetDaysOrOptions.dailyPagesTarget || 20);
        targetDays = Math.max(1, Math.ceil(remainingPages / dailyTarget));
      } else {
        targetDays = Math.max(1, targetDaysOrOptions.targetDays || 30);
        dailyTarget = Math.max(1, Math.ceil(remainingPages / targetDays));
      }
    } else {
      targetDays = Math.max(1, targetDaysOrOptions);
      validStart = Math.min(604, Math.max(1, startPage));
      const remainingPages = 604 - validStart + 1;
      dailyTarget = Math.max(1, Math.ceil(remainingPages / targetDays));
    }

    const plan: KhatmahPlan = {
      id: `khatmah_${Date.now()}`,
      title: planTitle,
      planMode,
      targetDays,
      startDate: Date.now(),
      startPage: validStart,
      currentPage: validStart,
      dailyPagesTarget: dailyTarget,
      todayPagesRead: 0,
      lastReadDateString: today,
      status: 'active',
      reminderEnabled,
      reminderTime,
      completedPrayersToday: [],
      streakDays: 1,
      history: [{
        date: today,
        pagesRead: 0,
        pageReached: validStart
      }]
    };

    this.saveKhatmahPlan(plan);
    return plan;
  },

  updateKhatmahPlanSettings(updates: Partial<KhatmahPlan>): KhatmahPlan | null {
    const plan = this.getKhatmahPlan();
    if (!plan) return null;

    const updated = { ...plan, ...updates };
    this.saveKhatmahPlan(updated);
    return updated;
  },

  togglePrayerCheckmark(prayerKey: string): KhatmahPlan | null {
    const plan = this.getKhatmahPlan();
    if (!plan) return null;

    const currentPrayers = plan.completedPrayersToday || [];
    const isCompleted = currentPrayers.includes(prayerKey);
    
    let newPrayers: string[];
    if (isCompleted) {
      newPrayers = currentPrayers.filter(p => p !== prayerKey);
    } else {
      newPrayers = [...currentPrayers, prayerKey];
    }

    plan.completedPrayersToday = newPrayers;
    this.saveKhatmahPlan(plan);
    return plan;
  },

  updateKhatmahProgress(pageNumber: number): KhatmahPlan | null {
    const plan = this.getKhatmahPlan();
    if (!plan || plan.status === 'completed') return null;

    const today = new Date().toISOString().slice(0, 10);
    const prevPage = plan.currentPage;
    const newPage = Math.min(604, Math.max(1, pageNumber));

    // Calculate pages progressed if advanced
    if (newPage > prevPage) {
      const pagesAdvanced = newPage - prevPage;
      plan.todayPagesRead = (plan.todayPagesRead || 0) + pagesAdvanced;
    }

    plan.currentPage = newPage;
    plan.lastReadDateString = today;

    // Update history for today
    if (!plan.history) plan.history = [];
    const todayIndex = plan.history.findIndex(h => h.date === today);
    if (todayIndex >= 0) {
      plan.history[todayIndex].pagesRead = plan.todayPagesRead;
      plan.history[todayIndex].pageReached = newPage;
    } else {
      plan.history.unshift({
        date: today,
        pagesRead: plan.todayPagesRead,
        pageReached: newPage
      });
    }

    if (newPage >= 604) {
      plan.status = 'completed';
    } else {
      // If planMode is 'days', adjust dailyPagesTarget based on remaining days
      if (plan.planMode === 'days') {
        const daysPassed = Math.floor((Date.now() - plan.startDate) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(1, plan.targetDays - daysPassed);
        const pagesLeft = Math.max(0, 604 - newPage + 1);
        plan.dailyPagesTarget = Math.max(1, Math.ceil(pagesLeft / daysLeft));
      } else {
        // If planMode is 'pages', recalculate targetDays based on remaining pages
        const pagesLeft = Math.max(0, 604 - newPage + 1);
        const daysLeft = Math.max(1, Math.ceil(pagesLeft / plan.dailyPagesTarget));
        const daysPassed = Math.floor((Date.now() - plan.startDate) / (1000 * 60 * 60 * 24));
        plan.targetDays = daysPassed + daysLeft;
      }
    }

    this.saveKhatmahPlan(plan);
    return plan;
  },

  resetKhatmahPlan(): void {
    try {
      localStorage.removeItem(KHATMAH_KEY);
    } catch {}
  },

  // Hisn Al-Muslim: Favorite Adhkar
  getFavoriteAdhkarIds(): number[] {
    try {
      const raw = localStorage.getItem(FAV_ADHKAR_KEY);
      return raw ? JSON.parse(raw) : [2, 3, 7, 14, 25, 39, 44, 54]; // defaults: popular beloved Adhkar
    } catch {
      return [2, 3, 7, 14, 25, 39, 44, 54];
    }
  },

  isFavoriteDhikr(id: number): boolean {
    const favs = this.getFavoriteAdhkarIds();
    return favs.includes(id);
  },

  toggleFavoriteDhikr(id: number): boolean {
    const favs = this.getFavoriteAdhkarIds();
    const index = favs.indexOf(id);
    let isNowFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isNowFav = false;
    } else {
      favs.push(id);
      isNowFav = true;
    }
    try {
      localStorage.setItem(FAV_ADHKAR_KEY, JSON.stringify(favs));
    } catch {}
    return isNowFav;
  },

  // Hisn Al-Muslim: Dhikr Progress Counts
  getDhikrCounts(): Record<number, number> {
    try {
      const raw = localStorage.getItem(DHIKR_COUNTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveDhikrCount(id: number, count: number): void {
    const current = this.getDhikrCounts();
    current[id] = count;
    try {
      localStorage.setItem(DHIKR_COUNTS_KEY, JSON.stringify(current));
    } catch {}
  },

  resetAllDhikrCounts(): void {
    try {
      localStorage.removeItem(DHIKR_COUNTS_KEY);
    } catch {}
  },

  // Daily Adhkar Repetition & Stats Tracking
  getTodayDateString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  getDailyDhikrStats(): DhikrDailyStats {
    const today = this.getTodayDateString();
    try {
      const raw = localStorage.getItem(DHIKR_DAILY_STATS_KEY);
      if (raw) {
        const parsed: DhikrDailyStats = JSON.parse(raw);
        // If from today, return it
        if (parsed.date === today) {
          return {
            date: today,
            repetitions: parsed.repetitions || {},
            completedRounds: parsed.completedRounds || {},
            totalRepetitionsToday: parsed.totalRepetitionsToday || 0,
          };
        }
      }
    } catch {}

    // Fresh log for today
    const fresh: DhikrDailyStats = {
      date: today,
      repetitions: {},
      completedRounds: {},
      totalRepetitionsToday: 0
    };
    try {
      localStorage.setItem(DHIKR_DAILY_STATS_KEY, JSON.stringify(fresh));
    } catch {}
    return fresh;
  },

  recordDhikrRepetition(dhikrId: number, targetCount: number): {
    currentCount: number;
    remainingCount: number;
    todayRepetitions: number;
    completedRoundsToday: number;
    isRoundComplete: boolean;
  } {
    // 1. Current round count (from 0 up to targetCount)
    const counts = this.getDhikrCounts();
    let currentRoundCount = counts[dhikrId] || 0;
    let isRoundComplete = false;

    if (currentRoundCount < targetCount) {
      currentRoundCount += 1;
    } else {
      // Starting another round!
      currentRoundCount = 1;
    }

    counts[dhikrId] = currentRoundCount;
    this.saveDhikrCount(dhikrId, currentRoundCount);

    if (currentRoundCount >= targetCount) {
      isRoundComplete = true;
    }

    // 2. Accumulate in today's daily stats
    const stats = this.getDailyDhikrStats();
    stats.repetitions[dhikrId] = (stats.repetitions[dhikrId] || 0) + 1;
    stats.totalRepetitionsToday = (stats.totalRepetitionsToday || 0) + 1;

    if (isRoundComplete) {
      stats.completedRounds[dhikrId] = (stats.completedRounds[dhikrId] || 0) + 1;
    }

    try {
      localStorage.setItem(DHIKR_DAILY_STATS_KEY, JSON.stringify(stats));
    } catch {}

    return {
      currentCount: currentRoundCount,
      remainingCount: Math.max(0, targetCount - currentRoundCount),
      todayRepetitions: stats.repetitions[dhikrId],
      completedRoundsToday: stats.completedRounds[dhikrId] || 0,
      isRoundComplete
    };
  },

  resetDhikrCurrentRound(dhikrId: number): void {
    const counts = this.getDhikrCounts();
    counts[dhikrId] = 0;
    try {
      localStorage.setItem(DHIKR_COUNTS_KEY, JSON.stringify(counts));
    } catch {}
  },

  resetAllTodayStats(): void {
    const today = this.getTodayDateString();
    const fresh: DhikrDailyStats = {
      date: today,
      repetitions: {},
      completedRounds: {},
      totalRepetitionsToday: 0
    };
    try {
      localStorage.setItem(DHIKR_DAILY_STATS_KEY, JSON.stringify(fresh));
      localStorage.removeItem(DHIKR_COUNTS_KEY);
    } catch {}
  }
};

