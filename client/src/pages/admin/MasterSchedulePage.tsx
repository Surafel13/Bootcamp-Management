import { useState } from 'react';
import { Calendar, MapPin, Shield } from 'lucide-react';
import { useAllSessions } from '../../features/bootcamps/bootcampsApi';
import { useDivisions } from '../../features/divisions/divisionApi';

export default function MasterSchedulePage() {
    const [selectedDivision, setSelectedDivision] = useState<string>('');
    const divisions = useDivisions();
    const { data: sessionsData, isLoading } = useAllSessions(
        selectedDivision ? { division: selectedDivision } : undefined
    );

    const divisionsList = divisions.data || [];
    const sessions = sessionsData?.sessions || [];

    const getSessionStatus = (session: any) => {
        const now = new Date();
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);

        if (now >= start && now <= end) return 'active';
        if (now < start) return 'upcoming';
        return 'completed';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    if (isLoading) {
        return <div className="py-16 text-center text-text-muted text-sm">Loading schedule…</div>;
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="card bg-bg-secondary border-border">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Calendar size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text-primary mb-1">Master Schedule</h2>
                            <p className="text-sm text-text-secondary">
                                Centralized bootcamp events across all divisions
                            </p>
                        </div>
                    </div>
                    <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        className="input"
                        style={{ width: 200 }}
                    >
                        <option value="">All Divisions</option>
                        {divisionsList.map((div: any) => (
                            <option key={div._id} value={div._id}>
                                {div.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sessions Table */}
            <div className="card">
                {sessions.length === 0 ? (
                    <div className="py-16 text-center text-text-muted text-sm">
                        <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                        No sessions found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Session Title
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Division
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session: any) => {
                                    const status = getSessionStatus(session);
                                    return (
                                        <tr key={session._id} className="border-b border-border hover:bg-bg-hover transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="font-semibold text-text-primary">{session.title}</div>
                                                <div className="text-xs text-text-muted mt-0.5">ID: {session._id.slice(-6)}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm font-semibold text-text-primary">
                                                    {session.bootcamp?.division?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm font-semibold text-text-primary">
                                                    {formatDate(session.startTime)}
                                                </div>
                                                <div className="text-xs text-text-muted mt-0.5">
                                                    {formatTime(session.startTime)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                                    <MapPin size={14} className="text-text-muted" />
                                                    {session.location || 'Not specified'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${status === 'active' ? 'bg-primary/10 text-primary' :
                                                        status === 'upcoming' ? 'bg-info/10 text-info' :
                                                            'bg-success/10 text-success'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
                                                    onClick={() => {
                                                        // TODO: Implement audit functionality
                                                        console.log('Audit session:', session._id);
                                                    }}
                                                >
                                                    <Shield size={16} />
                                                    Audit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}