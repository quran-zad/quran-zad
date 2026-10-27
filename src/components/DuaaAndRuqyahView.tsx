import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, BookOpen, ShieldCheck, Copy, 
  Share2, Check, Volume2, VolumeX, Play, Pause, Bookmark, Star
} from 'lucide-react';

interface DuaaItem {
  id: number;
  title: string;
  arabic: string;
  source: string;
  benefit?: string;
  repeatCount?: number;
}

const KHATM_DUAA_PARAGRAPHS = [
  {
    title: 'الافتتاح والحمد والثناء',
    text: 'اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ، وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً.'
  },
  {
    title: 'طلب الفهم والتذكير والتلاوة',
    text: 'اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ.'
  },
  {
    title: 'صلاح الدين والدنيا والآخرة',
    text: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ المَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.'
  },
  {
    title: 'حسن الخاتمة والنجاة من النار',
    text: 'اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ، وَخَيْرَ عَمَلِي خَوَاتِمَهُ، وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ. اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً، وَمِيتَةً سَوِيَّةً، وَمَرَدّاً غَيْرَ مُخْزٍ وَلا فَاضِحٍ.'
  },
  {
    title: 'سؤال الفردوس الأعلى والعفو',
    text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ المَسْأَلَةِ، وَخَيْرَ الدُّعَاءِ، وَخَيْرَ النَّجَاحِ، وَخَيْرَ العِلْمِ، وَخَيْرَ العَمَلِ، وَخَيْرَ الثَّوَابِ، وَخَيْرَ الحَيَاةِ، وَخَيْرَ المَمَاتِ، وَثَبِّتْنِي وَثَقِّلْ مَوَازِينِي، وَحَقِّقْ إِيمَانِي، وَارْفَعْ دَرَجَتِي، وَتَقَبَّلْ صَلاتِي، وَاغْفِرْ خَطِيئَاتِي، وَأَسْأَلُكَ العُلَى مِنَ الجَنَّةِ.'
  },
  {
    title: 'الدعاء للمؤمنين والمؤمنات والأموات',
    text: 'اللَّهُمَّ لا تَدَعْ لَنَا ذَنْباً إِلا غَفَرْتَهُ، وَلا هَمّاً إِلا فَرَّجْتَهُ، وَلا دَيْناً إِلا قَضَيْتَهُ، وَلا حَاجَةً مِنْ حَوَائِجِ الدُّنْيَا وَالآخِرَةِ إِلا قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِينَ. اللَّهُمَّ اغْفِرْ لِآبَائِنَا وَأُمَّهَاتِنَا وَإِخْوَانِنَا وَأَمْوَاتِنَا وَأَمْوَاتِ المُسْلِمِينَ أَجْمَعِينَ.'
  }
];

const RUQYAH_ITEMS: DuaaItem[] = [
  {
    id: 1,
    title: 'سورة الفاتحة (السبع المثاني والشفاء)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ * الرَّحْمَٰنِ الرَّحِيمِ * مَالِكِ يَوْمِ الدِّينِ * إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ * اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ * صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    source: 'القرآن الكريم - أم الكتاب وأعظم رقية',
    benefit: 'تقرأ 7 مرات بنية الشفاء والتحصين ودفع كل ضر',
    repeatCount: 7
  },
  {
    id: 2,
    title: 'آية الكرسي (أعظم آية في كتاب الله)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    source: 'سورة البقرة: 255',
    benefit: 'لا يزال عليك من الله حافظ ولا يقربك شيطان حتى تصبح',
    repeatCount: 3
  },
  {
    id: 3,
    title: 'خواتيم سورة البقرة',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ * لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    source: 'سورة البقرة: 285-286',
    benefit: 'من قرأهما في ليلة كفتاه من كل شر وسوء',
    repeatCount: 1
  },
  {
    id: 4,
    title: 'سورة الإخلاص والمعوذتين (الفلق والناس)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ... * قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... * قُلْ أَعُوذُ بِرَبِّ النَّاسِ ...',
    source: 'القرآن الكريم',
    benefit: 'تقرأ 3 مرات حين تصبح وحين تمسي تكفيك من كل شيء',
    repeatCount: 3
  },
  {
    id: 5,
    title: 'دعاء النبي ﷺ للشفاء وطرد البأس',
    arabic: 'أَذْهِبِ البَاسَ رَبَّ النَّاسِ، اشْفِ وَأَنْتَ الشَّافِي، لا شِفَاءَ إِلا شِفَاؤُكَ، شِفَاءً لا يُغَادِرُ سَقَماً.',
    source: 'صحيح البخاري ومسلم',
    benefit: 'يقال عند مسح موضع الألم أو رقية المريض',
    repeatCount: 3
  },
  {
    id: 6,
    title: 'رقية جبريل عليه السلام لرسول الله ﷺ',
    arabic: 'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ.',
    source: 'صحيح مسلم',
    benefit: 'من أعظم الأدعية في دفع العين والحسد والأذى',
    repeatCount: 3
  },
  {
    id: 7,
    title: 'الاستعاذة بكلمات الله التامات',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    source: 'صحيح مسلم',
    benefit: 'من نزل منزلاً فقالها لم يضره شيء حتى يرتحل منه',
    repeatCount: 3
  }
];

