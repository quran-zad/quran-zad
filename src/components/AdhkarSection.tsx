import React, { useState } from 'react';
import { Sparkles, RotateCcw, CheckCircle2, ChevronRight, Volume2 } from 'lucide-react';
import { ADHKAR_LIST, TASBIH_PRESETS, DhikrItem } from '../data/adhkarData';

export const AdhkarSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'sabah' | 'masaa' | 'salah'>('sabah');
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [tasbihPresetIndex, setTasbihPresetIndex] = useState<number>(0);
  const [tasbihCount, setTasbihCount] = useState<number>(0);

  const handleIncrement = (item: DhikrItem) => {
    const current = counts[item.id] || 0;
    if (current < item.count) {
      setCounts(prev => ({ ...prev, [item.id]: current + 1 }));
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  const handleReset = (itemId: number) => {
    setCounts(prev => ({ ...prev, [itemId]: 0 }));
  };

  const handleTasbihTap = () => {
    setTasbihCount(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleTasbihReset = () => {
    setTasbihCount(0);
  };

  const currentPreset = TASBIH_PRESETS[tasbihPresetIndex];
  const filteredAdhkar = ADHKAR_LIST.filter(a => a.category === activeCategory || a.category === 'general');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-10">
      
      {/* Category Tabs */}
      <div className="flex items-center justify-center">
        <div className="p-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center gap-1 shadow-xs">
          <button
            onClick={() => setActiveCategory('sabah')}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeCategory === 'sabah'
                ? 'bg-emerald-900 text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            أذكار الصباح
          </button>
          <button
            onClick={() => setActiveCategory('masaa')}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeCategory === 'masaa'
                ? 'bg-emerald-900 text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            أذكار المساء
          </button>
          <button
            onClick={() => setActiveCategory('salah')}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeCategory === 'salah'
                ? 'bg-emerald-900 text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            أذكار بعد الصلاة
          </button>
        </div>
      </div>

      {/* Interactive Electronic Tasbih Widget */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/80 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-md mx-auto space-y-5">
          <div className="flex items-center justify-between text-xs text-amber-300/80">
            <span>المسبحة الإلكترونية المباركة</span>
            <button 
              onClick={handleTasbihReset}
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="إعادة ضبط العداد"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير</span>
            </button>
          </div>

          {/* Current Preset Phrase */}
          <div>
            <h3 className="font-reading text-2xl sm:text-3xl font-bold text-amber-200 tracking-wide">
              {currentPreset.label}
            </h3>
            <p className="text-xs text-emerald-300/70 mt-1">
              الهدف المستحب: {currentPreset.target} مرة
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {TASBIH_PRESETS.map((p, idx) => (
              <button
                key={p.label}
                onClick={() => {
                  setTasbihPresetIndex(idx);
                  setTasbihCount(0);
                }}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  tasbihPresetIndex === idx
                    ? 'bg-amber-400 text-emerald-950 font-bold'
                    : 'bg-emerald-800/50 text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Big Tap Area */}
          <div className="pt-2">
            <button
              onClick={handleTasbihTap}
              className="w-36 h-36 mx-auto rounded-full bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all select-none border-4 border-amber-300/40"
              aria-label="تسبيح"
            >
              <span className="text-3xl font-bold font-mono tabular-nums">
                {tasbihCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-900 mt-1">
                اضغط للتسبيح
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Adhkar Cards List */}
      <div className="space-y-4">
        {filteredAdhkar.map((item) => {
          const count = counts[item.id] || 0;
          const isCompleted = count >= item.count;

          return (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-700/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <p className="font-reading text-lg sm:text-xl text-stone-800 dark:text-stone-100 leading-relaxed text-right">
                    {item.text}
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 font-reading">
                    فضله: {item.reward}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleReset(item.id)}
                    className="p-2 text-stone-400 hover:text-stone-600 rounded-lg"
                    title="إعادة البدء"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleIncrement(item)}
                    disabled={isCompleted}
                    className={`min-w-[90px] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isCompleted
                        ? 'bg-emerald-800 text-white cursor-default'
                        : 'bg-emerald-900 hover:bg-emerald-800 text-amber-200 active:scale-95 shadow-xs'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>اكتمل ({item.count})</span>
                      </>
                    ) : (
                      <>
                        <span className="tabular-nums font-mono text-sm">{count}</span>
                        <span>/</span>
                        <span className="tabular-nums font-mono">{item.count}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
