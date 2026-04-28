import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { BookOpen, Calendar, Clock, User, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { addToast } from '../../features/ui/uiSlice';
import { useMyEnrollments, useDropEnrollment } from '../../features/enrollments/enrollmentsApi';

export default function MyBootcampsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: enrollmentsData, isLoading } = useMyEnrollments();
    const dropEnrollment = useDropEnrollment();
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [showDropConfirm, setShowDropConfirm] = useState<string | null>(null);

    const toast = (message: string, type: 'success' | 'error' = 'success') =>
        dispatch(addToast({ message, type }));

    const enrollments = enrollmentsData?.enrollments || [];

    const handleDrop = async (enrollmentId: string) => {
        try {
            await dropEnrollment.mutateAsync(enrollmentId);
            toast('Successfully dropped from bootcamp');
            setShowDropConfirm(null);
        } catch (err: any) {
            toast(err.response?.data?.message ?? 'Failed to drop enrollment', 'error');
        }
    };

    if (isLoading) {
        return <div className="py-16 text-center text-text-muted text-sm">Loading your bootcamps…</div>;
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
                        <h2 className="text-lg font-black text-text-primary mb-1">My Bootcamps</h2>
                        <p className="text-sm text-text-secondary">
                            View your enrolled bootcamps and track your progress
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <CheckCircle size={18} className="text-success" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">
                                {enrollments.filter((e: any) => e.status === 'active').length}
                            </div>
                            <div className="text-xs text-text-muted">Active Bootcamps</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TrendingUp size={18} className="text-primary" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">
                                {enrollments.filter((e: any) => e.status === 'completed').length}
                            </div>
                            <div className="text-xs text-text-muted">Completed</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-text-muted/10 flex items-center justify-center">
                            <XCircle size={18} className="text-text-muted" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-text-primary">
                                {enrollments.filter((e: any) => e.status === 'dropped').length}
                            </div>
                            <div className="text-xs text-text-muted">Dropped</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrolled Bootcamps */}
            {enrollments.length === 0 ? (
                <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
                    <BookOpen size={48} className="opacity-30" />
                    <p className="text-sm">You haven't enrolled in any bootcamps yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrollments.map((enrollment: any) => {
                        const bootcamp = enrollment.bootcamp;
                        if (!bootcamp || typeof bootcamp !== 'object') return null;

                        return (
                            <div
                                key={enrollment._id}
                                className={`card hover:border-primary/40 transition-all cursor-pointer ${enrollment.status === 'active' ? 'border-success/40 bg-success/5' :
                                        enrollment.status === 'completed' ? 'border-primary/40 bg-primary/5' :
                                            'border-text-muted/40 bg-text-muted/5'
                                    }`}
                                onClick={() => setSelectedEnrollment(enrollment)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${bootcamp.status === 'ongoing' ? 'bg-success/10 text-success' :
                                            bootcamp.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                                                'bg-text-muted/10 text-text-muted'
                                        }`}>
                                        {bootcamp.status}
                                    </span>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${enrollment.status === 'active' ? 'bg-success/10 text-success' :
                                            enrollment.status === 'completed' ? 'bg-primary/10 text-primary' :
                                                'bg-text-muted/10 text-text-muted'
                                        }`}>
                                        {enrollment.status}
                                    </span>
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
                                </div>

                                {enrollment.status === 'active' && (
                                    <div className="pt-3 border-t border-border flex gap-2">
                                        <button
                                            className="btn btn-primary flex-1 text-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/student/bootcamps/${bootcamp._id}`);
                                            }}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            className="btn btn-secondary text-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDropConfirm(enrollment._id);
                                            }}
                                        >
                                            Drop
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Drop Confirmation Modal */}
            {showDropConfirm && (
                <div className="modal-overlay" onClick={() => setShowDropConfirm(null)}>
                    <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Drop Bootcamp?</h2>
                            <button className="modal-close" onClick={() => setShowDropConfirm(null)}>×</button>
                        </div>
                        <div className="">
                            <div className="flex  gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                                <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
                                <p className="text-sm text-text-secondary">
                                    Are you sure you want to drop this bootcamp? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="modal-actions mt-5">
                            <button className="btn-secondary" onClick={() => setShowDropConfirm(null)}>Cancel</button>
                            <button
                                className="btn-primary bg-danger hover:bg-danger/90"
                                onClick={() => handleDrop(showDropConfirm)}
                                disabled={dropEnrollment.isPending}
                            >
                                {dropEnrollment.isPending ? 'Dropping...' : 'Drop Bootcamp'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrollment Detail Modal */}
            {selectedEnrollment && (
                <EnrollmentDetailModal
                    enrollment={selectedEnrollment}
                    onClose={() => setSelectedEnrollment(null)}
                />
            )}
        </div>
    );
}

function EnrollmentDetailModal({ enrollment, onClose }: { enrollment: any; onClose: () => void }) {
    const navigate = useNavigate();
    const bootcamp = enrollment.bootcamp;

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
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${enrollment.status === 'active' ? 'bg-success/10 text-success' :
                                    enrollment.status === 'completed' ? 'bg-primary/10 text-primary' :
                                        'bg-text-muted/10 text-text-muted'
                                }`}>
                                {enrollment.status}
                            </span>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h3 className="font-bold text-text-primary mb-2">About</h3>
                        <p className="text-sm text-text-secondary">{bootcamp.description}</p>
                    </div>

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
                                <Calendar size={14} className="text-text-muted" />
                                <div>
                                    <div className="text-xs text-text-muted">Enrolled On</div>
                                    <div className="font-semibold text-text-primary">
                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                </div>

                <div className="modal-actions mt-5">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                    {enrollment.status === 'active' && (
                        <button
                            className="btn-primary"
                            onClick={() => navigate(`/student/bootcamps/${bootcamp._id}`)}
                        >
                            View Sessions
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}