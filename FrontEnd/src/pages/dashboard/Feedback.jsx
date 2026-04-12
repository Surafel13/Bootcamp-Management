import React, { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2 } from 'lucide-react';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">Your Voice Matters!</h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium text-lg">Help us refine the academy experience. Your insights directly influence the curriculum evolution and resource allocation.</p>
          </div>
          
          <div className="card flex items-start gap-5">
             <div className="h-12 w-12 bg-purple-100 dark:bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <MessageSquare size={24} />
             </div>
             <div>
                <p className="font-bold text-gray-900 dark:text-white text-base">Anonymous Transmission</p>
                <p className="text-primary font-semibold text-sm mt-1.5 leading-relaxed">Identity masking is active by default. We prioritize institutional transparency and individual security.</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="card text-center p-6">
                <span className="block text-3xl font-bold text-primary mb-1">2.4k</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Reports Lodged</span>
             </div>
             <div className="card text-center p-6">
                <span className="block text-3xl font-bold text-success mb-1">98%</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Action Rate</span>
             </div>
          </div>
        </div>

        <div className="card p-10">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] px-1">Evaluation Target</label>
              <select className="w-full p-4 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer">
                <option>Advanced React Patterns (Apr 12)</option>
                <option>Cybersecurity Fundamentals (Apr 14)</option>
                <option>Institutional Infrastructure</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] px-1">Performance Index</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      rating >= s ? 'bg-amber-400 text-white shadow-xl shadow-amber-400/20 active:scale-90' : 'bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-slate-700 hover:border-amber-200'
                    }`}
                  >
                    <Star size={28} fill={rating >= s ? 'currentColor' : 'none'} strokeWidth={2.5} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] px-1">Detailed Observations</label>
              <textarea 
                rows="5" 
                className="w-full p-5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="Share your experience or suggest improvements..."
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitted}
              className={`w-full py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 ${
                isSubmitted 
                  ? 'bg-success text-white shadow-lg shadow-success/20 scale-95' 
                  : 'bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20 active:scale-95'
              }`}
            >
               {isSubmitted ? (
                 <>
                   <CheckCircle2 size={24} /> Transmission Successful
                 </>
               ) : (
                 <>
                   Submit Review <Send size={24} strokeWidth={2.5} />
                 </>
               )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
