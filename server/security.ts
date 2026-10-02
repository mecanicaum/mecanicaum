import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { User } from './types';

// Server-side cryptographic secret for HMAC session token signing
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Creates an HMAC-SHA256 cryptographically signed session token
 */
export function signSessionToken(data: { userId: string; email: string; role: string }): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TOKEN_TTL_SECONDS;
  const payload: SessionPayload = {
    userId: data.userId,
    email: data.email,
    role: data.role,
    iat,
    exp,
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadEncoded);
  const signature = hmac.digest('base64url');

  return `sigc.${payloadEncoded}.${signature}`;
}

/**
 * Verifies the authenticity and expiration of an HMAC-SHA256 session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.startsWith('sigc.')) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [, payloadEncoded, signature] = parts;

  // Verify HMAC signature in constant time
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadEncoded);
  const expectedSignature = hmac.digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedSigBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Password Hashing with PBKDF2 and Cryptographic Salt
 */
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

/**
 * Verifies a password against PBKDF2 hash or legacy initial master values
 */
export function verifyPassword(password: string, storedPasswordOrHash: string, salt?: string): boolean {
  if (!password || !storedPasswordOrHash) return false;

  // If salt is present, verify with PBKDF2
  if (salt) {
    const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
    const computedHashBuffer = derivedKey;
    const storedHashBuffer = Buffer.from(storedPasswordOrHash, 'hex');
    if (computedHashBuffer.length !== storedHashBuffer.length) return false;
    return crypto.timingSafeEqual(computedHashBuffer, storedHashBuffer);
  }

  // Fallback for bootstrap passwords (timing-safe comparison)
  const userPassBuffer = Buffer.from(password.trim());
  const storedPassBuffer = Buffer.from(storedPasswordOrHash.trim());
  if (userPassBuffer.length !== storedPassBuffer.length) return false;
  return crypto.timingSafeEqual(userPassBuffer, storedPassBuffer);
}

/**
 * Strips password and sensitive hashes from user representation before sending to client
 */
export function sanitizeUser(user: User): Omit<User, 'password' | 'passwordSalt'> {
  const { password, ...safeUser } = user as any;
  delete safeUser.passwordSalt;
  return safeUser;
}

/**
 * In-Memory Rate Limiter for Login Protection against Brute Force Attacks
 */
interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

function normalizeIp(ip: string): string {
  if (!ip) return '127.0.0.1';
  return ip.replace(/^::ffff:/, '').trim();
}

export function checkLoginRateLimit(ip: string): { isBlocked: boolean; remainingSeconds?: number } {
  const normalized = normalizeIp(ip);
  const now = Date.now();
  const record = loginAttempts.get(normalized);

  if (!record) {
    return { isBlocked: false };
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { isBlocked: true, remainingSeconds };
  }

  // Window reset
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(normalized);
    return { isBlocked: false };
  }

  return { isBlocked: false };
}

export function recordFailedLogin(ip: string): void {
  const normalized = normalizeIp(ip);
  const now = Date.now();
  const record = loginAttempts.get(normalized);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(normalized, {
      attempts: 1,
      firstAttempt: now,
    });
    return;
  }

  record.attempts += 1;
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
  }
}

export function resetLoginRateLimit(ip: string): void {
  loginAttempts.delete(normalizeIp(ip));
}
