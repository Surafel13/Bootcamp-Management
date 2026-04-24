import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Bootcamp, Session, Group, Task, Resource, Attendance, InstructorAssignment, Feedback } from './types';
import api from '../../lib/axios';

// ─── Bootcamps ────────────────────────────────────────────────────────────────
export const useBootcamps = (divisionId?: string | null) =>
  useQuery<Bootcamp[]>({
    queryKey: ['bootcamps', divisionId],
    queryFn:  () => api.get('/bootcamps', { params: divisionId ? { division: divisionId } : {} }).then(r => r.data.data.bootcamps),
  });

export const useBootcamp = (id: string) =>
  useQuery<Bootcamp>({
    queryKey: ['bootcamps', id],
    queryFn:  () => api.get(`/bootcamps/${id}`).then(r => r.data.data.bootcamp),
    enabled:  !!id,
  });

export const useCreateBootcamp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Bootcamp>) => api.post('/bootcamps', body).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bootcamps'] }),
  });
};

export const useUpdateBootcamp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Bootcamp> & { id: string }) =>
      api.patch(`/bootcamps/${id}`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bootcamps'] }),
  });
};

export const useDeleteBootcamp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bootcamps/${id}`).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bootcamps'] }),
  });
};

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const useSessions = (bootcampId: string) =>
  useQuery<Session[]>({
    queryKey: ['sessions', bootcampId],
    queryFn:  () => api.get(`/bootcamps/${bootcampId}/sessions`).then(r => r.data.data.sessions),
    enabled:  !!bootcampId,
  });

export const useAllSessions = (filters?: { division?: string }) =>
  useQuery({
    queryKey: ['all-sessions', filters],
    queryFn: () => api.get('/sessions', { params: filters }).then(r => r.data.data),
  });

export const useCreateSession = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Session>) => api.post('/sessions', { ...body, bootcamp: bootcampId }).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['sessions', bootcampId] }),
  });
};

export const useUpdateSession = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Session> & { id: string }) =>
      api.patch(`/sessions/${id}`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions', bootcampId] }),
  });
};

export const useDeleteSession = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sessions/${id}`).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['sessions', bootcampId] }),
  });
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const useGroups = (bootcampId: string) =>
  useQuery<Group[]>({
    queryKey: ['groups', bootcampId],
    queryFn:  () => api.get('/groups', { params: { bootcamp: bootcampId } }).then(r => r.data.data.groups),
    enabled:  !!bootcampId,
  });

export const useCreateGroup = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Group>) => api.post('/groups', { ...body, bootcamp: bootcampId }).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['groups', bootcampId] }),
  });
};

export const useUpdateGroup = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Group> & { id: string }) =>
      api.patch(`/groups/${id}`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', bootcampId] }),
  });
};

export const useDeleteGroup = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/groups/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', bootcampId] }),
  });
};

export const useAddMember = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      api.post(`/groups/${groupId}/members`, { userId }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', bootcampId] }),
  });
};

