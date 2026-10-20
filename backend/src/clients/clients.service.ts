import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

  async create(user: any, data: { 
    name: string; 
    email?: string; 
    identification?: string; 
    phone?: string; 
    address?: string; 
    guarantorName?: string; 
    guarantorPhone?: string; 
    routeId?: number;
    cedulaFrontUrl?: string;
    cedulaBackUrl?: string;
    guarantorDocUrl?: string;
  }) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    const identification = data.identification?.trim() ? data.identification.trim() : null;
    return this.prisma.client.create({ 
      data: { 
        ...data, 
        identification,
        userId: adminId,
        score: 100,
        rating: 'EXCELLENT'
      } 
    });
  }

  async update(user: any, id: number, data: any) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    return this.prisma.client.updateMany({
      where: { id, userId: adminId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.identification !== undefined && { identification: data.identification?.trim() || null }),
        ...(data.guarantorName !== undefined && { guarantorName: data.guarantorName }),
        ...(data.guarantorPhone !== undefined && { guarantorPhone: data.guarantorPhone }),
        ...(data.cedulaFrontUrl !== undefined && { cedulaFrontUrl: data.cedulaFrontUrl }),
        ...(data.cedulaBackUrl !== undefined && { cedulaBackUrl: data.cedulaBackUrl }),
        ...(data.guarantorDocUrl !== undefined && { guarantorDocUrl: data.guarantorDocUrl }),
        ...(data.routeId !== undefined && { routeId: data.routeId }),
      }
    });
  }

  async findAll(user: any) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    const clients = await this.prisma.client.findMany({
      where: { userId: adminId },
      include: {
        route: true,
        loans: {
          include: {
            installments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    return clients.map(client => {
      let totalInst = 0;
      let lateInst = 0;
      client.loans.forEach(loan => {
        loan.installments.forEach(inst => {
          totalInst++;
          if (inst.status === 'PENDING' && new Date(inst.dueDate) < now) {
            lateInst++;
          }
        });
      });
      const calculatedScore = totalInst === 0 ? (client.score || 100) : Math.max(10, Math.min(100, Math.round(((totalInst - lateInst) / totalInst) * 100)));
      const calculatedRating = calculatedScore >= 90 ? 'EXCELLENT' : calculatedScore >= 70 ? 'REGULAR' : 'RISKY';
      return {
        ...client,
        score: calculatedScore,
        rating: calculatedRating,
      };
    });
  }

  async findOne(user: any, id: number) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    const client = await this.prisma.client.findFirst({
      where: { id, userId: adminId },
      include: { 
        loans: {
          include: {
            installments: true,
            payments: true
          }
        }, 
        route: true 
      },
    });

    if (!client) return null;

    let totalInst = 0;
    let lateInst = 0;
    const now = new Date();
    client.loans.forEach(loan => {
      loan.installments.forEach(inst => {
        totalInst++;
        if (inst.status === 'PENDING' && new Date(inst.dueDate) < now) {
          lateInst++;
        }
      });
    });
    const calculatedScore = totalInst === 0 ? (client.score || 100) : Math.max(10, Math.min(100, Math.round(((totalInst - lateInst) / totalInst) * 100)));
    const calculatedRating = calculatedScore >= 90 ? 'EXCELLENT' : calculatedScore >= 70 ? 'REGULAR' : 'RISKY';

    return {
      ...client,
      score: calculatedScore,
      rating: calculatedRating,
    };
  }

  async remove(user: any, id: number) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    return this.prisma.client.deleteMany({
      where: { id, userId: adminId },
    });
  }
}
