const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "RolePermission" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Permission" CASCADE;`);
    console.log("Tables dropped");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
