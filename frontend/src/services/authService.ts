import { apiRequest } from './apiClient';
import { ApiResponse, AuthResponse, ForgotPasswordData, LoginData, ResetPasswordData, SignUpData, User } from '../types/auth';

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const res = await apiRequest<ApiResponse<AuthResponse>>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.data?.token) {
      localStorage.setItem('sbg_token', res.data.token);
      localStorage.setItem('sbg_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await apiRequest<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.data?.token) {
      localStorage.setItem('sbg_token', res.data.token);
      localStorage.setItem('sbg_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string; data?: { token?: string; resetUrl?: string } }> {
    const res = await apiRequest<ApiResponse<any>>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      message: res.message || 'Reset link dispatched.',
      data: res.data?.data || res.data,
    };
  },

  async resetPassword(data: ResetPasswordData): Promise<string> {
    const res = await apiRequest<ApiResponse<any>>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.message || 'Password reset successfully.';
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<ApiResponse<string>>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore network logout errors
    } finally {
      localStorage.removeItem('sbg_token');
      localStorage.removeItem('sbg_user');
    }
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('sbg_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('sbg_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('sbg_token');
  }
};
