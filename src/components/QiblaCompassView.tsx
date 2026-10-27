import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, MapPin, Navigation, RotateCw, CheckCircle2, 
  Info, ShieldCheck, Volume2, Sparkles, AlertTriangle, ArrowUp
} from 'lucide-react';

interface CityPreset {
  nameAr: string;
  countryAr: string;
  lat: number;
  lng: number;
}

const CITY_PRESETS: CityPreset[] = [
  { nameAr: 'مكة المكرمة', countryAr: 'المملكة العربية السعودية', lat: 21.4225, lng: 39.8262 },
  { nameAr: 'المدينة المنورة', countryAr: 'المملكة العربية السعودية', lat: 24.4672, lng: 39.6111 },
  { nameAr: 'القدس الشريف', countryAr: 'فلسطين', lat: 31.7683, lng: 35.2137 },
  { nameAr: 'القاهرة', countryAr: 'مصر', lat: 30.0444, lng: 31.2357 },
  { nameAr: 'الرياض', countryAr: 'المملكة العربية السعودية', lat: 24.7136, lng: 46.6753 },
  { nameAr: 'عَمّان', countryAr: 'الأردن', lat: 31.9522, lng: 35.2332 },
  { nameAr: 'دمشق', countryAr: 'سوريا', lat: 33.5138, lng: 36.2765 },
  { nameAr: 'بغداد', countryAr: 'العراق', lat: 33.3152, lng: 44.3661 },
  { nameAr: 'أبو ظبي', countryAr: 'الإمارات', lat: 24.4539, lng: 54.3773 },
  { nameAr: 'دبي', countryAr: 'الإمارات', lat: 25.2048, lng: 55.2708 },
  { nameAr: 'الدوحة', countryAr: 'قطر', lat: 25.2854, lng: 51.5310 },
  { nameAr: 'الكويت', countryAr: 'الكويت', lat: 29.3759, lng: 47.9774 },
  { nameAr: 'مسقط', countryAr: 'عُمان', lat: 23.5880, lng: 58.3829 },
  { nameAr: 'بيروت', countryAr: 'لبنان', lat: 33.8938, lng: 35.5018 },
  { nameAr: 'الرباط', countryAr: 'المغرب', lat: 34.0209, lng: -6.8416 },
  { nameAr: 'تونس', countryAr: 'تونس', lat: 36.8065, lng: 10.1815 },
  { nameAr: 'الجزائر', countryAr: 'الجزائر', lat: 36.7538, lng: 3.0588 },
  { nameAr: 'طرابلس', countryAr: 'ليبيا', lat: 32.8872, lng: 13.1913 },
  { nameAr: 'الخرطوم', countryAr: 'السودان', lat: 15.5007, lng: 32.5599 },
  { nameAr: 'صنعاء', countryAr: 'اليمن', lat: 15.3694, lng: 44.1910 },
  { nameAr: 'إسطنبول', countryAr: 'تركيا', lat: 41.0082, lng: 28.9784 },
  { nameAr: 'لندن', countryAr: 'المملكة المتحدة', lat: 51.5074, lng: -0.1278 },
  { nameAr: 'باريس', countryAr: 'فرنسا', lat: 48.8566, lng: 2.3522 },
  { nameAr: 'برلين', countryAr: 'ألمانيا', lat: 52.5200, lng: 13.4050 },
  { nameAr: 'نيويورك', countryAr: 'الولايات المتحدة', lat: 40.7128, lng: -74.0060 },
  { nameAr: 'كوالالمبور', countryAr: 'ماليزيا', lat: 3.1390, lng: 101.6869 },
  { nameAr: 'جاكرتا', countryAr: 'إندونيسيا', lat: -6.2088, lng: 106.8456 }
];

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

function calculateQiblaBearing(lat: number, lng: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;

  const y = Math.sin(dLng);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLng);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

