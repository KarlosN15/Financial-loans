import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

  async create(user: any, data: { name: string; email?: string; identification: string; phone?: string }) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    return this.prisma.client.create({ 
      data: { ...data, userId: adminId } 
    });
  }

  async findAll(user: any) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    return this.prisma.client.findMany({
      where: { userId: adminId },
      include: {
        loans: {
          include: {
            installments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: any, id: number) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    return this.prisma.client.findFirst({
      where: { id, userId: adminId },
      include: { loans: true },
    });
  }

  async remove(user: any, id: number) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    // Verificamos propiedad antes de borrar
    return this.prisma.client.deleteMany({
      where: { id, userId: adminId },
    });
  }
}
