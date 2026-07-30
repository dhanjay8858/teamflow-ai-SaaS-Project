import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Max 20 auth attempts per IP per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    timestamp: new Date().toISOString(),
  },
});

export const fileUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30, // Max 30 file uploads per IP per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'File upload rate limit exceeded. Please wait before uploading more files.',
    timestamp: new Date().toISOString(),
  },
});

export const commentCreationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 60, // Max 60 comments per IP per 5 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Comment creation rate limit exceeded. Please slow down.',
    timestamp: new Date().toISOString(),
  },
});

export const taskCreationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100, // Max 100 tasks per IP per 10 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Task creation rate limit exceeded.',
    timestamp: new Date().toISOString(),
  },
});

export const organizationCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5, // Max 5 organizations per IP per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Organization creation rate limit exceeded.',
    timestamp: new Date().toISOString(),
  },
});

export const invitationSendingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20, // Max 20 invitations per IP per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Invitation sending rate limit exceeded.',
    timestamp: new Date().toISOString(),
  },
});
