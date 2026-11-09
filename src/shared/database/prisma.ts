import { PrismaClient } from '@prisma/client';

// One connection pool shared by all features in this process.
export const prisma = new PrismaClient();
