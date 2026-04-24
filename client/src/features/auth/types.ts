export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  roles: string[];
  memberships: {
    role: string;
    division: Division | null;
  }[];
}

export interface Division {
  _id: string;
  name: string;
  description: string;
}