function calculateDistanceKm(lat: number, lng: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getCompassDirectionName(degrees: number): string {
  const val = Math.floor((degrees / 22.5) + 0.5);
  const directions = [
    'شمال', 'شمال شمال شرق', 'شمال شرق', 'شرق شمال شرق',
    'شرق', 'شرق جنوب شرق', 'جنوب شرق', 'جنوب جنوب شرق',
    'جنوب', 'جنوب جنوب غرب', 'جنوب غرب', 'غرب جنوب غرب',
    'غرب', 'غرب شمال غرب', 'شمال غرب', 'شمال شمال غرب'
  ];
  return directions[val % 16];
}

export const QiblaCompassView: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: 30.0444,
    lng: 31.2357,
    name: 'القاهرة، مصر'
  });
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [hasOrientationSensor, setHasOrientationSensor] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('موقع محدد (القاهرة)');
  const [calibrationActive, setCalibrationActive] = useState<boolean>(false);
  const [searchCity, setSearchCity] = useState<string>('');

  const qiblaBearing = calculateQiblaBearing(userLocation.lat, userLocation.lng);
  const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng);

  // Active compass heading (sensor or manual slider)
  const currentHeading = deviceHeading !== null ? deviceHeading : manualHeading;
  
  // Calculate relative angle to Kaaba
  // When needle points up (0 deg difference), user is facing Kaaba
  const relativeAngle = (qiblaBearing - currentHeading + 360) % 360;
  const isAligned = Math.abs(relativeAngle) <= 4 || Math.abs(relativeAngle - 360) <= 4;

  // Auto-detect GPS location on mount
  useEffect(() => {
    requestGPSLocation(false);
  }, []);

  // Listen for device orientation
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // iOS webkitCompassHeading vs standard alpha
      const webkitHeading = (e as any).webkitCompassHeading;
      if (typeof webkitHeading === 'number') {
        setDeviceHeading(webkitHeading);
        setHasOrientationSensor(true);
      } else if (e.alpha !== null) {
        // Standard alpha is counter-clockwise, invert to clockwise
        const heading = (360 - e.alpha) % 360;
        setDeviceHeading(heading);
        setHasOrientationSensor(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Vibrate phone gently when aligned
  const lastVibrateRef = useRef<number>(0);
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
      const now = Date.now();
      if (now - lastVibrateRef.current > 1500) {
        lastVibrateRef.current = now;
        try {
          navigator.vibrate(80);
        } catch {}
      }
    }
  }, [isAligned]);

  const requestOrientationPermission = async () => {
    const DeviceOrientationEventAny = window.DeviceOrientationEvent as any;
    if (DeviceOrientationEventAny && typeof DeviceOrientationEventAny.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEventAny.requestPermission();
        if (response === 'granted') {
          setCalibrationActive(true);
        }
      } catch (err) {
        console.error('Error requesting orientation permission', err);
      }
    } else {
      setCalibrationActive(true);
    }
  };

  const requestGPSLocation = (notifyUser: boolean = true) => {
    if (!navigator.geolocation) {
      if (notifyUser) setLocationStatus('خدمة تحديد الموقع غير مدعومة في متصفحك');
      return;
    }

    setIsLocating(true);
    if (notifyUser) setLocationStatus('جاري تحديد موقعك الجغرافي عبر الأقمار الصناعية...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({
          lat,
          lng,
          name: `موقعك الحالي (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`
        });
        setIsLocating(false);
        setLocationStatus('تم تحديد موقعك بدقة بنجاح');
      },
      (err) => {
        setIsLocating(false);
        if (notifyUser) {
          setLocationStatus('تعذر تحديد الموقع تلقائياً، يمكنك اختيار مدينتك من القائمة أدناه');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const filteredCities = CITY_PRESETS.filter(c => 
    c.nameAr.includes(searchCity.trim()) || 
    c.countryAr.includes(searchCity.trim())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title & Introduction */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-900/10 text-emerald-900 rounded-2xl mb-3">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-emerald-950 mb-2">
          تحديد اتجاه القِبلة المشرفة
        </h1>
        <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base">
          بوصلة رقمية دقيقة لحساب زاوية الكعبة المشرفة بمكة المكرمة بالاعتماد على الحسابات الفلكية الكروية المعتمدة
        </p>
      </div>

      {/* Main Compass Card */}
      <div className="bg-gradient-to-b from-stone-900 via-emerald-950 to-stone-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-emerald-800/40 relative overflow-hidden mb-8">
        {/* Islamic Background Pattern Accents */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Alignment Banner */}
        <div className="relative z-10 flex flex-col items-center justify-center mb-6">
          <div className={`transition-all duration-300 px-5 py-2 rounded-full flex items-center gap-2 border text-sm sm:text-base font-bold shadow-lg ${
            isAligned 
              ? 'bg-emerald-500 text-white border-emerald-300 animate-pulse'
              : 'bg-stone-800/80 text-amber-300 border-amber-500/30'
          }`}>
            {isAligned ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>الله أكبر! أنت تواجه اتجاه القِبلة مباشرة</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-amber-400 rotate-45" />
                <span>
                  أدر جهازك بمقدار {Math.round(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle)}° نحو {relativeAngle > 180 ? 'اليسار' : 'اليمين'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Visual Compass Graphic */}
        <div className="relative z-10 flex flex-col items-center justify-center my-6">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            
            {/* Outer Dial Marks */}
            <div 
              className="absolute inset-0 rounded-full border-4 border-amber-500/30 flex items-center justify-center transition-transform duration-300"
              style={{ transform: `rotate(${-currentHeading}deg)` }}
            >
              {/* Compass Cardinal Points */}
              <span className="absolute top-2 font-bold text-red-400 text-base">ش (N)</span>
              <span className="absolute bottom-2 font-bold text-stone-300 text-sm">ج (S)</span>
              <span className="absolute right-3 font-bold text-stone-300 text-sm">ش (E)</span>
              <span className="absolute left-3 font-bold text-stone-300 text-sm">غ (W)</span>

              {/* Tick marks around circle */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`absolute w-0.5 ${i % 3 === 0 ? 'h-4 bg-amber-400' : 'h-2 bg-stone-500'}`}
                  style={{ 
                    top: '6px', 
                    transformOrigin: '50% 122px sm:50% 154px',
                    transform: `rotate(${i * 30}deg)` 
                  }}
                />
              ))}

              {/* Kaaba Direction Marker on the dial */}
              <div 
                className="absolute w-full h-full pointer-events-none flex flex-col items-center justify-start"
                style={{ transform: `rotate(${qiblaBearing}deg)` }}
              >
                <div className="mt-1 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-black border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/40">
                    {/* Golden Door of Kaaba representation */}
                    <div className="w-2.5 h-3.5 bg-amber-400 rounded-sm"></div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-300 mt-1 bg-black/70 px-1.5 py-0.5 rounded">
                    الكعبة
                  </span>
                </div>
              </div>
            </div>

            {/* Center Pointer Needle pointing to Qibla relative to device */}
            <div 
              className="absolute w-12 h-44 sm:w-16 sm:h-56 pointer-events-none flex flex-col items-center justify-center transition-transform duration-200"
              style={{ transform: `rotate(${relativeAngle}deg)` }}
            >
              {/* Arrow Head (pointing to Kaaba) */}
              <div className={`w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-r-[16px] sm:border-r-[20px] border-r-transparent border-b-[60px] sm:border-b-[75px] filter drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] ${
                isAligned ? 'border-b-emerald-400' : 'border-b-amber-400'
              }`} />
              
              {/* Center Pivot Point */}
              <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-stone-900 shadow-md my-[-8px] z-20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-950"></div>
              </div>

              {/* Opposite Needle (South/Tails) */}
              <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-r-[12px] sm:border-r-[16px] border-r-transparent border-t-[45px] sm:border-t-[55px] border-t-stone-600/70" />
            </div>

            {/* Target indicator at 12 o'clock (Device Top) */}
            <div className="absolute top-[-14px] flex flex-col items-center">
              <ArrowUp className={`w-6 h-6 ${isAligned ? 'text-emerald-400' : 'text-amber-400'} animate-bounce`} />
            </div>
          </div>
        </div>

        {/* Degrees & Distance Info Badges */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-4 border-t border-emerald-900/40">
          <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-3">
            <span className="block text-xs text-stone-400 mb-1">زاوية القِبلة</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
              {Math.round(qiblaBearing)}°
            </span>
            <span className="block text-[11px] text-stone-400 mt-0.5">
              {getCompassDirectionName(qiblaBearing)}
            </span>
          </div>

          <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-3">
            <span className="block text-xs text-stone-400 mb-1">المسافة إلى الكعبة</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
              {distanceKm.toLocaleString('ar-EG')}
            </span>
            <span className="block text-[11px] text-stone-400 mt-0.5">كيلومتر</span>
          </div>

          <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-3">
            <span className="block text-xs text-stone-400 mb-1">اتجاه الجهاز الحالي</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-stone-200">
              {Math.round(currentHeading)}°
            </span>
            <span className="block text-[11px] text-stone-400 mt-0.5">
              {hasOrientationSensor ? 'مستشعر تلقائي' : 'يدوي'}
            </span>
          </div>

          <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-3">
            <span className="block text-xs text-stone-400 mb-1">الموقع المعتمد</span>
            <span className="text-sm font-semibold text-amber-200 truncate block" title={userLocation.name}>
              {userLocation.name.split('(')[0]}
            </span>
            <span className="block text-[11px] text-stone-400 mt-0.5 truncate">
              خط {userLocation.lat.toFixed(1)}°
            </span>
          </div>
        </div>

        {/* Manual Dial for Desktop / Without Orientation Sensor */}
        {!hasOrientationSensor && (
          <div className="relative z-10 mt-6 pt-4 border-t border-emerald-900/40 bg-black/20 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-stone-300 mb-2">
              <span>تدوير البوصلة يدوياً للمحاذاة مع الشمال الحقيقي:</span>
              <span className="font-mono text-amber-300 font-bold">{manualHeading}°</span>
            </div>
            <input 
              type="range"
              min="0"
              max="359"
              value={manualHeading}
              onChange={(e) => setManualHeading(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>0° (شمال)</span>
              <span>90° (شرق)</span>
              <span>180° (جنوب)</span>
              <span>270° (غرب)</span>
              <span>360°</span>
            </div>
          </div>
        )}

        {/* Orientation Sensor Activation Button for Mobile Safari */}
        <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => requestGPSLocation(true)}
            disabled={isLocating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md transition-colors"
          >
            <MapPin className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>تحديث موقعي عبر GPS</span>
          </button>

          <button
            onClick={requestOrientationPermission}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs sm:text-sm transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>تفعيل / معايرة حساس الاتجاه</span>
          </button>
        </div>

        {locationStatus && (
          <div className="relative z-10 text-center text-xs text-stone-400 mt-3">
            {locationStatus}
          </div>
        )}
      </div>

      {/* City Presets Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>اختيار المدينة أو العاصمة</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              اختر مدينتك مباشرة لحساب القِبلة دون الحاجة لتشغيل الموقع الجغرافي
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input 
              type="text"
              placeholder="ابحث عن مدينة أو دولة..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {filteredCities.map((city) => {
            const isSelected = userLocation.name.startsWith(city.nameAr);
            const cityQibla = calculateQiblaBearing(city.lat, city.lng);
            return (
              <button
                key={city.nameAr}
                onClick={() => {
                  setUserLocation({
                    lat: city.lat,
                    lng: city.lng,
                    name: `${city.nameAr}، ${city.countryAr}`
                  });
                  setLocationStatus(`تم اختيار ${city.nameAr}`);
                }}
                className={`text-right p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm font-semibold'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-sm">{city.nameAr}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-emerald-800 text-amber-200' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {Math.round(cityQibla)}°
                  </span>
                </div>
                <span className={`text-[11px] ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                  {city.countryAr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guidelines & Sunnah for Qibla */}
      <div className="mt-8 bg-amber-50/60 border border-amber-200 rounded-2xl p-5 text-stone-800">
        <h3 className="font-bold text-amber-950 flex items-center gap-2 text-sm sm:text-base mb-2">
          <Info className="w-5 h-5 text-amber-700" />
          <span>توجيهات فقهية لاستقبال القبلة:</span>
        </h3>
        <ul className="text-xs sm:text-sm text-stone-700 space-y-1.5 leading-relaxed list-disc list-inside">
          <li>استقبال القبلة شرط من شروط صحة الصلاة للمقتدر عليها.</li>
          <li>الواجب على من كان بعيداً عن الكعبة المشرفة هو إصابة جهة القبلة وسمتها، لقول النبي ﷺ: «ما بين المشرق والمغرب قِبلة».</li>
          <li>تأكد من إبعاد هاتفك عن الأجهزة المعدنية والمغناطيسية الكبيرة لضمان دقة عمل مستشعر البوصلة.</li>
        </ul>
      </div>
    </div>
  );
};
