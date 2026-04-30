import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Download, FileText, Video, Image, Archive, Link as LinkIcon, Upload } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../../features/ui/uiSlice';
import type { Resource } from '../../../../features/bootcamps/types';
import { useResources, useCreateResource, useUpdateResource, useDeleteResource } from '../../../../features/bootcamps/bootcampsApi';

const TYPE_ICONS: Record<Resource['type'], any> = {
  pdf: FileText,
  video: Video,
  image: Image,
  zip: Archive,
  link: LinkIcon,
};

const TYPE_STYLE: Record<Resource['type'], string> = {
  pdf: 'bg-danger/10 text-danger',
  video: 'bg-primary/10 text-primary',
  image: 'bg-success/10 text-success',
  zip: 'bg-warning/10 text-warning',
  link: 'bg-info/10 text-info',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  externalLink: '',
  type: 'pdf' as Resource['type'],
};

interface Props {
  sessionId: string;
  bootcampId: string;
}

export default function ResourcesSubTab({ sessionId, bootcampId }: Props) {
  const dispatch = useDispatch();
  const { data: resources = [], isLoading } = useResources(sessionId);
  const createResource = useCreateResource(sessionId, bootcampId);
  const updateResource = useUpdateResource(sessionId);
  const deleteResource = useDeleteResource(sessionId);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (resource: Resource) => {
    setForm({
      title: resource.title,
      description: resource.description ?? '',
      externalLink: resource.externalLink ?? '',
      type: resource.type,
    });
    setSelectedFile(null);
    setEditTarget(resource._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteResource.mutateAsync(id);
      toast('Resource deleted.');
    } catch { toast('Delete failed.', 'error'); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.type) {
      toast('Please fill in title and type', 'error');
      return;
    }

    if (form.type === 'link' && !form.externalLink) {
      toast('External link is required for link type', 'error');
      return;
    }

    if (form.type !== 'link' && !selectedFile && !editTarget) {
      toast('Please select a file to upload', 'error');
      return;
    }

    try {
      setUploading(true);

      if (editTarget) {
        // Update existing resource (no file upload on edit)
        await updateResource.mutateAsync({
          id: editTarget,
          title: form.title,
          description: form.description || undefined,
          externalLink: form.externalLink || undefined,
          type: form.type,
        });
        toast('Resource updated.');
      } else {
        // Create new resource with file upload
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('type', form.type);
        if (form.description) formData.append('description', form.description);
        if (form.externalLink) formData.append('externalLink', form.externalLink);
        if (selectedFile) formData.append('file', selectedFile);

        await createResource.mutateAsync(formData);
        toast('Resource uploaded successfully.');
      }

      setShowModal(false);
      setForm(EMPTY_FORM);
      setSelectedFile(null);
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Save failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <div className="py-12 text-center text-text-muted text-sm">Loading resources…</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{resources.length} resource{resources.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={15} /> Add Resource
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
          <FileText size={36} className="opacity-30" />
          <p className="text-sm">No resources yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {resources.map(resource => {
            const Icon = TYPE_ICONS[resource.type];
            return (
              <div key={resource._id} className="card hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${TYPE_STYLE[resource.type]}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-text-primary">{resource.title}</span>
                        <span className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full uppercase ${TYPE_STYLE[resource.type]}`}>
                          {resource.type}
                        </span>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-text-secondary mb-2">{resource.description}</p>
                      )}
                      <div className="flex gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Download size={11} />
                          {resource.downloads} downloads
                        </span>
                        <span>By {resource.uploadedBy.name}</span>
                      </div>
                      {(resource.fileUrl || resource.externalLink) && (
                        <a
                          href={resource.externalLink || resource.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-2 inline-block"
                        >
                          Open Resource →
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="action-btn action-btn-edit" onClick={() => openEdit(resource)} title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(resource._id)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Resource' : 'New Resource'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Title <span className="text-danger">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Lecture Slides"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Type <span className="text-danger">*</span></label>
                <select
                  className="form-input"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as Resource['type'] }))}
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="zip">ZIP Archive</option>
                  <option value="link">External Link</option>
                </select>
              </div>

              {form.type === 'link' ? (
                <div className="form-group">
                  <label>External Link <span className="text-danger">*</span></label>
                  <input
                    className="form-input"
                    placeholder="https://..."
                    value={form.externalLink}
                    onChange={e => setForm(f => ({ ...f, externalLink: e.target.value }))}
                  />
                </div>
              ) : editTarget ? (
                <div className="form-group">
                  <p className="text-xs text-text-muted">File cannot be changed after upload. Delete and create a new resource to replace the file.</p>
                </div>
              ) : (
                <div className="form-group">
                  <label>Upload File <span className="text-danger">*</span></label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="form-input flex items-center gap-2 cursor-pointer hover:border-primary transition-colors">
                        <Upload size={16} className="text-text-muted" />
                        <span className="text-sm text-text-secondary">
                          {selectedFile ? selectedFile.name : 'Choose a file...'}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept={
                          form.type === 'pdf' ? '.pdf' :
                          form.type === 'video' ? 'video/*' :
                          form.type === 'image' ? 'image/*' :
                          form.type === 'zip' ? '.zip,.rar,.7z' :
                          '*'
                        }
                      />
                    </label>
                    {selectedFile && (
                      <button
                        type="button"
                        className="action-btn action-btn-delete"
                        onClick={() => setSelectedFile(null)}
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-text-muted mt-1">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="modal-actions mt-5">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={createResource.isPending || updateResource.isPending || uploading}
              >
                {uploading ? 'Uploading…' : createResource.isPending || updateResource.isPending ? 'Saving…' : editTarget ? 'Save Changes' : 'Upload Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}