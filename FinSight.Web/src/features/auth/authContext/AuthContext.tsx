import React from "react";
import { configureUnauthorizedHandler } from "../../../lib/apiClient";
import {
    clearToken,
    getMillisecondsUntilTokenExpires,
    getToken,
    isTokenExpired,
    saveToken
} from "../../../lib/tokenStorage";

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

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

function getRoleFromToken(token: string | null): UserRole | null {
    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1])) as Record<string, string>;

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
    const [token, setToken] = React.useState<string | null>(() => {
        const storedToken = getToken();

        if (!storedToken || isTokenExpired(storedToken)) {
            clearToken();
            return null;
        }

        return storedToken;
    });

    const role = React.useMemo(() => getRoleFromToken(token), [token]);

    const logoutUser = React.useCallback(() => {
        clearToken();
        setToken(null);
    }, []);

    const loginUser = React.useCallback((newToken: string) => {
        saveToken(newToken);
        setToken(newToken);
    }, []);

    const hasRole = React.useCallback(
        (allowedRoles: UserRole[]) => {
            return Boolean(role && allowedRoles.includes(role));
        },
        [role]
    );

    React.useEffect(() => {
        configureUnauthorizedHandler(logoutUser);

        return () => {
            configureUnauthorizedHandler(null);
        };
    }, [logoutUser]);

    React.useEffect(() => {
        if (!token) {
            return;
        }

        if (isTokenExpired(token)) {
            logoutUser();
            return;
        }

        const millisecondsUntilExpiration = getMillisecondsUntilTokenExpires(token);

        const timeoutId = window.setTimeout(() => {
            logoutUser();
        }, millisecondsUntilExpiration);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [token, logoutUser]);

    React.useEffect(() => {
        if (!token) {
            return;
        }

        let idleTimeoutId: number | undefined;

        function resetIdleTimer() {
            if (idleTimeoutId) {
                window.clearTimeout(idleTimeoutId);
            }

            idleTimeoutId = window.setTimeout(() => {
                logoutUser();
            }, IDLE_TIMEOUT_MS);
        }

        const activityEvents = [
            "click",
            "keydown",
            "mousemove",
            "scroll",
            "touchstart"
        ];

        activityEvents.forEach((eventName) => {
            window.addEventListener(eventName, resetIdleTimer);
        });

        resetIdleTimer();

        return () => {
            if (idleTimeoutId) {
                window.clearTimeout(idleTimeoutId);
            }

            activityEvents.forEach((eventName) => {
                window.removeEventListener(eventName, resetIdleTimer);
            });
        };
    }, [token, logoutUser]);

    const value: AuthContextValue = {
        token,
        role,
        isAuthenticated: Boolean(token),
        loginUser,
        logoutUser,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return context;
}