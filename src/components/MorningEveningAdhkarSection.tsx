import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun, Moon, RotateCcw, CheckCircle2, Copy, Share2, 
  Volume2, VolumeX, Sparkles, Heart, Check, Clock,
  TrendingUp, Award, BarChart3, ArrowDownCircle, 
  Calendar, Layers, ZoomIn, ZoomOut, Volume1, Play, Pause,
  ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, Info
} from 'lucide-react';
import { MORNING_EVENING_ADHKAR, DhikrItem } from '../data/adhkarData';
import { StorageService } from '../services/storageService';
import { TtsService } from '../services/ttsService';
import { DhikrDailyStats } from '../types';

interface MorningEveningAdhkarSectionProps {
  onNavigateToHisn?: () => void;
}

export const MorningEveningAdhkarSection: React.FC<MorningEveningAdhkarSectionProps> = ({
  onNavigateToHisn
}) => {
  // Determine default tab based on current time of day:
  // 04:00 - 15:00 -> Morning Adhkar ('sabah')
  // 15:00 - 04:00 -> Evening Adhkar ('masaa')
  const defaultTab = useMemo<'sabah' | 'masaa'>(() => {
    const hour = new Date().getHours();
    return (hour >= 4 && hour < 15) ? 'sabah' : 'masaa';
  }, []);

  const [activeTab, setActiveTab] = useState<'sabah' | 'masaa' | 'stats'>(defaultTab);
  const [counts, setCounts] = useState<Record<number, number>>(() => StorageService.getDhikrCounts());
  const [dailyStats, setDailyStats] = useState<DhikrDailyStats>(() => StorageService.getDailyDhikrStats());
  const [countingMode, setCountingMode] = useState<'countdown' | 'countup'>('countdown'); // Default to countdown as requested
  const [fontSize, setFontSize] = useState<number>(20); // 18 - 26px
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [speakingDhikrId, setSpeakingDhikrId] = useState<number | null>(null);

  // Sync state on mount and keep updated
  useEffect(() => {
    setCounts(StorageService.getDhikrCounts());
    setDailyStats(StorageService.getDailyDhikrStats());
  }, []);

  // Stop TTS if user unmounts or switches tabs
  useEffect(() => {
    return () => {
      TtsService.stop();
    };
  }, [activeTab]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Play subtle audio tone on completion
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {}
  };

  // Tap on counter for a dhikr
  const handleDhikrTap = (item: DhikrItem) => {
    const res = StorageService.recordDhikrRepetition(item.id, item.count);

    // Update local state
    setCounts(prev => ({ ...prev, [item.id]: res.currentCount }));
    setDailyStats(StorageService.getDailyDhikrStats());

    // Haptic feedback
    if (vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      if (res.isRoundComplete) {
        navigator.vibrate([40, 50, 80]);
        playChime();
        triggerToast(`ما شاء الله! تم إكمال الورد: ${item.title}`);
      } else {
        navigator.vibrate(25);
      }
    } else if (res.isRoundComplete) {
      playChime();
      triggerToast(`ما شاء الله! تم إكمال الورد: ${item.title}`);
    }
  };

  // Reset current round counter for single dhikr (preserves today's accumulated repetitions)
  const handleResetCurrentRound = (item: DhikrItem) => {
    StorageService.resetDhikrCurrentRound(item.id);
    setCounts(prev => ({ ...prev, [item.id]: 0 }));
    triggerToast(`تمت إعادة ضبط عداد: ${item.title}`);
  };

  // Reset current round for all adhkar in the active category
  const handleResetCategoryRounds = () => {
    if (window.confirm('هل تريد إعادة ضبط عداد الدورة الحالية لجميع أذكار هذا القسم؟ (ملاحظة: سجل التكرارات اليومية التراكمي سيبقى محفوظاً).')) {
      const currentList = MORNING_EVENING_ADHKAR.filter(a => a.category === activeTab);
      const updated = { ...counts };
      currentList.forEach(item => {
        updated[item.id] = 0;
        StorageService.resetDhikrCurrentRound(item.id);
      });
      setCounts(updated);
      triggerToast('تمت إعادة ضبط عدادات الدورة الحالية بنجاح');
    }
  };

  // Reset all today stats
  const handleResetAllTodayStats = () => {
    if (window.confirm('هل تريد تصفير جميع إحصائيات وتكرارات اليوم نهائياً؟')) {
      StorageService.resetAllTodayStats();
      setCounts({});
      setDailyStats(StorageService.getDailyDhikrStats());
      triggerToast('تم تصفير سجل تكرارات اليوم');
    }
  };

  // Copy Dhikr text
  const handleCopy = (item: DhikrItem) => {
    const text = `﴿ ${item.title} ﴾\n\n${item.text}\n\n[عدد المرات: ${item.count} مرات]\nالفضل: ${item.reward}\nالمصدر: ${item.reference || 'السنة النبوية'}\n\nتطبيق نور القرآن الكريم`;
    navigator.clipboard.writeText(text).then(() => {
      triggerToast('تم نسخ الذكر المبارك إلى الحافظة');
    });
  };

  // Share Dhikr
  const handleShare = async (item: DhikrItem) => {
    const shareData = {
      title: item.title,
      text: `﴿ ${item.title} ﴾\n\n${item.text}\n\n[تكرار: ${item.count} مرات] - ${item.reward}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopy(item);
      }
    } else {
      handleCopy(item);
    }
  };

  // Audio TTS recitation of Dhikr
  const handleToggleAudio = (item: DhikrItem) => {
    if (speakingDhikrId === item.id) {
      TtsService.stop();
      setSpeakingDhikrId(null);
      return;
    }

    TtsService.stop();
    setSpeakingDhikrId(item.id);

    const fullNarration = `${item.title}. ${item.text}`;
    TtsService.speak(fullNarration, {
      rate: 0.9,
      lang: 'ar-SA',
      onStart: () => setSpeakingDhikrId(item.id),
      onEnd: () => setSpeakingDhikrId(null),
      onError: () => {
        setSpeakingDhikrId(null);
        triggerToast('تعذر تشغيل الصوت عبر المتصفح');
      }
    });
  };

  // Filtered list
  const currentAdhkarList = useMemo(() => {
    if (activeTab === 'sabah' || activeTab === 'masaa') {
      return MORNING_EVENING_ADHKAR.filter(a => a.category === activeTab);
    }
    return [];
  }, [activeTab]);

  // Statistics calculations
  const morningList = MORNING_EVENING_ADHKAR.filter(a => a.category === 'sabah');
  const eveningList = MORNING_EVENING_ADHKAR.filter(a => a.category === 'masaa');

  const morningCompletedCount = useMemo(() => {
    return morningList.filter(item => (counts[item.id] || 0) >= item.count).length;
  }, [morningList, counts]);

  const eveningCompletedCount = useMemo(() => {
    return eveningList.filter(item => (counts[item.id] || 0) >= item.count).length;
  }, [eveningList, counts]);

  const currentCategoryCompleted = activeTab === 'sabah' ? morningCompletedCount : eveningCompletedCount;
  const currentCategoryTotal = activeTab === 'sabah' ? morningList.length : eveningList.length;
  const currentPercentage = currentCategoryTotal > 0 ? Math.round((currentCategoryCompleted / currentCategoryTotal) * 100) : 0;

  // Breakdown of top recited adhkar today
  const topRecitedToday = useMemo(() => {
    const list: { item: DhikrItem; repetitions: number; rounds: number }[] = [];
    MORNING_EVENING_ADHKAR.forEach(item => {
      const reps = dailyStats.repetitions[item.id] || 0;
      const rounds = dailyStats.completedRounds[item.id] || 0;
      if (reps > 0) {
        list.push({ item, repetitions: reps, rounds });
      }
    });
    return list.sort((a, b) => b.repetitions - a.repetitions);
  }, [dailyStats]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8" dir="rtl">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-amber-200 px-5 py-2.5 rounded-full shadow-2xl border border-amber-500/50 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white shadow-xl border border-emerald-800/60 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>أذكار الصباح والمساء التفاعلية · عد تنازلي وإحصاء دقيق</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold font-reading text-amber-100 tracking-wide">
              {activeTab === 'sabah' ? 'أذكار الصباح المباركة' : activeTab === 'masaa' ? 'أذكار المساء وحفظ الليلة' : 'لوحة إنجازات وتكرارات الأذكار'}
            </h2>
            
            <p className="text-xs sm:text-sm text-stone-300 font-reading leading-relaxed">
              حصّن يومك وليلتك بأذكار السنة النبوية الصحيحة. اضغط على الدائرة للعد التنازلي المباشر حتى اكتمال كل ذكر، مع تسجيل تراكمي دقيق لتكراراتك خلال اليوم كاملاً.
            </p>
          </div>

          {/* Quick KPI Badge */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[200px] shrink-0 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>تكراراتك اليوم الإجمالية</span>
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-100 tabular-nums">
              {dailyStats.totalRepetitionsToday.toLocaleString('ar-EG')}
            </div>
            <div className="text-[11px] text-stone-300 flex items-center justify-center gap-1">
              <span>تسبيحة وذكر مسجلة اليوم</span>
            </div>
          </div>
        </div>

        {/* Category Progress Bar (when viewing sabah or masaa) */}
        {activeTab !== 'stats' && (
          <div className="mt-6 pt-5 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>إنجاز ورد {activeTab === 'sabah' ? 'الصباح' : 'المساء'}:</span>
              <strong className="text-amber-200 text-sm">
                {currentCategoryCompleted} من {currentCategoryTotal} ذكر ({currentPercentage}%)
              </strong>
            </div>

            <div className="w-full sm:w-64 h-2.5 bg-stone-950/60 rounded-full overflow-hidden border border-emerald-800/40">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Mode Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category Tabs: Sabah / Masaa / Daily Stats */}
        <div className="p-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center gap-1 shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('sabah')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'sabah'
                ? 'bg-emerald-900 text-amber-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            <Sun className={`w-4 h-4 ${activeTab === 'sabah' ? 'text-amber-400 animate-spin-slow' : 'text-amber-500'}`} />
            <span>أذكار الصباح ({morningCompletedCount}/{morningList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('masaa')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'masaa'
                ? 'bg-emerald-900 text-amber-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            <Moon className={`w-4 h-4 ${activeTab === 'masaa' ? 'text-amber-300' : 'text-blue-400'}`} />
            <span>أذكار المساء ({eveningCompletedCount}/{eveningList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-emerald-900 text-amber-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>سجل وإحصائيات اليوم</span>
          </button>
        </div>

        {/* Interactive Controls & Settings Bar */}
        {activeTab !== 'stats' && (
          <div className="flex items-center flex-wrap gap-2 text-xs">
            
            {/* Countdown vs Countup Toggle */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-1">
              <button
                onClick={() => setCountingMode('countdown')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  countingMode === 'countdown'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="نمط العد التنازلي: يبدأ من العدد المستحب وينقص حتى الصفر"
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                <span>العد التنازلي (المتبقي)</span>
              </button>

              <button
                onClick={() => setCountingMode('countup')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  countingMode === 'countup'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="نمط العد التصاعدي: يبدأ من 0 ويزيد"
              >
                <span>العد التصاعدي</span>
              </button>
            </div>

            {/* Font Sizing */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-2 py-1">
              <button
                onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
                className="p-1 text-stone-500 hover:text-stone-800"
                title="تصغير الخط"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-stone-600 dark:text-stone-300">A</span>
              <button
                onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                className="p-1 text-stone-500 hover:text-stone-800"
                title="تكبير الخط"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Current Category Rounds */}
            <button
              onClick={handleResetCategoryRounds}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
              title="إعادة تصفير عدادات الدورة الحالية مع الحفاظ على سجل اليوم"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير الدورة</span>
            </button>

            {/* Link to Hisn Al-Muslim if available */}
            {onNavigateToHisn && (
              <button
                onClick={onNavigateToHisn}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 font-semibold transition-colors"
                title="تصفح جميع أبواب حصن المسلم"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>حصن المسلم الشامل</span>
              </button>
            )}

          </div>
        )}
      </div>

      {/* ===================== VIEW 1: Adhkar Cards (Sabah or Masaa) ===================== */}
      {(activeTab === 'sabah' || activeTab === 'masaa') && (
        <div className="space-y-5">
          {currentAdhkarList.map((item, index) => {
            const currentRoundCount = counts[item.id] || 0;
            const isCompleted = currentRoundCount >= item.count;
            const remainingCount = Math.max(0, item.count - currentRoundCount);
            const totalRepetitionsToday = dailyStats.repetitions[item.id] || 0;
            const completedRoundsToday = dailyStats.completedRounds[item.id] || 0;
            const isSpeaking = speakingDhikrId === item.id;

            // Percentage of current round done
            const roundPercentage = Math.min(100, Math.round((currentRoundCount / item.count) * 100));

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 dark:from-emerald-950/30 dark:via-stone-900 dark:to-stone-900 border-emerald-400 dark:border-emerald-700/70 shadow-sm'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-600/40 shadow-xs'
                }`}
              >
                
                {/* Top Card Info Bar */}
                <div className="flex items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 flex items-center justify-center font-mono font-bold text-xs">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base font-reading text-emerald-950 dark:text-amber-200">
                      {item.title}
                    </h3>
                  </div>

                  {/* Daily Repetitions Indicator Badge */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-600/30 text-[11px] font-semibold text-amber-950 dark:text-amber-200 flex items-center gap-1.5"
                      title="عدد التكرارات التي قمت بها لهذا الذكر خلال اليوم كاملاً"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>تكراراتك اليوم: <strong>{totalRepetitionsToday}</strong></span>
                      {completedRoundsToday > 0 && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          ({completedRoundsToday} {completedRoundsToday === 1 ? 'دورة' : 'دورات'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content & Counter Area */}
                <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6">
                  
                  {/* Left (Text & Virtues) */}
                  <div className="flex-1 space-y-4">
                    <p 
                      className="font-quran leading-loose text-stone-900 dark:text-stone-100 text-right select-text"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {item.text}
                    </p>

                    {/* Reward & Reference Badge */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60 space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-emerald-900 dark:text-emerald-300 font-reading font-semibold">
                        <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>فضله: {item.reward}</span>
                      </div>
                      {item.reference && (
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                          المصدر: {item.reference}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Dedicated Interactive Countdown Widget */}
                  <div className="flex flex-col items-center justify-center shrink-0 lg:w-48 pt-2 lg:pt-0 lg:border-r lg:border-stone-100 lg:dark:border-stone-800/80 lg:pr-6">
                    
                    {/* Big Interactive Touch Target */}
                    <button
                      onClick={() => handleDhikrTap(item)}
                      className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full transition-all transform active:scale-95 flex flex-col items-center justify-center select-none shadow-lg cursor-pointer ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white ring-4 ring-emerald-300 dark:ring-emerald-700'
                          : 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-stone-900 text-amber-200 hover:from-emerald-700 hover:to-stone-800 ring-4 ring-amber-400/30'
                      }`}
                      aria-label="العد للذكر"
                    >
                      {/* Radial Progress Ring SVG */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          className="stroke-white/10 fill-none"
                          strokeWidth="5"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          className={`fill-none transition-all duration-300 ${
                            isCompleted ? 'stroke-amber-300' : 'stroke-amber-400'
                          }`}
                          strokeWidth="5"
                          strokeDasharray={276.46}
                          strokeDashoffset={276.46 - (276.46 * roundPercentage) / 100}
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Display Numbers */}
                      {isCompleted ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-1 z-10">
                          <CheckCircle2 className="w-8 h-8 text-amber-300 animate-bounce" />
                          <span className="text-xs font-bold font-reading text-white">
                            مكتمل ({item.count})
                          </span>
                          <span className="text-[10px] text-amber-200 font-reading">
                            اضغط لتكرار جديد
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center z-10">
                          {countingMode === 'countdown' ? (
                            <>
                              <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-100 tabular-nums">
                                {remainingCount}
                              </span>
                              <span className="text-[11px] font-semibold text-emerald-200 font-reading mt-0.5">
                                المتبقي من {item.count}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-1 font-mono font-bold text-amber-100">
                                <span className="text-2xl sm:text-3xl tabular-nums">{currentRoundCount}</span>
                                <span className="text-xs text-amber-300/60">/ {item.count}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-200 font-reading mt-0.5">
                                اضغط للعد
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Bottom Helper Controls for this Dhikr */}
                    <div className="flex items-center gap-2 mt-4">
                      {/* Audio Play TTS */}
                      <button
                        onClick={() => handleToggleAudio(item)}
                        className={`p-2 rounded-xl transition-colors border ${
                          isSpeaking 
                            ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-emerald-50 hover:text-emerald-900'
                        }`}
                        title={isSpeaking ? 'إيقاف الاستماع الصوتي' : 'استماع لنطق الذكر بصوت واضح'}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      {/* Reset Current Round */}
                      <button
                        onClick={() => handleResetCurrentRound(item)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 hover:text-stone-800 transition-colors"
                        title="إعادة ضبط عداد الدورة الحالية لهذا الذكر"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(item)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 hover:text-stone-800 transition-colors"
                        title="نسخ الذكر"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 hover:text-stone-800 transition-colors"
                        title="مشاركة الذكر"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ===================== VIEW 2: Today's Repetition Log & Statistics ===================== */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          
          {/* Main KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Repetitions Today */}
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>إجمالي تكرارات اليوم</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-950 dark:text-amber-200 tabular-nums">
                {dailyStats.totalRepetitionsToday.toLocaleString('ar-EG')}
              </div>
              <p className="text-[11px] text-stone-400">
                تسبيحة وذكر تمت قراءتها اليوم
              </p>
            </div>

            {/* Morning Completion Rate */}
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>أذكار الصباح المنجزة</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-950 dark:text-amber-200 tabular-nums">
                {morningCompletedCount} / {morningList.length}
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.round((morningCompletedCount / morningList.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Evening Completion Rate */}
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>أذكار المساء المنجزة</span>
                <Moon className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-950 dark:text-amber-200 tabular-nums">
                {eveningCompletedCount} / {eveningList.length}
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.round((eveningCompletedCount / eveningList.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Today Date */}
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>تاريخ سجل اليوم</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-bold font-reading text-emerald-950 dark:text-amber-200">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                يتم تجديد وتحديث السجل تلقائياً كل يوم
              </p>
            </div>

          </div>

          {/* Detailed Breakdown Table of Today's Adhkar */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-base font-reading text-emerald-950 dark:text-amber-200">
                  تفصيل تكرارات الأذكار المسجلة اليوم
                </h3>
                <p className="text-xs text-stone-500">
                  قائمة الأذكار مرتبة حسب الأكثر قراءة وتكراراً من قبلك خلال اليوم
                </p>
              </div>

              <button
                onClick={handleResetAllTodayStats}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/60 text-xs font-bold hover:bg-red-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تصفير سجل اليوم</span>
              </button>
            </div>

            {topRecitedToday.length === 0 ? (
              <div className="text-center py-12 space-y-3 text-stone-400">
                <Sparkles className="w-10 h-10 mx-auto text-amber-400/50" />
                <p className="text-sm font-reading">
                  لم تقم بتسجيل أي تكرارات بعد لهذا اليوم.
                </p>
                <button
                  onClick={() => setActiveTab('sabah')}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  ابدأ بقراءة أذكار الصباح الآن
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {topRecitedToday.map(({ item, repetitions, rounds }) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.category === 'sabah' 
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300' 
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300'
                        }`}>
                          {item.category === 'sabah' ? 'صباح' : 'مساء'}
                        </span>
                        <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200 font-reading">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-stone-500 font-reading line-clamp-1 max-w-xl">
                        {item.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-left shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-mono font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                          {repetitions} <span className="text-xs font-sans font-normal text-stone-500">تكرار</span>
                        </div>
                        {rounds > 0 && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            {rounds} {rounds === 1 ? 'دورة مكتملة' : 'دورات مكتملة'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
