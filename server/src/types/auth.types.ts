import { Document, Types } from 'mongoose';

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  provider: string;
  isEmailVerified: boolean;
  refreshToken?: string | null;
  lastOrganization?: Types.ObjectId | null;
  lastWorkspace?: Types.ObjectId | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface SanitizedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  provider: string;
  isEmailVerified: boolean;
  lastOrganization?: string | null;
  lastWorkspace?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtAccessPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  userId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
