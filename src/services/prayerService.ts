export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDateInfo {
  day: string;
  monthAr: string;
  year: string;
  weekdayAr: string;
  readable: string;
}

export interface PrayerDataResponse {
  timings: PrayerTimings;
  hijri: HijriDateInfo;
  locationName: string;
  timezone?: string;
}

const STORAGE_KEY_LOCATION = 'nur_quran_user_location_v1';
const STORAGE_KEY_ALERTS = 'nur_quran_prayer_alerts_v1';

export interface PrayerAlertSettings {
  enabled: boolean;
  soundType: 'makkah' | 'madinah' | 'chime';
  volume: number;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export const DEFAULT_ALERT_SETTINGS: PrayerAlertSettings = {
  enabled: true,
  soundType: 'makkah',
  volume: 0.8,
  prayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  }
};

export const POPULAR_CITIES: { name: string; country: string; lat: number; lng: number }[] = [
  { name: 'مكة المكرمة', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262 },
  { name: 'المدينة المنورة', country: 'Saudi Arabia', lat: 24.4686, lng: 39.6142 },
  { name: 'الرياض', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  { name: 'القدس الشريف', country: 'Palestine', lat: 31.7683, lng: 35.2137 },
  { name: 'القاهرة', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'دبي', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
  { name: 'عَمّان', country: 'Jordan', lat: 31.9454, lng: 35.9284 },
  { name: 'الكويت', country: 'Kuwait', lat: 29.3759, lng: 47.9774 },
  { name: 'الدوحة', country: 'Qatar', lat: 25.2854, lng: 51.5310 },
  { name: 'بغداد', country: 'Iraq', lat: 33.3152, lng: 44.3661 },
  { name: 'بيروت', country: 'Lebanon', lat: 33.8938, lng: 35.5018 },
  { name: 'إسطنبول', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { name: 'الرباط', country: 'Morocco', lat: 34.0209, lng: -6.8416 },
  { name: 'الجزائر', country: 'Algeria', lat: 36.7538, lng: 3.0588 },
  { name: 'تونس', country: 'Tunisia', lat: 36.8065, lng: 10.1815 },
  { name: 'لندن', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'باريس', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'نيويورك', country: 'United States', lat: 40.7128, lng: -74.0060 }
];

export const PrayerService = {
  /**
   * Fetch prayer times from external Aladhan API using coordinates
   */
  async fetchByCoordinates(lat: number, lng: number, locationName?: string): Promise<PrayerDataResponse> {
    const timestamp = Math.floor(Date.now() / 1000);
    // Method 4 = Umm Al-Qura University, Makkah
    const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=4`;
    
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      if (json.code === 200 && json.data) {
        const d = json.data;
        return {
          timings: {
            Fajr: cleanTime(d.timings.Fajr),
            Sunrise: cleanTime(d.timings.Sunrise),
            Dhuhr: cleanTime(d.timings.Dhuhr),
            Asr: cleanTime(d.timings.Asr),
            Maghrib: cleanTime(d.timings.Maghrib),
            Isha: cleanTime(d.timings.Isha)
          },
          hijri: {
            day: d.date.hijri.day,
            monthAr: d.date.hijri.month.ar || d.date.hijri.month.en,
            year: d.date.hijri.year,
            weekdayAr: d.date.hijri.weekday.ar || 'اليوم',
            readable: d.date.readable
          },
          locationName: locationName || `إحداثيات: ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
          timezone: d.meta.timezone
        };
      }
    } catch (e) {
      console.warn('Aladhan API fetch error:', e);
    }

    // Fallback to offline defaults
    return this.getFallbackTimes(locationName || 'مكة المكرمة');
  },

  /**
   * Fetch prayer times from external Aladhan API by city name
   */
  async fetchByCity(cityName: string, country: string = 'Saudi Arabia'): Promise<PrayerDataResponse> {
    const matchedCity = POPULAR_CITIES.find(c => c.name === cityName);
    if (matchedCity) {
      return this.fetchByCoordinates(matchedCity.lat, matchedCity.lng, matchedCity.name);
    }

    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityName)}&country=${encodeURIComponent(country)}&method=4`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (response.ok) {
        const json = await response.json();
        if (json.code === 200 && json.data) {
          const d = json.data;
          return {
            timings: {
              Fajr: cleanTime(d.timings.Fajr),
              Sunrise: cleanTime(d.timings.Sunrise),
              Dhuhr: cleanTime(d.timings.Dhuhr),
              Asr: cleanTime(d.timings.Asr),
              Maghrib: cleanTime(d.timings.Maghrib),
              Isha: cleanTime(d.timings.Isha)
            },
            hijri: {
              day: d.date.hijri.day,
              monthAr: d.date.hijri.month.ar,
              year: d.date.hijri.year,
              weekdayAr: d.date.hijri.weekday.ar,
              readable: d.date.readable
            },
            locationName: cityName,
            timezone: d.meta.timezone
          };
        }
      }
    } catch (e) {
      console.warn('Aladhan city fetch error:', e);
    }

    return this.getFallbackTimes(cityName);
  },

  getFallbackTimes(locationName: string): PrayerDataResponse {
    return {
      timings: {
        Fajr: '05:04',
        Sunrise: '06:22',
        Dhuhr: '12:20',
        Asr: '15:42',
        Maghrib: '18:15',
        Isha: '19:45'
      },
      hijri: {
        day: '15',
        monthAr: 'رَبِيعُ الآخِرِ',
        year: '1448',
        weekdayAr: 'الخميس',
        readable: new Date().toLocaleDateString('ar-EG')
      },
      locationName
    };
  },

  // Location persistence
  getUserSavedLocation(): { lat?: number; lng?: number; name: string } {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { name: 'مكة المكرمة', lat: 21.4225, lng: 39.8262 };
  },

  saveUserLocation(loc: { lat?: number; lng?: number; name: string }): void {
    try {
      localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
    } catch {}
  },

  // Alert Settings persistence
  getAlertSettings(): PrayerAlertSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (raw) return { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_ALERT_SETTINGS;
  },

  saveAlertSettings(settings: PrayerAlertSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(settings));
    } catch {}
  },

  // Play audio Adhan or Chime
  playAdhanSound(soundType: 'makkah' | 'madinah' | 'chime', volume: number = 0.8): HTMLAudioElement {
    let url = 'https://server11.mp3quran.net/athan/01.mp3'; // Makkah adhan stream
    if (soundType === 'madinah') {
      url = 'https://server11.mp3quran.net/athan/02.mp3';
    } else if (soundType === 'chime') {
      url = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    }

    const audio = new Audio(url);
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch(e => {
      console.warn('Audio play restricted by browser autoplay policy:', e);
      // Synthesize tone with Web Audio API as safe backup
      this.playSyntheticChime();
    });
    return audio;
  },

  playSyntheticChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.5); // E5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  }
};

function cleanTime(timeStr: string): string {
  if (!timeStr) return '00:00';
  // Strip timezone suffix if present like "05:04 (AST)"
  return timeStr.split(' ')[0].slice(0, 5);
}
