export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  memberships: {
    role: string;
    division: Division | null;
  }[];
  status: 'active' | 'inactive';
}

export interface SearchUsersParams {
  q?: string;
  role?: string;
  status?: string;
  division?: string;
  limit?: number;
  page?: number;
}

export interface Division {
  _id: string;
  name: string;
  description: string;
}

export interface UsersResponse {
  data: {
    users: User[];
  };
}

export interface UserResponse {
  data: {
    user: User;
  };
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
  status?: string;
  memberships?: {
    division: string;
    role: string;
  }[];
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  role?: string;
}

export interface UpdateUserStatusInput {
  id: string;
  status: 'active' | 'inactive';
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}