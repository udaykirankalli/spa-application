export type UserRole = 'General User' | 'Admin';
export type AccountStatus = 'Active' | 'Disabled';

export interface AppUser {
  id: string;
  userId: string;
  displayName: string;
  department: string;
  role: UserRole;
  status: AccountStatus;
  accessLevel: string;
}

export interface CreateUserRequest {
  userId: string;
  displayName: string;
  department: string;
  role: UserRole;
  password: string;
  status: AccountStatus;
  accessLevel: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  department?: string;
  role?: UserRole;
  password?: string;
  status?: AccountStatus;
  accessLevel?: string;
}
