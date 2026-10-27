import { Ayah } from '../types';

export interface PageData {
  pageNumber: number;
  juzNumber: number;
  surahNames: string[];
  ayahs: Ayah[];
}

// Built-in offline seed for key pages to guarantee instant rendering even if network is offline
export const INITIAL_PAGES_CACHE: Record<number, PageData> = {
  1: {
    pageNumber: 1,
    juzNumber: 1,
    surahNames: ["الفاتحة"],
    ayahs: [
      {
        number: 1,
        numberInSurah: 1,
        surahNumber: 1,
        page: 1,
        juz: 1,
        text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        tafsir: "سورة الفاتحة تفتتح ببسم الله الرحمن الرحيم: أبدأ قراءتي مستعينا باسم الله، وهو الاسم الأعظم للمولى عز وجل، الرحمن ذي الرحمة العامة، الرحيم بالخاصة من المؤمنين.",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful."
      },
      {
        number: 2,
        numberInSurah: 2,
        surahNumber: 1,
        page: 1,
        juz: 1,
        text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        tafsir: "الثناء الكامل باللسان والشكر بالجنان خالص لله وحده، مربي خلقه ومصلح شؤونهم والمالك لنفعهم وضرهم في كل العوالم.",
        translation: "[All] praise is [due] to Allah, Lord of the worlds -"
      },
      {
        number: 3,
        numberInSurah: 3,
        surahNumber: 1,
        page: 1,
        juz: 1,
        text: "الرَّحْمَٰنِ الرَّحِيمِ",
        tafsir: "الواسع الرحمة التي وسعت كل شيء، والواصلة رحمته إلى من شاء من عباده وخاصة أهل طاعته.",
        translation: "The Entirely Merciful, the Especially Merciful,"
      },
      {
        number: 4,
        numberInSurah: 4,
        surahNumber: 1,
        page: 1,
        juz: 1,
        text: "مَالِكِ يَوْمِ الدِّينِ",
        tafsir: "المتصرف الأوحد في يوم القيامة والجزاء والحساب، يوم لا تملك نفس لنفس شيئا والأمر يومئذ لله.",
        translation: "Sovereign of the Day of Recompense."
      },
      {
        number: 5,
        numberInSurah: 5,
        surahNumber: 1,
        page: 1,
        juz: 1,
        text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        tafsir: "نخصك وحدك بالعبادة والتذلل، ونستعين بك وحدك في سائر أمورنا الدينية والدنيوية.",
        translation: "It is You we worship and You we ask for help."
      },
      {
        number: 6,
        numberInSurah: 6,
        surahNumber: 1,
        page: 1,
        juz: 1,
        text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        tafsir: "وفقنا وأرشدنا وثبتنا على الصراط السوي المستقيم، وهو دين الإسلام الحق والاتباع لسنة النبي ﷺ.",
        translation: "Guide us to the straight path -"
      },
      {
        number: 7,
        numberInSurah: 7,
        surahNumber: 1,
        page: 1,
        juz: 1,
        text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        tafsir: "طريق النبيين والصدّيقين والشهداء والصالحين، لا طريق اليهود المغضوب عليهم لعلمهم بالحق وتركه، ولا النصارى الضالين لعبادتهم على جهل وضلال.",
        translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray."
      }
    ]
  },
  2: {
    pageNumber: 2,
    juzNumber: 1,
    surahNames: ["البقرة"],
    ayahs: [
      {
        number: 8,
        numberInSurah: 1,
        surahNumber: 2,
        page: 2,
        juz: 1,
        text: "الم",
        tafsir: "من الحروف المقطعة في أوائل السور، فيها إعجاز وتحدٍّ للعرب أن يأتوا بمثل هذا القرآن المنظوم من جنس حروفهم."
      },
      {
        number: 9,
        numberInSurah: 2,
        surahNumber: 2,
        page: 2,
        juz: 1,
        text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
        tafsir: "هذا القرآن الكريم لا شك في صدقه وحقه وأنه من عند الله عز وجل، هو نور وإرشاد للمتقين الذين يخشون عذاب الله بامتثال أوامره واجتناب نواهيه."
      },
      {
        number: 10,
        numberInSurah: 3,
        surahNumber: 2,
        page: 2,
        juz: 1,
        text: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
        tafsir: "يصدقون بالغيب الذي لا تدركه الأبصار كالله والملائكة واليوم الآخر، ويؤدون الصلاة بأركانها وخشوعها، وينفقون في سبيل الله من زكاة وصدقة."
      },
      {
        number: 11,
        numberInSurah: 4,
        surahNumber: 2,
        page: 2,
        juz: 1,
        text: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
        tafsir: "ويؤمنون بالوحي المنزل عليك يا محمد، وبالكتب المنزلة على الرسل من قبلك كالتوراة والإنجيل، وهم بيوم القيامة والجزاء موقنون جازمون."
      },
      {
        number: 12,
        numberInSurah: 5,
        surahNumber: 2,
        page: 2,
        juz: 1,
        text: "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ",
        tafsir: "المتصفون بهذه الصفات الكريمة هم المستمسكون بالنور والبصيرة من ربهم، وهم الفائزون بكل محبوب والناجون من كل مرهوب في الدنيا والآخرة."
      }
    ]
  },
  604: {
    pageNumber: 604,
    juzNumber: 30,
    surahNames: ["الإخلاص", "الفلق", "الناس"],
    ayahs: [
      {
        number: 6222,
        numberInSurah: 1,
        surahNumber: 112,
        page: 604,
        juz: 30,
        text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        tafsir: "قل يا محمد لمن سألك عن نسب ربك: هو الله المنفرد بالألوهية والربوبية والأسماء والصفات، لا شريك له."
      },
      {
        number: 6223,
        numberInSurah: 2,
        surahNumber: 112,
        page: 604,
        juz: 30,
        text: "اللَّهُ الصَّمَدُ",
        tafsir: "السيد الذي تصمد إليه وتلجأ إليه الخلائق كلها في حوائجها ورغباتها."
      },
      {
        number: 6224,
        numberInSurah: 3,
        surahNumber: 112,
        page: 604,
        juz: 30,
        text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        tafsir: "ليس له ولد ولا والد، منزه عن صفات النقص والمشابهة."
      },
      {
        number: 6225,
        numberInSurah: 4,
        surahNumber: 112,
        page: 604,
        juz: 30,
        text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        tafsir: "ولم يكن له مماثل ولا نظير ولا شبيه في ذاته ولا في أسمائه وصفاته."
      },
      {
        number: 6226,
        numberInSurah: 1,
        surahNumber: 113,
        page: 604,
        juz: 30,
        text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        tafsir: "قل: أعتصم وأتحصن برب الصبح وفالقه بعد ظلمة الليل."
      },
      {
        number: 6227,
        numberInSurah: 2,
        surahNumber: 113,
        page: 604,
        juz: 30,
        text: "مِن شَرِّ مَا خَلَقَ",
        tafsir: "من شر جميع المخلوقات المؤذية من إنس وجن وحيوان وغير ذلك."
      },
      {
        number: 6228,
        numberInSurah: 3,
        surahNumber: 113,
        page: 604,
        juz: 30,
        text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        tafsir: "ومن شر الليل الشديد الظلمة إذا دخل وغمر الكون بما ينتشر فيه من الشرور."
      },
      {
        number: 6229,
        numberInSurah: 4,
        surahNumber: 113,
        page: 604,
        juz: 30,
        text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
        tafsir: "ومن شر السواحر والنفوس الشريرة التي تنفث في عقد الخيوط بالسحر للأذى."
      },
      {
        number: 6230,
        numberInSurah: 5,
        surahNumber: 113,
        page: 604,
        juz: 30,
        text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        tafsir: "ومن شر من يتمنى زوال النعمة عن غيره ويسعى في إلحاق الضرر به."
      },
      {
        number: 6231,
        numberInSurah: 1,
        surahNumber: 114,
        page: 604,
        juz: 30,
        text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        tafsir: "قل: ألوذ وأتحصن بخالق الناس ومدبر شؤونهم."
      },
      {
        number: 6232,
        numberInSurah: 2,
        surahNumber: 114,
        page: 604,
        juz: 30,
        text: "مَلِكِ النَّاسِ",
        tafsir: "الحاكم المتصرف في شؤونهم كلهم، غنيهم وفقيرهم."
      },
      {
        number: 6233,
        numberInSurah: 3,
        surahNumber: 114,
        page: 604,
        juz: 30,
        text: "إِلَٰهِ النَّاسِ",
        tafsir: "معبودهم الحق الذي لا إله سواه."
      },
      {
        number: 6234,
        numberInSurah: 4,
        surahNumber: 114,
        page: 604,
        juz: 30,
        text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
        tafsir: "من شر الشيطان الذي يوسوس في القلوب عند الغفلة، ويخنس ويتوارى إذا ذكر العبد ربه."
      },
      {
        number: 6235,
        numberInSurah: 5,
        surahNumber: 114,
        page: 604,
        juz: 30,
        text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
        tafsir: "الذي يبث الشبهات والشهوات ويشغل الصدور بالباطل."
      },
      {
        number: 6236,
        numberInSurah: 6,
        surahNumber: 114,
        page: 604,
        juz: 30,
        text: "مِنَ الْجِنَّةِ وَالنَّاسِ",
        tafsir: "وهؤلاء الوساوس يكونون من شياطين الإنس وشياطين الجن."
      }
    ]
  }
};
