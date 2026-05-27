const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const restaurants = await prisma.restaurant.count();
  const menuItems = await prisma.menuItem.count();
  const deals = await prisma.leftoverDeal.count();
  console.log('STATS:', { restaurants, menuItems, deals });
  process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
