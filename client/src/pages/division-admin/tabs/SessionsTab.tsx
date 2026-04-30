import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ChevronRight, MapPin, Monitor, Clock, Search, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../features/ui/uiSlice';
import SessionDetailPanel from './SessionDetailPanel';
import type { Bootcamp, Session } from '../../../features/bootcamps/types';
import { useCreateSession, useDeleteSession, useSessions, useUpdateSession } from '../../../features/bootcamps/bootcampsApi';
import { useSearchUsers } from '../../../features/users/usersApi';
import useDebounce from '../../../app/hooks/useDebounce';

const STATUS_STYLE: Record<string, string> = {
  upcoming: 'bg-primary/10 text-primary',
  active: 'bg-success/10 text-success',
  completed: 'bg-text-muted/10 text-text-muted',
  cancelled: 'bg-danger/10 text-danger',
};

const EMPTY_FORM = {
  title: '', description: '', location: '',
  onlineLink: '', startTime: '', endTime: '', instructor: '',
};

interface Props { bootcampId: string; bootcamp: Bootcamp; }

export default function SessionsTab({ bootcampId, bootcamp }: Props) {
  const dispatch = useDispatch();
  const { data: sessions = [], isLoading } = useSessions(bootcampId);
  const createSession = useCreateSession(bootcampId);
  const updateSession = useUpdateSession(bootcampId);
  const deleteSession = useDeleteSession(bootcampId);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<{ _id: string; name: string; email: string } | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading: isSearching } = useSearchUsers({
    q: debouncedSearchTerm,
    status: 'active',
    limit: 10
  }, {
    enabled: debouncedSearchTerm.length >= 2
  });

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const openAdd = () => { 
    setForm(EMPTY_FORM);
    setSelectedInstructor(null);
    setSearchTerm('');
    setEditTarget(null); 
    setShowModal(true); 
  };
  
  const openEdit = (s: Session) => {
    setForm({
      title: s.title,
      description: s.description ?? '',
      location: s.location ?? '',
      onlineLink: s.onlineLink ?? '',
      startTime: s.startTime.slice(0, 16),
      endTime: s.endTime.slice(0, 16),
      instructor: s.instructor?._id ?? '',
    });
    
    if (s.instructor) {
      setSelectedInstructor({
        _id: s.instructor._id,
        name: s.instructor.name,
        email: s.instructor.email
      });
      setSearchTerm(s.instructor.name);
    } else {
      setSelectedInstructor(null);
      setSearchTerm('');
    }
    
    setEditTarget(s._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await deleteSession.mutateAsync(id);
      toast('Session deleted.');
    } catch { toast('Delete failed.', 'error'); }
  };

  const handleSave = async () => {
    // Validate all required fields
    if (!form.title || !form.description || !form.startTime || !form.endTime) {
      toast('Please fill in all required fields (title, description, start time, end time)', 'error');
      return;
    }

    try {
      // Prepare the payload with all required fields
      const payload = {
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        bootcamp: bootcampId,
        division: bootcamp.division._id,
        instructor: selectedInstructor?._id || form.instructor || undefined,
        location: form.location || undefined,
        onlineLink: form.onlineLink || undefined,
      };

      if (editTarget) {
        await updateSession.mutateAsync({ id: editTarget, ...payload });
        toast('Session updated.');
      } else {
        await createSession.mutateAsync(payload);
        toast('Session created.');
      }
      setShowModal(false);

      // Reset form
      setForm(EMPTY_FORM);
      setSelectedInstructor(null);
      setSearchTerm('');
    } catch (err: any) {
      console.error('Session save failed:', err.response?.data);

      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;

        if (Array.isArray(errors)) {
          errors.forEach((error: any) => {
            const field = error.path?.join('.') || 'unknown';
            const message = error.message;
            dispatch(addToast({ message: `${field}: ${message}`, type: 'error' }));
          });
        } else if (typeof errors === 'object') {
          Object.entries(errors).forEach(([field, message]) => {
            dispatch(addToast({ message: `${field}: ${message}`, type: 'error' }));
          });
        }
      } else {
        toast(err.response?.data?.message ?? 'Save failed.', 'error');
      }
    }
  };

  // Show session detail panel if a session is selected
  if (activeSession) {
    return (
      <SessionDetailPanel
        session={activeSession}
        bootcamp={bootcamp}
        onBack={() => setActiveSession(null)}
      />
    );
  }

  if (isLoading) return <div className="py-16 text-center text-text-muted text-sm">Loading sessions…</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={15} /> Add Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
          <Clock size={36} className="opacity-30" />
          <p className="text-sm">No sessions yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map(s => (
            <div
              key={s._id}
              className="card hover:border-primary/40 transition-all cursor-pointer group"
              onClick={() => setActiveSession(s)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-text-primary">{s.title}</span>
                    <span className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_STYLE[s.status]}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-text-muted">
                    <span>🗓 {new Date(s.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {s.location && <span className="flex items-center gap-1"><MapPin size={11} />{s.location}</span>}
                    {s.onlineLink && <span className="flex items-center gap-1"><Monitor size={11} />Online</span>}
                    {s.instructor && <span>👤 {s.instructor.name}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="action-btn action-btn-edit" onClick={e => { e.stopPropagation(); openEdit(s); }} title="Edit"><Pencil size={13} /></button>
                  <button className="action-btn action-btn-delete" onClick={e => { e.stopPropagation(); handleDelete(s._id); }} title="Delete"><Trash2 size={13} /></button>
                  <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Session' : 'New Session'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Title - Required */}
              <div className="form-group">
                <label>Session Title <span className="text-danger">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Intro to React"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Description - Required */}
              <div className="form-group">
                <label>Description <span className="text-danger">*</span></label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Detailed description of the session..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Time - Required */}
                <div className="form-group">
                  <label>Start Time <span className="text-danger">*</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  />
                </div>

                {/* End Time - Required */}
                <div className="form-group">
                  <label>End Time <span className="text-danger">*</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Location - Optional */}
                <div className="form-group">
                  <label>Location</label>
                  <input
                    className="form-input"
                    placeholder="Room or building"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  />
                </div>

                {/* Online Link - Optional */}
                <div className="form-group">
                  <label>Online Link</label>
                  <input
                    className="form-input"
                    placeholder="https://meet.google.com/…"
                    value={form.onlineLink}
                    onChange={e => setForm(f => ({ ...f, onlineLink: e.target.value }))}
                  />
                </div>
              </div>

              {/* Instructor - Searchable */}
              <div className="form-group">
                <label>Instructor <span className="text-text-muted font-normal">(optional override)</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                      if (selectedInstructor) setSelectedInstructor(null);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  
                  {/* Search Results Dropdown */}
                  {isDropdownOpen && debouncedSearchTerm.length >= 2 && searchResults && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-text-secondary">
                          <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="ml-2 text-sm">Searching...</span>
                        </div>
                      ) : searchResults.total > 0 ? (
                        <>
                          <div className="px-3 py-2 bg-bg-hover border-b border-border">
                            <span className="text-xs text-text-muted">{searchResults.total} user(s) found</span>
                          </div>
                          {searchResults.users.map((user: any) => (
                            <button
                              key={user._id}
                              className="w-full p-3 text-left hover:bg-bg-hover transition-colors border-b border-border last:border-b-0"
                              onClick={() => {
                                setSelectedInstructor({
                                  _id: user._id,
                                  name: user.name,
                                  email: user.email
                                });
                                setSearchTerm(user.name);
                                setForm(f => ({ ...f, instructor: user._id }));
                                setIsDropdownOpen(false);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <User size={14} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-text-primary truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-text-muted truncate">
                                    {user.email}
                                  </p>
                                  <p className="text-xs text-primary mt-0.5 capitalize">
                                    {user.role}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="p-4 text-center text-text-secondary text-sm">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected Instructor Display */}
                {selectedInstructor && (
                  <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{selectedInstructor.name}</p>
                          <p className="text-xs text-text-muted">{selectedInstructor.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInstructor(null);
                          setSearchTerm('');
                          setForm(f => ({ ...f, instructor: '' }));
                        }}
                        className="p-1 hover:bg-danger/10 rounded transition-colors"
                      >
                        <X size={14} className="text-danger" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions mt-5">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={createSession.isPending || updateSession.isPending}
              >
                {createSession.isPending || updateSession.isPending ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}