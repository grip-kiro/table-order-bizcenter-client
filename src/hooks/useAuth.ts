import { useState, useCallback } from 'react';
import { AdminSession } from '../types';
import { authApi } from '../api';

const STORAGE_KEY = 'bizcenter_session';

export function useAuth() {
  const [session, setSession] = useState<AdminSession | null>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (storeId: string, username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!storeId.trim()) return { success: false, error: '매장 ID를 입력해주세요' };
    if (!username.trim()) return { success: false, error: '사용자명을 입력해주세요' };
    if (!password.trim()) return { success: false, error: '비밀번호를 입력해주세요' };

    try {
      const tokenResponse = await authApi.login(Number(storeId), username, password);
      const s: AdminSession = {
        storeId: Number(storeId),
        adminId: 0,
        username,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        expiresIn: tokenResponse.expiresIn,
      };
      setSession(s);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '로그인에 실패했습니다';
      return { success: false, error: message || '로그인에 실패했습니다' };
    }
  }, []);

  const logout = useCallback(() => {
    const rt = session?.refreshToken;
    if (rt) authApi.logout(rt).catch(() => {});
    setSession(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, [session]);

  return { session, login, logout, isLoggedIn: !!session };
}
