import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Navigation, Bell, BellOff, Volume2, 
  VolumeX, CheckCircle, Clock, Sparkles, AlertCircle, Play, Square, Loader2 
} from 'lucide-react';
import { 
  PrayerService, PrayerDataResponse, PrayerAlertSettings, 
  POPULAR_CITIES, DEFAULT_ALERT_SETTINGS 
} from '../services/prayerService';

export const PrayerTimesSection: React.FC = () => {
  const [data, setData] = useState<PrayerDataResponse>(() => 
    PrayerService.getFallbackTimes('مكة المكرمة')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  
  // Alerts state
  const [alertSettings, setAlertSettings] = useState<PrayerAlertSettings>(() => 
    PrayerService.getAlertSettings()
  );
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(false);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState<boolean>(false);
  const [activeAlertPrayer, setActiveAlertPrayer] = useState<string | null>(null);
  
  // Realtime clock and countdown
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{ name: string; nameEn: string; time: string; remainingStr: string }>({
    name: 'الظهر',
    nameEn: 'Dhuhr',
    time: '12:20',
    remainingStr: '00:00:00'
  });

  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastTriggeredPrayerRef = useRef<string>('');

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, []);

  // Load initial location and timings
  useEffect(() => {
    const savedLoc = PrayerService.getUserSavedLocation();
    setIsLoading(true);

    if (savedLoc.lat && savedLoc.lng) {
      PrayerService.fetchByCoordinates(savedLoc.lat, savedLoc.lng, savedLoc.name)
        .then(res => {
          setData(res);
          setIsLoading(false);
        });
    } else {
      PrayerService.fetchByCity(savedLoc.name)
        .then(res => {
          setData(res);
          setIsLoading(false);
        });
    }
  }, []);

  // Update clock, countdown, and trigger Adhan alert when prayer time enters
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (!data || !data.timings) return;

      const prayerOrder = [
        { key: 'Fajr', name: 'الفجر', time: data.timings.Fajr },
        { key: 'Sunrise', name: 'الشروق', time: data.timings.Sunrise },
        { key: 'Dhuhr', name: 'الظهر', time: data.timings.Dhuhr },
        { key: 'Asr', name: 'العصر', time: data.timings.Asr },
        { key: 'Maghrib', name: 'المغرب', time: data.timings.Maghrib },
        { key: 'Isha', name: 'العشاء', time: data.timings.Isha },
      ];

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();

      // Find next prayer
      let upcoming = prayerOrder.find(p => {
        const [h, m] = p.time.split(':').map(Number);
        return (h * 60 + m) > currentMinutes;
      });

      // If past Isha, next prayer is tomorrow's Fajr
      let diffSeconds = 0;
      if (!upcoming) {
        upcoming = prayerOrder[0]; // Fajr tomorrow
        const [fh, fm] = upcoming.time.split(':').map(Number);
        const minutesUntilMidnight = (24 * 60) - currentMinutes;
        const totalMinutes = minutesUntilMidnight + (fh * 60 + fm);
        diffSeconds = (totalMinutes * 60) - currentSeconds;
      } else {
        const [uh, um] = upcoming.time.split(':').map(Number);
        const targetMinutes = uh * 60 + um;
        diffSeconds = ((targetMinutes - currentMinutes) * 60) - currentSeconds;
      }

      if (diffSeconds < 0) diffSeconds = 0;
      const hours = Math.floor(diffSeconds / 3600);
      const mins = Math.floor((diffSeconds % 3600) / 60);
      const secs = diffSeconds % 60;
      const formattedDiff = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      setNextPrayerInfo({
        name: upcoming.name,
        nameEn: upcoming.key,
        time: upcoming.time,
        remainingStr: formattedDiff
      });

      // Check for exact prayer entry to fire Alert!
      const currentFormattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      prayerOrder.forEach(p => {
        if (p.key !== 'Sunrise' && p.time === currentFormattedTime && now.getSeconds() === 0) {
          const prayerKeyLower = p.key.toLowerCase() as keyof typeof alertSettings.prayers;
          const shouldAlert = alertSettings.enabled && alertSettings.prayers[prayerKeyLower];
          const triggerKey = `${p.key}_${now.toDateString()}`;

          if (shouldAlert && lastTriggeredPrayerRef.current !== triggerKey) {
            lastTriggeredPrayerRef.current = triggerKey;
            triggerPrayerAlert(p.name);
          }
        }
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data, alertSettings]);

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setHasNotificationPermission(res === 'granted');
        if (res === 'granted') {
          new Notification('نور القرآن', {
            body: 'تم تفعيل تنبيهات مواقيت الصلاة بنجاح',
            icon: '/favicon.ico'
          });
        }
      } catch (err) {
        console.warn('Notification permission error', err);
      }
    }
  };

  // Trigger prayer alert (Sound + Notification + In-App modal)
  const triggerPrayerAlert = (prayerName: string) => {
    setActiveAlertPrayer(prayerName);

    // Play Adhan sound
    if (adhanAudioRef.current) {
      adhanAudioRef.current.pause();
    }
    adhanAudioRef.current = PrayerService.playAdhanSound(alertSettings.soundType, alertSettings.volume);
    setIsPlayingAdhan(true);

    // Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`حان الآن موعد صلاة ${prayerName}`, {
        body: `الله أكبر الله أكبر · حان الآن موعد أذان ${prayerName} بتوقيت ${data.locationName}`,
        icon: '/favicon.ico'
      });
    }
  };

  // Test Adhan Sound
  const handleToggleTestAdhan = () => {
    if (isPlayingAdhan) {
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
      }
      setIsPlayingAdhan(false);
    } else {
      adhanAudioRef.current = PrayerService.playAdhanSound(alertSettings.soundType, alertSettings.volume);
      setIsPlayingAdhan(true);
      if (adhanAudioRef.current) {
        adhanAudioRef.current.onended = () => setIsPlayingAdhan(false);
        adhanAudioRef.current.onerror = () => setIsPlayingAdhan(false);
      }
    }
  };

  // Handle GPS Auto-detect
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setIsLocating(true);
    setLocationStatus('جاري تحديد موقعك الجغرافي عبر GPS...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationStatus('تم تحديد الإحداثيات، جاري جلب المواقيت...');
        
        try {
          const res = await PrayerService.fetchByCoordinates(latitude, longitude, 'موقعي الحالي');
          setData(res);
          PrayerService.saveUserLocation({ lat: latitude, lng: longitude, name: 'موقعي الحالي' });
          setLocationStatus('تم تحديث المواقيت بنجاح حسب موقعك الدقيق');
          setTimeout(() => setLocationStatus(''), 4000);
        } catch (e) {
          setLocationStatus('تعذر جلب المواقيت للإحداثيات، تم استخدام التوقيت الافتراضي');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('تعذر الوصول للموقع الجغرافي (تأكد من إعطاء الإذن في المتصفح)');
        setTimeout(() => setLocationStatus(''), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle City Selector Change
  const handleCitySelect = async (cityName: string) => {
    setIsLoading(true);
    const res = await PrayerService.fetchByCity(cityName);
    setData(res);
    setIsLoading(false);
    const matched = POPULAR_CITIES.find(c => c.name === cityName);
    PrayerService.saveUserLocation({
      name: cityName,
      lat: matched?.lat,
      lng: matched?.lng
    });
  };

  // Update Alert Settings
  const updateSettings = (partial: Partial<PrayerAlertSettings>) => {
    const updated = { ...alertSettings, ...partial };
    setAlertSettings(updated);
    PrayerService.saveAlertSettings(updated);
  };

  const prayers = [
    { key: 'fajr', name: 'الفجر', time: data.timings.Fajr, desc: 'صلاة الفجر' },
    { key: 'sunrise', name: 'الشروق', time: data.timings.Sunrise, desc: 'شروق الشمس' },
    { key: 'dhuhr', name: 'الظهر', time: data.timings.Dhuhr, desc: 'صلاة الظهر' },
    { key: 'asr', name: 'العصر', time: data.timings.Asr, desc: 'صلاة العصر' },
    { key: 'maghrib', name: 'المغرب', time: data.timings.Maghrib, desc: 'صلاة المغرب' },
    { key: 'isha', name: 'العشاء', time: data.timings.Isha, desc: 'صلاة العشاء' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      
      {/* Prayer Adhan Alert Modal Banner (when active) */}
      {activeAlertPrayer && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-200 border-2 border-amber-400 shadow-2xl animate-in zoom-in-95 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-right">
            <div className="w-12 h-12 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg animate-bounce">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-reading text-white">
                اللهُ أَكْبَرُ، اللهُ أَكْبَرُ
              </h3>
              <p className="text-xs text-amber-200/90 font-reading">
                حان الآن موعد أذان <strong>صلاة {activeAlertPrayer}</strong> حسب توقيت {data.locationName}.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (adhanAudioRef.current) adhanAudioRef.current.pause();
              setIsPlayingAdhan(false);
              setActiveAlertPrayer(null);
            }}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs shadow-md transition-colors"
          >
            إيقاف الأذان والتنبيه
          </button>
        </div>
      )}

      {/* Main Banner: Location & Hijri Date */}
      <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{data.hijri.weekdayAr}، {data.hijri.day} {data.hijri.monthAr} {data.hijri.year} هـ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-reading text-amber-100">
              مواقيت الصلاة حسب الموقع الجغرافي
            </h2>
            <p className="text-xs text-stone-300 mt-1 flex items-center gap-2">
              <span>الوقت الحالي:</span>
              <span className="font-mono tabular-nums font-bold text-amber-300 text-sm">{currentTimeStr}</span>
              <span>·</span>
              <span>المدينة: <strong>{data.locationName}</strong></span>
            </p>
          </div>

          {/* Location Controls: GPS button + City selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* GPS Auto Detect Button */}
            <button
              onClick={handleAutoDetectLocation}
              disabled={isLocating}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              title="تحديد موقعي التلقائي عبر الـ GPS"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span>{isLocating ? 'جاري التحديد...' : 'موقعي الحالي (GPS)'}</span>
            </button>

            {/* City Selector */}
            <div className="flex items-center gap-2 bg-stone-800/90 border border-stone-700 p-2 rounded-xl text-xs">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={data.locationName}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-100 focus:outline-none cursor-pointer"
              >
                {POPULAR_CITIES.map(c => (
                  <option key={c.name} value={c.name} className="bg-stone-900 text-white">
                    {c.name} ({c.country})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {locationStatus && (
          <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-700/80 text-amber-200">
            {locationStatus}
          </div>
        )}

        {/* Next Prayer Countdown Bar */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-300">الصلاة القادمة:</div>
              <div className="font-bold text-base font-reading text-amber-200">
                صلاة {nextPrayerInfo.name} ({nextPrayerInfo.time})
              </div>
            </div>
          </div>

          <div className="text-right sm:text-left">
            <div className="text-xs text-stone-400">الوقت المتبقي للأذان:</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 tabular-nums tracking-wider">
              {nextPrayerInfo.remainingStr}
            </div>
          </div>
        </div>
      </div>

      {/* Prayers Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {prayers.map((p) => {
          const isNext = nextPrayerInfo.name === p.name;
          const isEnabled = alertSettings.prayers[p.key as keyof typeof alertSettings.prayers] ?? true;

          return (
            <div
              key={p.name}
              className={`p-5 rounded-2xl border transition-all text-center space-y-2 relative shadow-xs ${
                isNext
                  ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/20 ring-2 ring-amber-500/30'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-700/50'
              }`}
            >
              {isNext && (
                <span className="absolute -top-2.5 right-1/2 translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold shadow-xs whitespace-nowrap">
                  الصلاة القادمة
                </span>
              )}

              <div className="text-xs text-stone-500 font-reading font-medium flex items-center justify-center gap-1">
                <span>{p.desc}</span>
              </div>

              <div className={`text-2xl font-bold font-mono tabular-nums ${
                isNext ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-950 dark:text-stone-100'
              }`}>
                {p.time}
              </div>

              {p.key !== 'sunrise' && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      const prayerKey = p.key as keyof typeof alertSettings.prayers;
                      updateSettings({
                        prayers: {
                          ...alertSettings.prayers,
                          [prayerKey]: !isEnabled
                        }
                      });
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      isEnabled && alertSettings.enabled
                        ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'text-stone-400 bg-stone-100 dark:bg-stone-800'
                    }`}
                    title={isEnabled ? 'التنبيه مفعل لهذه الصلاة' : 'التنبيه معطل'}
                  >
                    {isEnabled && alertSettings.enabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                    <span>{isEnabled && alertSettings.enabled ? 'تنبيه مفعّل' : 'صامت'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prayer Time Alert & Notification Settings Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-reading text-stone-900 dark:text-stone-100">
                إعدادات التنبيه والأذان عند دخول الصلاة
              </h3>
              <p className="text-xs text-stone-500">
                تشغيل صوت الأذان وإرسال إشعار لحظي عند حلول وقت الصلاة
              </p>
            </div>
          </div>

          {/* Master Alert Toggle */}
          <button
            onClick={() => updateSettings({ enabled: !alertSettings.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto ${
              alertSettings.enabled
                ? 'bg-emerald-900 text-amber-200'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            {alertSettings.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span>{alertSettings.enabled ? 'التنبيهات: مفعّلة' : 'التنبيهات: معطّلة'}</span>
          </button>
        </div>

        {/* Sound Selection & Notification Permission Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Sound Choice */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              صوت التنبيه / الأذان:
            </label>
            <select
              value={alertSettings.soundType}
              onChange={(e) => updateSettings({ soundType: e.target.value as any })}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:border-emerald-600"
            >
              <option value="makkah">أذان الحرم المكي الشريف</option>
              <option value="madinah">أذان المسجد النبوي الشريف</option>
              <option value="chime">تكبيرات وتنبيه هادئ</option>
            </select>
          </div>

          {/* Test Sound Button */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              تجربة الصوت:
            </label>
            <button
              onClick={handleToggleTestAdhan}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isPlayingAdhan
                  ? 'bg-amber-400 text-emerald-950 border-amber-500'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100'
              }`}
            >
              {isPlayingAdhan ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>إيقاف صوت الأذان</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>تجربة صوت الأذان</span>
                </>
              )}
            </button>
          </div>

          {/* Browser Notifications Permission */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              إشعارات المتصفح:
            </label>
            <button
              onClick={handleRequestNotificationPermission}
              disabled={hasNotificationPermission}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                hasNotificationPermission
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 cursor-default'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{hasNotificationPermission ? 'إشعارات المتصفح مفعّلة' : 'تفعيل إشعارات المتصفح'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spiritual Hadith */}
      <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-emerald-950/20 border border-amber-200/80 dark:border-emerald-900/40 text-center space-y-2">
        <p className="font-reading text-base sm:text-lg text-emerald-950 dark:text-stone-200">
          «مَنْ حَافَظَ عَلَى الصَّلَوَاتِ الْخَمْسِ، رُكُوعِهِنَّ، وَسُجُودِهِنَّ، وَمَوَاقِيتِهِنَّ، وَعَلِمَ أَنَّهُنَّ حَقٌّ مِنْ عِنْدِ اللَّهِ، دَخَلَ الْجَنَّةَ»
        </p>
        <p className="text-xs text-stone-500">
          - رواه الإمام أحمد بإسناد حسن
        </p>
      </div>

    </div>
  );
};
