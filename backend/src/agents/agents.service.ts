import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  async create(adminId: number, data: any) {
    // Verificar si el email ya existe
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('El correo ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'AGENT',
        adminId: adminId, // Enlazamos el agente a este administrador
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  }

  async findAll(adminId: number) {
    return this.prisma.user.findMany({
      where: { adminId: adminId, role: 'AGENT' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(adminId: number, agentId: number) {
    return this.prisma.user.deleteMany({
      where: { id: agentId, adminId: adminId, role: 'AGENT' },
    });
  }
}
