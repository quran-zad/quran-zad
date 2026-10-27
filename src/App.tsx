import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { QuranPageView } from './components/QuranPageView';
import { SurahIndex } from './components/SurahIndex';
import { SearchModal } from './components/SearchModal';
import { TafsirModal } from './components/TafsirModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { HisnMuslimSection } from './components/HisnMuslimSection';
import { MorningEveningAdhkarSection } from './components/MorningEveningAdhkarSection';
import { PrayerTimesSection } from './components/PrayerTimesSection';
import { KhatmahTrackerView } from './components/KhatmahTrackerView';
import { QiblaCompassView } from './components/QiblaCompassView';
import { QuranRadioView } from './components/QuranRadioView';
import { DuaaAndRuqyahView } from './components/DuaaAndRuqyahView';
import { HaramainLiveView } from './components/HaramainLiveView';
import { AdvancedTasbihModal } from './components/AdvancedTasbihModal';
import { QuranDownloadModal } from './components/QuranDownloadModal';
import { InstallAppBanner } from './components/InstallAppBanner';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { StorageService, UserPrefs } from './services/storageService';
import { KhatmahReminderService } from './services/khatmahReminderService';
import { SURAHS_LIST } from './data/quranMeta';
import { Ayah, SearchMatch } from './types';
import { Heart, BookOpen, Sparkles, Bell, Download, Sun } from 'lucide-react';

