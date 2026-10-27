import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed banner recently
    const dismissed = localStorage.getItem('nur_quran_pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 86400000 * 3) {
      // Dismissed in past 3 days
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not standalone, show after 3 seconds
    if (isIOSDevice && !isStandalone) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    try {
      localStorage.setItem('nur_quran_pwa_dismissed', Date.now().toString());
    } catch {}
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-gradient-to-r from-emerald-950 to-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-amber-500/40 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-800 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-100">تثبيت تطبيق نور القرآن</h4>
            <p className="text-xs text-stone-300 mt-0.5 leading-snug">
              تصفح القرآن والأذكار بدون إنترنت وتثبيت سريع على شاشتك
            </p>
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showIOSGuide ? (
        <div className="mt-3 pt-3 border-t border-emerald-800/60 text-xs text-stone-200 bg-black/20 p-2.5 rounded-xl">
          <p className="font-bold text-amber-300 mb-1">طريقة التثبيت على أجهزة iPhone / iPad:</p>
          <ol className="list-decimal list-inside space-y-1 text-[11px]">
            <li>اضغط على زر المشاركة <Share className="w-3 h-3 inline mx-0.5 text-blue-400" /> في أسفل متصفح Safari.</li>
            <li>اختر من القائمة <span className="font-bold text-white">«إضافة إلى الصفحة الرئيسية»</span> <PlusSquare className="w-3 h-3 inline mx-0.5 text-stone-300" />.</li>
            <li>اضغط على «إضافة» في الزاوية العلوية.</li>
          </ol>
        </div>
      ) : (
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت التطبيق الآن مجاناً</span>
          </button>
          <button
            onClick={handleDismiss}
            className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
          >
            لاحقاً
          </button>
        </div>
      )}
    </div>
  );
};
