import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import type {
    User,
    UsersResponse,
    UserResponse,
    SearchUsersParams,
    CreateUserInput,
    UpdateUserInput,
    UpdateUserStatusInput,
    UsersQueryParams,
} from './types';


// GET USERS
export const useUsers = (params?: UsersQueryParams) =>
    useQuery<User[]>({
        queryKey: ['users', params],
        queryFn: async () => {
            const res = await api.get<UsersResponse>('/users', { params });
            return res.data.data.users;
        },
    });

// CREATE USER
export const useCreateUser = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (body: CreateUserInput) => {
            const res = await api.post<User>('/users', body);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

// UPDATE USER
export const useUpdateUser = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...body }: UpdateUserInput) => {
            const res = await api.patch<User>(`/users/${id}`, body);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUserInfo = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await api.get<UserResponse>('/users/me');
            return res.data.data.user as User; // Extract the nested user object
        },
    });
};

export const useSearchUsers = (params: SearchUsersParams, options?: any) => {
    // Remove undefined params
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
    );

    return useQuery({
        queryKey: ['users', 'search', cleanParams],
        queryFn: async () => {
            const res = await api.get('/users/search', { params: cleanParams });
            return {
                users: res.data.data.users,
                total: res.data.total,
                pagination: res.data.pagination
            };
        },
        ...options,
    });
};

// For getting all users with filters
export const useAllUsers = (params?: {
    role?: string;
    status?: string;
    division?: string;
    limit?: number;
    page?: number;
}) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const res = await api.get('/users', { params });
            return {
                users: res.data.data.users,
                total: res.data.total,
                pagination: res.data.pagination
            };
        },
    });
};

// UPDATE USER STATUS
export const useUpdateUserStatus = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: UpdateUserStatusInput) => {
            const res = await api.patch<User>(`/users/${id}/status`, { status });
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

// DELETE USER
export const useDeleteUser = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete<{ success: boolean }>(`/users/${id}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
        },
    });
};