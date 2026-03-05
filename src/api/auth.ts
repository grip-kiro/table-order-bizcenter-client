import { api } from './client';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authApi = {
  login: (storeId: number, username: string, password: string) =>
    api.post<TokenResponse>('/api/auth/admin/login', { storeId, username, password }, true),

  refresh: (refreshToken: string) =>
    api.post<TokenResponse>('/api/auth/refresh', { refreshToken }, true),

  logout: (refreshToken: string) => api.post<void>('/api/auth/logout', { refreshToken }, true),
};
