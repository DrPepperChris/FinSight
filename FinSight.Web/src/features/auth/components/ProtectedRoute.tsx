import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "../authContext/AuthContext";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}