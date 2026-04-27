import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ChevronRight, Calendar, Clock, User, Search } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveDivisionId } from '../../features/auth/authSlice';
import { addToast } from '../../features/ui/uiSlice';
import { useBootcamps, useCreateBootcamp, useDeleteBootcamp, useUpdateBootcamp } from '../../features/bootcamps/bootcampsApi';
import type { Bootcamp } from '../../features/bootcamps/types';
import { useSearchUsers, useUserInfo } from '../../features/users/usersApi';
import useDebounce from '../../app/hooks/useDebounce';

const STATUS_STYLE: Record<string, string> = {
  upcoming: 'bg-primary/10 text-primary',
  ongoing: 'bg-success/10 text-success',
  completed: 'bg-text-muted/10 text-text-muted',
};

const EMPTY_FORM = {
  name: '', description: '', duration: '',
  startDate: '', endDate: '', enrollmentDeadline: '',
  instructor: '',
};

interface Props { onOpenBootcamp: (id: string) => void; }

export default function BootcampsPage({ onOpenBootcamp }: Props) {
  const { data: user } = useUserInfo();
  const dispatch = useDispatch();
  const divisionId = useSelector(selectActiveDivisionId);

  const { data: bootcamps = [], isLoading } = useBootcamps(divisionId);
  const createBootcamp = useCreateBootcamp();
  const updateBootcamp = useUpdateBootcamp();
  const deleteBootcamp = useDeleteBootcamp();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<{ _id: string; name: string; email: string } | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  const openEdit = (b: Bootcamp) => {
    setForm({
      name: b.name,
      description: b.description,
      duration: b.duration,
      startDate: b.startDate.slice(0, 10),
      endDate: b.endDate.slice(0, 10),
      enrollmentDeadline: b.enrollmentDeadline.slice(0, 10),
      instructor: b.instructor?._id ?? '',
    });
    
    if (b.instructor) {
      setSelectedInstructor({
        _id: b.instructor._id,
        name: b.instructor.name,
        email: b.instructor.email
      });
      setSearchTerm(b.instructor.name);
    } else {
      setSelectedInstructor(null);
      setSearchTerm('');
    }
    
    setEditTarget(b._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this bootcamp and all its sessions?')) return;
    try {
      await deleteBootcamp.mutateAsync(id);
      toast('Bootcamp deleted.');
    } catch { toast('Delete failed.', 'error'); }
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    
    // Use selected instructor ID if available, otherwise use form.instructor
    const instructorId = selectedInstructor?._id || form.instructor;
    
    const payload = { 
      ...form, 
      division: divisionId, 
      creator: user?._id,
      instructor: instructorId || undefined
    };
    
    try {
      if (editTarget) {
        await updateBootcamp.mutateAsync({ id: editTarget, ...payload });
        toast('Bootcamp updated.');
      } else {
        await createBootcamp.mutateAsync(payload);
        toast('Bootcamp created.');
      }
      setShowModal(false);
      // Reset form
      setSelectedInstructor(null);
      setSearchTerm('');
    } catch (err: any) {
      if (err.response?.data.errors) {
        for (const error of err.response?.data.errors) {
          dispatch(addToast({ message: `${error.field}: ${error.message}`, type: 'error' }));
        }
      } else {
        toast(err.response?.data?.message ?? 'Save failed.', 'error');
      }
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-60 text-text-muted text-sm">
      Loading bootcamps…
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-text-primary">Division Bootcamps</h2>
          <p className="text-sm text-text-secondary mt-0.5">{bootcamps.length} bootcamp{bootcamps.length !== 1 ? 's' : ''} in your division</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> New Bootcamp
        </button>
      </div>

      {/* Bootcamp cards */}
      {bootcamps.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-text-muted gap-3">
          <Calendar size={40} className="opacity-30" />
          <p className="text-sm font-medium">No bootcamps yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bootcamps.map(b => (
            <div
              key={b._id}
              className="card hover:border-primary/40 transition-all duration-200 cursor-pointer group"
              onClick={() => onOpenBootcamp(b._id)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-text-primary truncate">{b.name}</h3>
                    <span className={`text-[0.7rem] font-bold px-2.5 py-0.5 rounded-full capitalize shrink-0 ${STATUS_STYLE[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">{b.description}</p>
                  <div className="flex items-center gap-5 text-xs text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} /> {b.duration}
                    </span>
                    {b.instructor && (
                      <span className="flex items-center gap-1.5">
                        <User size={12} /> {b.instructor.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className="action-btn action-btn-edit"
                    onClick={e => { e.stopPropagation(); openEdit(b); }}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="action-btn action-btn-delete"
                    onClick={e => { e.stopPropagation(); handleDelete(b._id); }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Bootcamp' : 'New Bootcamp'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Bootcamp Name</label>
                <input className="form-input" placeholder="e.g. Web Dev Bootcamp 2025" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={3} placeholder="What will students learn?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'none' }} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Duration</label>
                  <input className="form-input" placeholder="e.g. 8 weeks" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
                
                {/* Searchable Lead Instructor Field */}
                <div className="form-group">
                  <label>Lead Instructor</label>
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
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              
              <div className="form-group">
                <label>Enrollment Deadline</label>
                <input type="date" className="form-input" value={form.enrollmentDeadline} onChange={e => setForm(f => ({ ...f, enrollmentDeadline: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions mt-5">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={createBootcamp.isPending || updateBootcamp.isPending}>
                {createBootcamp.isPending || updateBootcamp.isPending ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Bootcamp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}