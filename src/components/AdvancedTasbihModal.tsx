import React, { useState, useEffect, useRef } from 'react';
import { 
  X, RotateCcw, Volume2, VolumeX, Sparkles, 
  Heart, Plus, Check, Award, Flame, Settings2
} from 'lucide-react';

interface TasbihDhikr {
  id: string;
  text: string;
  virtue: string;
  defaultTarget: number;
}

const PRESET_ADHKAR: TasbihDhikr[] = [
  { id: 'subhanallah', text: 'سُبْحَانَ اللَّهِ', virtue: 'تغرس لك نخلة في الجنة وتُحط الخطايا', defaultTarget: 33 },
  { id: 'alhamdulillah', text: 'الْحَمْدُ لِلَّهِ', virtue: 'تملأ الميزان بالخير والبركة والرضا', defaultTarget: 33 },
  { id: 'allahuakbar', text: 'اللَّهُ أَكْبَرُ', virtue: 'أحب الكلام إلى الله تعالى وخير مما طلعت عليه الشمس', defaultTarget: 33 },
  { id: 'la_ilaha_illallah', text: 'لَا إِلَٰهَ إِلَّا اللَّهُ', virtue: 'أفضل الذكر وكلمة التوحيد ومفتاح الجنة', defaultTarget: 100 },
  { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', virtue: 'يفتح أبواب الرزق ويدفع الهموم ويزيل الكرب', defaultTarget: 100 },
  { id: 'salawat', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', virtue: 'من صلى عليّ صلاة صلى الله عليه بها عشراً', defaultTarget: 100 },
  { id: 'hawqalah', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', virtue: 'كنز عظيم من كنوز الجنة ودواء لتسعة وتسعين داء', defaultTarget: 33 },
  { id: 'subhan_wa_bihamdihi', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ', virtue: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن', defaultTarget: 100 },
  { id: 'hasbiyallah', text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', virtue: 'أمان الخائفين وتفريج الكروب والشدائد', defaultTarget: 100 },
  { id: 'yunus_duaa', text: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', virtue: 'دعوة ذي النون لم يدعُ بها مسلم في شيء إلا استجاب الله له', defaultTarget: 40 }
];

interface AdvancedTasbihModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedTasbihModal: React.FC<AdvancedTasbihModalProps> = ({ isOpen, onClose }) => {
  const [selectedDhikr, setSelectedDhikr] = useState<TasbihDhikr>(PRESET_ADHKAR[0]);
  const [count, setCount] = useState<number>(0);
  const [laps, setLaps] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [customDhikrText, setCustomDhikrText] = useState<string>('');
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);

  // Lifetime counts from storage
  const [totalLifetimeCount, setTotalLifetimeCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('nur_quran_tasbih_lifetime');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play pleasant mechanical click / chime using Web Audio API
  const playClickSound = (isTargetReached: boolean = false) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isTargetReached) {
        // High harmonic celebratory chime
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Subdued wooden / stone rosary bead click
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {}
  };

  const handleIncrement = () => {
    const nextCount = count + 1;
    const nextLifetime = totalLifetimeCount + 1;
    setTotalLifetimeCount(nextLifetime);
    try {
      localStorage.setItem('nur_quran_tasbih_lifetime', nextLifetime.toString());
    } catch {}

    // Check if target reached
    if (target > 0 && nextCount >= target) {
      setCount(0);
      setLaps(laps + 1);
      setShowCelebration(true);
      playClickSound(true);
      if (vibrateEnabled && navigator.vibrate) {
        try { navigator.vibrate([60, 50, 90]); } catch {}
      }
      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      setCount(nextCount);
      playClickSound(false);
      if (vibrateEnabled && navigator.vibrate) {
        try { navigator.vibrate(30); } catch {}
      }
    }
  };

  const handleReset = () => {
    setCount(0);
    setLaps(0);
  };

  const selectDhikr = (d: TasbihDhikr) => {
    setSelectedDhikr(d);
    setTarget(d.defaultTarget);
    setCount(0);
    setLaps(0);
  };

  const handleAddCustomDhikr = () => {
    if (!customDhikrText.trim()) return;
    const custom: TasbihDhikr = {
      id: `custom_${Date.now()}`,
      text: customDhikrText.trim(),
      virtue: 'ذكر مخصص من اختيارك المبارك',
      defaultTarget: 100
    };
    setSelectedDhikr(custom);
    setTarget(100);
    setCount(0);
    setLaps(0);
    setIsAddingCustom(false);
    setCustomDhikrText('');
  };

  if (!isOpen) return null;

  const progressPercent = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-xl text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-lg text-amber-100">المسبحة الإلكترونية الذكية</h3>
              <p className="text-[11px] text-emerald-300">
                إجمالي تسبيحاتك المسجلة: {totalLifetimeCount.toLocaleString('ar-EG')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl transition-colors ${
                soundEnabled ? 'text-amber-300 hover:bg-emerald-800' : 'text-stone-500 hover:bg-emerald-800'
              }`}
              title={soundEnabled ? 'كتم صوت النقرات' : 'تشغيل صوت النقرات'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-300 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Active Dhikr Display */}
          <div className="text-center py-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 mb-1 leading-snug">
              {selectedDhikr.text}
            </h2>
            <p className="text-xs text-amber-800 font-medium">
              {selectedDhikr.virtue}
            </p>
          </div>

          {/* Big Interactive Tasbih Button */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={handleIncrement}
              className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 focus:outline-none select-none ${
                showCelebration 
                  ? 'bg-amber-400 text-emerald-950 scale-105 ring-8 ring-amber-300' 
                  : 'bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950 text-white hover:from-emerald-700 hover:to-emerald-900 border-4 border-amber-400/50 shadow-emerald-950/40'
              }`}
            >
              {/* Progress Ring Stroke SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-2">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeDasharray="280"
                  strokeDashoffset={280 - (280 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-150"
                />
              </svg>

              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight mb-1 text-amber-100">
                {count}
              </span>
              <span className="text-xs text-emerald-200/90 font-medium">
                الهدف: {target > 0 ? target : 'مفتوح'}
              </span>
              {laps > 0 && (
                <span className="text-[11px] font-bold text-amber-300 mt-1 bg-black/30 px-2 py-0.5 rounded-full">
                  دورة مكتملة: {laps}
                </span>
              )}
            </button>

            {/* Tap prompt */}
            <span className="text-xs text-stone-500 mt-3">
              اضغط في أي مكان على الدائرة للتسبيح
            </span>
          </div>

          {/* Quick Target Selectors & Reset */}
          <div className="flex items-center justify-between border-t border-b border-stone-100 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 ml-1">تحديد الدورة:</span>
              {[33, 100, 1000].map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    target === t
                      ? 'bg-emerald-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => setTarget(0)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  target === 0 ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                مفتوح
              </button>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير العداد</span>
            </button>
          </div>

          {/* Adhkar Presets List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-stone-700 uppercase">
                اختر الذكر المبارك:
              </h4>
              <button
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="text-xs text-emerald-800 hover:text-emerald-900 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة ذكر مخصص</span>
              </button>
            </div>

            {isAddingCustom && (
              <div className="mb-3 p-3 bg-stone-50 rounded-xl border border-stone-200 flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب الصيغة أو الذكر المراد تسبيحه..."
                  value={customDhikrText}
                  onChange={(e) => setCustomDhikrText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
                <button
                  onClick={handleAddCustomDhikr}
                  className="px-3 py-1.5 bg-emerald-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-800"
                >
                  حفظ
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {PRESET_ADHKAR.map((item) => {
                const isSelected = selectedDhikr.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectDhikr(item)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-700 text-emerald-950 font-bold shadow-sm'
                        : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-xs font-serif leading-relaxed mb-1">{item.text}</span>
                    <span className="text-[10px] text-stone-500 font-normal">{item.virtue}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500">
            «أَلا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ» — صدقة جارية مباركة
          </p>
        </div>
      </div>
    </div>
  );
};
