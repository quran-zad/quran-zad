import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Heart, Share2, Copy, Check, Volume2, VolumeX, BookOpen, 
  Eye, Languages, Loader2, Play, Pause, Square, RotateCcw, 
  Headphones, Sparkles, Gauge
} from 'lucide-react';
import { Ayah } from '../types';
import { StorageService } from '../services/storageService';
import { QuranApiService } from '../services/quranApi';
import { TtsService } from '../services/ttsService';
import { SURAHS_LIST, TRANSLATIONS_LIST } from '../data/quranMeta';

interface TafsirModalProps {
  ayah: Ayah | null;
  onClose: () => void;
  reciterId: string;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({ ayah, onClose, reciterId }) => {
  if (!ayah) return null;

  const surahMeta = SURAHS_LIST.find(s => s.id === ayah.surahNumber);
  const surahName = surahMeta ? surahMeta.name : `سورة ${ayah.surahNumber}`;
  const likeKey = `ayah_${ayah.surahNumber}_${ayah.numberInSurah}`;
  const viewKey = `ayah_view_${ayah.surahNumber}_${ayah.numberInSurah}`;

  const [activeTab, setActiveTab] = useState<'tafsir' | 'translation'>('tafsir');
  const [selectedLangId, setSelectedLangId] = useState<string>('en.sahih');
  const [translationText, setTranslationText] = useState<string>(ayah.translation || '');
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);

  const [isLiked, setIsLiked] = useState<boolean>(() => StorageService.isLiked(likeKey));
  const [likesCount, setLikesCount] = useState<number>(() => 
    StorageService.getLikesCount(likeKey, 'ayah', ayah.number)
  );
  const [viewCount] = useState<number>(() => 
    StorageService.recordView(viewKey, 'ayah', ayah.number)
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingSingle, setIsPlayingSingle] = useState<boolean>(false);
  const singleAudioRef = useRef<HTMLAudioElement | null>(null);

  // TTS State
  const [isTtsSpeaking, setIsTtsSpeaking] = useState<boolean>(false);
  const [isTtsPaused, setIsTtsPaused] = useState<boolean>(false);
  const [ttsRate, setTtsRate] = useState<number>(1.0);
  const [ttsCharIndex, setTtsCharIndex] = useState<number | null>(null);
  const isTtsSupported = TtsService.isSupported();

  // Stop TTS and audio when modal unmounts or ayah changes
  useEffect(() => {
    return () => {
      TtsService.stop();
      if (singleAudioRef.current) {
        singleAudioRef.current.pause();
      }
    };
  }, [ayah.number]);

  // Stop TTS if tab changes
  useEffect(() => {
    handleStopTts();
  }, [activeTab]);

  // Fetch translation when selected language changes
  useEffect(() => {
    if (activeTab === 'translation') {
      if (selectedLangId === 'en.sahih' && ayah.translation) {
        setTranslationText(ayah.translation);
        return;
      }
      setLoadingTranslation(true);
      QuranApiService.getAyahTranslation(ayah.surahNumber, ayah.numberInSurah, selectedLangId)
        .then(text => {
          setTranslationText(text || 'جاري توفير الترجمة المعتمدة...');
        })
        .finally(() => {
          setLoadingTranslation(false);
        });
    }
  }, [activeTab, selectedLangId, ayah]);

  const handleToggleLike = () => {
    const res = StorageService.toggleLike(likeKey, 'ayah', ayah.number);
    setIsLiked(res.isLiked);
    setLikesCount(res.count);
  };

