"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/auth/roles";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRoles?: Role[];
};

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkAuth, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuth();
      
      if (!isValid) {
        router.push("/");
        return;
      }
      
      // Check role-based access if roles are specified
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = hasAnyRole(requiredRoles);
        if (!hasRequiredRole) {
          // Redirect to dashboard or home if user doesn't have required role
          router.push("/admin/dashboard");
        }
      }
    };

    verifyAuth();
  }, [checkAuth, router, requiredRoles, hasAnyRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles))) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
}