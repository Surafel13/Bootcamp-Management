import { useState, useEffect } from 'react';
import { Upload, FileText, Link as LinkIcon, Video, Download, Trash2, FolderArchive, X, CheckCircle, AlertCircle } from 'lucide-react';
import apiFetch from '../../utils/api';

const ICONS = {
  pdf:   { icon: FileText,     bg: 'rgba(214,48,49,0.1)',    col: '#d63031' },
  link:  { icon: LinkIcon,     bg: 'rgba(9,132,227,0.1)',    col: '#0984e3' },
  video: { icon: Video,        bg: 'rgba(162,155,254,0.15)', col: '#7c6ef9' },
  file:  { icon: FolderArchive,bg: 'rgba(253,203,110,0.15)', col: '#b7860a' },
};

export default function InstructorResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'link', url: '', description: '' });

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/resources');
      setResources(data.data.resources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async () => {
    if (!form.title || !form.url) return;
    try {
      await apiFetch('/resources', { method: 'POST', body: JSON.stringify(form) });
      showToast('Resource uploaded successfully!');
      setShowModal(false);
      fetchResources();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await apiFetch(`/resources/${id}`, { method: 'DELETE' });
      setResources(p => p.filter(r => r._id !== id));
      showToast('Resource deleted.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <div className="toast-icon">{toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}</div>
            <div className="toast-body"><h4>{toast.type === 'success' ? 'Success' : 'Error'}</h4><p>{toast.msg}</p></div>
          </div>
        </div>
      )}

      <div className="card-header" style={{ padding: '0 0 20px 0', borderBottom: 'none' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Resource Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Upload size={16} /> Upload Resource
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading resources...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {resources.map(r => {
            const typeKey = r.type?.toLowerCase() || 'file';
            const s = ICONS[typeKey] || ICONS.file;
            const Icon = s.icon;
            return (
              <div key={r._id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: s.bg, color: s.col, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{r.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{r.type}</span>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                    <span>{r.division?.name || 'All Divisions'}</span>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                    <span>{r.downloadCount || 0} downloads</span>
                  </div>
                </div>
                <div className="table-actions">
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="action-btn" style={{ background: 'var(--bg-input)' }} title="Open/Download">
                      <Download size={15} />
                    </a>
                  )}
                  <button className="action-btn action-btn-delete" onClick={() => del(r._id)} title="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
          {resources.length === 0 && (
            <div className="empty-state card">
              <div className="empty-icon"><FolderArchive size={36} /></div>
              <h3>No resources yet</h3>
              <p>Upload a resource to share it with your students.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Resource</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="link">External Link</option>
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video</option>
                  <option value="file">File / Archive</option>
                </select>
              </div>
              <div className="form-group">
                <label>URL / Link</label>
                <input className="form-input" placeholder="https://" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Upload Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
