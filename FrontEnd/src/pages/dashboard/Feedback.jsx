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
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">Your Voice Matters!</h2>
          <p className="text-gray-500 leading-relaxed">We constanty strive to improve the bootcamp experience. Share your thoughts on sessions, curriculum, or individual lectures directly with the team.</p>
          
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4 shadow-sm">
             <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <MessageSquare size={20} />
             </div>
             <div>
                <p className="font-bold text-indigo-900 text-sm">Anonymous Reporting</p>
                <p className="text-indigo-600 text-xs mt-1 font-medium leading-relaxed">Your feedback can be optionally anonymized. We prioritize transparency and safety.</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100 border border-gray-50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Evaluation Component</label>
              <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-indigo-600 transition appearance-none">
                <option>Advanced React Patterns (Apr 12)</option>
                <option>Cybersecurity Fundamentals (Apr 14)</option>
                <option>General Infrastructure</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Session Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                      rating >= s ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-gray-50 text-gray-300 hover:text-amber-200'
                    }`}
                  >
                    <Star size={24} fill={rating >= s ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Specific Observations</label>
              <textarea 
                rows="4" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:border-indigo-600 focus:bg-white transition resize-none"
                placeholder="What did you think about the course delivery?"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitted}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                isSubmitted ? 'bg-teal-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
               {isSubmitted ? (
                 <>
                   <CheckCircle2 size={20} /> Feedback Sent
                 </>
               ) : (
                 <>
                   Submit Review <Send size={20} />
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
