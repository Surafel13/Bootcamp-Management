import React from 'react';

const Attendance = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysInMonth = 31;
  const heatmapData = Array.from({ length: 4 }, (_, i) => 
    Array.from({ length: daysInMonth }, (_, j) => Math.random() > 0.7)
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-4">
      <div className="card w-full max-w-4xl overflow-hidden">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Engagement Tracking</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daily attendance overview for the current semester</p>
        </div>
        
        <div className="flex flex-col gap-6 overflow-x-auto scrollbar-hide pb-4">
          {/* Day Num labels */}
          <div className="flex gap-1.5 mb-1 ml-14">
             {Array.from({ length: daysInMonth }).map((_, i) => (
                <div key={i} className="w-6 text-[10px] text-center text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter">{(i + 1).toString().padStart(2, '0')}</div>
             ))}
          </div>

          <div className="flex flex-col gap-3">
            {heatmapData.map((row, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 text-[12px] text-gray-900 dark:text-white font-bold uppercase tracking-wide">{months[i]}</div>
                <div className="flex gap-1.5">
                  {row.map((active, j) => (
                    <div 
                      key={j} 
                      title={`${months[i]} ${j + 1}: ${active ? 'Attended' : 'No Session'}`}
                      className={`h-6 w-6 rounded-lg transition-all cursor-pointer hover:ring-2 hover:ring-primary/40 ${
                        active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-sm"></div>
              <span className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">No Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-primary rounded-sm shadow-sm shadow-primary/30"></div>
              <span className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Check-in</span>
            </div>
          </div>
          
          <div className="badge badge-purple px-4 py-1.5 font-bold uppercase tracking-widest">
            84% Average Attendance
          </div>
        </div>
      </div>
      
      <div className="card text-center max-w-lg">
         <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
           This visual distribution helps you monitor your physical and digital presence across academy sessions. Maintain high attendance to stay eligible for certifications.
         </p>
      </div>
    </div>
  );
};

export default Attendance;
