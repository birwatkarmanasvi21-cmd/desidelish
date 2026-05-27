import prisma from '../config/prisma';
import { calculateDistance, estimateDeliveryTime } from '../utils/distance';

export class OrderService {
  static async addToCart(userId: string, menuItemId: string, quantity: number) {
    // Check if item exists
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) throw new Error('Menu item not found');

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, restaurantId: menuItem.restaurantId },
        include: { items: true },
      });
    }

    // Ensure item is from the same restaurant
    if (cart.restaurantId && cart.restaurantId !== menuItem.restaurantId) {
      // If user wants to add from a different restaurant, we could either 
      // error or clear the cart. Let's error for now.
      if (cart.items.length > 0) {
        throw new Error('Cart can only contain items from one restaurant at a time');
      } else {
        // Clear old restaurant reference if cart is empty
        await prisma.cart.update({
          where: { id: cart.id },
          data: { restaurantId: menuItem.restaurantId }
        });
      }
    }

    // Upsert cart item
    return prisma.cartItem.upsert({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        menuItemId,
        quantity,
      },
    });
  }

  static async getCart(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }

  static async placeOrder(userId: string, data: any) {
    const { addressId, paymentMethod = 'CARD' } = data;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: cart.restaurantId! },
    });

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) throw new Error('Delivery address not found');

    // Calculate totals
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      const itemTotal = Number(item.menuItem.price) * item.quantity;
      subtotal += itemTotal;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.menuItem.price,
        totalPrice: itemTotal,
      };
    });

    const deliveryFee = 2.5; // Fixed for now
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + deliveryFee + tax;

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          restaurantId: cart.restaurantId!,
          deliveryAddressId: addressId,
          paymentMethod,
          subtotal,
          deliveryFee,
          tax,
          total,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          restaurantId: null,
          items: { deleteMany: {} },
        },
      });

      return newOrder;
    });

    return order;
  }

  static async getOrderHistory(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        restaurant: { select: { name: true, logoUrl: true } },
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async syncCart(userId: string, items: { menuItemId: string; quantity: number }[]) {
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      let restaurantId: string | null = null;
      if (items.length > 0) {
        const item = await prisma.menuItem.findUnique({ where: { id: items[0].menuItemId } });
        if (item) restaurantId = item.restaurantId;
      }

      cart = await prisma.cart.create({
        data: { userId, restaurantId },
      });
    } else {
      // Clear existing cart items
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      let restaurantId: string | null = null;
      if (items.length > 0) {
        const item = await prisma.menuItem.findUnique({ where: { id: items[0].menuItemId } });
        if (item) restaurantId = item.restaurantId;
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId },
      });
    }

    if (items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map((item) => ({
          cartId: cart.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      });
    }

    return prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });
  }

  static async updateOrderStatus(orderId: string, newStatus: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error('Order not found');

    const currentStatus = order.status;

    if (currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
      throw new Error(`Cannot change status of a completed/cancelled order. Current: ${currentStatus}`);
    }

    if (newStatus === currentStatus) {
      return order;
    }

    let isValid = false;
    if (currentStatus === 'PLACED') {
      isValid = ['PREPARING', 'CANCELLED'].includes(newStatus);
    } else if (currentStatus === 'PREPARING') {
      isValid = ['OUT_FOR_DELIVERY', 'CANCELLED'].includes(newStatus);
    } else if (currentStatus === 'OUT_FOR_DELIVERY') {
      isValid = ['DELIVERED'].includes(newStatus);
    }

    if (!isValid && newStatus !== 'CANCELLED') {
      throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        restaurant: { select: { name: true, logoUrl: true } },
        items: { include: { menuItem: true } },
      },
    });
  }

  static simulateOrderStatusUpdates(orderId: string) {
    console.log(`[Simulator] Starting status simulation for order ${orderId}`);
    
    // Transition to PREPARING after 8 seconds
    setTimeout(async () => {
      try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order && order.status === 'PLACED') {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PREPARING' }
          });
          console.log(`[Simulator] Order ${orderId} transitioned to PREPARING`);
          
          // Transition to OUT_FOR_DELIVERY after another 8 seconds
          setTimeout(async () => {
            try {
              const updatedOrder = await prisma.order.findUnique({ where: { id: orderId } });
              if (updatedOrder && updatedOrder.status === 'PREPARING') {
                await prisma.order.update({
                  where: { id: orderId },
                  data: { status: 'OUT_FOR_DELIVERY' }
                });
                console.log(`[Simulator] Order ${orderId} transitioned to OUT_FOR_DELIVERY`);
                
                // Transition to DELIVERED after another 8 seconds
                setTimeout(async () => {
                  try {
                    const finalOrder = await prisma.order.findUnique({ where: { id: orderId } });
                    if (finalOrder && finalOrder.status === 'OUT_FOR_DELIVERY') {
                      await prisma.order.update({
                        where: { id: orderId },
                        data: { status: 'DELIVERED' }
                      });
                      console.log(`[Simulator] Order ${orderId} transitioned to DELIVERED`);
                    }
                  } catch (err) {
                    console.error('[Simulator Error] Failed transition to DELIVERED:', err);
                  }
                }, 8000);
              }
            } catch (err) {
              console.error('[Simulator Error] Failed transition to OUT_FOR_DELIVERY:', err);
            }
          }, 8000);
        }
      } catch (err) {
        console.error('[Simulator Error] Failed transition to PREPARING:', err);
      }
    }, 8000);
  }
}
