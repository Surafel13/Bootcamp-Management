import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../../../features/ui/uiSlice';
import type { Bootcamp, Group } from '../../../features/bootcamps/types';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup, useAddMember, useRemoveMember } from '../../../features/bootcamps/bootcampsApi';
import { useSearchUsers } from '../../../features/users/usersApi';
import { selectActiveDivisionId } from '../../../features/auth/authSlice';
import useDebounce from '../../../app/hooks/useDebounce';

const EMPTY_FORM = {
  name: '',
  description: '',
  leader: '',
  members: [] as string[],
};

interface Props {
  bootcampId: string;
  bootcamp?: Bootcamp;
}

export default function GroupsTab({ bootcampId }: Props) {
  const dispatch = useDispatch();
  const divisionId = useSelector(selectActiveDivisionId);
  const { data: groups = [], isLoading } = useGroups(bootcampId);
  const createGroup = useCreateGroup(bootcampId);
  const updateGroup = useUpdateGroup(bootcampId);
  const deleteGroup = useDeleteGroup(bootcampId);
  const addMember = useAddMember(bootcampId);
  const removeMember = useRemoveMember(bootcampId);

  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedMembers, setSelectedMembers] = useState<Array<{ _id: string; name: string; email: string }>>([]);

  // Search states for adding members
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading: isSearching } = useSearchUsers({
    q: debouncedSearchTerm,
    role: 'student',
    division: divisionId || undefined,
    status: 'active',
    limit: 10
  }, {
    enabled: debouncedSearchTerm.length >= 2 && (showMemberModal || showModal)
  });

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSelectedMembers([]);
    setSearchTerm('');
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (group: Group) => {
    setForm({
      name: group.name,
      description: group.description ?? '',
      leader: group.leader ?? '',
      members: group.members.map(m => m._id),
    });
    setSelectedMembers([]);
    setEditTarget(group._id);
    setShowModal(true);
  };

  const openMemberManagement = (group: Group) => {
    setSelectedGroup(group);
    setSearchTerm('');
    setShowMemberModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await deleteGroup.mutateAsync(id);
      toast('Group deleted.');
    } catch { toast('Delete failed.', 'error'); }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast('Please fill in group name', 'error');
      return;
    }

    if (!divisionId) {
      toast('Division not found', 'error');
      return;
    }

    if (!editTarget && selectedMembers.length === 0) {
      toast('Please add at least one member to the group', 'error');
      return;
    }

    if (!editTarget && selectedMembers.length > 8) {
      toast('Maximum 8 members allowed per group', 'error');
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        leader: form.leader || undefined,
        division: divisionId,
        members: !editTarget ? selectedMembers.map(m => m._id) : undefined,
      };

      if (editTarget) {
        await updateGroup.mutateAsync({ id: editTarget, ...payload });
        toast('Group updated.');
      } else {
        await createGroup.mutateAsync(payload);
        toast('Group created.');
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setSelectedMembers([]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ?? 'Save failed.';
      toast(errorMessage, 'error');
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return;

    // Check max capacity
    if (selectedGroup.members.length >= 8) {
      toast('Group is at maximum capacity (8 members)', 'error');
      return;
    }

    try {
      await addMember.mutateAsync({ groupId: selectedGroup._id, userId });
      toast('Member added to group.');
      setSearchTerm('');
      setIsDropdownOpen(false);
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        toast('This student is already in another group for this division.', 'error');
      } else if (status === 422) {
        toast('Group is at maximum capacity (8 members).', 'error');
      } else {
        toast(message ?? 'Failed to add member.', 'error');
      }
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;

    // Check minimum size
    if (selectedGroup.members.length <= 2) {
      toast('Groups must have at least 2 members. Cannot remove this member.', 'error');
      return;
    }

    if (!window.confirm('Remove this member from the group?')) return;

    try {
      await removeMember.mutateAsync({ groupId: selectedGroup._id, userId });
      toast('Member removed from group.');
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 422) {
        toast('Cannot remove member. Groups must have at least 2 members.', 'error');
      } else {
        toast(message ?? 'Failed to remove member.', 'error');
      }
    }
  };

  if (isLoading) return <div className="py-16 text-center text-text-muted text-sm">Loading groups…</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={15} /> Add Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
          <Users size={36} className="opacity-30" />
          <p className="text-sm">No groups yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map(group => (
            <div key={group._id} className="card hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-text-primary">{group.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-sm text-text-secondary mb-2">{group.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {group.members.map(member => (
                      <div key={member._id} className="flex items-center gap-1.5 px-2 py-1 bg-bg-hover rounded-full text-xs">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[0.6rem] font-bold">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-text-secondary">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className="action-btn bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    onClick={() => openMemberManagement(group)}
                    title="Manage Members"
                  >
                    <UserPlus size={13} />
                  </button>
                  <button className="action-btn action-btn-edit" onClick={() => openEdit(group)} title="Edit">
                    <Pencil size={13} />
                  </button>
                  <button className="action-btn action-btn-delete" onClick={() => handleDelete(group._id)} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Group Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Group' : 'New Group'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Group Name <span className="text-danger">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Team Alpha"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Brief description of the group..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Member Selection - Only for new groups */}
              {!editTarget && (
                <>
                  <div className="form-group">
                    <label>
                      Add Members <span className="text-danger">*</span>
                      {selectedMembers.length > 0 && (
                        <span className="text-text-muted text-xs ml-2">({selectedMembers.length}/8)</span>
                      )}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '2.25rem' }}
                        placeholder={selectedMembers.length >= 8 ? "Maximum capacity reached" : "Search students by name or email..."}
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        disabled={selectedMembers.length >= 8}
                      />

                      {/* Search Results Dropdown */}
                      {isDropdownOpen && debouncedSearchTerm.length >= 2 && searchResults && (
                        <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {isSearching ? (
                            <div className="p-4 text-center text-text-secondary">
                              <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              <span className="ml-2 text-sm">Searching...</span>
                            </div>
                          ) : (searchResults as any).total > 0 ? (
                            <div>
                              <div className="px-3 py-2 bg-bg-hover border-b border-border">
                                <span className="text-xs text-text-muted">{(searchResults as any).total} student(s) found</span>
                              </div>
                              {((searchResults as any).users || []).map((user: any) => {
                                const isAlreadySelected = selectedMembers.some(m => m._id === user._id);
                                return (
                                  <button
                                    key={user._id}
                                    type="button"
                                    className={`w-full p-3 text-left transition-colors border-b border-border last:border-b-0 ${
                                      isAlreadySelected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-hover'
                                    }`}
                                    onClick={() => {
                                      if (!isAlreadySelected && selectedMembers.length < 8) {
                                        setSelectedMembers([...selectedMembers, { _id: user._id, name: user.name, email: user.email }]);
                                        setSearchTerm('');
                                        setIsDropdownOpen(false);
                                      }
                                    }}
                                    disabled={isAlreadySelected}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-primary text-xs font-bold">
                                          {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">
                                          {user.name} {isAlreadySelected && '(Already selected)'}
                                        </p>
                                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-text-secondary text-sm">
                              No students found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Members List */}
                  {selectedMembers.length > 0 && (
                    <div className="form-group">
                      <label>Selected Members ({selectedMembers.length})</label>
                      <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                        {selectedMembers.map(member => (
                          <div key={member._id} className="flex items-center justify-between p-2 border-b border-border last:border-b-0 hover:bg-bg-hover transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-[0.65rem] font-bold">
                                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-text-primary">{member.name}</p>
                                <p className="text-[0.65rem] text-text-muted">{member.email}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="action-btn action-btn-delete"
                              onClick={() => setSelectedMembers(selectedMembers.filter(m => m._id !== member._id))}
                              title="Remove"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-actions mt-5">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={createGroup.isPending || updateGroup.isPending}
              >
                {createGroup.isPending || updateGroup.isPending ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      {showMemberModal && selectedGroup && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMemberModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Manage Members - {selectedGroup.name}</h2>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Add Member Search */}
              <div className="form-group">
                <label>
                  Add Member
                  {selectedGroup.members.length >= 8 && (
                    <span className="text-danger text-xs ml-2">(Group is full)</span>
                  )}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder={selectedGroup.members.length >= 8 ? "Group is at maximum capacity" : "Search students by name or email..."}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    disabled={selectedGroup.members.length >= 8}
                  />

                  {/* Search Results Dropdown */}
                  {isDropdownOpen && debouncedSearchTerm.length >= 2 && searchResults && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-text-secondary">
                          <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="ml-2 text-sm">Searching...</span>
                        </div>
                      ) : (searchResults as any).total > 0 ? (
                        <div>
                          <div className="px-3 py-2 bg-bg-hover border-b border-border">
                            <span className="text-xs text-text-muted">{(searchResults as any).total} student(s) found</span>
                          </div>
                          {((searchResults as any).users || []).map((user: any) => {
                            const isAlreadyMember = selectedGroup.members.some(m => m._id === user._id);
                            return (
                              <button
                                key={user._id}
                                className={`w-full p-3 text-left transition-colors border-b border-border last:border-b-0 ${
                                  isAlreadyMember ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-hover'
                                }`}
                                onClick={() => !isAlreadyMember && handleAddMember(user._id)}
                                disabled={isAlreadyMember}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-primary text-xs font-bold">
                                      {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                      {user.name} {isAlreadyMember && '(Already in group)'}
                                    </p>
                                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-text-secondary text-sm">
                          No students found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Members List */}
              <div className="form-group">
                <label>
                  Current Members ({selectedGroup.members.length}/8)
                  {selectedGroup.members.length >= 8 && (
                    <span className="text-warning text-xs ml-2">(Maximum capacity reached)</span>
                  )}
                  {selectedGroup.members.length <= 2 && (
                    <span className="text-warning text-xs ml-2">(Minimum 2 members required)</span>
                  )}
                </label>
                <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                  {selectedGroup.members.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-sm">
                      No members yet. Add students to this group.
                    </div>
                  ) : (
                    selectedGroup.members.map(member => (
                      <div key={member._id} className="flex items-center justify-between p-3 border-b border-border last:border-b-0 hover:bg-bg-hover transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-xs font-bold">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{member.name}</p>
                            <p className="text-xs text-text-muted">{member.email}</p>
                          </div>
                        </div>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={selectedGroup.members.length <= 2}
                          title={selectedGroup.members.length <= 2 ? "Cannot remove - minimum 2 members required" : "Remove from group"}
                        >
                          <UserMinus size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions mt-5">
              <button className="btn-primary" onClick={() => setShowMemberModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}