import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodhub.com' },
    update: {},
    create: {
      email: 'admin@foodhub.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@pizza.com' },
    update: {},
    create: {
      email: 'owner@pizza.com',
      passwordHash,
      firstName: 'Tony',
      lastName: 'Pizza',
      role: Role.RESTAURANT_OWNER,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: {},
    create: {
      email: 'customer@gmail.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.CUSTOMER,
    },
  });

  // 2. Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Pizza Palace',
      description: 'The best authentic Italian pizzas in town.',
      address: '123 Main St, Tech City',
      city: 'Tech City',
      latitude: 40.7128,
      longitude: -74.006,
      logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      rating: 4.5,
      owners: { connect: { id: owner.id } },
    },
  });

  // 3. Create Categories & Menu Items
  const category = await prisma.menuCategory.create({
    data: {
      name: 'Signature Pizzas',
      restaurantId: restaurant.id,
      menuItems: {
        create: [
          {
            name: 'Margherita',
            description: 'Fresh mozzarella, basil, and tomato sauce.',
            price: 12.99,
            imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca',
          },
          {
            name: 'Pepperoni Feast',
            description: 'Double pepperoni and mozzarella.',
            price: 15.99,
            imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
          },
        ],
      },
    },
  });

  // 4. Create Leftover Deal
  const items = await prisma.menuItem.findMany({ where: { restaurantId: restaurant.id } });
  await prisma.leftoverDeal.create({
    data: {
      restaurantId: restaurant.id,
      menuItemId: items[0].id,
      originalPrice: items[0].price,
      discountPercentage: 50,
      discountedPrice: Number(items[0].price) * 0.5,
      quantityAvailable: 5,
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
