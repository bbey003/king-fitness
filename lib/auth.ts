import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { sessionRepo } from './repos/sessions';
import { userRepo } from './repos/users';
import { adminRoleRepo } from './repos/misc';
import type { User, PublicUser, UserRole } from './types';

export const SESSION_COOKIE = 'kf_session';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export async function setSessionCookie(token: string, expiresAt: string): Promise<void> {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const sess = await sessionRepo.findByToken(token);
  if (!sess) return null;
  const user = await userRepo.findById(sess.user_id);
  if (!user) return null;
  if (user.status === 'suspended') return null;
  return user;
}

export function publicUser(u: User): PublicUser {
  const { password_hash: _omit, ...rest } = u;
  return rest;
}

export interface AuthorizedUser {
  user: User;
  effectiveRole: UserRole;
  isAdmin: boolean;
  isProvider: boolean;
}

export async function getAuthorizedUser(): Promise<AuthorizedUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const adminRole = await adminRoleRepo.getRole(user.id);
  const isAdmin = user.role === 'admin' || user.role === 'super_admin' || adminRole !== null;
  const isProvider = user.role === 'provider' || isAdmin;
  return { user, effectiveRole: user.role, isAdmin, isProvider };
}

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError('UNAUTHORIZED', 'Not signed in', 401);
  return u;
}

export async function requireAdmin(): Promise<User> {
  const auth = await getAuthorizedUser();
  if (!auth) throw new AuthError('UNAUTHORIZED', 'Not signed in', 401);
  if (!auth.isAdmin) throw new AuthError('FORBIDDEN', 'Admin only', 403);
  return auth.user;
}

export async function requireProvider(): Promise<User> {
  const auth = await getAuthorizedUser();
  if (!auth) throw new AuthError('UNAUTHORIZED', 'Not signed in', 401);
  if (!auth.isProvider) throw new AuthError('FORBIDDEN', 'Provider only', 403);
  return auth.user;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
  }
}
