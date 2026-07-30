import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name cannot exceed 50 characters').trim(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain alphanumeric characters, dots, underscores, and hyphens')
      .toLowerCase()
      .trim(),
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    emailOrUsername: z.string().min(1, 'Email or username is required').trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name cannot exceed 50 characters').trim().optional(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain alphanumeric characters, dots, underscores, and hyphens')
      .toLowerCase()
      .trim()
      .optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});
