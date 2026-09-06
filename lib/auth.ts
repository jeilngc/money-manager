import { cookies } from "next/headers";
import type { Env } from "./cloudflare";
import { id, now } from "./utils";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/** PBKDF2-SHA256 password hashing using Web Crypto — works on the edge runtime (no native bindings like bcrypt needs). */
export async function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? hexToBuf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return { hash: bufToHex(bits), salt: bufToHex(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const attempt = await hashPassword(password, salt);
  return attempt.hash === hash;
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function createSession(db: Env["DB"], userId: string): Promise<string> {
  const sessionId = id();
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(sessionId, userId, now() + SESSION_TTL_MS, now())
    .run();
  return sessionId;
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}

export async function getSessionUser(db: Env["DB"]): Promise<SessionUser | null> {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const row = await db
    .prepare(
      `SELECT u.id as id, u.email as email, u.first_name as first_name, u.last_name as last_name, s.expires_at as expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .bind(sessionId)
    .first<{ id: string; email: string; first_name: string; last_name: string; expires_at: number }>();

  if (!row || row.expires_at < now()) return null;
  return { id: row.id, email: row.email, firstName: row.first_name, lastName: row.last_name };
}

export async function deleteSession(db: Env["DB"]) {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) return;
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}
