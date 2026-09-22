const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({
  select: { email: true, role: true, name: true },
  take: 15
}).then(users => {
  console.log(JSON.stringify(users, null, 2));
  p.$disconnect();
});
