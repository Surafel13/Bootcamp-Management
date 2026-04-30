import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Calendar, Award, Link as LinkIcon, FileText, GitBranch } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../../features/ui/uiSlice';
import type { Task } from '../../../../features/bootcamps/types';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../../../features/bootcamps/bootcampsApi';

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-text-muted/10 text-text-muted',
};

const SUBMISSION_TYPES = [
  { value: 'file', label: 'File Upload', icon: FileText },
  { value: 'github', label: 'GitHub Link', icon: GitBranch },
  { value: 'text', label: 'Text Submission', icon: FileText },
  { value: 'form', label: 'Form Link', icon: LinkIcon },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  deadline: '',
  status: 'active' as Task['status'],
  allowedTypes: [] as string[],
  formLink: '',
  allowLateSubmission: false,
  maxScore: 100,
};

interface Props {
  sessionId: string;
  bootcampId: string;
  divisionId: string; // Add divisionId prop
}

export default function TaskSubTab({ sessionId, bootcampId, divisionId }: Props) {
  const dispatch = useDispatch();
  const { data: tasks = [], isLoading, refetch } = useTasks(sessionId);
  const createTask = useCreateTask(sessionId, bootcampId);
  const updateTask = useUpdateTask(sessionId);
  const deleteTask = useDeleteTask(sessionId);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description,
      deadline: task.deadline.slice(0, 16),
      status: task.status,
      allowedTypes: task.allowedTypes,
      formLink: task.formLink ?? '',
      allowLateSubmission: task.allowLateSubmission,
      maxScore: task.maxScore,
    });
    setEditTarget(task._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;
    try {
      await deleteTask.mutateAsync(id);
      toast('Task deleted successfully.');
      refetch();
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Delete failed.', 'error');
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!form.title || !form.description || !form.deadline) {
      toast('Please fill in all required fields (title, description, deadline)', 'error');
      return;
    }

    if (form.allowedTypes.length === 0) {
      toast('Please select at least one submission type', 'error');
      return;
    }

    if (form.allowedTypes.includes('form') && !form.formLink) {
      toast('Please provide a form link when "Form Link" submission type is selected', 'error');
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        deadline: form.deadline,
        status: form.status,
        allowedTypes: form.allowedTypes,
        formLink: form.formLink || undefined,
        allowLateSubmission: form.allowLateSubmission,
        maxScore: form.maxScore,
        bootcamp: bootcampId,
        division: divisionId,
        session: sessionId,
      };

      if (editTarget) {
        await updateTask.mutateAsync({ id: editTarget, ...payload });
        toast('Task updated successfully.');
      } else {
        await createTask.mutateAsync(payload);
        toast('Task created successfully.');
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      refetch();
    } catch (err: any) {
      console.error('Task save failed:', err.response?.data);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (Array.isArray(errors)) {
          errors.forEach((error: any) => {
            const field = error.path?.join('.') || 'unknown';
            toast(`${field}: ${error.message}`, 'error');
          });
        } else if (typeof errors === 'object') {
          Object.entries(errors).forEach(([field, message]) => {
            toast(`${field}: ${message}`, 'error');
          });
        }
      } else {
        toast(err.response?.data?.message ?? 'Save failed. Please try again.', 'error');
      }
    }
  };

  const toggleSubmissionType = (type: string) => {
    setForm(f => ({
      ...f,
      allowedTypes: f.allowedTypes.includes(type)
        ? f.allowedTypes.filter(t => t !== type)
        : [...f.allowedTypes, type]
    }));
  };

  if (isLoading) return <div className="py-12 text-center text-text-muted text-sm">Loading tasks…</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={15} /> Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
          <Award size={36} className="opacity-30" />
          <p className="text-sm">No tasks yet. Create your first task.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map(task => (
            <div key={task._id} className="card hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-text-primary">{task.title}</span>
                    <span className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      Due: {new Date(task.deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award size={11} />
                      Max Score: {task.maxScore}
                    </span>
                    {task.allowLateSubmission && (
                      <span className="text-warning text-[0.68rem] font-medium">Late submissions allowed</span>
                    )}
                  </div>
                  
                  {task.allowedTypes.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                      {task.allowedTypes.map(type => {
                        const typeConfig = SUBMISSION_TYPES.find(t => t.value === type);
                        const Icon = typeConfig?.icon || FileText;
                        return (
                          <span key={type} className="flex items-center gap-1 text-[0.65rem] px-2 py-0.5 bg-bg-hover text-text-muted rounded-full border border-border">
                            <Icon size={10} />
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  {task.formLink && (
                    <a
                      href={task.formLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      <LinkIcon size={11} />
                      Open Submission Form →
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    className="action-btn action-btn-edit" 
                    onClick={() => openEdit(task)} 
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button 
                    className="action-btn action-btn-delete" 
                    onClick={() => handleDelete(task._id)} 
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Task' : 'Create Task'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={15} />
              </button>
            </div>
            
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Title */}
              <div className="form-group">
                <label>Task Title <span className="text-danger">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g., React Component Assignment"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description <span className="text-danger">*</span></label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Describe what students need to do, requirements, and evaluation criteria..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Deadline and Max Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Deadline <span className="text-danger">*</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Max Score</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.maxScore}
                    onChange={e => setForm(f => ({ ...f, maxScore: parseInt(e.target.value) || 0 }))}
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              {/* Submission Types */}
              <div className="">
                <label>Submission Types <span className="text-danger">*</span></label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {SUBMISSION_TYPES.map(type => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-bg-hover transition-colors">
                      <input
                        type="checkbox"
                        checked={form.allowedTypes.includes(type.value)}
                        onChange={() => toggleSubmissionType(type.value)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                      <type.icon size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                      <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Link (conditional) */}
              {form.allowedTypes.includes('form') && (
                <div className="form-group">
                  <label>Form Link <span className="text-danger">*</span></label>
                  <input
                    className="form-input"
                    placeholder="https://forms.google.com/..."
                    value={form.formLink}
                    onChange={e => setForm(f => ({ ...f, formLink: e.target.value }))}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Students will be redirected to this link to submit their work
                  </p>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 gap-4">
                <div className="">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowLateSubmission}
                      onChange={e => setForm(f => ({ ...f, allowLateSubmission: e.target.checked }))}
                      className="accent-primary cursor-pointer w-4 h-4"
                    />
                    <span>Allow late submissions</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-input"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Task['status'] }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-actions mt-5">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={createTask.isPending || updateTask.isPending}
              >
                {createTask.isPending || updateTask.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  editTarget ? 'Save Changes' : 'Create Task'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}