const DECEASED_DUAA_ITEMS: DuaaItem[] = [
  {
    id: 101,
    title: 'الدعاء الجامع للميت بالمغفرة وتثبيت السؤال',
    arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالمَاءِ وَالثَّلْجِ وَالبَرَدِ، وَنَقِّهِ مِنَ الخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الأَبْيَضَ مِنَ الدَّنَسِ، وَأَبْدِلْهُ دَاراً خَيْراً مِنْ دَارِهِ، وَأَهْلاً خَيْراً مِنْ أَهْلِهِ، وَأَدْخِلْهُ الجَنَّةَ، وَأَعِذْهُ مِنْ عَذَابِ القَبْرِ وَمِنْ عَذَابِ النَّارِ.',
    source: 'صحيح مسلم عن عوف بن مالك رضي الله عنه',
    benefit: 'دعاء النبي ﷺ في صلاة الجنازة على المتوفى'
  },
  {
    id: 102,
    title: 'دعاء للوالدين والأخوة والأقارب',
    arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيراً. اللَّهُمَّ اجْعَلْ قُبُورَهُمْ رَوْضَةً مِنْ رِيَاضِ الجَنَّةِ، وَلا تَجْعَلْهَا حُفْرَةً مِنْ حُفَرِ النَّارِ، وَافْسَحْ لَهُمْ فِي قُبُورِهِمْ مَدَّ بَصَرِهِمْ، وَفَرِّشْ قُبُورَهُمْ مِنْ فِرَاشِ الجَنَّةِ.',
    source: 'سورة الإسراء وسنة النبي ﷺ',
    benefit: 'بر الوالدين بالدعاء المستمر والصدقة الجارية'
  },
  {
    id: 103,
    title: 'طلب الفردوس الأعلى والظلال يوم القيامة',
    arabic: 'اللَّهُمَّ يَمِّنْ كِتَابَهُمْ، وَيَسِّرْ حِسَابَهُمْ، وَثَقِّلْ بِالحَسَنَاتِ مِيزَانَهُمْ، وَثَبِّتْ عَلَى الصِّرَاطِ أَقْدَامَهُمْ، وَأَسْكِنْهُمْ فِي أَعْلَى الجَنَّاتِ فِي جِوَارِ نَبِيِّكَ وَمُصْطَفَاكَ مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ.',
    source: 'مأثور الأدعية الصالحة',
    benefit: 'أعلى منازل الجنة والخلود في رحمة الله'
  },
  {
    id: 104,
    title: 'دعاء تنزيل النور والفسحة والسرور في القبر',
    arabic: 'اللَّهُمَّ أَنْزِلْ عَلَى قُبُورِهِمُ الضِّيَاءَ وَالنُّورَ، وَالفُسْحَةَ وَالسُّرُورَ، وَانْقُلْهُمْ مِنْ ضِيقِ اللُّحُودِ وَمَرَاكِعِ الدُّودِ إِلَى جَنَّاتِ الخُلُودِ، فِي سِدْرٍ مَخْضُودٍ وَطَلْحٍ مَنْضُودٍ وَظِلٍّ مَمْدُودٍ.',
    source: 'مأثور الصالحين',
    benefit: 'أنس الوحشة ونور القبر'
  }
];

