import React, { useState, useRef, useEffect } from 'react';
import { 
  Radio, Play, Pause, Volume2, VolumeX, Sparkles, 
  Disc, Mic, Bell, Heart, Share2, Music, Check, RefreshCw
} from 'lucide-react';

export interface RadioStation {
  id: string;
  name: string;
  category: 'quran' | 'reciter' | 'adhkar' | 'sunnah';
  description: string;
  streamUrl: string;
  country: string;
  badge?: string;
}

export interface AdhanSample {
  id: string;
  title: string;
  muazzin: string;
  location: string;
  audioUrl: string;
  duration?: string;
}

const STATIONS: RadioStation[] = [
  {
    id: 'cairo_quran',
    name: 'إذاعة القرآن الكريم من القاهرة',
    category: 'quran',
    description: 'البث الإذاعي الحي الرسمي الأقدم والأعرق في العالم الإسلامي، تلاوات نادرة وبرامج دينية هادفة',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    country: 'جمهورية مصر العربية',
    badge: 'بث مباشر 24/7'
  },
  {
    id: 'makkah_quran',
    name: 'إذاعة القرآن الكريم من مكة المكرمة',
    category: 'quran',
    description: 'بث مبارك مباشر لتلاوات أئمة الحرم المكي الشريف والصلوات الجهرية والختمات القرآنية',
    streamUrl: 'https://backup.qurango.net/radio/tarateel',
    country: 'المملكة العربية السعودية',
    badge: 'أئمة الحرمين'
  },
  {
    id: 'abdulbasit',
    name: 'إذاعة الشيخ عبد الباسط عبد الصمد',
    category: 'reciter',
    description: 'المصحف المجود والتلاوات الخارجية الخاشعة النادرة لصوت مكة الحنون رحمة الله عليه',
    streamUrl: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad',
    country: 'تلاوات مجودة',
    badge: 'صوت السماء'
  },
  {
    id: 'minshawi',
    name: 'إذاعة الشيخ محمد صديق المنشاوي',
    category: 'reciter',
    description: 'المصحف المرتل والمجود بنبرات الخشوع والسكينة والوقار المؤثر في القلوب',
    streamUrl: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad',
    country: 'مصر',
    badge: 'الصوت الباكي'
  },
  {
    id: 'hussary',
    name: 'إذاعة الشيخ محمود خليل الحصري',
    category: 'reciter',
    description: 'شيخ عموم المقارئ المصرية، المصحف المرتل المتقن بأعلى درجات أحكام التجويد والضبط',
    streamUrl: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary',
    country: 'مصر',
    badge: 'إتقان التجويد'
  },
  {
    id: 'afasy',
    name: 'إذاعة الشيخ مشاري بن راشد العفاسي',
    category: 'reciter',
    description: 'تلاوات عذبة وتراتيل قرآنية وأذكار الصباح والمساء برواية حفص عن عاصم',
    streamUrl: 'https://backup.qurango.net/radio/mishary_alafasi',
    country: 'الكويت',
    badge: 'ترتيل عذب'
  },
  {
    id: 'roqiah',
    name: 'إذاعة الرقية الشرعية المتواصلة',
    category: 'adhkar',
    description: 'رقية شرعية شاملة مستمرة من الكتاب والسنة لعلاج الحسد والعين والمس والسكينة وطرد الشياطين',
    streamUrl: 'https://backup.qurango.net/radio/roqiah',
    country: 'العالم الإسلامي',
    badge: 'شفاء وسكينة'
  },
  {
    id: 'sunnah',
    name: 'إذاعة السنة النبوية الشريفة',
    category: 'sunnah',
    description: 'أحاديث صحيحة من صحيح البخاري ومسلم وشروح سنية مع إذاعة صوتية متواصلة',
    streamUrl: 'https://backup.qurango.net/radio/sunnah',
    country: 'المدينة المنورة',
    badge: 'حديث نبوي'
  },
  {
    id: 'khashia',
    name: 'إذاعة التلاوات الخاشعة والمؤثرة',
    category: 'quran',
    description: 'مختارات تلاوات مبكية ومؤثرة من صلوات التراويح والقيام والتهجد لكبار القراء',
    streamUrl: 'https://backup.qurango.net/radio/khashia',
    country: 'مختارات إيمانية',
    badge: 'خشوع وتدبر'
  },
  {
    id: 'eid_takbeer',
    name: 'إذاعة تكبيرات العيدين والتلبية',
    category: 'adhkar',
    description: 'تكبيرات عيد الفطر والأضحى وتلبية الحجاج في المشاعر المقدسة بأصوات ندية',
    streamUrl: 'https://backup.qurango.net/radio/eid',
    country: 'المشاعر المقدسة',
    badge: 'تكبيرات الحرمين'
  }
];

