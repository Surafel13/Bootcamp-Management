import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser, useUpdateUserStatus, useDeleteUser } from '../../features/users/usersApi';
import { useDivisions } from '../../features/divisions/divisionApi';
import { addToast } from '../../features/ui/uiSlice';
import { useDispatch } from 'react-redux';

const ROLES = ['super_admin', 'division_admin', 'student'];
const STATUSES = ['active', 'suspended', 'graduated'];

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  division_admin: 'Division Admin',
  student: 'Student'
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  active: { bg: 'bg-success-light', color: 'text-success' },
  suspended: { bg: 'bg-danger-light', color: 'text-danger' },
  graduated: { bg: 'bg-info-light', color: 'text-info' },
};

interface BadgeProps {
  text: string;
  colorMap: Record<string, { bg: string; color: string }>;
}

function Badge({ text, colorMap }: BadgeProps) {
  const style = colorMap[text] ?? { bg: 'bg-bg-input', color: 'text-text-secondary' };
  return (
    <span className={`px-2.5 py-0.75 rounded-full text-xs font-semibold ${style.bg} ${style.color}`}>
      {text}
    </span>
  );
}

const initials = (name?: string) =>
  name?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') ?? '?';

const EMPTY_FORM = { name: '', email: '', role: 'student', status: 'active', memberships: [] };

interface UserForm {
  name: string;
  email: string;
  role: string;
  status: string;
  memberships: {
    role: string;
    division: string;
  }[]
}

