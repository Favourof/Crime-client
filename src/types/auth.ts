export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface AuthResponse {
  message: string;
  data: AuthPayload;
}
