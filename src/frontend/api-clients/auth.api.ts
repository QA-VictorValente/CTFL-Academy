import { apiFetch } from './client';

export interface AuthUserResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    totalXp: number;
    currentStreak: number;
  };
}

export async function loginUser(email: string, password: string): Promise<AuthUserResponse> {
  return apiFetch<AuthUserResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthUserResponse> {
  return apiFetch<AuthUserResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}

export async function getMe(): Promise<AuthUserResponse> {
  return apiFetch<AuthUserResponse>('/api/auth/me');
}