  const handleCopy = () => {
    let shareText = '';
    if (activeTab === 'tafsir') {
      shareText = `﴿ ${ayah.text} ﴾ [سورة ${surahName}: ${ayah.numberInSurah}]\nالتفسير الميسر:\n${ayah.tafsir || ''}\nمن تطبيق نور القرآن الكريم`;
    } else {
      const langObj = TRANSLATIONS_LIST.find(l => l.id === selectedLangId);
      shareText = `﴿ ${ayah.text} ﴾ [Surah ${surahMeta?.englishName || surahName}: ${ayah.numberInSurah}]\nTranslation (${langObj?.name}):\n${translationText}\nNur Al-Quran App`;
    }
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const langObj = TRANSLATIONS_LIST.find(l => l.id === selectedLangId);
    const content = activeTab === 'tafsir' 
      ? `التفسير الميسر:\n${ayah.tafsir || ''}`
      : `الترجمة (${langObj?.name}):\n${translationText}`;

    const shareData = {
      title: `آية من سورة ${surahName} [${ayah.numberInSurah}]`,
      text: `﴿ ${ayah.text} ﴾\n\n${content}\n\n- [سورة ${surahName}: الآية ${ayah.numberInSurah} - الصفحة ${ayah.page}]`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleStopTts = () => {
    TtsService.stop();
    setIsTtsSpeaking(false);
    setIsTtsPaused(false);
    setTtsCharIndex(null);
  };

  const handlePlayTafsirTtsWithRate = (rate: number) => {
    if (!ayah.tafsir) return;

    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
      setIsPlayingSingle(false);
    }

    setIsTtsSpeaking(true);
    setIsTtsPaused(false);
    setTtsCharIndex(0);

    const fullNarration = `تفسير الآية ${ayah.numberInSurah} من سورة ${surahName}. ${ayah.tafsir}`;

    TtsService.speak(fullNarration, {
      rate: rate,
      lang: 'ar-SA',
      onStart: () => {
        setIsTtsSpeaking(true);
        setIsTtsPaused(false);
      },
      onEnd: () => {
        setIsTtsSpeaking(false);
        setIsTtsPaused(false);
        setTtsCharIndex(null);
      },
      onError: (err) => {
        console.warn('TTS narration error:', err);
        setIsTtsSpeaking(false);
        setIsTtsPaused(false);
        setTtsCharIndex(null);
      },
      onPause: () => {
        setIsTtsPaused(true);
      },
      onResume: () => {
        setIsTtsPaused(false);
      },
      onBoundary: (charIndex) => {
        setTtsCharIndex(charIndex);
      }
    });
  };

  const handlePlayTafsirTts = () => {
    if (!ayah.tafsir) return;

    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
      setIsPlayingSingle(false);
    }

    if (isTtsSpeaking && isTtsPaused) {
      TtsService.resume();
      setIsTtsPaused(false);
      return;
    }

    if (isTtsSpeaking && !isTtsPaused) {
      TtsService.pause();
      setIsTtsPaused(true);
      return;
    }

    handlePlayTafsirTtsWithRate(ttsRate);
  };

  const handleChangeTtsRate = (newRate: number) => {
    setTtsRate(newRate);
    if (isTtsSpeaking) {
      handleStopTts();
      setTimeout(() => {
        handlePlayTafsirTtsWithRate(newRate);
      }, 50);
    }
  };

