import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(adminId: number, data: { amount: number; description: string; status?: 'PAID' | 'PENDING' }) {
    const expense = await this.prisma.expense.create({
      data: {
        userId: adminId,
        amount: data.amount,
        description: data.description,
        status: data.status || 'PAID',
      },
    });

    if (expense.status === 'PAID') {
      const openRegister = await this.prisma.cashRegister.findFirst({
        where: { userId: adminId, status: 'OPEN' }
      });
      if (openRegister) {
        await this.prisma.cashTransaction.create({
          data: {
            cashRegisterId: openRegister.id,
            type: 'EXPENSE',
            amount: data.amount,
            description: `Gasto: ${data.description}`
          }
        });
      }
    }

    return expense;
  }

  async findAll(adminId: number) {
    return this.prisma.expense.findMany({
      where: { userId: adminId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsPaid(adminId: number, id: number) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense || expense.userId !== adminId) {
      throw new NotFoundException('Gasto no encontrado');
    }

    const updated = await this.prisma.expense.update({
      where: { id },
      data: { status: 'PAID', date: new Date() },
    });

    const openRegister = await this.prisma.cashRegister.findFirst({
      where: { userId: adminId, status: 'OPEN' }
    });
    if (openRegister) {
      await this.prisma.cashTransaction.create({
        data: {
          cashRegisterId: openRegister.id,
          type: 'EXPENSE',
          amount: expense.amount,
          description: `Pago de factura: ${expense.description}`
        }
      });
    }

    return updated;
  }
}
