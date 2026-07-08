const TOKEN_KEY = "finsight_token";

interface JwtPayload {
    exp?: number;
    [key: string]: unknown;
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

export function getTokenPayload(token: string): JwtPayload | null {
    const parts = token.split(".");

    if (parts.length !== 3) {
        return null;
    }

    try {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const paddedBase64 = base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            "="
        );

        const jsonPayload = atob(paddedBase64);
        return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
        return null;
    }
}

export function getTokenExpirationTime(token: string): number | null {
    const payload = getTokenPayload(token);

    if (!payload?.exp) {
        return null;
    }

    return payload.exp * 1000;
}

export function isTokenExpired(token: string): boolean {
    const expirationTime = getTokenExpirationTime(token);

    if (!expirationTime) {
        return true;
    }

    return Date.now() >= expirationTime;
}

export function getMillisecondsUntilTokenExpires(token: string): number {
    const expirationTime = getTokenExpirationTime(token);

    if (!expirationTime) {
        return 0;
    }

    return Math.max(expirationTime - Date.now(), 0);
}