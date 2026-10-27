import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  RotateCcw, Sparkles, User, ChevronUp, ChevronDown 
} from 'lucide-react';
import { RECITERS_LIST } from '../data/quranMeta';
import { QuranApiService } from '../services/quranApi';

interface AudioPlayerBarProps {
  currentPage: number;
  surahName?: string;
  onPageChange: (newPage: number) => void;
  reciterId: string;
  onReciterChange: (newReciterId: string) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  autoPlayNext: boolean;
  onToggleAutoPlayNext: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentPage,
  surahName = 'سورة من القرآن الكريم',
  onPageChange,
  reciterId,
  onReciterChange,
  playbackRate,
  onPlaybackRateChange,
  autoPlayNext,
  onToggleAutoPlayNext
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const audioUrl = QuranApiService.getPageAudioUrl(currentPage, reciterId);

  // Sync audio source when page or reciter changes
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    setIsLoading(true);
    setHasError(false);
    audio.src = audioUrl;
    audio.playbackRate = playbackRate;
    audio.load();

    const handleCanPlay = () => {
      setIsLoading(false);
      setDuration(audio.duration || 0);
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (autoPlayNext && currentPage < 604) {
        onPageChange(currentPage + 1);
        setTimeout(() => {
          setIsPlaying(true);
        }, 300);
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      console.warn('Audio playback error for page:', currentPage);
      // Try fallback url
      const fallback = QuranApiService.getPageAudioFallbackUrl(currentPage);
      if (audio.src !== fallback) {
        audio.src = fallback;
        audio.load();
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentPage, reciterId, audioUrl]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((e) => {
          console.warn('Play interrupted', e);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleRateSelect = (rate: number) => {
    onPlaybackRateChange(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentReciter = RECITERS_LIST.find(r => r.id === reciterId) || RECITERS_LIST[0];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-t border-emerald-800/40 shadow-2xl transition-all">
      <audio ref={audioRef} preload="metadata" />

      {/* Scrubber Progress Bar along top edge */}
      <div className="relative group w-full h-1.5 bg-stone-800 hover:h-2 transition-all cursor-pointer">
        <div 
          className="absolute top-0 right-0 h-full bg-gradient-to-l from-amber-400 to-emerald-500 rounded-l transition-all"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="تقديم وتأخير التلاوة"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Section A: Current Playing Info */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-amber-200 font-reading">
                    تلاوة الصفحة {currentPage}
                  </span>
                  <span className="text-stone-400 text-xs hidden sm:inline">· {surahName}</span>
                </div>
                <div className="text-xs text-stone-300 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3 h-3 text-emerald-400" />
                  <span>{currentReciter.name}</span>
                  <span className="text-stone-400">({currentReciter.style})</span>
                </div>
              </div>
            </div>

            {/* Mobile expand button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden text-xs text-stone-400 p-1 rounded hover:bg-stone-800"
              aria-label="المزيد من خيارات التلاوة"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Section B: Core Playback Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* Previous Page (RTL: right is previous) */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-2 text-stone-300 hover:text-white disabled:opacity-30 disabled:hover:text-stone-300 transition-colors"
              title="الصفحة السابقة"
              aria-label="الصفحة السابقة"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={togglePlay}
              disabled={isLoading && !isPlaying}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-amber-100 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none"
              title={isPlaying ? 'إيقاف مؤقت' : 'استماع للصفحة كاملة بصوت مرتل'}
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'استماع للصفحة كاملة بصوت مرتل'}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current mr-0.5" />
              )}
            </button>

            {/* Next Page */}
            <button
              onClick={() => onPageChange(Math.min(604, currentPage + 1))}
              disabled={currentPage >= 604}
              className="p-2 text-stone-300 hover:text-white disabled:opacity-30 disabled:hover:text-stone-300 transition-colors"
              title="الصفحة التالية"
              aria-label="الصفحة التالية"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Time Indicator */}
            <div className="text-xs font-mono text-stone-300 tabular-nums min-w-[85px] text-center">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Section C: Reciter & Speed Controls */}
          <div className={`${isExpanded ? 'flex' : 'hidden md:flex'} items-center justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-stone-800`}>
            {/* Reciter Selector */}
            <div className="relative">
              <select
                value={reciterId}
                onChange={(e) => onReciterChange(e.target.value)}
                className="bg-stone-800 border border-stone-700 text-xs text-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                title="اختيار القارئ"
              >
                {RECITERS_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed Multiplier */}
            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-xs">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleRateSelect(speed)}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    playbackRate === speed
                      ? 'bg-emerald-800 text-amber-200 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Auto Play Next Page */}
            <button
              onClick={onToggleAutoPlayNext}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                autoPlayNext
                  ? 'border-emerald-600 bg-emerald-950/60 text-emerald-300'
                  : 'border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
              title="متابعة تلاوة الصفحات تلقائياً عند انتهاء الصفحة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">تلاوة متصلة</span>
            </button>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              aria-label="كتم الصوت"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
