import { PrismaClient } from '@prisma/client'

// Next.js dev-mode hot reload re-evaluates this module on every edit; without
// caching the instance on `globalThis`, each reload opens a fresh pool of
// connections to Postgres until the limit is exhausted.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
