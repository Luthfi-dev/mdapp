
'use client';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: number;
    name: string;
    email: string;
    role: number;
    avatar?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean | undefined;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{success: boolean, message: string}>;
    register: (data: any) => Promise<{success: boolean, message: string}>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A utility to check if a token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return Date.now() >= decoded.exp * 1000;
  } catch (err) {
    return true;
  }
};

let accessToken: string | null = null;
const getAccessToken = () => accessToken;

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

    const silentRefresh = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/refresh', {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Refresh failed');
            
            const data = await res.json();
            setAccessToken(data.accessToken);
            const decodedUser: User = jwtDecode(data.accessToken);
            setUser(decodedUser);
            setIsAuthenticated(true);
            return data.accessToken;
        } catch (error) {
            console.error('Silent refresh failed:', error);
            await logout(); // Logout if refresh fails
            return null;
        }
    }, []);

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        let token = getAccessToken();
        
        if (token && isTokenExpired(token)) {
            token = await silentRefresh();
        }

        if (!token) {
            throw new Error('Not authenticated');
        }

        const headers = new Headers(options.headers || {});
        headers.set('Authorization', `Bearer ${token}`);
        options.headers = headers;

        return fetch(url, options);
    }, [silentRefresh]);


    const initializeAuth = useCallback(async () => {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken && !isTokenExpired(storedToken)) {
            setAccessToken(storedToken);
            const decodedUser: User = jwtDecode(storedToken);
            setUser(decodedUser);
            setIsAuthenticated(true);
        } else if (storedToken) {
            // Token is expired, try to refresh it
            await silentRefresh();
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

    const logout = async () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
        await fetch('/api/auth/logout', { method: 'POST' });
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
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
