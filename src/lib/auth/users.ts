import { Prisma } from "@/generated/prisma/client";
import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Create a user with a bcrypt password hash (for credential-based sign-up). */
export async function createUserWithCredentials(input: {
  email: string;
  password: string;
  name?: string | null;
}): Promise<User> {
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.length ? input.name : null,
    },
  });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
}

/** Validate email + password against stored `User.passwordHash`. */
export async function authenticateUserCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }
  const ok = await verifyPassword(password, user.passwordHash ?? null);
  return ok ? user : null;
}

export function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
