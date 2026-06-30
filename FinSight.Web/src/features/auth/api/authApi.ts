import { apiClient } from "../../../lib/apiClient";
import type { LoginRequest, LoginResponse } from "../types/authTypes";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  console.log("Sending login request:", request);

  const response = await apiClient.post<LoginResponse>("/api/Auth/login", {
    userNameOrEmail: request.userNameOrEmail,
    password: request.password
  });

  return response.data;
}