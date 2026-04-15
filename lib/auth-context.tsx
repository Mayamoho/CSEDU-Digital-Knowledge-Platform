"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { apiClient, type User, type AuthTokens, type LoginRequest, type RegisterRequest } from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "csedu_access_token";
const REFRESH_TOKEN_KEY = "csedu_refresh_token";
const TOKEN_EXPIRY_KEY = "csedu_token_expiry";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + tokens.expires_in * 1000));
    apiClient.setAccessToken(tokens.access_token);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    apiClient.setAccessToken(null);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, [clearTokens]);

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      clearTokens();
      setUser(null);
      return;
    }

    try {
      const tokens = await apiClient.refreshToken(refreshToken);
      saveTokens(tokens);
      await loadUser();
    } catch {
      clearTokens();
      setUser(null);
    }
  }, [clearTokens, saveTokens, loadUser]);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      apiClient.setAccessToken(accessToken);

      // Check if token is expired
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        await refreshAuth();
      } else {
        await loadUser();
      }

      setIsLoading(false);
    };

    initAuth();
  }, [loadUser, refreshAuth]);

  // Set up token refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        // Refresh 5 minutes before expiry
        if (Date.now() > expiryTime - 5 * 60 * 1000) {
          refreshAuth();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [refreshAuth]);

  const login = useCallback(async (data: LoginRequest) => {
    const tokens = await apiClient.login(data);
    saveTokens(tokens);
    await loadUser();
  }, [saveTokens, loadUser]);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await apiClient.register(data);
    saveTokens(response.tokens);
    setUser(response.user);
  }, [saveTokens]);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      // Ignore logout errors
    }
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