export default function UsersPage() {
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);

  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const { data: divisions, isLoading: isDivisionLoading } = useDivisions()

  const filtered = useMemo(() =>
    users.filter((u: any) =>
      (roleFilter === 'All' || u.roles?.includes(roleFilter)) &&
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()))
    ), [users, search, roleFilter]);

  const toast = (msg: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message: msg, type }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setForm({
      name: u.name,
      email: u.email,
      role: u.roles?.[0] ?? 'student',
      status: u.status,
      memberships: u.memberships
    });
    setEditTarget(u._id);
    setShowModal(true);
  };


  const addMembership = () => {
    setForm(f => ({
      ...f,
      memberships: [...f.memberships, { division: '', role: 'student' }]
    }));
  };

  const updateMembership = (index, field, value) => {
    const newMemberships = [...form.memberships];
    newMemberships[index][field] = value;
    setForm(f => ({ ...f, memberships: newMemberships }));
  };

  const removeMembership = (index) => {
    const newMemberships = form.memberships.filter((_, i) => i !== index);
    setForm(f => ({ ...f, memberships: newMemberships }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await deleteUser.mutateAsync(id);
      toast('User removed successfully.');
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Delete failed.', 'error');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    try {
      if (editTarget) {
        await updateUser.mutateAsync({ id: editTarget, ...form });
        toast('User updated successfully.');
      } else {
        await createUser.mutateAsync(form);
        toast('User added successfully.');
      }
      setShowModal(false);
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Save failed.', 'error');
    }
  };

  return (
    <div>
      <div className="bg-bg-card rounded-radius border border-border shadow-shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">User Management</h2>
          <div className="flex items-center gap-2.5">
            <select
              className="px-3 py-2 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            <div className="flex items-center gap-2 bg-bg-input border border-border rounded-radius-sm px-3 py-2 transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <Search size={15} className="text-text-muted" />
              <input
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border-none bg-transparent outline-none text-text-primary text-sm w-45 placeholder:text-text-muted"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-radius-sm bg-primary text-text-on-primary font-semibold text-sm transition-all duration-300 hover:bg-primary-dark hover:shadow-[0_6px_24px_rgba(108,92,231,0.45)] hover:-translate-y-0.5" onClick={openAdd}>
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-15 text-center text-text-muted">Loading users…</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wide bg-bg-input">User</th>
                  <th className="px-5 py-3 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wide bg-bg-input">Role</th>
                  <th className="px-5 py-3 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wide bg-bg-input">Division</th>
                  <th className="px-5 py-3 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wide bg-bg-input">Status</th>
                  <th className="px-5 py-3 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wide bg-bg-input">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-text-muted py-10">No users found.</td>
                  </tr>
                ) : filtered.map((user: any) => (
                  <tr key={user._id} className="border-b border-border last:border-none hover:bg-bg-hover transition-all duration-300">
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-radius-sm bg-linear-to-br from-primary-light to-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials(user.name)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-text-primary">{user.name}</div>
                          <div className="text-[0.82rem] text-primary">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 align-middle font-semibold text-text-secondary text-sm">
                      {ROLE_LABEL[user.roles?.[0]] ?? user.roles?.[0]}
                    </td>
                    <td className="px-5 py-3.5 align-middle text-[0.85rem] text-text-muted">
                      {user.memberships?.map((m: any) => (
                          <Badge text={m.division?.name} colorMap={{}} />
                      ))}
                    </td>
                    <td className="px-5 py-3.5 align-middle">
                      <Badge text={user.status} colorMap={STATUS_COLOR} />
                    </td>
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-radius-sm bg-primary-glow text-primary flex items-center justify-center cursor-pointer border-none transition-all duration-300 hover:bg-primary hover:text-white"
                          onClick={() => openEdit(user)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-radius-sm bg-danger-light text-danger flex items-center justify-center cursor-pointer border-none transition-all duration-300 hover:bg-danger hover:text-white"
                          onClick={() => handleDelete(user._id)}
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
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-500 backdrop-blur-sm animate-fade-in"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-bg-card rounded-radius-lg p-7 w-full max-w-[520px] border border-border shadow-shadow-lg animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-text-primary">{editTarget ? 'Edit User' : 'Add New User'}</h2>
              <button
                className="w-8 h-8 rounded-radius-sm bg-bg-input border border-border flex items-center justify-center cursor-pointer text-text-secondary transition-all duration-300 hover:bg-danger-light hover:text-danger hover:border-transparent"
                onClick={() => setShowModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary">Full Name</label>
                <input
                  className="px-3 py-2.5 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-bg-card"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary">Email Address</label>
                <input
                  className="px-3 py-2.5 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-bg-card"
                  type="email"
                  placeholder="email@csec.edu"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary">Primary Role</label>
                <select
                  className="px-3 py-2.5 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-bg-card cursor-pointer"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary">Memberships</label>
                <div className=''>
                  {form.memberships.map((membership, index) => (
                    <div key={index} className='flex gap-2 mb-2 items-center'>
                      <select
                        className="px-3 py-2.5 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-bg-card cursor-pointer"
                        value={membership.division}
                        onChange={e => updateMembership(index, 'division', e.target.value)}
                        style={{ flex: 2 }}
                      >
                        <option value="">Select Division</option>
                        {divisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                      <select
                        className="px-3 py-2.5 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-bg-card cursor-pointer"
                        value={membership.role}
                        onChange={e => updateMembership(index, 'role', e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="student">Student</option>
                        <option value="division_admin">Division Admin</option>
                      </select>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-radius-sm bg-danger text-text-on-primary font-semibold text-sm transition-all duration-300 hover:opacity-90"
                        onClick={() => removeMembership(index)}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-radius-sm bg-primary text-white ifont-semibold text-sm transition-all duration-300 hover:opacity-90"
                    onClick={addMembership}
                  >
                    <span><Plus size={15} className="inline"/>Add Membership</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary">Status</label>
                <select
                  className="px-3 py-2.5 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-bg-card cursor-pointer"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-5">
              <button
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-radius-sm bg-bg-input text-text-primary font-semibold text-sm border border-border transition-all duration-300 hover:bg-bg-hover hover:border-primary hover:text-primary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-radius-sm bg-primary text-text-on-primary font-semibold text-sm transition-all duration-300 hover:bg-primary-dark hover:shadow-shadow-primary"
                onClick={handleSave}
                disabled={createUser.isPending || updateUser.isPending}
              >
                {createUser.isPending || updateUser.isPending ? 'Saving…' : (editTarget ? 'Save Changes' : 'Add User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}