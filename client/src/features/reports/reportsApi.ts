import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const useDashboardStats = () =>
    useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => api.get('/reports/dashboard-stats').then(r => r.data.data),
    });

// ─── Attendance Report ────────────────────────────────────────────────────────
export const useAttendanceReport = (filters?: {
    division?: string;
    bootcamp?: string;
    from?: string;
    to?: string;
}) =>
    useQuery({
        queryKey: ['attendance-report', filters],
        queryFn: () => api.get('/reports/attendance', { params: filters }).then(r => r.data.data),
    });

// ─── Task Report ──────────────────────────────────────────────────────────────
export const useTaskReport = (filters?: {
    division?: string;
    bootcamp?: string;
    status?: 'draft' | 'published' | 'active' | 'completed';
}) =>
    useQuery({
        queryKey: ['task-report', filters],
        queryFn: () => api.get('/reports/tasks', { params: filters }).then(r => r.data.data),
    });

// ─── Feedback Report ──────────────────────────────────────────────────────────
export const useFeedbackReport = (filters?: {
    division?: string;
    bootcamp?: string;
    from?: string;
    to?: string;
}) =>
    useQuery({
        queryKey: ['feedback-report', filters],
        queryFn: () => api.get('/reports/feedback', { params: filters }).then(r => r.data.data),
    });

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const useAuditLogs = (filters?: {
    action?: string;
    user?: string;
    from?: string;
    to?: string;
    limit?: number;
}) =>
    useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: () => api.get('/reports/logs', { params: filters }).then(r => r.data.data),
    });

// ─── Bootcamp Report ──────────────────────────────────────────────────────────
export const useBootcampReport = (bootcampId: string) =>
    useQuery({
        queryKey: ['bootcamp-report', bootcampId],
        queryFn: () => api.get(`/reports/bootcamp/${bootcampId}`).then(r => r.data.data),
        enabled: !!bootcampId,
    });