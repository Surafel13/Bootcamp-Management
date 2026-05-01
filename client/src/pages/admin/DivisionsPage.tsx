import { useState , useMemo } from 'react';

import {  Pencil, Trash2, Plus, X, Search } from 'lucide-react';
import { useDivisions, useCreateDivision, useUpdateDivision, useDeleteDivision } from '../../features/divisions/divisionApi';
import { addToast } from '../../features/ui/uiSlice';
import { useDispatch } from 'react-redux';
import type { Division } from '../../features/divisions/types';


function DivisionsPage() {
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [form, setForm] = useState<Division>({ name: '', description: '' });

  const { data: divisionsData, isLoading } = useDivisions();
  const createDivision = useCreateDivision();
  const updateDivision = useUpdateDivision();
  const deleteDivision = useDeleteDivision();

  const filtered = useMemo(() =>
    divisionsData!.filter((d: any) =>
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase()))
    ), [divisionsData, search]);

  const showToast = (msg: string) => { dispatch(addToast({ message: msg, type: 'success' })); };

  const initials = (name: string) => {
    return name.toUpperCase().split(' ').map(word => word.charAt(0)).join('');
  }

  const openAdd = () => {
    setForm({ name: '', description: '' });
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (div: Division) => {
    setForm({ name: div.name, description: div.description });
    setEditTarget(div._id!);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editTarget) {
      updateDivision.mutateAsync({ _id: editTarget, ...form });
      showToast('Division updated successfully.');
    } else {
      createDivision.mutateAsync(form);
      showToast('Division added successfully.');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this division?')) return;
    try {
      await deleteDivision.mutateAsync(id);
      dispatch(addToast({ message: 'Division removed successfully.', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message ?? 'Delete failed.', type: 'error' }));
    }
  };

  return (
    <div>
      <div className="bg-bg-card rounded-radius border border-border shadow-shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">Division Management</h2>
          <div className="flex items-center gap-2.5">

            <div className="flex items-center gap-2 bg-bg-input border border-border rounded-radius-sm px-3 py-2 transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <Search size={15} className="text-text-muted" />
              <input
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border-none bg-transparent outline-none text-text-primary text-sm w-45 placeholder:text-text-muted"
              />
            </div>
            <button className="bg-primary text-white rounded-radius-sm px-4 py-2 flex items-center justify-center cursor-pointer border-none transition-all duration-300 hover:bg-primary hover:text-white" onClick={openAdd}>
              <Plus size={16} />
              Add Division
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-15 text-center text-text-muted">Loading divisions…</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wide bg-bg-input">Division</th>
                  <th className="px-5 py-3 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wide bg-bg-input">Description</th>
                  <th className="px-5 py-3 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-wide bg-bg-input">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-text-muted py-10">No divisions found.</td>
                  </tr>
                ) : filtered.map((division: any) => (
                  <tr key={division._id} className="border-b border-border last:border-none hover:bg-bg-hover transition-all duration-300">
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-radius-sm bg-linear-to-br from-primary-light to-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials(division.name)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-text-primary">{division.name}</div>
                          <div className="text-[0.82rem] text-primary">{division.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 align-middle text-[0.85rem] text-text-muted">
                      {division.description}
                    </td>
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-radius-sm bg-primary-glow text-primary flex items-center justify-center cursor-pointer border-none transition-all duration-300 hover:bg-primary hover:text-white"
                          onClick={() => openEdit(division)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-radius-sm bg-danger-light text-danger flex items-center justify-center cursor-pointer border-none transition-all duration-300 hover:bg-danger hover:text-white"
                          onClick={() => handleDelete(division._id)}
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

      {/**Modal**/}
      {showModal && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-500 backdrop-blur-sm animate-fade-in" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-bg-card rounded-radius-lg p-7 w-full max-w-[520px] border border-border shadow-shadow-lg animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-text-primary">{editTarget ? 'Edit Division' : 'Add New Division'}</h2>
              <button
                className="w-8 h-8 rounded-radius-sm bg-bg-input border border-border flex items-center justify-center cursor-pointer text-text-secondary transition-all duration-300 hover:bg-danger-light hover:text-danger hover:border-transparent"
                onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="grid grid-cols-1 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary">Division Name</label>
                <input
                  className="px-3 py-2.5 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-bg-card"
                  placeholder="e.g. Data Science"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary">Description</label>
                <textarea
                  className="px-3 py-2.5 border-[1.5px] border-border rounded-radius-sm bg-bg-input text-text-primary text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-bg-card cursor-pointer"
                  placeholder="e.g. CSEC Data Science Division"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-radius-sm bg-gray-500 text-text-on-primary font-semibold text-sm transition-all duration-300 hover:opacity-90" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-radius-sm bg-primary text-white ifont-semibold text-sm transition-all duration-300 hover:opacity-90" id="save-div-btn" onClick={handleSave}>
                {editTarget ? 'Save Changes' : 'Add Division'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DivisionsPage