import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, data: { loanId: number; amount: number; method: PaymentMethod }) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({
        where: { id: data.loanId, userId: adminId },
        include: { client: true }
      });
      if (!loan) throw new Error('Préstamo no encontrado o no autorizado');

      const payment = await tx.payment.create({
        data: {
          loanId: data.loanId,
          amount: data.amount,
          method: data.method,
          clientName: loan.client.name
        }
      });
      // ... logic for installments remains same since it's inside tx and loan is checked
      let remainingAmount = data.amount;
      const pendingInstallments = await tx.installment.findMany({
        where: { loanId: data.loanId, status: 'PENDING' },
        orderBy: { number: 'asc' },
      });

      for (const inst of pendingInstallments) {
        if (remainingAmount >= inst.amount) {
          await tx.installment.update({
            where: { id: inst.id },
            data: { status: 'PAID' },
          });
          remainingAmount -= inst.amount;
        } else {
          break;
        }
      }

      const stillPending = await tx.installment.findFirst({
        where: { loanId: data.loanId, status: 'PENDING' }
      });

      if (!stillPending) {
        await tx.loan.update({
          where: { id: data.loanId },
          data: { status: 'COMPLETED' }
        });
      }

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          loan: {
            include: {
              client: true,
              installments: true,
              payments: true
            }
          }
        }
      });
    });
  }

  async findAll(user: any) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    return this.prisma.payment.findMany({
      where: {
        loan: { userId: adminId }
      },
      include: {
        loan: {
          include: { client: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getUpcoming(user: any) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    const now = new Date();
    const in30days = new Date();
    in30days.setDate(now.getDate() + 30);

    return this.prisma.installment.findMany({
      where: {
        status: 'PENDING',
        dueDate: { lte: in30days },
        loan: { userId: adminId }
      },
      include: {
        loan: {
          include: { client: true }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });
  }
}
