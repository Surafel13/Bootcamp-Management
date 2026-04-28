import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { BookOpen, Calendar, Clock, User, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { addToast } from '../../features/ui/uiSlice';
import { useBootcamps } from '../../features/bootcamps/bootcampsApi';
import { useMyEnrollments, useEnrollInBootcamp } from '../../features/enrollments/enrollmentsApi';

export default function StudentBootcampsPage() {
    const dispatch = useDispatch();
    const { data: bootcamps = [], isLoading } = useBootcamps(null);
    const { data: enrollmentsData } = useMyEnrollments();
    const enrollInBootcamp = useEnrollInBootcamp();
    const [selectedBootcamp, setSelectedBootcamp] = useState<any>(null);

    const enrolledBootcampIds = new Set(
        enrollmentsData?.enrollments?.map((e: any) => e.bootcamp._id || e.bootcamp) || []
    );

    const toast = (message: string, type: 'success' | 'error' = 'success') =>
        dispatch(addToast({ message, type }));

    const handleEnroll = async (bootcampId: string) => {
        try {
            await enrollInBootcamp.mutateAsync(bootcampId);
            toast('Successfully enrolled in bootcamp!');
            setSelectedBootcamp(null);
        } catch (err: any) {
            toast(err.response?.data?.message ?? 'Failed to enroll', 'error');
        }
    };

    const isEnrolled = (bootcampId: string) => enrolledBootcampIds.has(bootcampId);

    const canEnroll = (bootcamp: any) => {
        if (isEnrolled(bootcamp._id)) return false;
        if (bootcamp.status === 'completed') return false;
        const deadline = new Date(bootcamp.enrollmentDeadline);
        return deadline > new Date();
    };

    if (isLoading) {
        return <div className="py-16 text-center text-text-muted text-sm">Loading bootcamps…</div>;
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="card bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen size={24} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-text-primary mb-1">Available Bootcamps</h2>
                        <p className="text-sm text-text-secondary">
                            Browse and enroll in bootcamps to start your learning journey
                        </p>
                    </div>
                </div>
            </div>

            {/* Bootcamps Grid */}
            {bootcamps.length === 0 ? (
                <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
                    <BookOpen size={48} className="opacity-30" />
                    <p className="text-sm">No bootcamps available at the moment</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bootcamps.map((bootcamp: any) => {
                        const enrolled = isEnrolled(bootcamp._id);
                        const canEnrollNow = canEnroll(bootcamp);
                        const deadlinePassed = new Date(bootcamp.enrollmentDeadline) < new Date();

                        return (
                            <div
                                key={bootcamp._id}
                                className={`card hover:border-primary/40 transition-all cursor-pointer ${enrolled ? 'border-success/40 bg-success/5' : ''
                                    }`}
                                onClick={() => setSelectedBootcamp(bootcamp)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${bootcamp.status === 'ongoing' ? 'bg-success/10 text-success' :
                                            bootcamp.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                                                'bg-text-muted/10 text-text-muted'
                                        }`}>
                                        {bootcamp.status}
                                    </span>
                                    {enrolled && (
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/10 text-success flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Enrolled
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-text-primary mb-2">{bootcamp.name}</h3>
                                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{bootcamp.description}</p>

                                <div className="flex flex-col gap-2 text-xs text-text-muted mb-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} />
                                        <span>
                                            {new Date(bootcamp.startDate).toLocaleDateString()} - {new Date(bootcamp.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} />
                                        <span>{bootcamp.duration}</span>
                                    </div>
                                    {bootcamp.instructor && (
                                        <div className="flex items-center gap-2">
                                            <User size={12} />
                                            <span>{bootcamp.instructor.name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Users size={12} />
                                        <span>Enrollment deadline: {new Date(bootcamp.enrollmentDeadline).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {!enrolled && (
                                    <div className="pt-3 border-t border-border">
                                        {canEnrollNow ? (
                                            <button
                                                className="btn btn-primary w-full text-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEnroll(bootcamp._id);
                                                }}
                                                disabled={enrollInBootcamp.isPending}
                                            >
                                                {enrollInBootcamp.isPending ? 'Enrolling...' : 'Enroll Now'}
                                            </button>
                                        ) : deadlinePassed ? (
                                            <div className="text-xs text-danger flex items-center gap-1 justify-center">
                                                <XCircle size={12} />
                                                Enrollment deadline passed
                                            </div>
                                        ) : (
                                            <div className="text-xs text-text-muted flex items-center gap-1 justify-center">
                                                <AlertCircle size={12} />
                                                Enrollment closed
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bootcamp Detail Modal */}
            {selectedBootcamp && (
                <BootcampDetailModal
                    bootcamp={selectedBootcamp}
                    isEnrolled={isEnrolled(selectedBootcamp._id)}
                    canEnroll={canEnroll(selectedBootcamp)}
                    onClose={() => setSelectedBootcamp(null)}
                    onEnroll={handleEnroll}
                    enrolling={enrollInBootcamp.isPending}
                />
            )}
        </div>
    );
}

// Bootcamp Detail Modal
function BootcampDetailModal({
    bootcamp,
    isEnrolled,
    canEnroll,
    onClose,
    onEnroll,
    enrolling
}: {
    bootcamp: any;
    isEnrolled: boolean;
    canEnroll: boolean;
    onClose: () => void;
    onEnroll: (id: string) => void;
    enrolling: boolean;
}) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 700 }}>
                <div className="modal-header">
                    <div>
                        <h2>{bootcamp.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${bootcamp.status === 'ongoing' ? 'bg-success/10 text-success' :
                                    bootcamp.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                                        'bg-text-muted/10 text-text-muted'
                                }`}>
                                {bootcamp.status}
                            </span>
                            {isEnrolled && (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/10 text-success flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    Enrolled
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Description */}
                    <div>
                        <h3 className="font-bold text-text-primary mb-2">About</h3>
                        <p className="text-sm text-text-secondary">{bootcamp.description}</p>
                    </div>

                    {/* Details */}
                    <div>
                        <h3 className="font-bold text-text-primary mb-2">Details</h3>
                        <div className="grid grid-cols-2 gap-3">
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
                            <div className="flex items-center gap-2 text-sm">
                                <Users size={14} className="text-text-muted" />
                                <div>
                                    <div className="text-xs text-text-muted">Enrollment Deadline</div>
                                    <div className="font-semibold text-text-primary">
                                        {new Date(bootcamp.enrollmentDeadline).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructor */}
                    {bootcamp.instructor && (
                        <div>
                            <h3 className="font-bold text-text-primary mb-2">Instructor</h3>
                            <div className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User size={18} className="text-primary" />
                                </div>
                                <div>
                                    <div className="font-semibold text-text-primary">{bootcamp.instructor.name}</div>
                                    <div className="text-xs text-text-muted">{bootcamp.instructor.email}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Division */}
                    {bootcamp.division && typeof bootcamp.division === 'object' && (
                        <div>
                            <h3 className="font-bold text-text-primary mb-2">Division</h3>
                            <div className="text-sm text-text-secondary">{bootcamp.division.name}</div>
                        </div>
                    )}
                </div>

                <div className="modal-actions mt-5">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                    {!isEnrolled && canEnroll && (
                        <button
                            className="btn-primary"
                            onClick={() => onEnroll(bootcamp._id)}
                            disabled={enrolling}
                        >
                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}