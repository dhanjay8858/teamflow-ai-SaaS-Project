export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  provider: string;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  avatarFile?: File;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthApiResponse<T = { user: User; accessToken: string }> {
  success: boolean;
  message: string;
  data: T;
}
