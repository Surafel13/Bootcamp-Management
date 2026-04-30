import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

// ─── Student Submission ───────────────────────────────────────────────────────
export const useSubmitTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { task: string; githubLink?: string; fileUrl?: string; text?: string }) =>
      api.post('/submissions', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-submissions'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; githubLink?: string; fileUrl?: string; text?: string }) =>
      api.patch(`/submissions/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-submissions'] });
      qc.invalidateQueries({ queryKey: ['submission'] });
    },
  });
};

export const useMySubmissions = () =>
  useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => api.get('/submissions/me').then(r => r.data.data),
  });

export const useSubmissionById = (id: string) =>
  useQuery({
    queryKey: ['submission', id],
    queryFn: () => api.get(`/submissions/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

// ─── Admin Submission Management ──────────────────────────────────────────────
export const useAllSubmissions = (filters?: { task?: string; student?: string; status?: string }) =>
  useQuery({
    queryKey: ['submissions', filters],
    queryFn: () => api.get('/submissions', { params: filters }).then(r => r.data.data),
  });

export const useSubmissionsByTask = (taskId: string) =>
  useQuery({
    queryKey: ['task-submissions', taskId],
    queryFn: () => api.get(`/submissions/task/${taskId}`).then(r => r.data.data),
    enabled: !!taskId,
  });

export const useGradeSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, score, feedback, status }: {
      submissionId: string;
      score: number;
      feedback?: string;
      status?: 'graded' | 'returned'
    }) =>
      api.patch(`/submissions/${submissionId}/grade`, { score, feedback, status }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['submissions'] });
      qc.invalidateQueries({ queryKey: ['submission'] });
      qc.invalidateQueries({ queryKey: ['task-submissions'] });
    },
  });
};

export const useBootcampSubmissionStats = (bootcampId: string) =>
  useQuery({
    queryKey: ['bootcamp-submission-stats', bootcampId],
    queryFn: () => api.get(`/submissions/bootcamp/${bootcampId}/stats`).then(r => r.data.data),
    enabled: !!bootcampId,
  });