import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  CheckSquare,
  Calendar,
  Star,
  Upload,
  GitBranch,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  X
} from 'lucide-react';
import { addToast } from '../../features/ui/uiSlice';
import { useMySubmissions, useSubmitTask, useUpdateSubmission } from '../../features/submissions/submissionsApi';
import { useMyEnrollments } from '../../features/enrollments/enrollmentsApi';

export default function StudentTasksPage() {
  const dispatch = useDispatch();
  const { data: submissionsData } = useMySubmissions();
  const { data: enrollmentsData } = useMyEnrollments();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const submissions = submissionsData?.submissions || [];
  const enrollments = enrollmentsData?.enrollments || [];

  // Collect all tasks from enrolled bootcamps
  const allTasks: any[] = [];
  enrollments.forEach((enrollment: any) => {
    const bootcamp = enrollment.bootcamp;
    if (bootcamp && typeof bootcamp === 'object' && bootcamp.sessions) {
      bootcamp.sessions?.forEach((session: any) => {
        session.tasks?.forEach((task: any) => {
          allTasks.push({
            ...task,
            sessionTitle: session.title,
            bootcampName: bootcamp.name,
            bootcampId: bootcamp._id,
            sessionId: session._id,
          });
        });
      });
    }
  });

  // Map submissions to tasks
  const tasksWithSubmissions = allTasks.map(task => {
    const submission = submissions.find((s: any) => s.task === task._id || s.task?._id === task._id);
    return { ...task, submission };
  });

  // Filter tasks
  const filteredTasks = tasksWithSubmissions.filter(task => {
    if (filter === 'pending') return !task.submission;
    if (filter === 'submitted') return task.submission && task.submission.status === 'submitted';
    if (filter === 'graded') return task.submission && task.submission.status === 'graded';
    return true;
  });

  const pendingCount = tasksWithSubmissions.filter(t => !t.submission).length;
  const submittedCount = tasksWithSubmissions.filter(t => t.submission && t.submission.status === 'submitted').length;
  const gradedCount = tasksWithSubmissions.filter(t => t.submission && t.submission.status === 'graded').length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="card bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CheckSquare size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black text-text-primary mb-1">My Tasks</h2>
            <p className="text-sm text-text-secondary">
              View and submit your assignments and tasks
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckSquare size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary">{allTasks.length}</div>
              <div className="text-xs text-text-muted">Total Tasks</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock size={18} className="text-warning" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary">{pendingCount}</div>
              <div className="text-xs text-text-muted">Pending</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Upload size={18} className="text-info" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary">{submittedCount}</div>
              <div className="text-xs text-text-muted">Submitted</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Award size={18} className="text-success" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary">{gradedCount}</div>
              <div className="text-xs text-text-muted">Graded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
          }`}
          onClick={() => setFilter('all')}
        >
          All ({allTasks.length})
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-primary text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
          }`}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filter === 'submitted'
              ? 'bg-primary text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
          }`}
          onClick={() => setFilter('submitted')}
        >
          Submitted ({submittedCount})
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filter === 'graded'
              ? 'bg-primary text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
          }`}
          onClick={() => setFilter('graded')}
        >
          Graded ({gradedCount})
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
            <CheckSquare size={48} className="opacity-30" />
            <p className="text-sm">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task: any) => {
            const isPastDue = task.dueDate && new Date(task.dueDate) < new Date();
            const hasSubmission = !!task.submission;
            const isGraded = task.submission?.status === 'graded';

            return (
              <div
                key={task._id}
                className={`card hover:border-primary/40 transition-all cursor-pointer ${
                  isGraded ? 'border-success/40 bg-success/5' :
                  hasSubmission ? 'border-info/40 bg-info/5' :
                  isPastDue ? 'border-danger/40 bg-danger/5' : ''
                }`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isGraded ? 'bg-success/10' :
                      hasSubmission ? 'bg-info/10' :
                      isPastDue ? 'bg-danger/10' : 'bg-primary/10'
                    }`}>
                      {isGraded ? <Award size={18} className="text-success" /> :
                       hasSubmission ? <Upload size={18} className="text-info" /> :
                       isPastDue ? <AlertCircle size={18} className="text-danger" /> :
                       <CheckSquare size={18} className="text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-text-primary">{task.title}</h4>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                          task.type === 'assignment' ? 'bg-primary/10 text-primary' :
                          task.type === 'quiz' ? 'bg-warning/10 text-warning' :
                          task.type === 'project' ? 'bg-success/10 text-success' :
                          'bg-text-muted/10 text-text-muted'
                        }`}>
                          {task.type}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-text-secondary mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>{task.bootcampName} • {task.sessionTitle}</span>
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 ${isPastDue ? 'text-danger font-bold' : ''}`}>
                            <Calendar size={12} />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.points && (
                          <div className="flex items-center gap-1">
                            <Star size={12} />
                            <span>{task.points} points</span>
                          </div>
                        )}
                      </div>
                      {isGraded && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm font-bold text-success">
                            Score: {task.submission.score}/{task.points || 100}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isGraded ? (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                        <CheckCircle size={12} />
                        Graded
                      </span>
                    ) : hasSubmission ? (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-info/10 text-info flex items-center gap-1">
                        <Upload size={12} />
                        Submitted
                      </span>
                    ) : isPastDue ? (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-danger/10 text-danger flex items-center gap-1">
                        <AlertCircle size={12} />
                        Overdue
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Detail/Submit Modal */}
      {selectedTask && (
        <TaskSubmitModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

function TaskSubmitModal({ task, onClose }: { task: any; onClose: () => void }) {
  const dispatch = useDispatch();
  const submitTask = useSubmitTask();
  const updateSubmission = useUpdateSubmission();

  const [submissionType, setSubmissionType] = useState<'github' | 'file' | 'text'>('github');
  const [githubLink, setGithubLink] = useState(task.submission?.githubLink || '');
  const [fileUrl, setFileUrl] = useState(task.submission?.fileUrl || '');
  const [text, setText] = useState(task.submission?.text || '');

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date();
  const hasSubmission = !!task.submission;
  const isGraded = task.submission?.status === 'graded';

  const handleSubmit = async () => {
    const data: any = { task: task._id };

    if (submissionType === 'github') {
      if (!githubLink) {
        toast('Please enter a GitHub link', 'error');
        return;
      }
      data.githubLink = githubLink;
    } else if (submissionType === 'file') {
      if (!fileUrl) {
        toast('Please upload a file', 'error');
        return;
      }
      data.fileUrl = fileUrl;
    } else {
      if (!text) {
        toast('Please enter your response', 'error');
        return;
      }
      data.text = text;
    }

    try {
      if (hasSubmission) {
        await updateSubmission.mutateAsync({ id: task.submission._id, ...data });
        toast('Submission updated successfully');
      } else {
        await submitTask.mutateAsync(data);
        toast('Task submitted successfully');
      }
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Failed to submit task', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <div>
            <h2>{task.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                task.type === 'assignment' ? 'bg-primary/10 text-primary' :
                task.type === 'quiz' ? 'bg-warning/10 text-warning' :
                'bg-success/10 text-success'
              }`}>
                {task.type}
              </span>
              {isGraded && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/10 text-success flex items-center gap-1">
                  <CheckCircle size={12} />
                  Graded
                </span>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Task Details */}
          <div>
            <h3 className="font-bold text-text-primary mb-2">Task Details</h3>
            {task.description && (
              <p className="text-sm text-text-secondary mb-3">{task.description}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <div className="text-xs text-text-muted">Bootcamp</div>
                <div className="font-semibold text-text-primary">{task.bootcampName}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs text-text-muted">Session</div>
                <div className="font-semibold text-text-primary">{task.sessionTitle}</div>
              </div>
              {task.dueDate && (
                <div className="text-sm">
                  <div className="text-xs text-text-muted">Due Date</div>
                  <div className={`font-semibold ${isPastDue ? 'text-danger' : 'text-text-primary'}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              {task.points && (
                <div className="text-sm">
                  <div className="text-xs text-text-muted">Points</div>
                  <div className="font-semibold text-text-primary">{task.points}</div>
                </div>
              )}
            </div>
          </div>

          {task.instructions && (
            <div>
              <h3 className="font-bold text-text-primary mb-2">Instructions</h3>
              <div className="p-3 bg-bg-hover rounded-lg text-sm text-text-secondary">
                {task.instructions}
              </div>
            </div>
          )}

          {task.attachmentUrl && (
            <div>
              <h3 className="font-bold text-text-primary mb-2">Attachment</h3>
              <a
                href={task.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <FileText size={14} />
                Download Task Attachment
              </a>
            </div>
          )}

          {/* Graded Submission */}
          {isGraded && (
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                <Award size={18} className="text-success" />
                Grade
              </h3>
              <div className="text-2xl font-black text-success mb-2">
                {task.submission.score}/{task.points || 100}
              </div>
              {task.submission.feedback && (
                <div>
                  <div className="text-xs text-text-muted mb-1">Feedback</div>
                  <p className="text-sm text-text-secondary">{task.submission.feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Submission Form */}
          {!isGraded && (
            <>
              <div>
                <h3 className="font-bold text-text-primary mb-2">
                  {hasSubmission ? 'Update Submission' : 'Submit Your Work'}
                </h3>
                <div className="flex gap-2 mb-3">
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      submissionType === 'github'
                        ? 'bg-primary text-white'
                        : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
                    }`}
                    onClick={() => setSubmissionType('github')}
                  >
                    <GitBranch size={16} className="inline mr-1" />
                    GitHub
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      submissionType === 'file'
                        ? 'bg-primary text-white'
                        : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
                    }`}
                    onClick={() => setSubmissionType('file')}
                  >
                    <Upload size={16} className="inline mr-1" />
                    File
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      submissionType === 'text'
                        ? 'bg-primary text-white'
                        : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
                    }`}
                    onClick={() => setSubmissionType('text')}
                  >
                    <FileText size={16} className="inline mr-1" />
                    Text
                  </button>
                </div>

                {submissionType === 'github' && (
                  <div className="form-group">
                    <label>GitHub Repository URL</label>
                    <input
                      className="form-input"
                      placeholder="https://github.com/username/repository"
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                    />
                  </div>
                )}

                {submissionType === 'file' && (
                  <div className="form-group">
                    <label>File URL</label>
                    <input
                      className="form-input"
                      placeholder="Upload file and paste URL here"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Upload your file to a cloud storage and paste the URL here
                    </p>
                  </div>
                )}

                {submissionType === 'text' && (
                  <div className="form-group">
                    <label>Your Response</label>
                    <textarea
                      className="form-input"
                      rows={6}
                      placeholder="Enter your response here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>

              {isPastDue && (
                <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary">
                    This task is past its due date. Late submissions may receive reduced points.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-actions mt-5">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          {!isGraded && (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleSubmit}
              disabled={submitTask.isPending || updateSubmission.isPending}
            >
              <Upload size={14} />
              {submitTask.isPending || updateSubmission.isPending
                ? 'Submitting...'
                : hasSubmission
                ? 'Update Submission'
                : 'Submit Task'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}