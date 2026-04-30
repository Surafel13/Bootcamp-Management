import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  PlayCircle,
  Calendar,
  Clock,
  MapPin,
  CheckSquare,
  FileText,
  UserCheck,
  MessageSquare,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { addToast } from '../../features/ui/uiSlice';
import {
  useSessions,
  useTasks,
  useResources,
  useSessionAttendance,
  useSubmitFeedback
} from '../../features/bootcamps/bootcampsApi';

type TabType = 'tasks' | 'resources' | 'attendance' | 'feedback';

const toLocalTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

export default function StudentSessionDetailPage() {
  const { bootcampId, sessionId } = useParams<{ bootcampId: string; sessionId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');

  const { data: sessions = [] } = useSessions(bootcampId!);
  const session = sessions.find((s: any) => s._id === sessionId);

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  if (!session) {
    return (
      <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
        <PlayCircle size={48} className="opacity-30" />
        <p className="text-sm">Session not found</p>
      </div>
    );
  }

  const isPast = new Date(session.startTime) < new Date();

  return (
    <div className="flex flex-col gap-5">
      {/* Back Button */}
      <button
        className="btn btn-secondary flex items-center gap-2 w-fit"
        onClick={() => navigate(`/student/bootcamps/${bootcampId}`)}
      >
        <ArrowLeft size={15} />
        Back to Sessions
      </button>

      {/* Session Header */}
      <div className="card bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            isPast ? 'bg-text-muted/10' : 'bg-primary/10'
          }`}>
            <PlayCircle size={24} className={isPast ? 'text-text-muted' : 'text-primary'} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-text-primary mb-1">{session.title}</h2>
            {session.description && (
              <p className="text-sm text-text-secondary">{session.description}</p>
            )}
          </div>
          {isPast && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-text-muted/10 text-text-muted">
              Past Session
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-text-muted" />
            <div>
              <div className="text-xs text-text-muted">Date</div>
              <div className="font-semibold text-text-primary">
                {new Date(session.startTime).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-text-muted" />
            <div>
              <div className="text-xs text-text-muted">Time</div>
              <div className="font-semibold text-text-primary">
                {toLocalTime(session.startTime)} - {toLocalTime(session.endTime)}
              </div>
            </div>
          </div>
          {session.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-text-muted" />
              <div>
                <div className="text-xs text-text-muted">Location</div>
                <div className="font-semibold text-text-primary">{session.location}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'tasks'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('tasks')}
        >
          <div className="flex items-center gap-2">
            <CheckSquare size={15} />
            Tasks
          </div>
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'resources'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('resources')}
        >
          <div className="flex items-center gap-2">
            <FileText size={15} />
            Resources
          </div>
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'attendance'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('attendance')}
        >
          <div className="flex items-center gap-2">
            <UserCheck size={15} />
            Attendance
          </div>
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'feedback'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('feedback')}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={15} />
            Feedback
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'tasks' && <TasksTab sessionId={sessionId!} />}
        {activeTab === 'resources' && <ResourcesTab sessionId={sessionId!} />}
        {activeTab === 'attendance' && <AttendanceTab sessionId={sessionId!} />}
        {activeTab === 'feedback' && <FeedbackTab sessionId={sessionId!} />}
      </div>
    </div>
  );
}

function TasksTab({ sessionId }: { sessionId: string }) {
  const { data: tasks = [], isLoading } = useTasks(sessionId);

  if (isLoading) {
    return <div className="py-8 text-center text-text-muted text-sm">Loading tasks…</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
        <CheckSquare size={48} className="opacity-30" />
        <p className="text-sm">No tasks assigned for this session</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task: any) => {
        const isPastDue = task.dueDate && new Date(task.dueDate) < new Date();

        return (
          <div key={task._id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-text-primary mb-1">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-text-secondary mb-2">{task.description}</p>
                )}
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                task.type === 'assignment' ? 'bg-primary/10 text-primary' :
                task.type === 'quiz' ? 'bg-warning/10 text-warning' :
                task.type === 'project' ? 'bg-success/10 text-success' :
                'bg-text-muted/10 text-text-muted'
              }`}>
                {task.type}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${isPastDue ? 'text-danger' : ''}`}>
                  <Calendar size={12} />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  {isPastDue && <span className="font-bold">(Past Due)</span>}
                </div>
              )}
              {task.points && (
                <div className="flex items-center gap-1">
                  <Star size={12} />
                  <span>{task.points} points</span>
                </div>
              )}
            </div>

            {task.instructions && (
              <div className="p-3 bg-bg-hover rounded-lg text-sm text-text-secondary">
                {task.instructions}
              </div>
            )}

            {task.attachmentUrl && (
              <div className="mt-3 pt-3 border-t border-border">
                <a
                  href={task.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Download size={12} />
                  Download Attachment
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResourcesTab({ sessionId }: { sessionId: string }) {
  const { data: resources = [], isLoading } = useResources(sessionId);

  if (isLoading) {
    return <div className="py-8 text-center text-text-muted text-sm">Loading resources…</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
        <FileText size={48} className="opacity-30" />
        <p className="text-sm">No resources available for this session</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {resources.map((resource: any) => (
        <div key={resource._id} className="card hover:border-primary/40 transition-all">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              resource.type === 'document' ? 'bg-primary/10' :
              resource.type === 'video' ? 'bg-danger/10' :
              resource.type === 'link' ? 'bg-info/10' :
              'bg-text-muted/10'
            }`}>
              <FileText size={18} className={
                resource.type === 'document' ? 'text-primary' :
                resource.type === 'video' ? 'text-danger' :
                resource.type === 'link' ? 'text-info' :
                'text-text-muted'
              } />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-text-primary mb-1">{resource.title}</h4>
              {resource.description && (
                <p className="text-sm text-text-secondary mb-2 line-clamp-2">{resource.description}</p>
              )}
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-text-muted/10 text-text-muted capitalize">
                {resource.type}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            {resource.type === 'link' ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                Open Link
              </a>
            ) : (
              <a
                href={resource.fileUrl}
                download
                className="btn btn-primary w-full text-sm flex items-center justify-center gap-2"
              >
                <Download size={14} />
                Download
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceTab({ sessionId }: { sessionId: string }) {
  const { data: attendanceData, isLoading } = useSessionAttendance(sessionId);

  if (isLoading) {
    return <div className="py-8 text-center text-text-muted text-sm">Loading attendance…</div>;
  }

  const myAttendance = attendanceData?.attendance?.find((a: any) => a.isCurrentUser);

  return (
    <div className="flex flex-col gap-4">
      {/* My Attendance Status */}
      <div className="card">
        <h3 className="font-bold text-text-primary mb-3">Your Attendance</h3>
        {myAttendance ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-hover">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              myAttendance.status === 'present' ? 'bg-success/10' :
              myAttendance.status === 'absent' ? 'bg-danger/10' :
              myAttendance.status === 'late' ? 'bg-warning/10' :
              'bg-text-muted/10'
            }`}>
              {myAttendance.status === 'present' ? <CheckCircle size={20} className="text-success" /> :
               myAttendance.status === 'absent' ? <XCircle size={20} className="text-danger" /> :
               myAttendance.status === 'late' ? <AlertCircle size={20} className="text-warning" /> :
               <AlertCircle size={20} className="text-text-muted" />}
            </div>
            <div>
              <div className="font-semibold text-text-primary capitalize">{myAttendance.status}</div>
              {myAttendance.markedAt && (
                <div className="text-xs text-text-muted">
                  Marked at {new Date(myAttendance.markedAt).toLocaleString()}
                </div>
              )}
              {myAttendance.note && (
                <div className="text-sm text-text-secondary mt-1">{myAttendance.note}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-text-muted/5">
            <AlertCircle size={20} className="text-text-muted" />
            <span className="text-sm text-text-secondary">Attendance not marked yet</span>
          </div>
        )}
      </div>

      {/* Session Attendance Stats */}
      {attendanceData?.stats && (
        <div className="card">
          <h3 className="font-bold text-text-primary mb-3">Session Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-success/5 border border-success/20">
              <div className="text-2xl font-black text-success">{attendanceData.stats.present || 0}</div>
              <div className="text-xs text-text-muted">Present</div>
            </div>
            <div className="p-3 rounded-lg bg-danger/5 border border-danger/20">
              <div className="text-2xl font-black text-danger">{attendanceData.stats.absent || 0}</div>
              <div className="text-xs text-text-muted">Absent</div>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
              <div className="text-2xl font-black text-warning">{attendanceData.stats.late || 0}</div>
              <div className="text-xs text-text-muted">Late</div>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-black text-primary">{attendanceData.stats.excused || 0}</div>
              <div className="text-xs text-text-muted">Excused</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackTab({ sessionId }: { sessionId: string }) {
  const dispatch = useDispatch();
  const submitFeedback = useSubmitFeedback(sessionId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const handleSubmit = async () => {
    if (rating === 0) {
      toast('Please select a rating', 'error');
      return;
    }

    try {
      await submitFeedback.mutateAsync({ session: sessionId, rating, comment: comment || undefined });
      toast('Feedback submitted successfully');
      setSubmitted(true);
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Failed to submit feedback', 'error');
    }
  };

  if (submitted) {
    return (
      <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
        <CheckCircle size={48} className="text-success" />
        <p className="text-sm text-text-primary font-semibold">Thank you for your feedback!</p>
        <p className="text-xs text-text-secondary">Your feedback helps us improve the sessions</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 className="font-bold text-text-primary mb-4">Session Feedback</h3>

      <div className="form-group">
        <label>How would you rate this session?</label>
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-all hover:scale-110"
            >
              <Star
                size={32}
                className={star <= rating ? 'fill-warning text-warning' : 'text-text-muted'}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Additional Comments (Optional)</label>
        <textarea
          className="form-input"
          rows={4}
          placeholder="Share your thoughts about this session..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      <button
        className="btn btn-primary w-full flex items-center justify-center gap-2"
        onClick={handleSubmit}
      >
        <MessageSquare size={14} />
        Submit Feedback
      </button>
    </div>
  );
}