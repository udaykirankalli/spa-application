import { AccountStatus, UserRole } from './types';

export const allowedRoles: UserRole[] = ['General User', 'Admin'];
export const allowedStatuses: AccountStatus[] = ['Active', 'Disabled'];

export function isUserRole(value: unknown): value is UserRole {
  return allowedRoles.includes(value as UserRole);
}

export function isAccountStatus(value: unknown): value is AccountStatus {
  return allowedStatuses.includes(value as AccountStatus);
}

export function readRequiredText(payload: Record<string, unknown>, fieldName: string): string | null {
  const value = payload[fieldName];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function readOptionalText(payload: Record<string, unknown>, fieldName: string): string | undefined {
  const value = payload[fieldName];
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
