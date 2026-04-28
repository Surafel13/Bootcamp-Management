import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    BookOpen,
    Calendar,
    Clock,
    User,
    ArrowLeft,
    PlayCircle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    CheckSquare,
    UserCheck,
    MessageSquare,
    Download,
    ExternalLink,
    XCircle,
    AlertCircle,
    Star
} from 'lucide-react';
import { addToast } from '../../features/ui/uiSlice';
import {
    useBootcamp,
    useSessions,
    useBootcampResources,
    useTasks,
    useResources,
    useSessionAttendance
} from '../../features/bootcamps/bootcampsApi';
import { useMyEnrollments } from '../../features/enrollments/enrollmentsApi';


const toLocalTime = (date: string) =>
    new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

export default function EnrolledBootcampDetailPage() {
    const { bootcampId } = useParams<{ bootcampId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: bootcamp, isLoading: bootcampLoading } = useBootcamp(bootcampId!);
    const { data: sessions = [], isLoading: sessionsLoading } = useSessions(bootcampId!);
    const { data: bootcampResources = [] } = useBootcampResources(bootcampId!);
    const { data: enrollmentsData } = useMyEnrollments();

    const [expandedSession, setExpandedSession] = useState<string | null>(null);

    const toast = (message: string, type: 'success' | 'error' = 'success') =>
        dispatch(addToast({ message, type }));

    const enrollment = enrollmentsData?.enrollments?.find(
        (e: any) => e.bootcamp._id === bootcampId || e.bootcamp === bootcampId
    );

    const isLoading = bootcampLoading || sessionsLoading;

    if (isLoading) {
        return <div className="py-16 text-center text-text-muted text-sm">Loading bootcamp details…</div>;
    }

    if (!bootcamp) {
        return (
            <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
                <BookOpen size={48} className="opacity-30" />
                <p className="text-sm">Bootcamp not found</p>
            </div>
        );
    }

    const upcomingSessions = sessions.filter((s: any) => new Date(s.startTime) > new Date());
    const pastSessions = sessions.filter((s: any) => new Date(s.startTime) <= new Date());

    return (
        <div className="flex flex-col gap-5">
            {/* Back Button */}
            <button
                className="btn btn-secondary flex items-center gap-2 w-fit"
                onClick={() => navigate('/student/my-bootcamps')}
            >
                <ArrowLeft size={15} />
                Back to My Bootcamps
            </button>

            {/* Bootcamp Header */}
            <div className="card bg-primary/5 border-primary/20">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text-primary mb-1">{bootcamp.name}</h2>
                            <p className="text-sm text-text-secondary">{bootcamp.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${bootcamp.status === 'ongoing' ? 'bg-success/10 text-success' :
                            bootcamp.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                                'bg-text-muted/10 text-text-muted'
                            }`}>
                            {bootcamp.status}
                        </span>
                        {enrollment && (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${enrollment.status === 'active' ? 'bg-success/10 text-success' :
                                enrollment.status === 'completed' ? 'bg-primary/10 text-primary' :
                                    'bg-text-muted/10 text-text-muted'
                                }`}>
                                {enrollment.status}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-text-muted" />
                        <div>
                            <div className="text-xs text-text-muted">Start Date</div>
                            <div className="font-semibold text-text-primary">
                                {new Date(bootcamp.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-text-muted" />
                        <div>
                            <div className="text-xs text-text-muted">End Date</div>
                            <div className="font-semibold text-text-primary">
                                {new Date(bootcamp.endDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-text-muted" />
                        <div>
                            <div className="text-xs text-text-muted">Duration</div>
                            <div className="font-semibold text-text-primary">{bootcamp.duration}</div>
                        </div>
                    </div>
                </div>

                {bootcamp.instructor && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User size={18} className="text-primary" />
                            </div>
                            <div>
                                <div className="text-xs text-text-muted">Instructor</div>
                                <div className="font-semibold text-text-primary">{bootcamp.instructor.name}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <PlayCircle size={18} className="text-primary" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">{sessions.length}</div>
                            <div className="text-xs text-text-muted">Total Sessions</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <CheckCircle size={18} className="text-success" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">{pastSessions.length}</div>
                            <div className="text-xs text-text-muted">Completed Sessions</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Clock size={18} className="text-warning" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">{upcomingSessions.length}</div>
                            <div className="text-xs text-text-muted">Upcoming Sessions</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bootcamp Resources */}
            {bootcampResources.length > 0 && (
                <div>
                    <h3 className="text-md font-black text-text-primary mb-3 flex items-center gap-2">
                        <FileText size={18} />
                        Bootcamp Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {bootcampResources.map((resource: any) => (
                            <div key={resource._id} className="card hover:border-primary/40 transition-all">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${resource.type === 'document' ? 'bg-primary/10' :
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
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
                <div>
                    <h3 className="text-md font-black text-text-primary mb-3">Upcoming Sessions</h3>
                    <div className="flex flex-col gap-2">
                        {upcomingSessions.map((session: any) => (
                            <ExpandableSessionCard
                                key={session._id}
                                session={session}
                                bootcampId={bootcampId!}
                                isPast={false}
                                expanded={expandedSession === session._id}
                                onToggle={() => setExpandedSession(expandedSession === session._id ? null : session._id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
                <div>
                    <h3 className="text-md font-black text-text-primary mb-3">Past Sessions</h3>
                    <div className="flex flex-col gap-2">
                        {pastSessions.map((session: any) => (
                            <ExpandableSessionCard
                                key={session._id}
                                session={session}
                                bootcampId={bootcampId!}
                                isPast={true}
                                expanded={expandedSession === session._id}
                                onToggle={() => setExpandedSession(expandedSession === session._id ? null : session._id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {sessions.length === 0 && (
                <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
                    <PlayCircle size={48} className="opacity-30" />
                    <p className="text-sm">No sessions scheduled yet</p>
                </div>
            )}
        </div>
    );
}

function ExpandableSessionCard({
    session,
    bootcampId,
    isPast,
    expanded,
    onToggle
}: {
    session: any;
    bootcampId: string;
    isPast: boolean;
    expanded: boolean;
    onToggle: () => void;
}) {
    const navigate = useNavigate();

    return (
        <div className={`card ${isPast ? 'opacity-75' : ''}`}>
            <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => navigate(`/student/bootcamps/${bootcampId}/sessions/${session._id}`)}
            >
                <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isPast ? 'bg-text-muted/10' : 'bg-primary/10'
                        }`}>
                        <PlayCircle size={18} className={isPast ? 'text-text-muted' : 'text-primary'} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-text-primary mb-1">{session.title}</h4>
                        {session.description && (
                            <p className="text-sm text-text-secondary mb-2 line-clamp-2">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{toLocalTime(session.startTime)} - {toLocalTime(session.endTime)}</span>
                            </div>
                            {session.location && (
                                <span>{session.location}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="action-btn bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        title={expanded ? 'Collapse preview' : 'Expand preview'}
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-border">
                    <SessionPreview sessionId={session._id} />
                </div>
            )}
        </div>
    );
}

function SessionPreview({ sessionId }: { sessionId: string }) {
    const { data: tasks = [] } = useTasks(sessionId);
    const { data: resources = [] } = useResources(sessionId);
    const { data: attendanceData } = useSessionAttendance(sessionId);

    const myAttendance = attendanceData?.attendance?.find((a: any) => a.isCurrentUser);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tasks Preview */}
            <div className="p-4 bg-bg-hover rounded-lg">
                <h5 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <CheckSquare size={16} />
                    Tasks ({tasks.length})
                </h5>
                {tasks.length === 0 ? (
                    <p className="text-sm text-text-muted">No tasks assigned</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {tasks.slice(0, 3).map((task: any) => {
                            const isPastDue = task.dueDate && new Date(task.dueDate) < new Date();
                            return (
                                <div key={task._id} className="p-2 bg-bg-card rounded border border-border">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-text-primary truncate">{task.title}</div>
                                            {task.dueDate && (
                                                <div className={`text-xs mt-1 ${isPastDue ? 'text-danger' : 'text-text-muted'}`}>
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize shrink-0 ${task.type === 'assignment' ? 'bg-primary/10 text-primary' :
                                            task.type === 'quiz' ? 'bg-warning/10 text-warning' :
                                                'bg-success/10 text-success'
                                            }`}>
                                            {task.type}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {tasks.length > 3 && (
                            <p className="text-xs text-text-muted">+{tasks.length - 3} more tasks</p>
                        )}
                    </div>
                )}
            </div>

            {/* Resources Preview */}
            <div className="p-4 bg-bg-hover rounded-lg">
                <h5 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Resources ({resources.length})
                </h5>
                {resources.length === 0 ? (
                    <p className="text-sm text-text-muted">No resources available</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {resources.slice(0, 3).map((resource: any) => (
                            <div key={resource._id} className="p-2 bg-bg-card rounded border border-border">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-text-primary truncate">{resource.title}</div>
                                        <div className="text-xs text-text-muted capitalize">{resource.type}</div>
                                    </div>
                                    {resource.type === 'link' ? (
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn bg-info/10 text-info hover:bg-info hover:text-white shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink size={12} />
                                        </a>
                                    ) : (
                                        <a
                                            href={resource.fileUrl}
                                            download
                                            className="action-btn bg-primary/10 text-primary hover:bg-primary hover:text-white shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Download size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {resources.length > 3 && (
                            <p className="text-xs text-text-muted">+{resources.length - 3} more resources</p>
                        )}
                    </div>
                )}
            </div>

            {/* Attendance Preview */}
            <div className="p-4 bg-bg-hover rounded-lg">
                <h5 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <UserCheck size={16} />
                    Your Attendance
                </h5>
                {myAttendance ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-card">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${myAttendance.status === 'present' ? 'bg-success/10' :
                            myAttendance.status === 'absent' ? 'bg-danger/10' :
                                myAttendance.status === 'late' ? 'bg-warning/10' :
                                    'bg-text-muted/10'
                            }`}>
                            {myAttendance.status === 'present' ? <CheckCircle size={18} className="text-success" /> :
                                myAttendance.status === 'absent' ? <XCircle size={18} className="text-danger" /> :
                                    myAttendance.status === 'late' ? <AlertCircle size={18} className="text-warning" /> :
                                        <AlertCircle size={18} className="text-text-muted" />}
                        </div>
                        <div>
                            <div className="font-semibold text-text-primary capitalize">{myAttendance.status}</div>
                            {myAttendance.markedAt && (
                                <div className="text-xs text-text-muted">
                                    {new Date(myAttendance.markedAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-card">
                        <AlertCircle size={18} className="text-text-muted" />
                        <span className="text-sm text-text-secondary">Not marked yet</span>
                    </div>
                )}
            </div>

            {/* Feedback Preview */}
            <div className="p-4 bg-bg-hover rounded-lg">
                <h5 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Feedback
                </h5>
                <div className="p-3 rounded-lg bg-bg-card text-center">
                    <MessageSquare size={32} className="mx-auto mb-2 text-text-muted opacity-50" />
                    <p className="text-sm text-text-secondary">View full details to submit feedback</p>
                </div>
            </div>
        </div>
    );
}