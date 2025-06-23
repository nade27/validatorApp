import React from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const user = JSON.parse(jsonPayload);

    if (allowedRoles.includes(user.role)) {
      return <>{children}</>;
    } else {
      // Redirect unauthorized users to their dashboard or login
      if (user.role === "User") {
        return <Navigate to="/dashboarduser" replace />;
      }
      return <Navigate to="/auth/login" replace />;
    }
  } catch (error) {
    return <Navigate to="/auth/login" replace />;
  }
};

export default ProtectedRoute;
