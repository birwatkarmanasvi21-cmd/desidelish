const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name = 'restaurants'");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
