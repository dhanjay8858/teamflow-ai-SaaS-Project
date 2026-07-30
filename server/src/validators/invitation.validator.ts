import { z } from 'zod';
import { MembershipRole } from '../types/organization.types.js';

export const createInvitationSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1, 'Workspace ID is required'),
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    role: z.nativeEnum(MembershipRole).optional(),
  }),
});

export const invitationTokenParamSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Invitation token is required'),
  }),
});

export const invitationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invitation ID is required'),
  }),
});
