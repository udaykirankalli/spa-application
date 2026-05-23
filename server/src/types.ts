export type UserRole = 'General User' | 'Admin';
export type AccountStatus = 'Active' | 'Disabled';

export interface StoredUser {
  id: string;
  userId: string;
  displayName: string;
  department: string;
  role: UserRole;
  password: string;
  status: AccountStatus;
  accessLevel: string;
}

export interface PublicUser {
  id: string;
  userId: string;
  displayName: string;
  department: string;
  role: UserRole;
  status: AccountStatus;
  accessLevel: string;
}

export interface WorkRecord {
  id: string;
  ownerUserId: string;
  customer: string;
  region: string;
  category: string;
  amount: number;
  risk: 'Low' | 'Medium' | 'High';
  status: string;
}

export interface SessionEntry {
  token: string;
  userId: string;
  createdAt: string;
}

export interface LocalDatabase {
  sessions: SessionEntry[];
  users: StoredUser[];
  records: WorkRecord[];
}
