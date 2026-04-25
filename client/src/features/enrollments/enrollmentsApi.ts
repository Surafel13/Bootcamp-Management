import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

// ─── Student Enrollment ───────────────────────────────────────────────────────
export const useEnrollInBootcamp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bootcampId: string) =>
      api.post('/enrollments', { bootcamp: bootcampId }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-enrollments'] });
      qc.invalidateQueries({ queryKey: ['enrollment-status'] });
    },
  });
};

export const useMyEnrollments = () =>
  useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => api.get('/enrollments/my-enrollments').then(r => r.data.data),
  });

export const useCheckEnrollmentStatus = (bootcampId: string) =>
  useQuery({
    queryKey: ['enrollment-status', bootcampId],
    queryFn: () => api.get(`/enrollments/check/${bootcampId}`).then(r => r.data.data),
    enabled: !!bootcampId,
  });

export const useDropEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      api.patch(`/enrollments/${enrollmentId}/drop`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-enrollments'] });
      qc.invalidateQueries({ queryKey: ['enrollment-status'] });
    },
  });
};

// ─── Admin Enrollment Management ──────────────────────────────────────────────
export const useAllEnrollments = (filters?: { bootcamp?: string; student?: string; status?: string }) =>
  useQuery({
    queryKey: ['enrollments', filters],
    queryFn: () => api.get('/enrollments', { params: filters }).then(r => r.data.data),
  });

export const useEnrollmentById = (id: string) =>
  useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => api.get(`/enrollments/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

export const useUpdateEnrollmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'dropped' | 'completed' }) =>
      api.patch(`/enrollments/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['enrollment'] });
    },
  });
};

export const useBootcampEnrollmentStats = (bootcampId: string) =>
  useQuery({
    queryKey: ['bootcamp-enrollment-stats', bootcampId],
    queryFn: () => api.get(`/enrollments/bootcamp/${bootcampId}/stats`).then(r => r.data.data),
    enabled: !!bootcampId,
  });