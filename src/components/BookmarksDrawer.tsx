import React from 'react';
import { X, Bookmark, Trash2, ArrowUpLeft, Calendar, BookOpen } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Bookmark as BookmarkType } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPage: (page: number) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToPage
}) => {
  const [bookmarks, setBookmarks] = React.useState<BookmarkType[]>([]);
  const lastRead = StorageService.getLastRead();

  React.useEffect(() => {
    if (isOpen) {
      setBookmarks(StorageService.getBookmarks());
    }
  }, [isOpen]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.removeBookmark(id);
    setBookmarks(StorageService.getBookmarks());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-emerald-800 dark:text-emerald-400 fill-current" />
            <h3 className="font-bold text-stone-900 dark:text-stone-100 font-reading text-lg">
              العلامات المرجعية وفواصل القراءة
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Last Read Card */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>آخر موضع قراءة مسجل:</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100 font-reading text-base">
                {lastRead.title}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                الصفحة رقم {lastRead.pageNumber}
              </p>
            </div>
            <button
              onClick={() => {
                onNavigateToPage(lastRead.pageNumber);
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>متابعة</span>
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <Bookmark className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700 stroke-1" />
              <p className="text-sm font-reading text-stone-600 dark:text-stone-400">
                لا توجد علامات مرجعية محفوظة بعد
              </p>
              <p className="text-xs text-stone-400">
                انقر على أيقونة الإشارة المرجعية أثناء قراءة أي صفحة في المصحف لتثبيتها هنا.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => {
                  onNavigateToPage(bm.pageNumber);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-700/60 bg-stone-50/60 dark:bg-stone-850 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 font-reading text-sm group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                    سورة {bm.surahName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                    <span>الصفحة {bm.pageNumber}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(bm.timestamp).toLocaleDateString('ar-EG')}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(bm.id, e)}
                    className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="حذف العلامة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