const ADHAN_SAMPLES: AdhanSample[] = [
  {
    id: 'makkah_mulla',
    title: 'أذان المسجد الحرام بمكة المكرمة',
    muazzin: 'الشيخ علي أحمد ملا (شيخ مؤذني الحرم المكي)',
    location: 'مكة المكرمة',
    audioUrl: 'https://media.islamway.net/several/adhan/makkah.mp3',
    duration: '3:45'
  },
  {
    id: 'madinah_adhan',
    title: 'أذان المسجد النبوي الشريف',
    muazzin: 'مؤذنو الحرم النبوي الشريف',
    location: 'المدينة المنورة',
    audioUrl: 'https://media.islamway.net/several/adhan/madinah.mp3',
    duration: '4:12'
  },
  {
    id: 'aqsa_adhan',
    title: 'أذان المسجد الأقصى المبارك',
    muazzin: 'مؤذنو المسجد الأقصى',
    location: 'القدس الشريف - فلسطين',
    audioUrl: 'https://media.islamway.net/several/adhan/aqsa.mp3',
    duration: '3:50'
  },
  {
    id: 'afasy_adhan',
    title: 'أذان بصوت الشيخ مشاري العفاسي',
    muazzin: 'الشيخ مشاري راشد العفاسي',
    location: 'الكويت',
    audioUrl: 'https://media.islamway.net/several/adhan/alafasi.mp3',
    duration: '3:20'
  },
  {
    id: 'cairo_adhan',
    title: 'أذان الجامع الأزهر الشريف',
    muazzin: 'مؤذنو الجامع الأزهر',
    location: 'القاهرة - مصر',
    audioUrl: 'https://media.islamway.net/several/adhan/cairo.mp3',
    duration: '3:30'
  }
];

