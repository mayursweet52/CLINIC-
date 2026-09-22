const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, name: true } });
    console.log("=== DB USERS ===");
    console.table(users);
  } catch (e) {
    console.log("No DB connection or table missing:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
