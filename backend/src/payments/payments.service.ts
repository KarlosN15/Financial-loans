import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, data: { 
    loanId: number; 
    amount: number; 
    method: PaymentMethod; 
    isInterestOnly?: boolean; 
    notes?: string;
    latitude?: number;
    longitude?: number;
    lateFeePaid?: number;
  }) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    const isRedito = Boolean(data.isInterestOnly);
    
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({
        where: { id: data.loanId, userId: adminId },
        include: { client: true }
      });
      if (!loan) throw new Error('Préstamo no encontrado o no autorizado');

      const pendingInstallments = await tx.installment.findMany({
        where: { loanId: data.loanId, status: 'PENDING' },
        orderBy: { number: 'asc' },
      });

      let finalNotes = data.notes;

      if (isRedito) {
        // En pago de Rédito y Capital (Interés Periódico + Abonos al Capital):
        let ratePerPeriod = 0;
        if (loan.frequency === 'MONTHLY') {
          ratePerPeriod = Number(loan.interestRate) / 100;
        } else if (loan.frequency === 'BIWEEKLY') {
          ratePerPeriod = (Number(loan.interestRate) / 2) / 100;
        } else {
          ratePerPeriod = (Number(loan.interestRate) / 4) / 100;
        }

        const targetInst = pendingInstallments[0];
        const currentCapital = targetInst ? Number(targetInst.capital) : Number(loan.amount);
        const singlePeriodInterest = targetInst && Number(targetInst.interest) > 0
          ? Number(targetInst.interest)
          : (currentCapital * ratePerPeriod);

        let interestPaid = 0;
        let capitalAbono = 0;

        if (singlePeriodInterest <= 0) {
          capitalAbono = data.amount;
        } else if (data.amount <= singlePeriodInterest) {
          // El pago cubre hasta el rédito de 1 período
          interestPaid = data.amount;
          capitalAbono = 0;
        } else {
          // El cliente cubre el rédito del período + excedente como abono a capital
          // (ej: si son 500 de rédito y el cliente paga 1000, 500 van a rédito y 500 van a capital)
          interestPaid = singlePeriodInterest;
          capitalAbono = data.amount - singlePeriodInterest;
        }

        const coversFullInterestCycle = singlePeriodInterest > 0 && data.amount >= singlePeriodInterest;
        const newCapital = Math.max(0, currentCapital - capitalAbono);
        const nextPeriodInterest = Number((newCapital * ratePerPeriod).toFixed(2));

        if (targetInst) {
          const newDueDate = new Date(targetInst.dueDate);
          if (coversFullInterestCycle) {
            if (loan.frequency === 'MONTHLY') {
              newDueDate.setMonth(newDueDate.getMonth() + 1);
            } else if (loan.frequency === 'BIWEEKLY') {
              newDueDate.setDate(newDueDate.getDate() + 15);
            } else {
              newDueDate.setDate(newDueDate.getDate() + 7);
            }
          }

          if (newCapital <= 0) {
            // Préstamo completamente saldado
            await tx.installment.update({
              where: { id: targetInst.id },
              data: {
                dueDate: newDueDate,
                capital: 0,
                interest: 0,
                amount: 0,
                balance: 0,
                paidAmount: Number(targetInst.amount),
                status: 'PAID'
              }
            });

            await tx.loan.update({
              where: { id: data.loanId },
              data: {
                amount: 0,
                status: 'COMPLETED'
              }
            });
          } else {
            // Queda capital pendiente: actualizamos capital, cuota y renovamos ciclo
            await tx.installment.update({
              where: { id: targetInst.id },
              data: {
                dueDate: coversFullInterestCycle ? newDueDate : targetInst.dueDate,
                capital: newCapital,
                interest: nextPeriodInterest,
                amount: newCapital + nextPeriodInterest,
                balance: newCapital,
              }
            });

            await tx.loan.update({
              where: { id: data.loanId },
              data: {
                amount: newCapital,
                status: 'ACTIVE'
              }
            });
          }
        }

        if (!finalNotes) {
          if (capitalAbono > 0) {
            finalNotes = `Pago de Rédito (RD$ ${interestPaid.toFixed(2)}) + Abono a Capital (RD$ ${capitalAbono.toFixed(2)}). Nuevo Capital: RD$ ${newCapital.toFixed(2)}`;
          } else {
            finalNotes = `Pago de Rédito (${coversFullInterestCycle ? '1 ciclo' : 'parcial'}): RD$ ${data.amount.toFixed(2)}`;
          }
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

      // Calcular comisión del agente si aplica
      let agentCommission = 0;
      if (user.role === 'AGENT') {
        const agentUser = await tx.user.findUnique({ where: { id: user.userId } });
        const commRate = agentUser?.commissionRate ? Number(agentUser.commissionRate) : 0;
        if (commRate > 0) {
          agentCommission = Number((data.amount * (commRate / 100)).toFixed(2));
        }
      }

      const payment = await tx.payment.create({
        data: {
          loanId: data.loanId,
          amount: data.amount,
          method: data.method,
          clientName: loan.client.name,
          userId: user.userId,
          isInterestOnly: isRedito,
          notes: finalNotes || (isRedito ? 'Pago de Rédito y Capital' : 'Cobro de Cuota Regular'),
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          lateFeePaid: data.lateFeePaid || 0,
          agentCommission: agentCommission,
        }
      });

      // Actualizar Scoring y Rating del Cliente automáticamente
      const allClientLoans = await tx.loan.findMany({
        where: { clientId: loan.clientId },
        include: { installments: true }
      });
      let totalInst = 0;
      let lateInst = 0;
      const now = new Date();
      allClientLoans.forEach(l => {
        l.installments.forEach(inst => {
          totalInst++;
          if (inst.status === 'PENDING' && new Date(inst.dueDate) < now) {
            lateInst++;
          }
        });
      });
      const score = totalInst === 0 ? 100 : Math.max(10, Math.min(100, Math.round(((totalInst - lateInst) / totalInst) * 100)));
      const rating = score >= 90 ? 'EXCELLENT' : score >= 70 ? 'REGULAR' : 'RISKY';
      await tx.client.update({
        where: { id: loan.clientId },
        data: { score, rating }
      });

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
