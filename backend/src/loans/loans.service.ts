import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentFrequency, Prisma } from '@prisma/client';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async createLoan(user: any, data: { 
    clientId: number; 
    amount: number; 
    interestRate: number; 
    term: number; 
    frequency: PaymentFrequency 
  }) {
    const { clientId, amount, interestRate, term, frequency } = data;
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    
    // Verificar que el cliente pertenece al admin corporativo
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, userId: adminId }
    });
    if (!client) throw new Error('Cliente no encontrado o no pertenece a esta cuenta');

    // Ajustar tasa y períodos según la frecuencia
    const ratePerPeriod = (frequency === 'MONTHLY' ? interestRate : interestRate / 4) / 100;
    
    // Calcular cuota fija (Amortización francesa)
    const installmentAmount = amount * (ratePerPeriod * Math.pow(1 + ratePerPeriod, term)) / (Math.pow(1 + ratePerPeriod, term) - 1);
    
    // Crear el préstamo siempre vinculado al administrador de la cartera
    const loan = await this.prisma.loan.create({
      data: {
        userId: adminId,
        clientId,
        amount,
        interestRate,
        term,
        frequency,
      },
    });

    // Generar cuotas dinámicas
    let currentBalance = amount;
    const installments: Prisma.InstallmentCreateManyInput[] = [];
    for (let i = 1; i <= term; i++) {
       const interest = currentBalance * ratePerPeriod;
       const capital = installmentAmount - interest;
       currentBalance -= capital;
       
       const dueDate = new Date();
       if (frequency === 'MONTHLY') {
         dueDate.setMonth(dueDate.getMonth() + i);
       } else {
         dueDate.setDate(dueDate.getDate() + (i * 7));
       }

       installments.push({
         loanId: loan.id,
         number: i,
         dueDate,
         amount: installmentAmount,
         capital,
         interest,
         balance: Math.max(0, currentBalance),
         status: 'PENDING',
       });
    }

    await this.prisma.installment.createMany({ data: installments });

    return this.prisma.loan.findFirst({
      where: { id: loan.id, userId: adminId },
      include: { installments: true },
    });
  }

  async findAll(user: any) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    
    // Antes de listar, actualizamos estados de mora
    await this.refreshLoanStatuses(adminId);

    return this.prisma.loan.findMany({ 
      where: { userId: adminId },
      include: { 
        client: true,
        installments: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async refreshLoanStatuses(adminId: number) {
    const now = new Date();
    
    // Buscar todos los préstamos activos que tienen cuotas vencidas
    const loansWithOverdue = await this.prisma.loan.findMany({
        where: { userId: adminId, status: 'ACTIVE' },
        include: { 
            installments: { 
                where: { status: 'PENDING', dueDate: { lt: now } } 
            }
        }
    });

    for (const loan of loansWithOverdue) {
        if (loan.installments.length > 0) {
            await this.prisma.loan.update({
                where: { id: loan.id },
                data: { status: 'ARREARS' }
            });
        }
    }

    // Y viceversa (volver a ACTIVE si ya no hay vencidas)
    const arrearsLoans = await this.prisma.loan.findMany({
        where: { userId: adminId, status: 'ARREARS' },
        include: { 
            installments: { 
                where: { status: 'PENDING', dueDate: { lt: now } } 
            }
        }
    });

    for (const loan of arrearsLoans) {
        if (loan.installments.length === 0) {
            await this.prisma.loan.update({
                where: { id: loan.id },
                data: { status: 'ACTIVE' }
            });
        }
    }
  }

  async getSummary(user: any) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    
    // Actualizamos estados antes de dar el resumen
    await this.refreshLoanStatuses(adminId);

    const loans = await this.prisma.loan.findMany({
      where: { userId: adminId },
      include: { installments: true, payments: true }
    });

    const totalLent = loans.reduce((acc, curr) => curr.amount + acc, 0);
    const activeLoans = loans.filter((l: any) => l.status === 'ACTIVE').length;
    const arrearsLoans = loans.filter((l: any) => l.status === 'ARREARS').length;
    
    const expectedCollections = loans.reduce((acc, l) => {
      return acc + l.installments.reduce((sum, inst) => sum + (inst.status === 'PENDING' ? (inst.amount - inst.paidAmount) : 0), 0);
    }, 0);

    const totalCollected = loans.reduce((acc, l) => {
      return acc + (l.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);
    }, 0);

    return {
      totalLent,
      activeLoans,
      arrearsLoans,
      expectedCollections,
      totalCollected
    };
  }

  async remove(user: any, id: number) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    return this.prisma.loan.deleteMany({ 
      where: { id, userId: adminId } 
    });
  }
}


