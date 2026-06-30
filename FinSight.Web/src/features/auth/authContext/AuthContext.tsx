import React from "react";
import { clearToken, getToken, saveToken } from "../../../lib/tokenStorage";

interface AuthContextValue {
    token: string | null;
    isAuthenticated: boolean;
    loginUser: (token: string) => void;
    logoutUser: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = React.useState<string | null>(() => getToken());

    function loginUser(newToken: string) {
        saveToken(newToken);
        setToken(newToken);
    }

    function logoutUser() {
        clearToken();
        setToken(null);
    }

    const value: AuthContextValue = {
        token,
        isAuthenticated: Boolean(token),
        loginUser,
        logoutUser
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