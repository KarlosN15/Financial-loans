import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, data: { loanId: number; amount: number; method: PaymentMethod; isInterestOnly?: boolean; notes?: string }) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    const isRedito = Boolean(data.isInterestOnly);
    
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
          clientName: loan.client.name,
          userId: user.userId,
          isInterestOnly: isRedito,
          notes: data.notes || (isRedito ? 'Pago de Rédito (Solo Interés)' : null)
        }
      });

      const pendingInstallments = await tx.installment.findMany({
        where: { loanId: data.loanId, status: 'PENDING' },
        orderBy: { number: 'asc' },
      });

      if (isRedito) {
        // En pago de Rédito (Solo Interés):
        // 1. El capital adeudado se mantiene intacto.
        // 2. Se renuevan las fechas de vencimiento de las cuotas pendientes para el siguiente ciclo.
        const ratePerPeriod = (loan.frequency === 'MONTHLY' ? Number(loan.interestRate) : Number(loan.interestRate) / 4) / 100;
        const singlePeriodInterest = pendingInstallments[0] 
          ? Number(pendingInstallments[0].interest) 
          : (Number(loan.amount) * ratePerPeriod);

        const periodsPaid = singlePeriodInterest > 0 
          ? Math.max(1, Math.round(data.amount / singlePeriodInterest)) 
          : 1;

        for (const inst of pendingInstallments) {
          const newDueDate = new Date(inst.dueDate);
          if (loan.frequency === 'MONTHLY') {
            newDueDate.setMonth(newDueDate.getMonth() + periodsPaid);
          } else {
            newDueDate.setDate(newDueDate.getDate() + (7 * periodsPaid));
          }

          await tx.installment.update({
            where: { id: inst.id },
            data: { dueDate: newDueDate }
          });
        }

        // Si el préstamo estaba en mora, al pagar el rédito pasa a estar al día (ACTIVE)
        if (loan.status === 'ARREARS') {
          await tx.loan.update({
            where: { id: data.loanId },
            data: { status: 'ACTIVE' }
          });
        }
      } else {
        // Amortización regular de cuotas
        let remainingAmount = data.amount;

        for (const inst of pendingInstallments) {
          const amount = Number(inst.amount);
          const paidAmount = Number(inst.paidAmount);
          const needed = amount - paidAmount;
          
          if (remainingAmount <= 0) break;

          if (remainingAmount >= needed) {
            await tx.installment.update({
              where: { id: inst.id },
              data: { 
                paidAmount: amount, // Se paga completo
                status: 'PAID' 
              },
            });
            remainingAmount -= needed;
          } else {
            await tx.installment.update({
              where: { id: inst.id },
              data: { 
                paidAmount: paidAmount + remainingAmount 
              },
            });
            remainingAmount = 0;
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
      }

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          user: true,
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
        user: true,
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
