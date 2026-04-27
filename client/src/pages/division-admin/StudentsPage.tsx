import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useAllUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../features/users/usersApi';
import { addToast } from '../../features/ui/uiSlice';
import { selectActiveDivisionId } from '../../features/auth/authSlice';

const STATUSES = ['active', 'suspended', 'graduated'];

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  active: { bg: 'bg-success/10', color: 'text-success' },
  suspended: { bg: 'bg-danger/10', color: 'text-danger' },
  graduated: { bg: 'bg-info/10', color: 'text-info' },
};

interface BadgeProps {
  text: string;
  colorMap: Record<string, { bg: string; color: string }>;
}

function Badge({ text, colorMap }: BadgeProps) {
  const style = colorMap[text] ?? { bg: 'bg-bg-input', color: 'text-text-secondary' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${style.bg} ${style.color}`}>
      {text}
    </span>
  );
}

const initials = (name?: string) =>
  name?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') ?? '?';

const EMPTY_FORM = { name: '', email: '', status: 'active' };

interface StudentForm {
  name: string;
  email: string;
  status: string;
}

export default function StudentsPage() {
  const dispatch = useDispatch();
  const divisionId = useSelector(selectActiveDivisionId);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM);

  const { data: usersData, isLoading } = useAllUsers({
    role: 'student',
    division: divisionId || undefined
  });
  const students = usersData?.users || [];

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const filtered = useMemo(() =>
    students.filter((s: any) =>
      (statusFilter === 'All' || s.status === statusFilter) &&
      (s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()))
    ), [students, search, statusFilter]);

  const toast = (msg: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message: msg, type }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (student: any) => {
    setForm({
      name: student.name,
      email: student.email,
      status: student.status,
    });
    setEditTarget(student._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this student?')) return;
    try {
      await deleteUser.mutateAsync(id);
      toast('Student removed successfully.');
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Delete failed.', 'error');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    if (!divisionId) {
      toast('Division not found', 'error');
      return;
    }

    try {
      if (editTarget) {
        await updateUser.mutateAsync({
          id: editTarget,
          name: form.name,
          email: form.email,
          status: form.status,
        });
        toast('Student updated successfully.');
      } else {
        await createUser.mutateAsync({
          name: form.name,
          email: form.email,
          role: 'student',
          status: form.status,
          password: 'defaultPassword123', // Backend should handle password generation
          memberships: [{
            division: divisionId,
            role: 'student'
          }]
        });
        toast('Student added successfully.');
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Save failed.', 'error');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">Student Management</h2>
          <div className="flex items-center gap-2.5">
            <select
              className="form-input text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <div className="flex items-center gap-2 bg-bg-input border border-border rounded-radius-sm px-3 py-2 transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <Search size={15} className="text-text-muted" />
              <input
                placeholder="Search students…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border-none bg-transparent outline-none text-text-primary text-sm w-45 placeholder:text-text-muted"
              />
            </div>
            <button className="btn btn-primary flex items-center gap-2" onClick={openAdd}>
              <Plus size={16} className="inline"/> Add Student
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-15 text-center text-text-muted">Loading students…</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide bg-bg-hover">Student</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide bg-bg-hover">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide bg-bg-hover">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide bg-bg-hover">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-text-muted py-10">No students found.</td>
                  </tr>
                ) : filtered.map((student: any) => (
                  <tr key={student._id} className="border-b border-border last:border-none hover:bg-bg-hover transition-all duration-300">
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {initials(student.name)}
                        </div>
                        <div className="text-sm font-semibold text-text-primary">{student.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 align-middle text-sm text-text-secondary">
                      {student.email}
                    </td>
                    <td className="px-5 py-3.5 align-middle">
                      <Badge text={student.status} colorMap={STATUS_COLOR} />
                    </td>
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => openEdit(student)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleDelete(student._id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={15} />
              </button>
            </div>
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Full Name <span className="text-danger">*</span></label>
                <input
                  className="form-input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Email Address <span className="text-danger">*</span></label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={!!editTarget}
                />
                {editTarget && (
                  <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
                )}
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-input"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions mt-5">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={createUser.isPending || updateUser.isPending}
              >
                {createUser.isPending || updateUser.isPending ? 'Saving…' : (editTarget ? 'Save Changes' : 'Add Student')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}