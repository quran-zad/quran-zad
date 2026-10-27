import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle, Clock, Target, ArrowUpLeft, 
  RotateCcw, Sparkles, BookOpen, Plus, Flame, Award, Heart,
  Bell, BellOff, Check, AlertCircle, ChevronLeft, ShieldCheck,
  TrendingUp, BarChart2, Edit3, Volume2, Share2, LayoutDashboard,
  BarChart3, ListChecks
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { KhatmahReminderService, NotificationPermissionStatus } from '../services/khatmahReminderService';
import { KhatmahDashboard } from './KhatmahDashboard';
import { KhatmahPlan } from '../types';
import { SURAHS_LIST, JUZ_NAMES } from '../data/quranMeta';

interface KhatmahTrackerViewProps {
  onNavigateToPage: (page: number) => void;
}

const PRESET_DAYS = [
  { days: 30, label: 'شهر واحد (30 يوماً)', note: '~20 صفحة يومياً (جزء كامل)' },
  { days: 15, label: 'أسبوعين (15 يوماً)', note: '~40 صفحة يومياً (جزئين)' },
  { days: 10, label: 'عشرة أيام (10 أيام)', note: '~60 صفحة يومياً (3 أجزاء)' },
  { days: 7, label: 'أسبوع واحد (7 أيام)', note: '~86 صفحة يومياً' },
  { days: 60, label: 'شهرين (60 يوماً)', note: '~10 صفحات يومياً (نصف جزء)' },
];

const PRESET_PAGES = [
  { pages: 20, label: '20 صفحة يومياً (جزء كامل)', note: 'تختم في ~30 يوماً (شهر واحد)' },
  { pages: 10, label: '10 صفحات يومياً (نصف جزء)', note: 'تختم في ~60 يوماً (شهرين)' },
  { pages: 40, label: '40 صفحة يومياً (جزئين)', note: 'تختم في ~15 يوماً (نصف شهر)' },
  { pages: 4, label: '4 صفحات يومياً', note: 'تختم في ~151 يوماً (يسير ومستمر)' },
  { pages: 60, label: '60 صفحة يومياً (3 أجزاء)', note: 'تختم في ~10 أيام (همة عالية)' },
];

const REMINDER_PRESETS = [
  { time: '07:00', label: 'ورد الصباح (07:00 ص)' },
  { time: '13:30', label: 'بعد صلاة الظهر (01:30 م)' },
  { time: '16:30', label: 'بعد صلاة العصر (04:30 م)' },
  { time: '21:00', label: 'المساء قبل النوم (09:00 م)' },
];

const PRAYERS_LIST: { id: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'; name: string }[] = [
  { id: 'fajr', name: 'صلاة الفجر' },
  { id: 'dhuhr', name: 'صلاة الظهر' },
  { id: 'asr', name: 'صلاة العصر' },
  { id: 'maghrib', name: 'صلاة المغرب' },
  { id: 'isha', name: 'صلاة العشاء' },
];

