import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SaasService {
  constructor(private prisma: PrismaService) {}

  async getAllAdmins() {
    // Retornamos todos los usuarios que son dueños de cuenta (Role ADMIN)
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            loans: true,
            clients: true,
            agents: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return admins;
  }

  async updateUserPlan(userId: number, newPlan: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    
    return this.prisma.user.update({
      where: { id: userId },
      data: { plan: newPlan }
    });
  }
}
