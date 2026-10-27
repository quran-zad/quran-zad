import React, { useState } from 'react';
import { 
  Tv, Compass, Sparkles, Heart, ExternalLink, 
  Eye, Volume2, Shield, Info, MapPin, Maximize2
} from 'lucide-react';

interface Sanctuary {
  id: 'makkah' | 'madinah' | 'aqsa';
  title: string;
  subtitle: string;
  liveUrl: string; // YouTube embed or stream URL
  description: string;
  virtues: string[];
  bannerImage: string;
}

const SANCTUARIES: Sanctuary[] = [
  {
    id: 'makkah',
    title: 'المسجد الحرام والكعبة المشرفة',
    subtitle: 'مكة المكرمة - المملكة العربية السعودية',
    liveUrl: 'https://www.youtube.com/embed/live_stream?channel=UC8C6q3pZ70kE_K4Q0iX9n5Q', // Official Saudi Quran Channel
    description: 'أقدس بقاع الأرض وقبلة المسلمين، فيه الكعبة المشرفة ومقام إبراهيم وبئر زمزم، والصلاة فيه بمائة ألف صلاة فيما سواه.',
    virtues: [
      'الصلاة في المسجد الحرام تعدل 100,000 صلاة',
      'مهبط الوحي وأول بيت وُضع للناس',
      'قبلة المسلمين في صلواتهم في مشارق الأرض ومغاربها'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'madinah',
    title: 'المسجد النبوي والروضة الشريفة',
    subtitle: 'المدينة المنورة - طيبة الطيبة',
    liveUrl: 'https://www.youtube.com/embed/live_stream?channel=UCc_j8kE0y82j4iL8G1G0NnA', // Official Saudi Sunnah Channel
    description: 'مسجد رسول الله ﷺ وفيه الروضة الشريفة التي هي روضة من رياض الجنة، والصلاة فيه بألف صلاة فيما سواه إلا المسجد الحرام.',
    virtues: [
      'الصلاة في مسجدي هذا خير من ألف صلاة فيما سواه',
      'ما بين بيتي ومنبري روضة من رياض الجنة',
      'من زارني بعد مماتي فكأنما زارني في حياتي'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'aqsa',
    title: 'المسجد الأقصى وقبة الصخرة',
    subtitle: 'القدس الشريف - فلسطين المحتلة',
    liveUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4g5tZ314qQ4Q7E6fQe9w8A',
    description: 'أولى القبلتين وثالث الحرمين الشريفين ومسرى رسول الله ﷺ في ليلة الإسراء والمعراج، والصلاة فيه بمائتين وخمسين أو خمسمائة صلاة.',
    virtues: [
      'مسرى النبي المصطفى ﷺ ومعراجه إلى السماوات العلى',
      'ثالث المساجد التي لا تُشد الرحال إلا إليها',
      'أرض المحشر والمنشر وموئل الأنبياء والمرسلين'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1544977824-d922f5f14fc2?auto=format&fit=crop&w=1200&q=80'
  }
];

export const HaramainLiveView: React.FC = () => {
  const [activeSanctuary, setActiveSanctuary] = useState<'makkah' | 'madinah' | 'aqsa'>('makkah');

  const current = SANCTUARIES.find(s => s.id === activeSanctuary) || SANCTUARIES[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-900/10 text-emerald-900 rounded-2xl mb-3">
          <Tv className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-emerald-950 mb-2">
          البث المباشر ومعالم الحرمين الشريفين
        </h1>
        <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base">
          شاهد البث الحي على مدار الساعة من المسجد الحرام بمكة المكرمة والمسجد النبوي الشريف والمسجد الأقصى المبارك
        </p>
      </div>

      {/* Sanctuary Selector Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-stone-200/80 rounded-2xl gap-1">
          {SANCTUARIES.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSanctuary(s.id)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeSanctuary === s.id
                  ? 'bg-emerald-900 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>{s.title.split(' ')[1] || s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Video Stream Container */}
      <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-800 mb-8 relative aspect-video">
        {/* Live Indicator Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>بث مباشر حي</span>
        </div>

        {/* Video Player */}
        <iframe
          src={
            activeSanctuary === 'makkah'
              ? 'https://www.youtube.com/embed/videoseries?list=PL44dwtk3e_H6v4x7_g3pGz1e7q3u-lqWn&autoplay=1'
              : activeSanctuary === 'madinah'
              ? 'https://www.youtube.com/embed/videoseries?list=PL44dwtk3e_H6143mXyK_7nZ2fQ8D5zXlA&autoplay=1'
              : 'https://www.youtube.com/embed/videoseries?list=PL_X2P7d7w2k8q6k_L6fT5r6j9j5a8d9b&autoplay=1'
          }
          title={current.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      {/* Sanctuary Overview & Virtues */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-stone-200 pb-5 mb-5">
          <div>
            <span className="text-xs font-bold text-emerald-800 px-2.5 py-1 rounded-full bg-emerald-100">
              {current.subtitle}
            </span>
            <h2 className="text-2xl font-bold font-serif text-emerald-950 mt-2">
              {current.title}
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-2xl">
              {current.description}
            </p>
          </div>

          <a
            href={
              activeSanctuary === 'makkah'
                ? 'https://www.youtube.com/results?search_query=بث+مباشر+قناة+القران+الكريم+مكة'
                : activeSanctuary === 'madinah'
                ? 'https://www.youtube.com/results?search_query=بث+مباشر+قناة+السنة+النبوية+المدينة'
                : 'https://www.youtube.com/results?search_query=بث+مباشر+المسجد+الاقصى'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors shrink-0"
          >
            <span>فتح في يوتيوب</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div>
          <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>من فضائل وبركات هذا المكان الطاهر:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {current.virtues.map((v, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 font-medium">
                • {v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
