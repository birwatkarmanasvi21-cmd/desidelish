import prisma from '../config/prisma';

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      }
    });
    
    if (!user) throw new Error('User not found');
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateProfile(userId: string, data: any) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePictureUrl: true
      }
    });
  }

  static async addAddress(userId: string, data: any) {
    // If this is the first address, make it default
    const count = await prisma.address.count({ where: { userId } });
    if (data.isDefault) {
      // Unset previous defaults
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    return prisma.address.create({
      data: {
        ...data,
        userId,
        isDefault: count === 0 || data.isDefault
      }
    });
  }

  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
  }

  static async deleteAddress(userId: string, addressId: string) {
    return prisma.address.delete({
      where: { id: addressId, userId }
    });
  }
}
