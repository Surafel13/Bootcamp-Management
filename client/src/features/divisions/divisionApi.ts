import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { Division , DivisionResponse } from './types';

// GET DIVISIONS
export const useDivisions = () =>
  useQuery<Division[]>({
    queryKey: ['divisions'],
    queryFn: async () => {
      const res = await api.get<DivisionResponse>('/divisions');
      return res.data.data;
    },
  });

// CREATE DIVISION
export const useCreateDivision = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: Division) => {
      const res = await api.post<Division>('/divisions', body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['divisions'] });
    },
  });
};

// UPDATE DIVISION
export const useUpdateDivision = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ _id, ...body }: Division) => {
      const res = await api.patch<Division>(`/divisions/${_id}`, body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['divisions'] });
    },
  });
};

// DELETE DIVISION
export const useDeleteDivision = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ success: boolean }>(`/divisions/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['divisions'] });
    },
  });
};