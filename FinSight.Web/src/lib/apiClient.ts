import axios from "axios";
import { env } from "../config/env";
import { clearToken, getToken, isTokenExpired } from "./tokenStorage";

let unauthorizedHandler: (() => void) | null = null;

export function configureUnauthorizedHandler(handler: (() => void) | null) {
    unauthorizedHandler = handler;
}

export const apiClient = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
        "Content-Type": "application/json"
    }
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();

    if (!token) {
        return config;
    }

    if (isTokenExpired(token)) {
        clearToken();
        unauthorizedHandler?.();
        return config;
    }

    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            clearToken();
            unauthorizedHandler?.();
        }

        return Promise.reject(error);
    }
);