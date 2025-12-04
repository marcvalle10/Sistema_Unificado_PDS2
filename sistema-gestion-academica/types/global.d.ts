// types/global.d.ts
declare global {
  var prisma: import('@prisma/client').PrismaClient | undefined;
}

export {};