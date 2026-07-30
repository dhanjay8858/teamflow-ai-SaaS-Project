import { CookieOptions } from 'express';
import { env } from './env.config.js';

export const REFRESH_COOKIE_NAME = 'teamflow_rt';
export const ACCESS_COOKIE_NAME = 'teamflow_at';

/**
 * Returns cookie options appropriate for the current environment.
 *
 * Production (Vercel → Render cross-origin):
 *   - secure: true        — Required: HTTPS-only cookies
 *   - sameSite: 'none'    — Required: cross-site requests between different domains
 *   - httpOnly: true      — Prevents JavaScript access (XSS protection)
 *
 * Development (localhost):
 *   - secure: false       — HTTP allowed
 *   - sameSite: 'lax'     — Same-origin default, adequate for localhost
 *
 * NOTE: sameSite:'none' REQUIRES secure:true — browsers reject sameSite:none without it.
 */
export const getCookieOptions = (isRefresh = false): CookieOptions => {
  const isProduction = env.NODE_ENV === 'production';
  const maxAge = isRefresh
    ? 7 * 24 * 60 * 60 * 1000  // 7 days for refresh token
    : 15 * 60 * 1000;           // 15 minutes for access token

  return {
    httpOnly: true,
    secure: isProduction,                          // true in production (HTTPS required)
    sameSite: isProduction ? 'none' : 'lax',       // 'none' enables cross-origin cookies
    path: isRefresh ? '/api/v1/auth/refresh' : '/',
    maxAge,
  };
};

