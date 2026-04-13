import { useState } from 'react';
import { Plus, Pencil, Trash2, CalendarDays, Code, FileText } from 'lucide-react';

const TASKS = [
  { id:1, title: 'Build Portfolio Website', deadline: 'Apr 20, 2026', tag: 'Web Development',       type: 'File',   subs: 28, total: 32 },
  { id:2, title: 'React Component Library', deadline: 'Apr 15, 2026', tag: 'React Advanced',        type: 'GitHub', subs: 24, total: 24 },
  { id:3, title: 'API Integration Exercise',deadline: 'Apr 10, 2026', tag: 'JavaScript Fundamentals',type: 'Both',   subs: 28, total: 28 },
  { id:4, title: 'Docker Setup Lab',        deadline: 'Apr 25, 2026', tag: 'DevOps Intro',          type: 'GitHub', subs: 5,  total: 30 },
];

export default function InstructorTasksPage() {
  const [tasks, setTasks] = useState(TASKS);

  const del = id => setTasks(p => p.filter(t => t.id !== id));

  return (
    <div>
      <div className="card-header" style={{ padding: '0 0 20px 0', borderBottom: 'none' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Task Management</h2>
        <button className="btn btn-primary">
          <Plus size={16} /> Create Task
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tasks.map(t => {
          const perc = Math.round((t.subs / t.total) * 100);
          return (
            <div key={t.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {t.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CalendarDays size={13} /> Deadline: {t.deadline}
                    </div>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                    <span>{t.tag}</span>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {t.type === 'File' && <FileText size={13} />}
                      {t.type === 'GitHub' && <Code size={13} />}
                      {t.type === 'Both' && <><FileText size={13}/><Code size={13}/></>}
                      {t.type}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {t.subs}/{t.total}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Submissions</div>
                  </div>
                  <div className="table-actions">
                    <button className="action-btn action-btn-edit" title="Edit"><Pencil size={14}/></button>
                    <button className="action-btn action-btn-delete" onClick={() => del(t.id)} title="Delete"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${perc}%`, height: '100%', background: perc === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: 34, textAlign: 'right' }}>
                  {perc}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
