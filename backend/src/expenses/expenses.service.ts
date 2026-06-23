import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(adminId: number, data: { amount: number, description: string, status?: 'PAID' | 'PENDING' }) {
    return this.prisma.expense.create({
      data: {
        userId: adminId,
        amount: data.amount,
        description: data.description,
        status: data.status || 'PAID',
      },
    });
  }

  async findAll(adminId: number) {
    return this.prisma.expense.findMany({
      where: { userId: adminId },
      orderBy: { date: 'desc' },
    });
  }

  async markAsPaid(adminId: number, id: number) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense || expense.userId !== adminId) {
      throw new NotFoundException('Gasto no encontrado');
    }

    return this.prisma.expense.update({
      where: { id },
      data: { status: 'PAID' },
    });
  }
}
