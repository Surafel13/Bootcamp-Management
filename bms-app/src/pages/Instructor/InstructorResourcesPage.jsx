import { useState } from 'react';
import { Upload, FileText, Link as LinkIcon, Video, Download, Trash2, FolderArchive } from 'lucide-react';

const RESOURCES = [
  { id:1, title:'React Documentation.pdf', type:'pdf',   session:'React Advanced',         date:'Apr 8, 2026', size:'2.4 MB', count:24 },
  { id:2, title:'JavaScript Best Practices',type:'link',  session:'Web Development',        date:'Apr 5, 2026', link:'https://example.com', count:18 },
  { id:3, title:'Project Setup Video.mp4', type:'video', session:'JavaScript Fundamentals',date:'Apr 3, 2026', size:'45 MB',  count:32 },
  { id:4, title:'UI/UX Assets Bundle.zip', type:'zip',   session:'Capstone Project',       date:'Mar 28, 2026',size:'112 MB', count:45 },
];

const ICONS = {
  pdf:   { icon: FileText,    bg: 'rgba(214,48,49,0.1)',    col: '#d63031' },
  link:  { icon: LinkIcon,    bg: 'rgba(9,132,227,0.1)',    col: '#0984e3' },
  video: { icon: Video,       bg: 'rgba(162,155,254,0.15)', col: '#7c6ef9' },
  zip:   { icon: FolderArchive,bg: 'rgba(253,203,110,0.15)',col: '#b7860a' },
};

export default function InstructorResourcesPage() {
  const [resources, setResources] = useState(RESOURCES);

  const del = id => setResources(p => p.filter(r => r.id !== id));

  return (
    <div>
      <div className="card-header" style={{ padding: '0 0 20px 0', borderBottom: 'none' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Resource Management</h2>
        <button className="btn btn-primary">
          <Upload size={16} /> Upload Resource
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {resources.map(r => {
          const s = ICONS[r.type];
          const Icon = s.icon;
          return (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: s.bg, color: s.col, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} />
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {r.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>{r.session}</span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                  <span>{r.date}</span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                  {r.type === 'link' ? <span>{r.link}</span> : <span>{r.size}</span>}
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                  <span>{r.count} downloads</span>
                </div>
              </div>

              <div className="table-actions">
                <button className="action-btn" style={{ background: 'var(--bg-input)' }} title="Download / Open">
                  <Download size={15} />
                </button>
                <button className="action-btn action-btn-delete" onClick={() => del(r.id)} title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
        {resources.length === 0 && (
          <div className="empty-state card">
            <div className="empty-icon"><FolderArchive size={36} /></div>
            <h3>No resources found</h3>
            <p>Upload a resource to share it with your students.</p>
          </div>
        )}
      </div>
    </div>
  );
}
