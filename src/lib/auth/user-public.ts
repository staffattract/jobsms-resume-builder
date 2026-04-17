import type { User } from "@/generated/prisma/client";

export type PublicUser = Pick<User, "id" | "email" | "name" | "createdAt" | "updatedAt">;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
