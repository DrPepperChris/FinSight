import React from "react";
import { clearToken, getToken, saveToken } from "../../../lib/tokenStorage";

export type UserRole = "Admin" | "Auditor" | "Analyst";

interface AuthContextValue {
    token: string | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    loginUser: (token: string) => void;
    logoutUser: () => void;
    hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

function getRoleFromToken(token: string | null): UserRole | null {
    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1])) as Record<string, unknown>;

        const role =
            payload.role ??
            payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];

        if (role === "Admin" || role === "Auditor" || role === "Analyst") {
            return role;
        }

        return null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = React.useState<string | null>(() => getToken());

    const role = React.useMemo(() => getRoleFromToken(token), [token]);

    function loginUser(newToken: string) {
        saveToken(newToken);
        setToken(newToken);
    }

    function logoutUser() {
        clearToken();
        setToken(null);
    }

    function hasRole(allowedRoles: UserRole[]) {
        return Boolean(role && allowedRoles.includes(role));
    }

    const value: AuthContextValue = {
        token,
        role,
        isAuthenticated: Boolean(token),
        loginUser,
        logoutUser,
        hasRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = React.useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return context;
}