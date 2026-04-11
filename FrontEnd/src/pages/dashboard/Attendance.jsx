import React from 'react';

const Attendance = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysInMonth = 31;
  const heatmapData = Array.from({ length: 4 }, (_, i) => 
    Array.from({ length: daysInMonth }, (_, j) => Math.random() > 0.7)
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full max-w-4xl overflow-hidden">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8 text-center">Engagement Heatmap</h3>
        
        <div className="flex flex-col gap-4 overflow-x-auto scrollbar-hide pb-4">
          {/* Day Num labels */}
          <div className="flex gap-1.5 mb-1 ml-12">
             {Array.from({ length: daysInMonth }).map((_, i) => (
                <div key={i} className="w-5 text-[8px] text-center text-gray-300 font-black uppercase tracking-tighter">{(i + 1).toString().padStart(2, '0')}</div>
             ))}
          </div>

          <div className="flex flex-col gap-2">
            {heatmapData.map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 text-[10px] text-gray-900 font-black uppercase tracking-widest">{months[i]}</div>
                <div className="flex gap-1.5">
                  {row.map((active, j) => (
                    <div 
                      key={j} 
                      title={`${months[i]} ${j + 1}: ${active ? 'Attended' : 'No Session'}`}
                      className={`h-5 w-5 rounded-[4px] border transition-all cursor-pointer hover:ring-2 hover:ring-indigo-300 ${
                        active ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-100' : 'bg-gray-50 border-gray-100 shadow-inner'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 pt-6 border-t border-gray-50">
           <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-50 border border-gray-100 rounded-[3px]"></div>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">No Activity</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-indigo-600 rounded-[3px]"></div>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Check-in</span>
           </div>
           <div className="text-[9px] text-gray-300 font-black italic uppercase tracking-[0.2em]">
             Interactive Grid Assessment
           </div>
        </div>
      </div>
      
      <div className="p-4 bg-indigo-50/30 rounded-lg border border-indigo-100/30 text-center max-w-sm">
         <p className="text-[10px] text-indigo-900/40 font-bold leading-relaxed uppercase tracking-widest">
           Visual distribution of your physical and digital presence across academy sessions.
         </p>
      </div>
    </div>
  );
};

export default Attendance;
