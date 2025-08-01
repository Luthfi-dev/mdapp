
'use client';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

export interface User {
    id: number;
    name: string;
    email: string;
    role: number;
    avatar?: string;
    phone?: string;
    points?: number;
    referralCode?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean | undefined;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{success: boolean, message: string}>;
    register: (data: any) => Promise<{success: boolean, message: string}>;
    logout: () => Promise<void>;
    fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
    updateUser: (newUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return Date.now() >= decoded.exp * 1000;
  } catch (err) {
    return true;
  }
};

let accessToken: string | null = null;

const getAccessToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return accessToken;
};

const setAccessToken = (token: string | null) => {
    accessToken = token;
    if (typeof window !== 'undefined') {
        if(token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const logout = useCallback(async () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
        await fetch('/api/auth/logout', { method: 'POST' });
    }, []);

    const silentRefresh = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/refresh', { method: 'POST' });
            if (!res.ok) throw new Error('Refresh failed');
            
            const data = await res.json();
            if (data.success && data.accessToken) {
                setAccessToken(data.accessToken);
                const decodedUser: User = jwtDecode(data.accessToken);
                setUser(decodedUser);
                setIsAuthenticated(true);
                return data.accessToken;
            }
            throw new Error('Refresh token invalid');
        } catch (error) {
            console.error('Silent refresh failed:', error);
            await logout();
            return null;
        }
    }, [logout]);

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        let token = getAccessToken();
        
        if (token && isTokenExpired(token)) {
            token = await silentRefresh();
        }

        if (!token) {
            logout(); // Force logout if no token is available after refresh attempt
            router.push('/account'); // Redirect to login
            throw new Error('Not authenticated');
        }

        const headers = new Headers(options.headers || {});
        headers.set('Authorization', `Bearer ${token}`);
        if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            await logout();
            router.push('/account');
        }

        return response;
    }, [silentRefresh, logout, router]);

    const initializeAuth = useCallback(async () => {
        const storedToken = getAccessToken();
        if (storedToken) {
            if (!isTokenExpired(storedToken)) {
                setAccessToken(storedToken);
                const decodedUser: User = jwtDecode(storedToken);
                setUser(decodedUser);
                setIsAuthenticated(true);
            } else {
                await silentRefresh();
            }
        } else {
            setIsAuthenticated(false);
        }
    }, [silentRefresh]);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success && data.accessToken) {
                setAccessToken(data.accessToken);
                const decodedUser: User = jwtDecode(data.accessToken);
                setUser(decodedUser);
                setIsAuthenticated(true);
            }
            return data;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: any) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await res.json();
        } finally {
            setIsLoading(false);
        }
    };
    
    const updateUser = (newUser: User) => {
        setUser(newUser);
        // Regenerate token with new user data to keep session consistent
        // This is a client-side update for immediate UI changes.
        // The real token will be updated on the next refresh.
        const currentToken = getAccessToken();
        if(currentToken) {
            const decoded: any = jwtDecode(currentToken);
            const updatedPayload = { ...decoded, ...newUser };
            // Note: This does not generate a new valid JWT, it's just for state consistency.
            // The next fetchWithAuth will handle getting a new valid token if needed.
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, fetchWithAuth, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
