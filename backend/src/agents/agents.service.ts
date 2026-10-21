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
      throw new ConflictException('El plan Prueba no permite crear cobradores. Máximo 1 usuario permitido.');
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
        commissionRate: data.commissionRate ? Number(data.commissionRate) : 0,
        ...(data.branchId && { branchId: data.branchId }),
      },
      select: { id: true, name: true, email: true, role: true, commissionRate: true, createdAt: true, branch: true }
    });
  }

  async findAll(adminId: number) {
    return this.prisma.user.findMany({
      where: { adminId: adminId, role: 'AGENT' },
      select: { id: true, name: true, email: true, role: true, commissionRate: true, createdAt: true, branch: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateCommission(adminId: number, agentId: number, commissionRate: number) {
    return this.prisma.user.updateMany({
      where: { id: agentId, adminId: adminId, role: 'AGENT' },
      data: { commissionRate: Number(commissionRate) }
    });
  }

  async getCommissions(adminId: number) {
    const agents = await this.prisma.user.findMany({
      where: { adminId, role: 'AGENT' },
      select: { id: true, name: true, email: true, commissionRate: true },
    });
    
    const payments = await this.prisma.payment.findMany({
      where: {
        loan: { userId: adminId }
      }
    });

    return agents.map(agent => {
      const agentPayments = payments.filter(p => p.userId === agent.id);
      const totalCollected = agentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const recordedCommission = agentPayments.reduce((sum, p) => sum + Number(p.agentCommission || 0), 0);
      const rate = Number(agent.commissionRate || 0);
      const totalCommission = recordedCommission > 0 ? recordedCommission : Number((totalCollected * (rate / 100)).toFixed(2));
      return {
        ...agent,
        totalPaymentsCount: agentPayments.length,
        totalCollected,
        totalCommission
      };
    });
  }

  async remove(adminId: number, agentId: number) {
    return this.prisma.user.deleteMany({
      where: { id: agentId, adminId: adminId, role: 'AGENT' },
    });
  }
}
