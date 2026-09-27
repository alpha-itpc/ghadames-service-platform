import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
  };

  return (
    <div className="bg-slate-900 text-white p-3.5 px-4 shadow-xl border-b border-slate-800 relative z-30 animate-in fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center font-black text-white shrink-0 shadow">
            خ
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-white">تثبيت تطبيق منصة خدمتي</h4>
            <p className="text-[11px] text-slate-300">ثبت التطبيق على هاتفك لاستخدامه بسهولة ودون اتصال بالإنترنت!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت الآن</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
