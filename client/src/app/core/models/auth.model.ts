import { AppUser, UserRole } from './user.model';

export interface LoginRequest {
  userId: string;
  password: string;
  role: UserRole;
  delayMs: number;
}

export interface LoginResponse {
  token: string;
  user: AppUser;
}