export const DuaaAndRuqyahView: React.FC = () => {
  const [subTab, setSubTab] = useState<'khatm' | 'ruqyah' | 'deceased'>('deceased');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [fatihahReadCount, setFatihahReadCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('nur_quran_fatihah_count');
      return stored ? parseInt(stored, 10) : 124;
    } catch {
      return 124;
    }
  });
  const [isPlayingKhatmAudio, setIsPlayingKhatmAudio] = useState<boolean>(false);
  const khatmAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReadFatihah = () => {
    const next = fatihahReadCount + 1;
    setFatihahReadCount(next);
    try {
      localStorage.setItem('nur_quran_fatihah_count', next.toString());
    } catch {}
    if (navigator.vibrate) {
      try { navigator.vibrate(50); } catch {}
    }
  };

  const toggleKhatmAudio = () => {
    if (!khatmAudioRef.current) return;
    if (isPlayingKhatmAudio) {
      khatmAudioRef.current.pause();
      setIsPlayingKhatmAudio(false);
    } else {
      khatmAudioRef.current.play()
        .then(() => setIsPlayingKhatmAudio(true))
        .catch(() => setIsPlayingKhatmAudio(false));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hidden Audio Element for Khatm Duaa */}
      <audio 
        ref={khatmAudioRef}
        src="https://media.islamway.net/several/duaa_khatm_sudais.mp3"
        onEnded={() => setIsPlayingKhatmAudio(false)}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-900/10 text-emerald-900 rounded-2xl mb-3">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-emerald-950 mb-2">
          الأدعية القرآنية والرقية الشرعية وصدقة جارية
        </h1>
        <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base">
          دعاء ختم القرآن، الرقية الشرعية المحققة، وأدعية صالحة للمتوفى والوالدين صدقة جارية
        </p>
      </div>

      {/* Sub Tabs Selection */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-stone-200/80 rounded-2xl gap-1">
          <button
            onClick={() => setSubTab('deceased')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              subTab === 'deceased'
                ? 'bg-emerald-900 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Heart className="w-4 h-4 text-amber-300" />
            <span>صدقة جارية عن الوالد والأخ</span>
          </button>

          <button
            onClick={() => setSubTab('khatm')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              subTab === 'khatm'
                ? 'bg-emerald-900 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>دعاء ختم القرآن</span>
          </button>

          <button
            onClick={() => setSubTab('ruqyah')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              subTab === 'ruqyah'
                ? 'bg-emerald-900 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>الرقية الشرعية</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: DECEASED MEMORIAL & DEDICATION */}
      {subTab === 'deceased' && (
        <div className="space-y-6">
          {/* Main Dedication Box */}
          <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-amber-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-4">
                ﴿ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا ﴾
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 mb-3">
                هذا الموقع صدقة جارية مباركة
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-stone-200 font-serif mb-6">
                عن روح والدي وأخي، رحمهما الله تعالى.
                <br />
                نرجو قراءة سورة الفاتحة على روح والدي المرحوم 
                <strong className="text-amber-300 mx-1">سليم بركات</strong>، 
                وأخي المرحوم 
                <strong className="text-amber-300 mx-1">محمود سليم بركات</strong>، 
                سائلين الله أن يتغمدهما بواسع رحمته، ويسكنهما فسيح جناته، وأن يجعل هذا العمل نوراً في قبريهما.
              </p>

              {/* Interactive Fatihah Reading Counter */}
              <div className="bg-black/30 border border-amber-400/30 rounded-2xl p-4 sm:p-6 inline-flex flex-col items-center">
                <span className="text-xs text-amber-200/80 mb-2">
                  عدد مرات قراءة الفاتحة وإهداء الثواب من زوار المنصة:
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 mb-3">
                  {fatihahReadCount.toLocaleString('ar-EG')} مرة
                </span>
                <button
                  onClick={handleReadFatihah}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-amber-500/20 transform active:scale-95 transition-all"
                >
                  <Heart className="w-5 h-5 fill-current text-emerald-900" />
                  <span>قرأتُ الفاتحة الآن وأهديتُ ثوابها لهما</span>
                </button>
              </div>
            </div>
          </div>

          {/* Deceased Supplications List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-serif text-emerald-950 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-600" />
              <span>مأثور الأدعية للمتوفى من السنة النبوية</span>
            </h3>

            {DECEASED_DUAA_ITEMS.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-bold text-base text-emerald-950">{item.title}</h4>
                  <button
                    onClick={() => handleCopy(item.arabic, `deceased_${item.id}`)}
                    className="p-2 text-stone-500 hover:text-emerald-800 rounded-lg hover:bg-stone-100 transition-colors"
                    title="نسخ الدعاء"
                  >
                    {copiedIndex === `deceased_${item.id}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-lg sm:text-xl font-serif leading-loose text-stone-900 bg-stone-50 p-4 rounded-xl border border-stone-100">
                  {item.arabic}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                  <span>المصدر: {item.source}</span>
                  {item.benefit && <span className="text-amber-800 font-medium">{item.benefit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: KHATM AL-QURAN DUAA */}
      {subTab === 'khatm' && (
        <div className="space-y-6">
          {/* Audio Player Bar for Khatm Duaa */}
          <div className="bg-emerald-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-emerald-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-800 rounded-xl text-amber-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-amber-200">استماع لدعاء ختم القرآن الكريم</h3>
                <p className="text-xs text-stone-300">بصوت خاشع ومؤثر من رحاب الحرم المكي الشريف</p>
              </div>
            </div>

            <button
              onClick={toggleKhatmAudio}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${
                isPlayingKhatmAudio
                  ? 'bg-amber-400 text-emerald-950'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
              }`}
            >
              {isPlayingKhatmAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف الدعاء</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>تشغيل الدعاء الصوتي</span>
                </>
              )}
            </button>
          </div>

          {/* Full Khatm Duaa Text */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="text-center border-b border-stone-200 pb-4">
              <h2 className="text-2xl font-bold font-serif text-emerald-950">
                دعاء ختم القرآن الكريم المبارك
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                المأثور في ختام المصحف الشريف وأدعية أئمة الحرمين الشريفين
              </p>
            </div>

            {KHATM_DUAA_PARAGRAPHS.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 px-2 py-0.5 rounded bg-emerald-100">
                    {p.title}
                  </span>
                  <button
                    onClick={() => handleCopy(p.text, `khatm_${idx}`)}
                    className="p-1.5 text-stone-500 hover:text-emerald-800 rounded-lg hover:bg-stone-200 transition-colors"
                    title="نسخ"
                  >
                    {copiedIndex === `khatm_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-lg sm:text-xl font-serif leading-loose text-stone-900">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: RUQYAH SHARIAH */}
      {subTab === 'ruqyah' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-950">
            <h3 className="font-bold flex items-center gap-2 text-base mb-1">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <span>كيفية الرقية الشرعية الصحيحة:</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              تقرأ هذه الآيات والأحاديث النبوية بحضور قلب وخشوع وتوكل تام على الله الشافي المعافي، مع النفث في الكفين ومسح الرأس والجسد، أو القراءة على ماء للشرب والاغتسال.
            </p>
          </div>

          <div className="space-y-4">
            {RUQYAH_ITEMS.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                      {item.id}
                    </span>
                    <h4 className="font-bold text-base text-emerald-950">{item.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {item.repeatCount && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        تكرار {item.repeatCount} مرات
                      </span>
                    )}
                    <button
                      onClick={() => handleCopy(item.arabic, `ruqyah_${item.id}`)}
                      className="p-2 text-stone-500 hover:text-emerald-800 rounded-lg hover:bg-stone-100 transition-colors"
                      title="نسخ"
                    >
                      {copiedIndex === `ruqyah_${item.id}` ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-lg sm:text-xl font-serif leading-loose text-stone-900 bg-stone-50 p-4 rounded-xl border border-stone-100">
                  {item.arabic}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                  <span>{item.source}</span>
                  {item.benefit && <span className="text-emerald-800 font-semibold">{item.benefit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
