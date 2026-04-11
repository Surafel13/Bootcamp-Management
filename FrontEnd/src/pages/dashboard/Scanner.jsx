import React, { useState } from 'react';
import { QrCode, ShieldCheck, Wifi, Lock, Zap, RefreshCw } from 'lucide-react';

const Scanner = () => {
  const [status, setStatus] = useState('idle'); // idle, scanning, success

  const simulateScan = () => {
    setStatus('scanning');
    setTimeout(() => {
      setStatus('success');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Daily Attendance</h2>
            <p className="text-gray-500 leading-relaxed">Please scan the session QR code using this interface to mark your attendance. Ensure you are connected to the bootcamp network.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-2xl border border-teal-100">
              <div className="h-10 w-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
                <Wifi size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-teal-900 leading-none">Bootcamp-Secure-WiFi</p>
                <p className="text-[11px] text-teal-600 mt-1 uppercase font-bold tracking-wider">Network Connected</p>
              </div>
              <ShieldCheck className="ml-auto text-teal-600" size={20} />
            </div>

            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-900 leading-none">End-to-End Encryption</p>
                <p className="text-[11px] text-indigo-600 mt-1 uppercase font-bold tracking-wider">Secure Scan Active</p>
              </div>
              <ShieldCheck className="ml-auto text-indigo-600" size={20} />
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100 border border-gray-50 relative overflow-hidden group">
            {/* Corner Accents */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative aspect-square bg-gray-900 rounded-[32px] flex items-center justify-center overflow-hidden">
               {/* Scanning Line */}
               {status === 'scanning' && (
                 <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="h-1 w-full bg-indigo-400 absolute animate-scan shadow-[0_0_15px_rgba(129,140,248,0.8)]"></div>
                 </div>
               )}

               {status === 'idle' && (
                 <div className="text-center space-y-4 p-8">
                    <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <QrCode size={48} className="text-indigo-400 opacity-50" />
                    </div>
                    <button 
                      onClick={simulateScan}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-900/40"
                    >
                      Initialize Scanner
                    </button>
                 </div>
               )}

               {status === 'scanning' && (
                 <div className="text-center space-y-4">
                    <Zap size={48} className="text-indigo-400 animate-pulse mx-auto" />
                    <p className="text-white text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Scanning System...</p>
                 </div>
               )}

               {status === 'success' && (
                 <div className="text-center space-y-4 p-8 animate-in zoom-in-95 duration-500">
                    <div className="h-24 w-24 bg-teal-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-teal-500/40">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold text-lg">Attendance Verified</p>
                      <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Thank you, Alex!</p>
                    </div>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="flex items-center gap-2 mx-auto text-indigo-400 text-xs font-bold hover:text-indigo-300 transition"
                    >
                      <RefreshCw size={14} /> Reset Scanner
                    </button>
                 </div>
               )}
               
               {/* Viewfinder borders */}
               <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-white/20 rounded-tl-xl"></div>
               <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-white/20 rounded-tr-xl"></div>
               <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-white/20 rounded-bl-xl"></div>
               <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-white/20 rounded-br-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 90%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
