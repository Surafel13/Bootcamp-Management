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
    <div className="max-w-5xl mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl font-bold text-text-primary mb-6 tracking-tight">Check-in Terminal</h2>
            <p className="text-text-secondary leading-relaxed text-lg font-medium">Position your session QR code within the viewfinder. Connectivity to the primary bootcamp node is required for validation.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-surface-border shadow-soft">
              <div className="h-12 w-12 bg-success/10 rounded-2xl flex items-center justify-center text-success shadow-lg shadow-success/10">
                <Wifi size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-text-primary leading-none">Academy-Mesh-01</p>
                <p className="text-xs text-success mt-1.5 uppercase font-bold tracking-widest">Network Securely Hooked</p>
              </div>
              <ShieldCheck className="ml-auto text-success" size={24} />
            </div>

            <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-surface-border shadow-soft">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                <Lock size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-text-primary leading-none">End-to-End Encryption</p>
                <p className="text-xs text-primary mt-1.5 uppercase font-bold tracking-widest">Identity Tunnel Active</p>
              </div>
              <ShieldCheck className="ml-auto text-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-primary/10 border border-surface-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative aspect-square bg-[#0F172A] rounded-[36px] flex items-center justify-center overflow-hidden shadow-2xl">
               {status === 'scanning' && (
                 <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="h-1 w-full bg-primary absolute animate-scan shadow-[0_0_20px_rgba(124,108,242,0.8)]"></div>
                 </div>
               )}

               {status === 'idle' && (
                 <div className="text-center space-y-6 p-10">
                    <div className="h-28 w-28 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 group-hover:bg-white/10 transition-colors">
                      <QrCode size={56} className="text-primary opacity-60" />
                    </div>
                    <button 
                      onClick={simulateScan}
                      className="btn-primary px-10 py-3.5 shadow-xl shadow-primary/30"
                    >
                      Initialize Scanner
                    </button>
                 </div>
               )}

               {status === 'scanning' && (
                 <div className="text-center space-y-4">
                    <Zap size={56} className="text-primary animate-pulse mx-auto" />
                    <p className="text-white text-sm font-bold uppercase tracking-[0.4em] animate-pulse">Analyzing QR Node...</p>
                 </div>
               )}

               {status === 'success' && (
                 <div className="text-center space-y-6 p-10 animate-in zoom-in-95 duration-700">
                    <div className="h-28 w-28 bg-success rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-success/40 border-4 border-white/20">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-2xl mb-1">Access Granted</h4>
                      <p className="text-white/60 text-sm uppercase tracking-widest font-semibold font-mono">ID Trace Identified</p>
                    </div>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="flex items-center gap-2 mx-auto text-primary-light text-sm font-bold hover:text-white transition-colors"
                    >
                      <RefreshCw size={18} /> Reset Terminal
                    </button>
                 </div>
               )}
               
               {/* Finder borders */}
               <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-primary/40 rounded-tl-2xl"></div>
               <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-primary/40 rounded-tr-2xl"></div>
               <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-primary/40 rounded-bl-2xl"></div>
               <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-primary/40 rounded-br-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 32px; }
          50% { top: calc(100% - 36px); }
          100% { top: 32px; }
        }
        .animate-scan {
          animation: scan 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