export const useRemoveMember = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      api.delete(`/groups/${groupId}/members/${userId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', bootcampId] }),
  });
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const useTasks = (sessionId: string) =>
  useQuery<Task[]>({
    queryKey: ['tasks', sessionId],
    queryFn:  () => api.get('/tasks', { params: { session: sessionId } }).then(r => r.data.data.tasks),
    enabled:  !!sessionId,
  });

export const useCreateTask = (sessionId: string, bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Task>) =>
      api.post('/tasks', { ...body, session: sessionId, bootcamp: bootcampId }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', sessionId] }),
  });
};

export const useUpdateTask = (sessionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Task> & { id: string }) =>
      api.patch(`/tasks/${id}`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', sessionId] }),
  });
};

export const useDeleteTask = (sessionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', sessionId] }),
  });
};

// ─── Resources ────────────────────────────────────────────────────────────────
export const useResources = (sessionId: string) =>
  useQuery<Resource[]>({
    queryKey: ['resources', sessionId],
    queryFn:  () => api.get('/resources', { params: { session: sessionId } }).then(r => r.data.data.resources),
    enabled:  !!sessionId,
  });

export const useBootcampResources = (bootcampId: string) =>
  useQuery<Resource[]>({
    queryKey: ['bootcamp-resources', bootcampId],
    queryFn:  () => api.get('/resources', { params: { bootcamp: bootcampId } }).then(r => r.data.data.resources),
    enabled:  !!bootcampId,
  });

export const useCreateResource = (sessionId: string, bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => {
      formData.append('session', sessionId);
      formData.append('bootcamp', bootcampId);
      return api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(r => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources', sessionId] }),
  });
};

export const useUpdateResource = (sessionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Resource> & { id: string }) =>
      api.patch(`/resources/${id}`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources', sessionId] }),
  });
};

export const useDeleteResource = (sessionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/resources/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources', sessionId] }),
  });
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const useAttendance = (sessionId: string) =>
  useQuery<Attendance[]>({
    queryKey: ['attendance', sessionId],
    queryFn:  () => api.get(`/sessions/${sessionId}/attendance`).then(r => r.data.data.attendance),
    enabled:  !!sessionId,
  });

export const useSessionAttendance = (sessionId: string) =>
  useQuery({
    queryKey: ['session-attendance', sessionId],
    queryFn:  () => api.get(`/attendance/session/${sessionId}`).then(r => r.data.data),
    enabled:  !!sessionId,
  });

export const useAllAttendance = (filters?: { division?: string; bootcamp?: string; session?: string; fromDate?: string; toDate?: string }) =>
  useQuery({
    queryKey: ['all-attendance', filters],
    queryFn: () => api.get('/attendance', { params: filters }).then(r => r.data.data),
  });

export const useMarkAttendance = (sessionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { student: string; status: Attendance['status']; note?: string }) =>
      api.patch(`/sessions/${sessionId}/attendance`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', sessionId] });
      qc.invalidateQueries({ queryKey: ['session-attendance', sessionId] });
    },
  });
};

export const useMarkAttendanceManual = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { studentId: string; sessionId: string; status: Attendance['status']; note?: string }) =>
      api.post('/attendance/mark', body).then(r => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['attendance', variables.sessionId] });
      qc.invalidateQueries({ queryKey: ['session-attendance', variables.sessionId] });
      qc.invalidateQueries({ queryKey: ['all-attendance'] });
      qc.invalidateQueries({ queryKey: ['my-attendance'] });
    },
  });
};

export const useUpdateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sessionId, ...body }: { id: string; sessionId: string; status?: Attendance['status']; note?: string }) =>
      api.patch(`/attendance/${id}`, body).then(r => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['attendance', variables.sessionId] });
      qc.invalidateQueries({ queryKey: ['session-attendance', variables.sessionId] });
      qc.invalidateQueries({ queryKey: ['all-attendance'] });
      qc.invalidateQueries({ queryKey: ['my-attendance'] });
    },
  });
};

export const useGenerateQR = () => {
  return useMutation({
    mutationFn: (sessionId: string) =>
      api.post(`/attendance/generate/${sessionId}`).then(r => r.data.data),
  });
};

export const useScanQR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (qrToken: string) =>
      api.post('/attendance/scan', { qrToken }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-attendance'] });
      qc.invalidateQueries({ queryKey: ['session-attendance'] });
      qc.invalidateQueries({ queryKey: ['all-attendance'] });
    },
  });
};

export const useMyAttendance = () =>
  useQuery({
    queryKey: ['my-attendance'],
    queryFn: () => api.get('/attendance/me').then(r => r.data.data),
  });

export const useBootcampAttendanceStats = (bootcampId: string, params?: { fromDate?: string; toDate?: string }) =>
  useQuery({
    queryKey: ['bootcamp-attendance-stats', bootcampId, params],
    queryFn: () => api.get(`/attendance/bootcamp/${bootcampId}/stats`, { params }).then(r => r.data.data),
    enabled: !!bootcampId,
  });

// ─── Instructor Assignments ───────────────────────────────────────────────────
export const useInstructorAssignments = (bootcampId: string) =>
  useQuery<InstructorAssignment[]>({
    queryKey: ['instructor-assignments', bootcampId],
    queryFn:  () => api.get(`/bootcamps/${bootcampId}/instructors`).then(r => r.data.data.assignments),
    enabled:  !!bootcampId,
  });

export const useAssignInstructor = (bootcampId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { instructor: string; assignedBy: string, permissions: string[]; startDate: string; endDate: string }) =>
      api.post(`/bootcamps/${bootcampId}/instructors`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instructor-assignments', bootcampId] }),
  });
};

// ─── Feedback ─────────────────────────────────────────────────────────────────
export const useFeedback = (sessionId: string) =>
  useQuery<Feedback[]>({
    queryKey: ['feedback', sessionId],
    queryFn:  () => api.get(`/feedback/${sessionId}`).then(r => r.data.data.feedback),
    enabled:  !!sessionId,
  });

export const useSubmitFeedback = (sessionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { session: string, rating: number; comment?: string }) =>
      api.post(`/feedback`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feedback', sessionId] }),
  });
};