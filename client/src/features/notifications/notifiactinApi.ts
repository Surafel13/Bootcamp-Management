import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

// ─── User Notifications ───────────────────────────────────────────────────────
export const useNotifications = () =>
    useQuery({
        queryKey: ['notifications'],
        queryFn: () => api.get('/notifications').then(r => r.data),
    });

export const useMarkAsRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: string) =>
            api.patch(`/notifications/${notificationId}/read`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

export const useMarkAllAsRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => api.patch('/notifications/read-all').then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

// ─── Admin Broadcast ──────────────────────────────────────────────────────────
export const useBroadcastToDivision = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { divisionId: string; role?: string; title?: string; message: string; type?: string }) =>
            api.post('/notifications/broadcast/division', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

export const useBroadcastToBootcamp = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { bootcampId: string; status?: string; title?: string; message: string; type?: string }) =>
            api.post('/notifications/broadcast/bootcamp', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

export const useBroadcastToGroup = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { groupId: string; title?: string; message: string; type?: string }) =>
            api.post('/notifications/broadcast/group', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

export const useSendToUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { userId: string; title?: string; message: string; type?: string }) =>
            api.post('/notifications/broadcast/user', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

export const useSendBulk = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { userIds: string[]; title?: string; message: string; type?: string }) =>
            api.post('/notifications/broadcast/bulk', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

// ─── Preview ──────────────────────────────────────────────────────────────────
export const useBootcampStudents = (bootcampId: string, status?: string) =>
    useQuery({
        queryKey: ['bootcamp-students', bootcampId, status],
        queryFn: () => api.get(`/notifications/bootcamp/${bootcampId}/students`, { params: { status } }).then(r => r.data),
        enabled: !!bootcampId,
    });