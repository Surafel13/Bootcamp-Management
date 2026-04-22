import { useState, useEffect } from 'react';
import { Upload, FileText, Link as LinkIcon, Video, Download, Trash2, FolderArchive, X, CheckCircle, AlertCircle } from 'lucide-react';
import apiFetch, { UPLOADS_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ICONS = {
  pdf:   { icon: FileText,     bg: 'rgba(214,48,49,0.1)',    col: '#d63031' },
  link:  { icon: LinkIcon,     bg: 'rgba(9,132,227,0.1)',    col: '#0984e3' },
  video: { icon: Video,        bg: 'rgba(162,155,254,0.15)', col: '#7c6ef9' },
  zip:   { icon: FolderArchive,bg: 'rgba(253,203,110,0.15)', col: '#b7860a' },
  file:  { icon: FolderArchive,bg: 'rgba(253,203,110,0.15)', col: '#b7860a' },
};

export default function InstructorResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'link', url: '', description: '', file: null });

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/resources');
      const sorted = (data.data.resources || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setResources(sorted);
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
    if (!form.title || (!form.url && !form.file)) return;
    try {
      let payload;
      let headers = {};

      if (form.type !== 'link' && form.file) {
        // Use FormData for file uploads
        payload = new FormData();
        payload.append('title', form.title);
        payload.append('type', form.type);
        payload.append('description', form.description);
        payload.append('division', user?.divisions?.[0]?._id || user?.divisions?.[0]);
        payload.append('file', form.file);
        // Important: When sending FormData, the browser sets the correct Content-Type with boundary
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = JSON.stringify({
          title: form.title,
          type: 'link',
          description: form.description,
          division: user?.divisions?.[0]?._id || user?.divisions?.[0],
          externalLink: form.url
        });
      }

      await apiFetch('/resources', { 
        method: 'POST', 
        body: payload,
        // apiFetch adds application/json by default, we need to override or handle it
        headers: form.file ? {} : undefined 
      });

      showToast('Resource uploaded successfully!');
      setShowModal(false);
      setForm({ title: '', type: 'link', url: '', description: '', file: null });
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
                  {(r.externalLink || r.fileUrl) && (
                    <button 
                      className="action-btn" 
                      style={{ background: 'var(--bg-input)' }} 
                      title="Open/Download"
                      onClick={() => {
                        let url = r.externalLink || r.fileUrl;
                        if (url && !url.startsWith('http')) {
                          url = `${UPLOADS_URL}/${url}`;
                        }
                        window.open(url, '_blank');
                      }}
                    >
                      <Download size={15} />
                    </button>
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 8, background: 'var(--primary-glow)', borderRadius: 10, color: 'var(--primary)' }}>
                  <Upload size={18} />
                </div>
                <h2>Upload Resource</h2>
              </div>
              <button className="modal-close" onClick={() => { setShowModal(false); setForm({ title: '', type: 'link', url: '', description: '' }); }}><X size={15} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Title</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Introduction to React"
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, url: '' }))}>
                  <option value="link">External Link / URL</option>
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video Lesson</option>
                  <option value="zip">File / Archive (ZIP/RAR)</option>
                </select>
              </div>

              {form.type === 'link' ? (
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>URL / Link</label>
                  <div style={{ position: 'relative' }}>
                    <LinkIcon size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      className="form-input" 
                      style={{ paddingLeft: 40 }}
                      placeholder="https://example.com/resource" 
                      value={form.url} 
                      onChange={e => setForm(f => ({ ...f, url: e.target.value }))} 
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Upload {form.type.toUpperCase()}</label>
                  <div 
                    className="file-drop-zone"
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 12,
                      padding: '30px 20px',
                      textAlign: 'center',
                      background: 'var(--bg-input)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    onClick={() => document.getElementById('resource-file-input').click()}
                  >
                    <input 
                      type="file" 
                      id="resource-file-input" 
                      style={{ display: 'none' }} 
                      accept={
                        form.type === 'pdf' ? '.pdf' :
                        form.type === 'video' ? 'video/*' :
                        form.type === 'zip' ? '.zip,.rar,.7z' :
                        '*'
                      }
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) setForm(f => ({ ...f, url: file.name, file: file }));
                      }} 
                    />
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--white)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <Upload size={20} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {form.url || 'Select a file to upload'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Maximum file size: 50MB
                    </p>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Description (Optional)</label>
                <textarea className="form-input" rows={3} placeholder="Provide a brief context..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '20px 24px', background: 'var(--bg-input)', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
              <button className="btn btn-secondary" onClick={() => { setShowModal(false); setForm({ title: '', type: 'link', url: '', description: '' }); }}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreate}
                disabled={!form.title || !form.url}
                style={{ opacity: (!form.title || !form.url) ? 0.6 : 1 }}
              >
                Upload Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