export const KhatmahTrackerView: React.FC<KhatmahTrackerViewProps> = ({ onNavigateToPage }) => {
  const [plan, setPlan] = useState<KhatmahPlan | null>(null);
  const [planMode, setPlanMode] = useState<'days' | 'pages'>('days');
  const [targetDaysInput, setTargetDaysInput] = useState<number>(30);
  const [dailyPagesInput, setDailyPagesInput] = useState<number>(20);
  const [startPageInput, setStartPageInput] = useState<number>(1);
  const [customTitle, setCustomTitle] = useState<string>('ختمة مباركة');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'dashboard'>('daily');
  
  // Notification states
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<string>('21:00');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermissionStatus(KhatmahReminderService.getPermissionStatus());
    const existing = StorageService.getKhatmahPlan();
    if (existing) {
      setPlan(existing);
      setPlanMode(existing.planMode || 'days');
      setTargetDaysInput(existing.targetDays);
      setDailyPagesInput(existing.dailyPagesTarget);
      setStartPageInput(existing.startPage);
      setCustomTitle(existing.title || 'ختمة مباركة');
      setReminderEnabled(existing.reminderEnabled ?? true);
      setReminderTime(existing.reminderTime || '21:00');

      // Check daily reminder trigger
      KhatmahReminderService.checkAndTriggerDailyReminder(existing, (alertMsg) => {
        setToastMessage(alertMsg);
      });
    } else {
      const last = StorageService.getLastRead();
      setStartPageInput(last.pageNumber || 1);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleRequestPermission = async () => {
    const status = await KhatmahReminderService.requestPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      showToast('تم تفعيل إشعارات المتصفح بنجاح! ستصلك التنبيهات في موعدها.');
    } else if (status === 'denied') {
      showToast('تم حظر الإشعارات من إعدادات المتصفح، يمكنك تفعيلها من شريط العنوان.');
    }
  };

  const handleSendTestNotification = () => {
    const sent = KhatmahReminderService.sendTestNotification(plan);
    if (sent) {
      showToast('تم إرسال إشعار تجريبي بنجاح! تفقد تنبيهات جهازك.');
    } else {
      showToast('يرجى السماح بالإشعارات أولاً لتلقي التنبيهات على جهازك.');
    }
  };

  const handleCreateOrUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan = StorageService.createKhatmahPlan({
      planMode,
      targetDays: planMode === 'days' ? targetDaysInput : undefined,
      dailyPagesTarget: planMode === 'pages' ? dailyPagesInput : undefined,
      startPage: startPageInput,
      title: customTitle,
      reminderEnabled,
      reminderTime
    });

    setPlan(newPlan);
    setIsEditing(false);
    showToast('تم حفظ خطة الختمة بنجاح! نسأل الله لك البركة والتيسير.');
  };

  const handleManualAddPages = (count: number) => {
    if (!plan) return;
    const targetPage = Math.min(604, plan.currentPage + count);
    const updated = StorageService.updateKhatmahProgress(targetPage);
    if (updated) {
      setPlan(updated);
      showToast(`تمت إضافة ${count} صفحة إلى رصيدك اليومي! صفحتك الحالية: ${targetPage}`);
      if (updated.todayPagesRead >= updated.dailyPagesTarget) {
        KhatmahReminderService.triggerCompletionCelebration(updated, (msg) => {
          setToastMessage(msg);
        });
      }
    }
  };

  const handleTogglePrayer = (prayerId: string) => {
    if (!plan) return;
    const updated = StorageService.togglePrayerCheckmark(prayerId);
    if (updated) {
      setPlan(updated);
      const isNowCompleted = (updated.completedPrayersToday || []).includes(prayerId);
      if (isNowCompleted) {
        // Automatically advance reading if desired or encourage user
        showToast('تقبل الله منك! تم تسجيل إنجاز ورد هذه الصلاة.');
      }
    }
  };

  const handleUpdateReminderSettings = (enabled: boolean, time: string) => {
    setReminderEnabled(enabled);
    setReminderTime(time);
    const updated = StorageService.updateKhatmahPlanSettings({
      reminderEnabled: enabled,
      reminderTime: time
    });
    if (updated) {
      setPlan(updated);
      showToast(`تم تحديث موعد التنبيه اليومي إلى ${time}`);
    }
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط خطة الختمة الحالية؟')) {
      StorageService.resetKhatmahPlan();
      setPlan(null);
      setIsEditing(true);
      showToast('تمت إعادة ضبط الخطة.');
    }
  };

  // Calculations for current plan or setup preview
  const totalQuranPages = 604;
  const currentPage = plan ? plan.currentPage : startPageInput;
  const progressPercent = plan ? Math.min(100, Math.round(((currentPage - 1) / totalQuranPages) * 100)) : 0;
  
  const daysPassed = plan ? Math.floor((Date.now() - plan.startDate) / (1000 * 60 * 60 * 24)) : 0;
  const daysRemaining = plan ? Math.max(1, plan.targetDays - daysPassed) : targetDaysInput;
  const pagesRemaining = plan ? Math.max(0, totalQuranPages - currentPage + 1) : Math.max(0, totalQuranPages - startPageInput + 1);

  // Live calculation for preview:
  const previewDailyPages = planMode === 'days' 
    ? Math.max(1, Math.ceil(pagesRemaining / Math.max(1, targetDaysInput)))
    : dailyPagesInput;

  const previewTotalDays = planMode === 'pages'
    ? Math.max(1, Math.ceil(pagesRemaining / Math.max(1, dailyPagesInput)))
    : targetDaysInput;

  const calculatedDailyPages = plan ? plan.dailyPagesTarget : previewDailyPages;
  const perPrayerPages = Math.ceil(calculatedDailyPages / 5);

  const todayPagesRead = plan?.todayPagesRead || 0;
  const todayProgressPercent = Math.min(100, Math.round((todayPagesRead / calculatedDailyPages) * 100));

  // Projected completion date
  const projectedFinishDate = new Date();
  projectedFinishDate.setDate(projectedFinishDate.getDate() + (plan ? daysRemaining : previewTotalDays));
  const finishDateString = projectedFinishDate.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentSurahMeta = SURAHS_LIST.find(s => currentPage >= s.startPage && currentPage <= s.endPage) || SURAHS_LIST[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white shadow-xl flex items-center justify-between gap-3 animate-fade-in border border-emerald-700">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-stone-300 hover:text-white text-xs px-2 py-1 rounded-lg bg-emerald-800/60"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>مُتَابَعَةُ وَتَخْطِيطُ خَتْمَةِ القُرْآنِ الكَرِيمِ</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-reading text-stone-900 dark:text-stone-100">
          جدول الختمة القرآنية والتنبيه اليومي للإنجاز
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto font-reading">
          حدد خطتك حسب المدة (بالأيام) أو حسب الورد (بعدد الصفحات)، وتلقَّ تنبيهات يومية مشجعة للوصول للختم بإذن الله تعالى.
        </p>
      </div>

      {/* Plan Setup View (if no plan or editing) */}
      {(!plan || isEditing) && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4 flex items-center justify-between">
            <h3 className="font-bold text-lg font-reading text-emerald-950 dark:text-amber-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-700 dark:text-amber-300" />
              <span>{plan ? 'تعديل خطة الختمة' : 'إعداد وتخطيط خطة الختمة الجديدة'}</span>
            </h3>
            {plan && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                إلغاء التعديل
              </button>
            )}
          </div>

          {/* Mode Switcher: By Days vs By Daily Pages */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              اختر طريقة التخطيط المناسبة لك:
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 dark:bg-stone-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setPlanMode('days')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  planMode === 'days'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>التخطيط بالمدة (بالأيام)</span>
              </button>

              <button
                type="button"
                onClick={() => setPlanMode('pages')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  planMode === 'pages'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>التخطيط بالورد (بعدد الصفحات)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateOrUpdatePlan} className="space-y-6">
            
            {/* Title & Start Page Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  اسم الخطة أو النيّة:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="مثال: ختمة رمضان المبارك، صدقة عن الوالدين..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  البدء من الصفحة:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={startPageInput}
                    onChange={(e) => setStartPageInput(Math.min(604, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold text-sm tabular-nums focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-xs text-stone-500 whitespace-nowrap">من 604</span>
                </div>
              </div>
            </div>

            {/* Presets and Input for MODE: DAYS */}
            {planMode === 'days' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  حدد عدد الأيام المستهدفة لإتمام الختمة:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PRESET_DAYS.map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => setTargetDaysInput(p.days)}
                      className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        targetDaysInput === p.days
                          ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/20'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span className="font-bold text-xs">{p.label}</span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">{p.note}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-stone-600 dark:text-stone-400">أو حدد عدداً مخصصاً للأيام:</span>
                  <div className="flex items-center gap-2 max-w-[160px]">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={targetDaysInput}
                      onChange={(e) => setTargetDaysInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold text-sm tabular-nums focus:outline-none focus:border-emerald-600"
                    />
                    <span className="text-xs text-stone-500">يوماً</span>
                  </div>
                </div>
              </div>
            )}

            {/* Presets and Input for MODE: DAILY PAGES */}
            {planMode === 'pages' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  حدد عدد الصفحات التي ترغب بقراءتها يومياً:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PRESET_PAGES.map((p) => (
                    <button
                      key={p.pages}
                      type="button"
                      onClick={() => setDailyPagesInput(p.pages)}
                      className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        dailyPagesInput === p.pages
                          ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/20'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span className="font-bold text-xs">{p.label}</span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">{p.note}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-stone-600 dark:text-stone-400">أو حدد عدداً مخصصاً للصفحات اليومية:</span>
                  <div className="flex items-center gap-2 max-w-[160px]">
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={dailyPagesInput}
                      onChange={(e) => setDailyPagesInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold text-sm tabular-nums focus:outline-none focus:border-emerald-600"
                    />
                    <span className="text-xs text-stone-500">صفحة/يوم</span>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Achievement Notification Settings */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-700 dark:text-amber-300" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    تنبيهات الإنجاز والورد اليومي
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {reminderEnabled && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="text-xs text-stone-600 dark:text-stone-400">
                    اختر وقت التنبيه اليومي المفضل:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {REMINDER_PRESETS.map((rp) => (
                      <button
                        key={rp.time}
                        type="button"
                        onClick={() => setReminderTime(rp.time)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          reminderTime === rp.time
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {rp.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-stone-500">أو وقت محدد:</span>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold"
                    />
                  </div>

                  {/* Browser notification permission helper */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/60 dark:border-stone-700/60">
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                      {permissionStatus === 'granted' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>إشعارات المتصفح مفعلة على هذا الجهاز</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>تحتاج للسماح بالإشعارات ليصلك التنبيه خارج التطبيق</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {permissionStatus !== 'granted' && (
                        <button
                          type="button"
                          onClick={handleRequestPermission}
                          className="px-2.5 py-1 text-xs rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 font-semibold"
                        >
                          تفعيل إذن الإشعارات
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSendTestNotification}
                        className="px-2.5 py-1 text-xs rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300"
                      >
                        تجربة إشعار فوري
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Calculation Preview Card */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-600/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-amber-800 dark:text-amber-400 font-bold">
                  ملخص الحساب التلقائي للخطة:
                </div>
                <div className="font-reading text-base font-bold">
                  الورد اليومي المطلوب: <span className="text-emerald-800 dark:text-emerald-300 text-xl tabular-nums">{previewDailyPages}</span> صفحة يومياً
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400">
                  المدة الكلية: <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{previewTotalDays} يوماً</strong> · بمعدل <strong className="text-stone-900 dark:text-stone-100 tabular-nums">~{Math.ceil(previewDailyPages / 5)} صفحات</strong> بعد كل صلاة.
                </div>
                <div className="text-xs text-emerald-800 dark:text-emerald-400 pt-0.5">
                  موعد الختم المتوقع: <span className="font-bold">{finishDateString}</span>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer"
              >
                {plan ? 'تحديث وحفظ الخطة' : 'اعتماد وبدء الخطة المباركة'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Active Plan Dashboard */}
      {plan && !isEditing && (
        <div className="space-y-6">
          
          {/* Sub-tab Switcher: Daily Portion & Schedule vs Analytics Dashboard */}
          <div className="flex items-center justify-center p-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-xl mx-auto shadow-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('daily')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'daily'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>متابعة الورد والصلوات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('dashboard')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                activeSubTab === 'dashboard'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>لوحة الإحصائيات والرسم البياني</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                متقدم
              </span>
            </button>
          </div>

          {/* DASHBOARD VIEW */}
          {activeSubTab === 'dashboard' && (
            <KhatmahDashboard 
              plan={plan} 
              onNavigateToPage={onNavigateToPage} 
            />
          )}

          {/* DAILY PORTION & PRAYERS VIEW */}
          {activeSubTab === 'daily' && (
            <div className="space-y-6">
              
              {/* Main KPI Card */}
              <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/80 space-y-6 relative overflow-hidden">
                
                {/* Top row */}
                <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40 shadow-inner">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl font-reading text-amber-100">
                          {plan.title}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 border border-emerald-700/50">
                          {plan.planMode === 'pages' ? 'تخطيط بالورد' : 'تخطيط بالمدة'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-300 mt-0.5">
                        بدأت بتاريخ {new Date(plan.startDate).toLocaleDateString('ar-EG')} · الختم المتوقع: {finishDateString}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSubTab('dashboard')}
                      className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs transition-colors flex items-center gap-1.5 border border-amber-400/30 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>الإحصائيات والرسم البياني</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-xl bg-white/10 hover:bg-red-500/40 text-stone-300 hover:text-white transition-colors cursor-pointer"
                      title="إعادة ضبط الختمة"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Core Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10 text-center">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-stone-300 block">الصفحة الحالية</span>
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-200 tabular-nums">
                      {currentPage}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5 font-reading">
                      سورة {currentSurahMeta.name}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-stone-300 block">ورد اليوم المطلوب</span>
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-300 tabular-nums">
                      {calculatedDailyPages}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      صفحة / يومياً
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-stone-300 block">الأيام المتبقية</span>
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-200 tabular-nums">
                      {daysRemaining}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      يوماً متبقياً
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-stone-300 block">الصفحات المتبقية</span>
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-300 tabular-nums">
                      {pagesRemaining}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      صفحة للختم الكامل
                    </span>
                  </div>
                </div>

                {/* Today's Daily Target Achievement Gauge */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-xs text-stone-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${todayPagesRead >= calculatedDailyPages ? 'text-emerald-400' : 'text-amber-300'}`} />
                      <span className="font-bold">إنجاز ورد اليوم ({todayPagesRead} من {calculatedDailyPages} صفحة)</span>
                    </div>
                    <span className="font-bold text-amber-300 tabular-nums text-sm">
                      {todayProgressPercent}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        todayPagesRead >= calculatedDailyPages 
                          ? 'bg-gradient-to-l from-emerald-400 to-emerald-500' 
                          : 'bg-gradient-to-l from-amber-400 to-amber-500'
                      }`}
                      style={{ width: `${todayProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span>
                      {todayPagesRead >= calculatedDailyPages 
                        ? '🎉 هنيئاً لك! أتممت وردك اليومي بالكامل.' 
                        : `متبقي لك اليوم ${Math.max(0, calculatedDailyPages - todayPagesRead)} صفحة لإتمام الهدف.`}
                    </span>
                    <span className="text-amber-200">
                      🔥 التزام {plan.streakDays || 1} أيام
                    </span>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span>نسبة الإنجاز الكلية للختمة (من 604 صفحات)</span>
                    <span className="font-bold text-amber-300 tabular-nums">{progressPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-l from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Direct Reading CTA Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-2 text-xs text-stone-300">
                    <Clock className="w-4 h-4 text-amber-300" />
                    <span>
                      التنبيه اليومي: {plan.reminderEnabled ? `مفعّل في ${plan.reminderTime || '21:00'}` : 'معطّل'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onNavigateToPage(currentPage)}
                      className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>متابعة قراءة الورد في المصحف (ص {currentPage})</span>
                      <ArrowUpLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Daily Prayers Distribution with Interactive Checkboxes */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-bold text-base font-reading text-emerald-950 dark:text-amber-200">
                      توزيع الورد اليومي بعد الصلوات الخمس
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      انقر على الصلاة لتعليم إنجاز وردها اليومي ({perPrayerPages} صفحات بعد كل صلاة)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    {perPrayerPages} صفحات بعد كل صلاة
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
                  {PRAYERS_LIST.map((prayer) => {
                    const isCompleted = (plan.completedPrayersToday || []).includes(prayer.id);
                    return (
                      <button
                        key={prayer.id}
                        type="button"
                        onClick={() => handleTogglePrayer(prayer.id)}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 ${
                          isCompleted
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs">{prayer.name}</span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}>
                            {isCompleted && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                        <div className="font-bold font-mono text-emerald-800 dark:text-amber-300 text-sm tabular-nums">
                          {perPrayerPages} صفحات
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                          {isCompleted ? 'تمت القراءة' : 'انقر لتعليم الإنجاز'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick manual progress logger buttons */}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-stone-600 dark:text-stone-400 font-semibold">
                    تسجيل قراءة صفحات إضافية يدوياً:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleManualAddPages(1)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-stone-800 dark:text-stone-200 font-bold transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
                    >
                      +1 صفحة
                    </button>
                    <button
                      onClick={() => handleManualAddPages(5)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-stone-800 dark:text-stone-200 font-bold transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
                    >
                      +5 صفحات
                    </button>
                    <button
                      onClick={() => handleManualAddPages(10)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-stone-800 dark:text-stone-200 font-bold transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
                    >
                      +10 صفحات
                    </button>
                    <button
                      onClick={() => handleManualAddPages(20)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold transition-colors cursor-pointer border border-emerald-300 dark:border-emerald-800"
                    >
                      +20 صفحة (جزء كامل)
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Notification & Reminder Settings Card */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base font-reading text-emerald-950 dark:text-amber-200">
                        إعدادات التنبيه اليومي لإنجاز الورد
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        إشعار لطيف ينبهك في موعد محدد لإتمام وردك اليومي
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={(e) => handleUpdateReminderSettings(e.target.checked, reminderTime)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {reminderEnabled && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {REMINDER_PRESETS.map((rp) => (
                        <button
                          key={rp.time}
                          type="button"
                          onClick={() => handleUpdateReminderSettings(true, rp.time)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                            reminderTime === rp.time
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                              : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {rp.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500">وقت مخصص:</span>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => handleUpdateReminderSettings(true, e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {permissionStatus !== 'granted' && (
                          <button
                            type="button"
                            onClick={handleRequestPermission}
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors"
                          >
                            السماح بإشعارات المتصفح
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSendTestNotification}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium"
                        >
                          إرسال إشعار تجريبي
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Du'a Khatm Al-Quran & Dedication Card */}
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-600/30 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>دُعَاءُ خَتْمِ القُرْآنِ الكَرِيمِ المُبَارَكِ</span>
            </div>
            <p className="font-reading text-base sm:text-lg text-emerald-950 dark:text-amber-100 leading-relaxed max-w-2xl mx-auto">
              «اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ»
            </p>
            <div className="text-xs text-stone-500 dark:text-stone-400 pt-1 font-reading">
              نسأل الله تعالى أن يجعل ثواب هذه القراءة صدقة جارية ونوراً في قبور والدي وأخي، وجميع موتى المسلمين.
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
