import { z } from 'zod';

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters long').max(50).trim(),
    slug: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
      .toLowerCase()
      .trim(),
    description: z.string().max(200).optional(),
    logo: z.string().url().optional().or(z.literal('')),
  }),
});

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).trim().optional(),
    description: z.string().max(200).optional(),
    logo: z.string().url().optional().or(z.literal('')),
  }),
});
