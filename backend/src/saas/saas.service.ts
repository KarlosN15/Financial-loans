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

  async updateUserPassword(userId: number, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new NotFoundException('La contraseña debe tener al menos 6 caracteres.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: { id: true, name: true, email: true }
    });
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Al borrar el usuario (ADMIN), gracias al onDelete: Cascade en Prisma,
    // se borrarán sus préstamos, clientes, transacciones, etc. automáticamente.
    return this.prisma.user.delete({
      where: { id: userId }
    });
  }
}
