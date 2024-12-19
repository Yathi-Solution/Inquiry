"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: number;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }

    if (!isLoading && requiredRole && user?.role_id !== requiredRole) {
      router.push('/unauthorized');
      return;
    }
  }, [isLoading, token, user, requiredRole, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!token) {
    return null;
  }

  if (requiredRole && user?.role_id !== requiredRole) {
    return null;
  }

  return <>{children}</>;
} 