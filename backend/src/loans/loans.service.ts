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

    // Calcular cuota fija (Amortización francesa)
    const monthlyRate = interestRate / 100;
    const installmentAmount = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    
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

    // Generar cuotas (Simplificado para el ejemplo)
    let currentBalance = amount;
    const installments: Prisma.InstallmentCreateManyInput[] = [];
    for (let i = 1; i <= term; i++) {
       const interest = currentBalance * monthlyRate;
       const capital = installmentAmount - interest;
       currentBalance -= capital;
       
       installments.push({
         loanId: loan.id,
         number: i,
         dueDate: new Date(new Date().setMonth(new Date().getMonth() + i)),
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
    return this.prisma.loan.findMany({ 
      where: { userId: adminId },
      include: { 
        client: true,
        installments: true 
      } 
    });
  }

  async getSummary(user: any) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    const loans = await this.prisma.loan.findMany({
      where: { userId: adminId },
      include: { installments: true, payments: true }
    });

    const totalLent = loans.reduce((acc, curr) => curr.amount + acc, 0);
    const activeLoans = loans.filter((l: any) => l.status === 'ACTIVE').length;
    const arrearsLoans = loans.filter((l: any) => l.status === 'ARREARS').length;
    
    const expectedCollections = loans.reduce((acc, l) => {
      return acc + l.installments.reduce((sum, inst) => sum + (inst.status === 'PENDING' ? inst.amount : 0), 0);
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