  const handlePlayAyah = () => {
    handleStopTts();
    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
    }
    const url = QuranApiService.getAyahAudioUrl(ayah.surahNumber, ayah.numberInSurah, reciterId);
    const audio = new Audio(url);
    singleAudioRef.current = audio;
    setIsPlayingSingle(true);
    audio.play().catch(() => setIsPlayingSingle(false));
    audio.onended = () => {
      setIsPlayingSingle(false);
      singleAudioRef.current = null;
    };
    audio.onerror = () => {
      setIsPlayingSingle(false);
      singleAudioRef.current = null;
    };
  };

  const handleCloseModal = () => {
    handleStopTts();
    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
    }
    onClose();
  };

  const currentLang = TRANSLATIONS_LIST.find(l => l.id === selectedLangId) || TRANSLATIONS_LIST[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/10 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
              {activeTab === 'tafsir' ? <BookOpen className="w-4 h-4" /> : <Languages className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base font-reading">
                {activeTab === 'tafsir' ? 'تفسير' : 'ترجمة معاني'} الآية {ayah.numberInSurah} من سورة {surahName}
              </h3>
              <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                <span>الجزء {ayah.juz}</span>
                <span>·</span>
                <span>الصفحة {ayah.page}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-stone-400" />
                  <span className="tabular-nums">{viewCount.toLocaleString('ar-EG')} مشاهدة</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (التفسير الميسر / ترجمة المعاني) */}
        <div className="px-6 pt-3 pb-0 border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tafsir')}
              className={`flex items-center gap-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'tafsir'
                  ? 'border-emerald-800 text-emerald-900 dark:text-emerald-400 dark:border-emerald-500'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>التفسير الميسر</span>
            </button>
            <button
              onClick={() => setActiveTab('translation')}
              className={`flex items-center gap-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'translation'
                  ? 'border-emerald-800 text-emerald-900 dark:text-emerald-400 dark:border-emerald-500'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>ترجمة معاني الآية</span>
            </button>
          </div>

          {/* Language Selector when Translation Tab is Active */}
          {activeTab === 'translation' && (
            <div className="py-1">
              <select
                value={selectedLangId}
                onChange={(e) => setSelectedLangId(e.target.value)}
                className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-600"
              >
                {TRANSLATIONS_LIST.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Ayah Calligraphy Card */}
          <div className="p-6 rounded-xl bg-amber-50/50 dark:bg-stone-950/60 border border-amber-200/60 dark:border-stone-800 text-center relative overflow-hidden">
            <p className="font-quran text-2xl md:text-3xl text-emerald-950 dark:text-amber-100 leading-loose">
              {ayah.text}
              <span className="inline-block mx-2 text-amber-700 dark:text-amber-400 font-reading text-xl">
                ﴿{ayah.numberInSurah}﴾
              </span>
            </p>
          </div>

          {/* Tafsir Tab View */}
          {activeTab === 'tafsir' && (
            <div className="space-y-4">
              {/* Tafsir Header with Audio TTS Badge */}
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 font-reading">
                    التفسير الميسر المعتمد
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>تفسير صوتي ذكي (TTS)</span>
                  </span>
                </div>
                <span className="text-xs text-stone-500">نخبة من علماء التفسير</span>
              </div>

              {/* Dedicated Audio TTS Player Card for Tafsir */}
              <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                isTtsSpeaking && !isTtsPaused
                  ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-stone-900 border-emerald-500/40 shadow-sm'
                  : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200/70 dark:border-stone-800'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  
                  {/* Left: Playback controls & state description */}
                  <div className="flex items-center gap-3">
                    {/* Main Play / Pause Button */}
                    <button
                      onClick={handlePlayTafsirTts}
                      disabled={!ayah.tafsir}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-xs ${
                        isTtsSpeaking && !isTtsPaused
                          ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                          : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                      }`}
                      title={isTtsSpeaking && !isTtsPaused ? 'إيقاف مؤقت' : 'استماع للتفسير الصوتي'}
                    >
                      {isTtsSpeaking && !isTtsPaused ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current mr-0.5" />
                      )}
                    </button>

                    {/* Stop Button */}
                    {isTtsSpeaking && (
                      <button
                        onClick={handleStopTts}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 transition-colors"
                        title="إيقاف التفسير الصوتي"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    {/* Sound Waves & Status Text */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 font-reading">
                          {isTtsSpeaking && !isTtsPaused
                            ? 'جاري قراءة التفسير الصوتي للآية...'
                            : isTtsPaused
                            ? 'التفسير الصوتي متوقف مؤقتاً'
                            : 'الاستماع إلى التفسير الصوتي (TTS)'}
                        </span>

                        {/* Animated Equalizer Waveform when speaking */}
                        {isTtsSpeaking && !isTtsPaused && (
                          <div className="flex items-end gap-0.5 h-4 px-1">
                            <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 bg-teal-600 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 bg-amber-500 rounded-full animate-bounce h-3" style={{ animationDelay: '300ms' }} />
                            <span className="w-1 bg-emerald-700 rounded-full animate-bounce h-4" style={{ animationDelay: '75ms' }} />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {isTtsSpeaking && !isTtsPaused
                          ? 'استمع بإنصات لتوضيح معاني ألفاظ الآية وهدايتها'
                          : 'تحويل نص التفسير الميسر إلى كلام صوتي نقي ومسموع'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Speed Adjustment Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <span className="text-[10px] text-stone-400 flex items-center gap-1 ml-1">
                      <Gauge className="w-3 h-3" />
                      <span>السرعة:</span>
                    </span>
                    {[0.8, 1.0, 1.25].map(rate => (
                      <button
                        key={rate}
                        onClick={() => handleChangeTtsRate(rate)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                          ttsRate === rate
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 border border-stone-200 dark:border-stone-600'
                        }`}
                      >
                        {rate === 0.8 ? '0.8x هادئ' : rate === 1.0 ? '1.0x عادي' : '1.25x سريع'}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* The Tafsir Text Display */}
              <div className={`p-4 rounded-xl transition-colors border ${
                isTtsSpeaking && !isTtsPaused
                  ? 'border-emerald-400/80 dark:border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900/50'
              }`}>
                <p className="text-stone-800 dark:text-stone-200 text-base sm:text-lg leading-relaxed font-reading text-justify">
                  {ayah.tafsir || 'جاري تحميل التفسير المعتمد لهذه الآية الكريمة...'}
                </p>
              </div>
            </div>
          )}

          {/* Translation Tab View */}
          {activeTab === 'translation' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 font-reading flex items-center gap-1.5">
                  <span>ترجمة المعاني:</span>
                  <span className="text-stone-600 dark:text-stone-300 font-normal">{currentLang.name}</span>
                </h4>
                <span className="text-xs text-stone-500 font-sans">
                  المترجم: {currentLang.translator}
                </span>
              </div>

              {loadingTranslation ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-500">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
                  <span className="text-xs">جاري تحميل الترجمة المعتمدة...</span>
                </div>
              ) : (
                <div 
                  className={`text-base leading-relaxed p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 font-sans ${
                    currentLang.direction === 'rtl' ? 'text-right' : 'text-left font-serif'
                  }`}
                  dir={currentLang.direction}
                >
                  <p className="text-base sm:text-lg">
                    {translationText || 'جاري تحميل نص الترجمة...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 flex items-center justify-between flex-wrap gap-3">
          {/* Audio play actions: Ayah Recitation + Tafsir TTS Audio */}
          <div className="flex items-center gap-2">
            {/* Audio recitation for single ayah */}
            <button
              onClick={handlePlayAyah}
              disabled={isPlayingSingle}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-900 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-200/80 transition-colors"
              title="الاستماع لتلاوة الآية بصوت القارئ المختار"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingSingle ? 'animate-bounce text-amber-500' : ''}`} />
              <span>{isPlayingSingle ? 'جاري الاستماع للآية...' : 'استماع للآية'}</span>
            </button>

            {/* Audio Tafsir TTS Button in footer */}
            {activeTab === 'tafsir' && (
              <button
                onClick={handlePlayTafsirTts}
                disabled={!ayah.tafsir}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isTtsSpeaking && !isTtsPaused
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-emerald-800/90 hover:bg-emerald-800 text-white'
                }`}
                title="الاستماع للتفسير الصوتي للآية باستخدام تقنية تحويل النص إلى كلام (TTS)"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>
                  {isTtsSpeaking && !isTtsPaused 
                    ? 'إيقاف التفسير مؤقتاً' 
                    : isTtsPaused 
                    ? 'متابعة التفسير الصوتي' 
                    : 'استماع للتفسير (TTS)'}
                </span>
              </button>
            )}
          </div>

          {/* Interactive like, share, copy */}
          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                isLiked
                  ? 'border-red-300 bg-red-50 text-red-600 dark:bg-red-950/30 dark:border-red-800'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title="إعجاب بالآية"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
              <span className="tabular-nums">{likesCount.toLocaleString('ar-EG')}</span>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="نسخ الآية وتفسيرها أو ترجمتها"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              title="مشاركة الآية"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