export const QuranRadioView: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<RadioStation>(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Adhan player state
  const [playingAdhanId, setPlayingAdhanId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const radioAudioRef = useRef<HTMLAudioElement | null>(null);
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize or handle Radio station change
  const playStation = (station: RadioStation) => {
    // If playing an Adhan, pause it
    if (adhanAudioRef.current) {
      adhanAudioRef.current.pause();
      setPlayingAdhanId(null);
    }

    if (selectedStation.id === station.id && isPlaying) {
      radioAudioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setSelectedStation(station);
    setIsLoading(true);

    if (radioAudioRef.current) {
      radioAudioRef.current.src = station.streamUrl;
      radioAudioRef.current.volume = isMuted ? 0 : volume;
      radioAudioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Audio play interrupted or failed:', err);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const togglePlayRadio = () => {
    if (!radioAudioRef.current) return;

    if (isPlaying) {
      radioAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      radioAudioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (radioAudioRef.current) {
      radioAudioRef.current.volume = isMuted ? 0 : newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!radioAudioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    radioAudioRef.current.volume = nextMute ? 0 : volume;
  };

  // Play Adhan sample
  const playAdhan = (sample: AdhanSample) => {
    // Pause radio first
    if (radioAudioRef.current && isPlaying) {
      radioAudioRef.current.pause();
      setIsPlaying(false);
    }

    if (playingAdhanId === sample.id) {
      adhanAudioRef.current?.pause();
      setPlayingAdhanId(null);
      return;
    }

    setPlayingAdhanId(sample.id);
    if (adhanAudioRef.current) {
      adhanAudioRef.current.src = sample.audioUrl;
      adhanAudioRef.current.volume = volume;
      adhanAudioRef.current.play().catch(() => {
        setPlayingAdhanId(null);
      });
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      radioAudioRef.current?.pause();
      adhanAudioRef.current?.pause();
    };
  }, []);

  const filteredStations = STATIONS.filter(s => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hidden native audio elements */}
      <audio 
        ref={radioAudioRef} 
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />
      <audio 
        ref={adhanAudioRef} 
        onEnded={() => setPlayingAdhanId(null)}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-900/10 text-emerald-900 rounded-2xl mb-3">
          <Radio className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-emerald-950 mb-2">
          إذاعات القرآن الكريم المباشرة وأصوات الأذان
        </h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-sm sm:text-base">
          استمع إلى البث الحي المباشر لأعرق إذاعات العالم الإسلامي وتلاوات كبار المقرئين وأجمل أصوات الأذان المباركة على مدار الساعة
        </p>
      </div>

      {/* Featured Main Radio Player Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-800/40 relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Station Info & Equalizer */}
          <div className="flex items-center gap-5 w-full md:w-auto">
            {/* Spinning Disc / Station Logo */}
            <div className="relative shrink-0">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-800/60 border-2 border-amber-400/50 flex items-center justify-center shadow-lg ${
                isPlaying ? 'ring-4 ring-emerald-500/40 animate-pulse' : ''
              }`}>
                <Radio className={`w-10 h-10 ${isPlaying ? 'text-amber-300' : 'text-stone-300'}`} />
              </div>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {selectedStation.badge || 'بث إذاعي مباشر'}
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                  {isPlaying ? 'البث متصل ومباشر' : 'متوقف'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
                {selectedStation.name}
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-md line-clamp-2">
                {selectedStation.description}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlayRadio}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
                isPlaying
                  ? 'bg-amber-400 text-emerald-950 hover:bg-amber-300 shadow-amber-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-700/40'
              }`}
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل البث المباشر'}
            >
              {isLoading ? (
                <RefreshCw className="w-7 h-7 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 bg-stone-900/80 px-3.5 py-2 rounded-xl border border-emerald-800/40">
              <button 
                onClick={toggleMute}
                className="text-stone-300 hover:text-white transition-colors"
                title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-amber-300" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Audio Visualizer Waves Indicator */}
        {isPlaying && (
          <div className="relative z-10 mt-6 pt-4 border-t border-emerald-800/40 flex items-center justify-center gap-1.5 h-8">
            <span className="text-xs text-emerald-300 font-mono ml-3">صوت عالي الدقة HD:</span>
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="w-1 bg-amber-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.max(6, Math.sin(i * 0.5) * 22 + 10)}px`,
                  animationDuration: `${0.4 + (i % 5) * 0.2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Radio Stations Catalog */}
      <div className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-emerald-950 flex items-center gap-2">
              <Disc className="w-6 h-6 text-emerald-700" />
              <span>دليل إذاعات القرآن الكريم المعتمدة</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              اختر الإذاعة للاستماع الفوري للبث الحي بجودة عالية
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === 'all' ? 'bg-emerald-900 text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              الكل ({STATIONS.length})
            </button>
            <button
              onClick={() => setFilterCategory('quran')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === 'quran' ? 'bg-emerald-900 text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              إذاعات رسمية
            </button>
            <button
              onClick={() => setFilterCategory('reciter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === 'reciter' ? 'bg-emerald-900 text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              كبار المقرئين
            </button>
            <button
              onClick={() => setFilterCategory('adhkar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === 'adhkar' ? 'bg-emerald-900 text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              أذكار ورقيا
            </button>
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStations.map((station) => {
            const isCurrentStation = selectedStation.id === station.id;
            const isCurrentPlaying = isCurrentStation && isPlaying;

            return (
              <div
                key={station.id}
                onClick={() => playStation(station)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isCurrentStation
                    ? 'bg-emerald-50 border-emerald-700 shadow-md ring-2 ring-emerald-600/20'
                    : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-emerald-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl shrink-0 mt-0.5 ${
                    isCurrentStation 
                      ? 'bg-emerald-800 text-amber-300' 
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {station.country}
                      </span>
                      {station.badge && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                          {station.badge}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-bold font-serif ${
                      isCurrentStation ? 'text-emerald-950' : 'text-stone-900'
                    }`}>
                      {station.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {station.description}
                    </p>
                  </div>
                </div>

                <button
                  className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                    isCurrentPlaying
                      ? 'bg-emerald-900 text-amber-300'
                      : 'bg-stone-100 hover:bg-emerald-800 hover:text-white text-stone-800'
                  }`}
                  aria-label={isCurrentPlaying ? 'إيقاف' : 'تشغيل'}
                >
                  {isCurrentPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adhan Audio Showcase */}
      <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-emerald-950">
              أصوات الأذان المباركة
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              استمع لأجمل أصوات الأذان من الحرمين الشريفين والمسجد الأقصى والجامع الأزهر
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADHAN_SAMPLES.map((sample) => {
            const isPlayingThis = playingAdhanId === sample.id;
            return (
              <div
                key={sample.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPlayingThis
                    ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-300/30'
                    : 'bg-white border-stone-200 hover:border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                    {sample.location}
                  </span>
                  {sample.duration && (
                    <span className="text-[11px] text-stone-400 font-mono">
                      {sample.duration}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-stone-900 mb-1">
                  {sample.title}
                </h3>
                <p className="text-xs text-stone-500 mb-4 line-clamp-1">
                  {sample.muazzin}
                </p>

                <button
                  onClick={() => playAdhan(sample)}
                  className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors ${
                    isPlayingThis
                      ? 'bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold'
                      : 'bg-emerald-900 hover:bg-emerald-800 text-white'
                  }`}
                >
                  {isPlayingThis ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>إيقاف الأذان</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>استماع للأذان</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
