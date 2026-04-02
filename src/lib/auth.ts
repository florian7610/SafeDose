// src/lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

export interface DecodedToken {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "patient" | "caregiver";
}

/**
 * Decodes and verifies the JWT from the httpOnly cookie.
 * Returns the full payload or null if missing / invalid / expired.
 */
export async function getDecodedToken(): Promise<DecodedToken | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Convenience wrapper — returns only the userId string.
 * Use in patient-facing routes that just need to scope by owner.
 */
export async function getAuthUserId(): Promise<string | null> {
  const decoded = await getDecodedToken();
  return decoded?.userId ?? null;
}

/**
 * Returns the decoded token only when the caller's role matches
 * one of the allowed roles. Returns null otherwise.
 *
 * @example
 * const caller = await requireRole("caregiver", "admin");
 * if (!caller) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
 */
export async function requireRole(
  ...roles: Array<DecodedToken["role"]>
): Promise<DecodedToken | null> {
  const decoded = await getDecodedToken();
  if (!decoded) return null;
  if (!roles.includes(decoded.role)) return null;
  return decoded;
}