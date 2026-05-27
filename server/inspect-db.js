const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: { name: true, cuisine: true }
    });
    console.log(JSON.stringify(restaurants, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
