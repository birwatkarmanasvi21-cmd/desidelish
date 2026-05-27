import prisma from '../config/prisma';
import crypto from 'crypto';

export class GroupOrderService {
  static async createGroup(userId: string, restaurantId: string) {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 char code
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours expiry

    return prisma.groupOrder.create({
      data: {
        code,
        creatorId: userId,
        restaurantId,
        expiresAt,
        members: {
          create: { userId }
        }
      },
      include: {
        members: true
      }
    });
  }

  static async joinGroup(userId: string, code: string) {
    const group = await prisma.groupOrder.findUnique({
      where: { code },
      include: { members: true }
    });

    if (!group) throw new Error('Group not found');
    if (group.expiresAt < new Date()) throw new Error('Group has expired');

    // Check if user is already a member
    const isMember = group.members.some(m => m.userId === userId);
    if (isMember) return group;

    return prisma.groupMember.create({
      data: {
        groupOrderId: group.id,
        userId
      }
    });
  }

  static async addMemberItem(userId: string, groupId: string, menuItemId: string, quantity: number) {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupOrderId_userId: {
          groupOrderId: groupId,
          userId
        }
      }
    });

    if (!member) throw new Error('You are not a member of this group');

    return prisma.groupItem.create({
      data: {
        groupMemberId: member.id,
        menuItemId,
        quantity
      }
    });
  }

  static async getGroupDetails(id: string) {
    const group = await prisma.groupOrder.findUnique({
      where: { id },
      include: {
        restaurant: { select: { name: true } },
        members: {
          include: {
            user: { select: { firstName: true, email: true } },
            items: { include: { menuItem: true } }
          }
        }
      }
    });

    if (!group) throw new Error('Group not found');

    // Calculate totals
    let total = 0;
    const memberTotals = group.members.map(member => {
      const memberSubtotal = member.items.reduce((acc, item) => {
        return acc + (Number(item.menuItem.price) * item.quantity);
      }, 0);
      total += memberSubtotal;
      return {
        memberId: member.id,
        name: member.user.firstName,
        subtotal: memberSubtotal
      };
    });

    return {
      ...group,
      total,
      memberTotals
    };
  }
}
