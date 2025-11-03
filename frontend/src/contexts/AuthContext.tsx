"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { ROLES } from "@/auth/roles";

type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  studentId?: string | null;
  department?: string | null;
  branch?: string | null;
  year?: string | null;
  avatarUrl?: string | null;
};

type Role = 'admin' | 'staff' | 'student';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setUser(null);
      return false;
    }
    
    try {
      const res = await API.get(`/auth/me?_t=${Date.now()}`);
    setUser(res.data.user);
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem("token");
    setUser(null);
    return false;
    }
  };

  const login = async (email: string, password: string, role: Role) => {
    setIsLoading(true);
    
    try {
      const endpoint = `/auth/${role}/login`;
      const res = await API.post<{ token: string; user: User }>(endpoint, {
        email,
        password
      });

      localStorage.setItem('token', res.data.token);
      
      setUser(res.data.user);

      router.push(`/${role}/dashboard`);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  const hasRole = (role: string): boolean => {
    return user ? user.roles.includes(role) : false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.some(role => user.roles.includes(role)) : false;
  };

  const isAdmin = hasRole(ROLES.ADMIN);
  const isStaff = hasRole(ROLES.STAFF);
  const isStudent = hasRole(ROLES.STUDENT);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
        hasRole,
        hasAnyRole,
        isAdmin,
        isStaff,
        isStudent
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