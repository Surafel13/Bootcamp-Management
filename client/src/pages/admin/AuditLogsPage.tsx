import { useState } from 'react';
import { Shield, Clock, User, Eye, FileDown } from 'lucide-react';
import { useAuditLogs } from '../../features/reports/reportsApi';

export default function AuditLogsPage() {
    const [filters, setFilters] = useState({
        action: '',
        user: '',
        from: '',
        to: '',
        limit: 50,
    });
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const { data: logsData, isLoading } = useAuditLogs(filters);
    const logs = logsData?.logs || [];

    const getSeverityBadge = (action: string) => {
        if (action === 'DELETE') return { label: 'Critical', class: 'bg-danger text-white' };
        if (action === 'PATCH' || action === 'PUT') return { label: 'Warning', class: 'bg-warning text-white' };
        return { label: 'Info', class: 'bg-info text-white' };
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    const handleExportPDF = () => {
        // TODO: Implement PDF export functionality
        console.log('Export PDF clicked');
    };

    if (isLoading) {
        return <div className="py-16 text-center text-text-muted text-sm">Loading audit logs…</div>;
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="card bg-bg-secondary border-border">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Shield size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text-primary mb-1">System Audit Logs</h2>
                            <p className="text-sm text-text-secondary">
                                Security tracking and administrative action history
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <FileDown size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1.5">Action</label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="input"
                        >
                            <option value="">All Actions</option>
                            <option value="POST">POST</option>
                            <option value="PATCH">PATCH</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="GET">GET</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1.5">From Date</label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1.5">To Date</label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1.5">Limit</label>
                        <select
                            value={filters.limit}
                            onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value) })}
                            className="input"
                        >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="card">
                {logs.length === 0 ? (
                    <div className="py-16 text-center text-text-muted text-sm">
                        <Shield size={48} className="mx-auto mb-3 opacity-30" />
                        No audit logs found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Resource Path
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Performer
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Severity
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log: any) => {
                                    const severity = getSeverityBadge(log.action);
                                    return (
                                        <tr key={log._id} className="border-b border-border hover:bg-bg-hover transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                    <Clock size={14} className="text-text-muted" />
                                                    {formatTimestamp(log.timestamp || log.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-sm text-text-primary">
                                                    {log.action}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm font-mono text-text-secondary">
                                                    {log.resourcePath || log.path || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                    <User size={14} className="text-text-muted" />
                                                    {log.performer?.name || log.user?.name || 'System'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${severity.class}`}>
                                                    {severity.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="w-8 h-8 rounded-lg bg-bg-hover hover:bg-bg-input flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
                                                >
                                                    <Eye size={16} />
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

            {/* Details Modal */}
            {selectedLog && (
                <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Audit Log Details</h2>
                            <button className="modal-close" onClick={() => setSelectedLog(null)}>×</button>
                        </div>
                        <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-semibold text-text-muted mb-1">Timestamp</div>
                                    <div className="text-sm text-text-primary">
                                        {formatTimestamp(selectedLog.timestamp || selectedLog.createdAt)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-text-muted mb-1">Action</div>
                                    <div className="text-sm font-bold text-text-primary">{selectedLog.action}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-text-muted mb-1">Performer</div>
                                    <div className="text-sm text-text-primary">
                                        {selectedLog.performer?.name || selectedLog.user?.name || 'System'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-text-muted mb-1">User Role</div>
                                    <div className="text-sm text-text-primary">
                                        {selectedLog.performer?.role || selectedLog.user?.role || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-text-muted mb-1">Resource Path</div>
                                <div className="text-sm font-mono text-text-primary bg-bg-hover p-2 rounded">
                                    {selectedLog.resourcePath || selectedLog.path || 'N/A'}
                                </div>
                            </div>
                            {selectedLog.details && (
                                <div>
                                    <div className="text-xs font-semibold text-text-muted mb-1">Additional Details</div>
                                    <div className="text-sm text-text-secondary bg-bg-hover p-3 rounded max-h-60 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap font-mono text-xs">
                                            {JSON.stringify(selectedLog.details, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                            {selectedLog.ipAddress && (
                                <div>
                                    <div className="text-xs font-semibold text-text-muted mb-1">IP Address</div>
                                    <div className="text-sm text-text-primary">{selectedLog.ipAddress}</div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions mt-5">
                            <button className="btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}