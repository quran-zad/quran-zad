import React, { useState } from 'react';
import { 
  X, FileText, Download, FileCode, Check, Loader2, 
  Sparkles, BookOpen, Layers, Printer, ShieldCheck, Heart
} from 'lucide-react';
import { JUZ_NAMES, SURAHS_LIST } from '../data/quranMeta';
import { QuranExportService } from '../services/quranExportService';

interface QuranDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialJuz?: number;
}

export const QuranDownloadModal: React.FC<QuranDownloadModalProps> = ({
  isOpen,
  onClose,
  initialJuz = 1
}) => {
  const [selectedJuz, setSelectedJuz] = useState<number>(initialJuz);
  const [format, setFormat] = useState<'word' | 'pdf' | 'text'>('word');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentJuzMeta = JUZ_NAMES[selectedJuz - 1] || JUZ_NAMES[0];
  const nextJuzPage = JUZ_NAMES[selectedJuz]?.page || 605;
  const pageRange = `صفحة ${currentJuzMeta.page} إلى ${nextJuzPage - 1}`;

  const handleDownload = async () => {
    setIsExporting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (format === 'word') {
        await QuranExportService.exportJuzToWord(selectedJuz);
        setSuccessMessage(`تم تحميل الجزء ${selectedJuz} كملف Word بنجاح!`);
      } else if (format === 'pdf') {
        await QuranExportService.exportJuzToPDF(selectedJuz);
        setSuccessMessage(`تم فتح مستند PDF للجزء ${selectedJuz}، يمكنك حفظه أو طباعته فوراً.`);
      } else {
        await QuranExportService.exportJuzToText(selectedJuz);
        setSuccessMessage(`تم تحميل الجزء ${selectedJuz} كملف نصي بنجاح!`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء إعداد الملف، يرجى المحاولة مجدداً.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-reading text-emerald-950 dark:text-amber-200">
                تحميل أي جزء من القرآن الكريم
              </h3>
              <p className="text-xs text-stone-500">
                بصيغة ملف وورد (Word .doc) أو مستند (PDF) جاهز للطباعة والقراءة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedication Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-600/30 text-xs text-amber-950 dark:text-amber-200 flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            الملفات المصدرة تتضمن إهداء صدقة جارية عن روح المرحوم <strong>سليم بركات</strong>، والمرحوم <strong>محمود سليم بركات</strong> رحمهما الله.
          </span>
        </div>

        {/* Step 1: Select Juz */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
            1. اختر الجزء المراد تحميله (1 إلى 30):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <select
                value={selectedJuz}
                onChange={(e) => setSelectedJuz(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold text-sm focus:outline-none focus:border-emerald-600"
              >
                {JUZ_NAMES.map((j) => (
                  <option key={j.juz} value={j.juz}>
                    الجزء {j.juz}: {j.name} (ص {j.page})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedJuz(1)}
                className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium"
              >
                الجزء الأول
              </button>
              <button
                type="button"
                onClick={() => setSelectedJuz(29)}
                className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium"
              >
                جزء تبارك (29)
              </button>
              <button
                type="button"
                onClick={() => setSelectedJuz(30)}
                className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium"
              >
                جزء عمّ (30)
              </button>
            </div>
          </div>

          <div className="text-xs text-stone-500 pt-1">
            نطاق الجزء: <strong className="text-emerald-800 dark:text-emerald-400">{pageRange}</strong> · يبدأ من سورة {currentJuzMeta.startSurah}
          </div>
        </div>

        {/* Step 2: Select Format */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
            2. اختر صيغة التحميل:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Word Button */}
            <button
              type="button"
              onClick={() => setFormat('word')}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                format === 'word'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-sm">ملف وورد</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-bold">
                  .DOC / Word
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                مستند وورد منسق بالخط العثماني، قابل للتعديل والطباعة في Microsoft Word.
              </p>
            </button>

            {/* PDF Button */}
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                format === 'pdf'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-sm">ملف PDF</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-mono font-bold">
                  .PDF
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                مستند جاهز للطباعة بجودة فائقة وإطارات إسلامية وزخارف الآيات.
              </p>
            </button>

            {/* Plain Text Button */}
            <button
              type="button"
              onClick={() => setFormat('text')}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                format === 'text'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-sm">نص عادي</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-mono font-bold">
                  .TXT
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                ملف نصي نقي بالرسم العثماني للأبحاث والقراءة على أي جهاز.
              </p>
            </button>

          </div>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 border border-emerald-300 dark:border-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-900 dark:text-red-200 text-xs flex items-center gap-2 border border-red-300 dark:border-red-800">
            <X className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors"
          >
            إغلاق
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري إعداد الملف وتصديره...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  تحميل الجزء {selectedJuz} ({format === 'word' ? 'Word' : format === 'pdf' ? 'PDF' : 'Text'})
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
