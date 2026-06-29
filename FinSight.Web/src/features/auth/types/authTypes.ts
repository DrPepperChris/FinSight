export interface LoginRequest {
  userNameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  userName?: string;
  email?: string;
  role?: string;
}