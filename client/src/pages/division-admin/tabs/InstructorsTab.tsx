import { useState } from 'react';
import { Plus, X, Shield, Search, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../features/ui/uiSlice';
import { useAssignInstructor, useInstructorAssignments } from '../../../features/bootcamps/bootcampsApi';
import { useSearchUsers , useUserInfo } from '../../../features/users/usersApi';
import useDebounce from '../../../app/hooks/useDebounce';

const ALL_PERMISSIONS = [
  { key: 'manage_attendance', label: 'Manage Attendance' },
  { key: 'upload_resources', label: 'Upload Resources' },
  { key: 'create_tasks', label: 'Create Tasks' },
  { key: 'grade_submissions', label: 'Grade Submissions' },
  { key: 'view_feedback', label: 'View Feedback' },
] as const;

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-success/10 text-success',
  expired: 'bg-text-muted/10 text-text-muted',
  revoked: 'bg-danger/10 text-danger',
};

interface Props { bootcampId: string; }

export default function InstructorsTab({ bootcampId }: Props) {
  const userInfo = useUserInfo();
  const dispatch = useDispatch();
  const { data: assignments = [], isLoading } = useInstructorAssignments(bootcampId);
  const assignInstructor = useAssignInstructor(bootcampId);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<{ _id: string; name: string; email: string } | null>(null);

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    permissions: [] as string[],
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search for users (instructors only or all users)
  const { data: searchResults, isLoading: isSearching } = useSearchUsers({
    q: debouncedSearchTerm,
    status: 'active',
    limit: 10
  }, {
    enabled: debouncedSearchTerm.length >= 2
  });


  const togglePermission = (key: string) =>
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }));

  const handleAssign = async () => {
    if (!selectedInstructor) {
      dispatch(addToast({ message: 'Please select an instructor.', type: 'error' }));
      return;
    }
    if (!form.startDate || !form.endDate) {
      dispatch(addToast({ message: 'Please select start and end dates.', type: 'error' }));
      return;
    }
    if (form.permissions.length === 0) {
      dispatch(addToast({ message: 'Please select at least one permission.', type: 'error' }));
      return;
    }

    try {
      await assignInstructor.mutateAsync({
        instructor: selectedInstructor._id,
        startDate: form.startDate,
        assignedBy: userInfo.data._id,
        endDate: form.endDate,
        permissions: form.permissions,
      });
      dispatch(addToast({ message: 'Instructor assigned.', type: 'success' }));
      resetForm();
      setShowModal(false);
    } catch (err: any) {
      console.error('Assignment failed:', err.response?.data.errors);
      if (err.response?.data?.errors) {
        for (const field in err.response.data.errors) {
          const message = err.response.data.errors[field];
          dispatch(addToast({ message: `${field}: ${message}`, type: 'error' }));
        }
      } else {
        dispatch(addToast({ message: 'Assignment failed.', type: 'error' }));
      }
    }
  };

  const resetForm = () => {
    setSelectedInstructor(null);
    setSearchTerm('');
    setForm({
      startDate: '',
      endDate: '',
      permissions: [],
    });
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };

  if (isLoading) return <div className="py-12 text-center text-text-muted text-sm">Loading instructors…</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{assignments.length} instructor assignment{assignments.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Assign Instructor
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
          <Shield size={36} className="opacity-30" />
          <p className="text-sm">No instructors assigned yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map(a => (
            <div key={a._id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-text-primary">{a.instructor.name}</span>
                  <span className="text-xs text-text-muted ml-2">{a.instructor.email}</span>
                </div>
                <span className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[a.status]}`}>
                  {a.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.permissions.map(p => (
                  <span key={p} className="text-[0.68rem] font-semibold bg-primary/8 text-primary px-2 py-0.5 rounded-full capitalize">
                    {p.replace('_', ' ')}
                  </span>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-2">
                {new Date(a.startDate).toLocaleDateString()} → {new Date(a.endDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleCloseModal()}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 className="text-xl font-bold text-text-primary">Assign Instructor</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Searchable Instructor Field */}
              <div className="form-group">
                <label>
                  Search Instructor <span className="text-danger">*</span>
                </label>
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
                      if (!selectedInstructor) setSelectedInstructor(null);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />

                  {/* Search Results Dropdown */}
                  {isDropdownOpen && debouncedSearchTerm.length >= 2 && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-text-secondary">
                          <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="ml-2 text-sm">Searching...</span>
                        </div>
                      ) : searchResults && searchResults.total > 0 ? (
                        searchResults.users.map((user: any) => (
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
                        ))
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
                  <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{selectedInstructor.name}</p>
                          <p className="text-xs text-text-muted">{selectedInstructor.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInstructor(null);
                          setSearchTerm('');
                        }}
                        className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <X size={16} className="text-danger" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>
                    End Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="form-grou">
                <label className="mb-2 block">
                  Permissions <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ALL_PERMISSIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-bg-hover transition-colors">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(key)}
                        onChange={() => togglePermission(key)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                      <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAssign}
                disabled={assignInstructor.isPending}
              >
                {assignInstructor.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  'Assign Instructor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}