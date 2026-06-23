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

    // Verificar límites del plan
    const adminUser = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!adminUser) throw new UnauthorizedException('Admin no encontrado');
    
    if (adminUser.plan === 'inicio') {
      throw new ConflictException('El plan Inicio no permite crear cobradores. Máximo 1 usuario permitido.');
    }
    
    if (adminUser.plan === 'estandar') {
      const currentAgents = await this.prisma.user.count({ where: { adminId } });
      if (currentAgents >= 1) {
        throw new ConflictException('Límite alcanzado: El plan Estándar permite un máximo de 1 cobrador adicional.');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'AGENT',
        adminId: adminId, // Enlazamos el agente a este administrador
        ...(data.branchId && { branchId: data.branchId }),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true, branch: true }
    });
  }

  async findAll(adminId: number) {
    return this.prisma.user.findMany({
      where: { adminId: adminId, role: 'AGENT' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, branch: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(adminId: number, agentId: number) {
    return this.prisma.user.deleteMany({
      where: { id: agentId, adminId: adminId, role: 'AGENT' },
    });
  }
}