export default function App() {
  const [prefs, setPrefs] = useState<UserPrefs>(() => StorageService.getPrefs());
  const [activeTab, setActiveTab] = useState<AppTab>('page');
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const last = StorageService.getLastRead();
    return last.pageNumber || 1;
  });
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isTasbihOpen, setIsTasbihOpen] = useState<boolean>(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState<Ayah | null>(null);
  const [highlightAyahNumber, setHighlightAyahNumber] = useState<number | undefined>(undefined);
  const [lastReadTitle, setLastReadTitle] = useState<string>('صفحة 1');
  const [khatmahAlert, setKhatmahAlert] = useState<{ message: string; page: number } | null>(null);
  const [adhkarSubView, setAdhkarSubView] = useState<'morning_evening' | 'hisn'>('morning_evening');

  // Periodic and on-mount Khatmah daily reminder check
  useEffect(() => {
    const checkKhatmahReminder = () => {
      const plan = StorageService.getKhatmahPlan();
      if (plan && plan.status === 'active' && plan.reminderEnabled) {
        KhatmahReminderService.checkAndTriggerDailyReminder(plan, (msg) => {
          setKhatmahAlert({
            message: msg,
            page: plan.currentPage
          });
        });
      }
    };

    checkKhatmahReminder();
    const interval = setInterval(checkKhatmahReminder, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync theme to document body
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'night') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const last = StorageService.getLastRead();
    setLastReadTitle(last.title);
  }, [prefs.theme]);

  const handleUpdatePrefs = (newPrefs: Partial<UserPrefs>) => {
    const updated = StorageService.savePrefs(newPrefs);
    setPrefs(updated);
  };

  const handleToggleTheme = () => {
    const nextTheme = prefs.theme === 'night' ? 'mushaf' : prefs.theme === 'mushaf' ? 'sepia' : 'night';
    handleUpdatePrefs({ theme: nextTheme });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setHighlightAyahNumber(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSearchResult = (page: number, surahNumber: number, ayahNumberInSurah: number) => {
    setCurrentPage(page);
    setActiveTab('page');
    setHighlightAyahNumber(ayahNumberInSurah);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTafsirFromSearch = (match: SearchMatch) => {
    const ayah: Ayah = {
      number: match.ayahNumber,
      numberInSurah: match.numberInSurah,
      text: match.text,
      surahNumber: match.surahNumber,
      page: match.page,
      juz: match.juz,
      tafsir: match.tafsir
    };
    setSelectedAyahForTafsir(ayah);
  };

  const handleSelectSurah = (startPage: number, surahNumber: number) => {
    setCurrentPage(startPage);
    setActiveTab('page');
    setHighlightAyahNumber(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaySurah = (surahNumber: number) => {
    const surah = SURAHS_LIST.find((s) => s.id === surahNumber);
    if (surah) {
      setCurrentPage(surah.startPage);
    }
    setActiveTab('page');
    setHighlightAyahNumber(undefined);
  };

  const handleNavigateToFatihah = () => {
    setCurrentPage(1);
    setActiveTab('page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find metadata for current page
  const currentSurahMeta = SURAHS_LIST.find(
    (s) => currentPage >= s.startPage && currentPage <= s.endPage
  ) || SURAHS_LIST[0];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      prefs.theme === 'night' 
        ? 'bg-stone-950 text-stone-100' 
        : prefs.theme === 'sepia' 
        ? 'bg-[#fcf8ed] text-stone-900' 
        : 'bg-stone-50 text-stone-900'
    }`}>
      {/* Header with Navigation and Memorial Dedication */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenTasbih={() => setIsTasbihOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
        onContinueReading={() => {
          const last = StorageService.getLastRead();
          if (last.pageNumber) {
            handlePageChange(last.pageNumber);
            setActiveTab('page');
          }
        }}
        onNavigateToFatihah={handleNavigateToFatihah}
        prefs={prefs}
        onToggleTheme={handleToggleTheme}
        lastReadTitle={lastReadTitle}
      />

      {/* Daily Khatmah Reminder In-App Banner */}
      {khatmahAlert && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white border-b border-amber-500/40 px-4 py-3 shadow-md animate-fade-in relative z-20">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <span className="font-reading text-amber-100">{khatmahAlert.message}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => {
                  handlePageChange(khatmahAlert.page);
                  setActiveTab('page');
                  setKhatmahAlert(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>اقرأ وردك الآن (ص {khatmahAlert.page})</span>
              </button>
              <button
                onClick={() => setActiveTab('khatmah')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs transition-colors"
              >
                عرض جدول الختمة
              </button>
              <button
                onClick={() => setKhatmahAlert(null)}
                className="text-stone-400 hover:text-white px-2 py-1 text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Quick Navigator */}
      {activeTab === 'page' && (
        <HeroSection
          onOpenSearch={() => setIsSearchOpen(true)}
          onStartReading={(page) => handlePageChange(page || currentPage)}
          onPlayPageAudio={(page) => handlePageChange(page)}
          onOpenAdhkar={() => {
            setActiveTab('adhkar');
            setAdhkarSubView('morning_evening');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="pb-24">
        {activeTab === 'page' && (
          <QuranPageView
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onOpenTafsir={(ayah) => setSelectedAyahForTafsir(ayah)}
            onPlayPageAudio={() => {}}
            onNavigateToKhatmah={() => setActiveTab('khatmah')}
            reciterId={prefs.reciterId}
            prefs={prefs}
            onUpdatePrefs={handleUpdatePrefs}
            highlightAyahNumber={highlightAyahNumber}
          />
        )}

        {activeTab === 'surahs' && (
          <SurahIndex
            onSelectSurah={handleSelectSurah}
            onPlaySurah={handlePlaySurah}
          />
        )}

        {activeTab === 'khatmah' && (
          <KhatmahTrackerView
            onNavigateToPage={(p) => {
              setCurrentPage(p);
              setActiveTab('page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'adhkar' && (
          <div className="space-y-4">
            {/* Top Sub-Switcher between Morning/Evening Adhkar and Full Hisn Muslim */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-center">
              <div className="p-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center gap-1 shadow-xs">
                <button
                  onClick={() => setAdhkarSubView('morning_evening')}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                    adhkarSubView === 'morning_evening'
                      ? 'bg-emerald-900 text-amber-300 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>أذكار الصباح والمساء (العد التنازلي)</span>
                </button>

                <button
                  onClick={() => setAdhkarSubView('hisn')}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                    adhkarSubView === 'hisn'
                      ? 'bg-emerald-900 text-amber-300 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>موسوعة حصن المسلم</span>
                </button>
              </div>
            </div>

            {adhkarSubView === 'morning_evening' ? (
              <MorningEveningAdhkarSection onNavigateToHisn={() => setAdhkarSubView('hisn')} />
            ) : (
              <HisnMuslimSection />
            )}
          </div>
        )}

        {activeTab === 'prayer' && (
          <PrayerTimesSection />
        )}

        {activeTab === 'qibla' && (
          <QiblaCompassView />
        )}

        {activeTab === 'radio' && (
          <QuranRadioView />
        )}

        {activeTab === 'duaa' && (
          <DuaaAndRuqyahView />
        )}

        {activeTab === 'live' && (
          <HaramainLiveView />
        )}
      </main>

      {/* Sticky Murtal Audio Player Bar (only for Quran page reading) */}
      {activeTab === 'page' && (
        <AudioPlayerBar
          currentPage={currentPage}
          surahName={currentSurahMeta.name}
          onPageChange={handlePageChange}
          reciterId={prefs.reciterId}
          onReciterChange={(newReciterId) => handleUpdatePrefs({ reciterId: newReciterId })}
          playbackRate={prefs.playbackRate}
          onPlaybackRateChange={(rate) => handleUpdatePrefs({ playbackRate: rate })}
          autoPlayNext={prefs.autoPlayNextPage}
          onToggleAutoPlayNext={() => handleUpdatePrefs({ autoPlayNextPage: !prefs.autoPlayNextPage })}
        />
      )}

      {/* Quran Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
        onOpenTafsir={handleOpenTafsirFromSearch}
      />

      {/* Ayah Tafsir & Share Modal */}
      <TafsirModal
        ayah={selectedAyahForTafsir}
        onClose={() => setSelectedAyahForTafsir(null)}
        reciterId={prefs.reciterId}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onNavigateToPage={(p) => {
          setCurrentPage(p);
          setActiveTab('page');
        }}
      />

      {/* Advanced Interactive Digital Tasbih Modal */}
      <AdvancedTasbihModal
        isOpen={isTasbihOpen}
        onClose={() => setIsTasbihOpen(false)}
      />

      {/* Quran Juz Download Modal (Word & PDF) */}
      <QuranDownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

      {/* PWA Install App Banner */}
      <InstallAppBanner />

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800/80 bg-white/60 dark:bg-stone-950/40 py-8 pb-32 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2 font-reading font-semibold text-emerald-950 dark:text-amber-200 text-sm">
            <BookOpen className="w-4 h-4 text-emerald-700 dark:text-amber-300" />
            <span>نُورُ القُرْآنِ الكَرِيمِ - المِنَصَّةُ الإِسْلَامِيَّةُ الشَّامِلَةُ</span>
          </div>
          <p className="max-w-lg mx-auto text-[11px] leading-relaxed">
            جميع النصوص والتفاسير مأخوذة من مصحف مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة والتفسير الميسر المعتمد.
          </p>
          <div className="pt-2 text-xs font-reading text-emerald-900 dark:text-amber-200">
            صدقة جارية عن روح والدي المرحوم <strong>سليم بركات</strong>، وأخي المرحوم <strong>محمود سليم بركات</strong>، رحمهما الله وأسكنهما فسيح جناته.
          </div>
          <div className="text-[10px] text-stone-400">
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ
          </div>
        </div>
      </footer>
    </div>
  );
}
