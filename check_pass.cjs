const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function run() {
  const users = await p.user.findMany({
    select: { email: true, passwordHash: true, role: true }
  });
  
  console.log("=== DB Password Hashes ===");
  for (const u of users) {
    const isSimple = u.passwordHash === 'hashed_password_123';
    const bcryptMatch = u.passwordHash && u.passwordHash.startsWith('$2') 
      ? await bcrypt.compare('password123', u.passwordHash) 
      : false;
    console.log(`${u.email} [${u.role}]`);
    console.log(`  hash: ${u.passwordHash ? u.passwordHash.substring(0, 40) : 'NULL'}...`);
    console.log(`  isSimpleSeed: ${isSimple}, bcrypt_password123: ${bcryptMatch}`);
    console.log('');
  }
  p.$disconnect();
}
run();
