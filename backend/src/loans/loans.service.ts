import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentFrequency, Prisma } from '@prisma/client';

import { CreateLoanDto } from './dto/create-loan.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createLoan(user: any, data: CreateLoanDto) {
    const { clientId, amount, interestRate, term, frequency, bankAccountId, loanType, interestType } = data;
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    
    // Verificar límites del plan
    const adminUser = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!adminUser) throw new UnauthorizedException('Admin no encontrado');

    if (adminUser.plan === 'inicio') {
      const currentLoans = await this.prisma.loan.count({ where: { userId: adminId } });
      if (currentLoans >= 3) {
        throw new ConflictException('Límite alcanzado: El plan Prueba permite un máximo de 3 préstamos.');
      }
    } else if (adminUser.plan === 'estandar') {
      const currentLoans = await this.prisma.loan.count({ where: { userId: adminId } });
      if (currentLoans >= 50) {
        throw new ConflictException('Límite alcanzado: El plan Estándar permite un máximo de 50 préstamos.');
      }
    }
    
    // Verificar que el cliente pertenece al admin corporativo
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, userId: adminId }
    });
    if (!client) throw new NotFoundException('Cliente no encontrado o no pertenece a esta cuenta');

    // Verificar liquidez en la cuenta bancaria de origen
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId: adminId }
    });
    if (!bankAccount) throw new NotFoundException('Cuenta de fondeo no encontrada');
    if (Number(bankAccount.balance) < amount) {
      throw new BadRequestException(`Fondos insuficientes. La cuenta tiene RD$ ${Number(bankAccount.balance)} pero el desembolso es de RD$ ${amount}.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Ajustar tasa y períodos según la frecuencia (Mensual: 1, Quincenal: 2, Semanal: 4 cuotas/mes)
      let ratePerPeriod = 0;
      if (frequency === 'MONTHLY') {
        ratePerPeriod = interestRate / 100;
      } else if (frequency === 'BIWEEKLY') {
        ratePerPeriod = (interestRate / 2) / 100;
      } else {
        ratePerPeriod = (interestRate / 4) / 100;
      }
      
      // Modo Solo Rédito (Tiempo abierto / Solo pago de intereses periódicos)
      const isRedito = loanType === 'REDITO';
      const effectiveTerm = isRedito 
        ? 1 
        : (term && Number(term) > 0 
            ? Number(term) 
            : (frequency === 'WEEKLY' ? 4 : frequency === 'BIWEEKLY' ? 2 : 1));
      
      // Crear el préstamo siempre vinculado al administrador de la cartera
      const loan = await tx.loan.create({
        data: {
          userId: adminId,
          clientId,
          amount,
          interestRate,
          term: effectiveTerm,
          frequency,
          lateFeeType: data.lateFeeType || 'PERCENT',
          lateFeeValue: data.lateFeeValue || 0,
          graceDays: data.graceDays !== undefined ? data.graceDays : 2,
        },
      });

      // Generar cuotas dinámicas según modalidad
      const installments: Prisma.InstallmentCreateManyInput[] = [];

      if (isRedito) {
        // En Solo Rédito: 1 cuota representativa del ciclo con su interés y capital intacto
        const perInterest = amount * ratePerPeriod;
        const dueDate = new Date();
        if (frequency === 'MONTHLY') {
          dueDate.setMonth(dueDate.getMonth() + 1);
        } else if (frequency === 'BIWEEKLY') {
          dueDate.setDate(dueDate.getDate() + 15);
        } else {
          dueDate.setDate(dueDate.getDate() + 7);
        }

        installments.push({
          loanId: loan.id,
          number: 1,
          dueDate,
          amount: amount + perInterest,
          capital: amount,
          interest: perInterest,
          balance: amount,
          status: 'PENDING',
        });
      } else if (interestType === 'FRENCH') {
        // Amortización francesa decreciente
        const installmentAmount = ratePerPeriod === 0 
          ? amount / effectiveTerm 
          : amount * (ratePerPeriod * Math.pow(1 + ratePerPeriod, effectiveTerm)) / (Math.pow(1 + ratePerPeriod, effectiveTerm) - 1);

        let currentBalance = amount;
        for (let i = 1; i <= effectiveTerm; i++) {
          const interest = currentBalance * ratePerPeriod;
          const capital = installmentAmount - interest;
          currentBalance -= capital;
          
          const dueDate = new Date();
          if (frequency === 'MONTHLY') {
            dueDate.setMonth(dueDate.getMonth() + i);
          } else if (frequency === 'BIWEEKLY') {
            dueDate.setDate(dueDate.getDate() + (i * 15));
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
      } else {
        // Interés Simple / Directo (Práctica estándar informal y callejera)
        const durationInMonths = frequency === 'WEEKLY' ? effectiveTerm / 4 : frequency === 'BIWEEKLY' ? effectiveTerm / 2 : effectiveTerm;
        const totalInterest = amount * (interestRate / 100) * durationInMonths;
        const totalCredit = amount + totalInterest;
        const installmentAmount = totalCredit / effectiveTerm;
        const capitalPerInstallment = amount / effectiveTerm;
        const interestPerInstallment = totalInterest / effectiveTerm;

        let currentBalance = amount;
        for (let i = 1; i <= effectiveTerm; i++) {
          currentBalance -= capitalPerInstallment;
          
          const dueDate = new Date();
          if (frequency === 'MONTHLY') {
            dueDate.setMonth(dueDate.getMonth() + i);
          } else if (frequency === 'BIWEEKLY') {
            dueDate.setDate(dueDate.getDate() + (i * 15));
          } else {
            dueDate.setDate(dueDate.getDate() + (i * 7));
          }

          installments.push({
            loanId: loan.id,
            number: i,
            dueDate,
            amount: installmentAmount,
            capital: capitalPerInstallment,
            interest: interestPerInstallment,
            balance: Math.max(0, currentBalance),
            status: 'PENDING',
          });
        }
      }

      await tx.installment.createMany({ data: installments });

      // Descontar fondos y crear transacción
      await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { decrement: amount } }
      });

      await tx.bankTransaction.create({
        data: {
          bankAccountId: bankAccountId,
          type: 'EXPENSE',
          amount: amount,
          description: `Desembolso de Préstamo PR-${loan.id.toString().padStart(4, '0')} para ${client.name}`
        }
      });

      const createdLoan = await tx.loan.findFirst({
        where: { id: loan.id, userId: adminId },
        include: { installments: true },
      });

      await this.audit.logAction(adminId, 'CREATE_LOAN', 'Loan', loan.id, {
        amount,
        clientId,
        term: effectiveTerm,
        frequency,
        loanType
      });

      return createdLoan;
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

    const totalLent = loans.reduce((acc, curr) => Number(curr.amount) + acc, 0);
    const activeLoans = loans.filter((l: any) => l.status === 'ACTIVE').length;
    const arrearsLoans = loans.filter((l: any) => l.status === 'ARREARS').length;
    
    const expectedCollections = loans.reduce((acc, l) => {
      return acc + l.installments.reduce((sum, inst) => sum + (inst.status === 'PENDING' ? (Number(inst.amount) - Number(inst.paidAmount)) : 0), 0);
    }, 0);

    const totalCollected = loans.reduce((acc, l) => {
      return acc + (l.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0);
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
    if (user.role === 'AGENT') {
      throw new UnauthorizedException('Solo los administradores pueden eliminar préstamos.');
    }
    const adminId = user.userId;
    const loan = await this.prisma.loan.findFirst({
      where: { id, userId: adminId },
      include: { payments: true }
    });

    if (!loan) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    if (loan.payments.length > 0) {
      throw new BadRequestException('No es posible eliminar un préstamo que ya cuenta con pagos registrados. Utilice la opción de refinanciamiento o márquelo como completado.');
    }

    await this.prisma.loan.delete({ where: { id } });
    await this.audit.logAction(adminId, 'DELETE_LOAN', 'Loan', id, {
      amount: Number(loan.amount),
      clientId: loan.clientId
    });

    return { message: 'Préstamo eliminado exitosamente.' };
  }

  async refinanceLoan(user: any, loanId: number, data: { newAmount?: number; interestRate: number; term: number; frequency: PaymentFrequency }) {
    const adminId = user.role === 'AGENT' ? user.adminId : user.userId;
    
    return this.prisma.$transaction(async (tx) => {
      const oldLoan = await tx.loan.findFirst({
        where: { id: loanId, userId: adminId },
        include: { installments: true, client: true }
      });
      if (!oldLoan) throw new NotFoundException('Préstamo a refinanciar no encontrado');

      // Calcular deuda pendiente real
      const pendingBalance = oldLoan.installments.reduce((acc, inst) => {
        return acc + (inst.status === 'PENDING' ? (Number(inst.amount) - Number(inst.paidAmount)) : 0);
      }, 0);

      const principalAmount = data.newAmount && data.newAmount > 0 ? data.newAmount : (pendingBalance > 0 ? pendingBalance : Number(oldLoan.amount));

      // 1. Cerrar cuotas del préstamo anterior y marcarlo como completado/refinanciado
      await tx.installment.updateMany({
        where: { loanId: oldLoan.id, status: 'PENDING' },
        data: { status: 'PAID' }
      });
      await tx.loan.update({
        where: { id: oldLoan.id },
        data: { status: 'COMPLETED', isRefinanced: true }
      });

      // 2. Crear nuevo préstamo refinanciado
      let ratePerPeriod = 0;
      if (data.frequency === 'MONTHLY') ratePerPeriod = data.interestRate / 100;
      else if (data.frequency === 'BIWEEKLY') ratePerPeriod = (data.interestRate / 2) / 100;
      else ratePerPeriod = (data.interestRate / 4) / 100;

      const newLoan = await tx.loan.create({
        data: {
          userId: adminId,
          clientId: oldLoan.clientId,
          amount: principalAmount,
          interestRate: data.interestRate,
          term: data.term,
          frequency: data.frequency,
          isRefinanced: true,
          refinancedFromId: oldLoan.id,
        }
      });

      // 3. Generar cuotas amortizables
      const installments: Prisma.InstallmentCreateManyInput[] = [];
      const capitalPerInstallment = principalAmount / data.term;
      const interestPerInstallment = principalAmount * ratePerPeriod;
      const installmentAmount = capitalPerInstallment + interestPerInstallment;

      let currentDate = new Date();
      for (let i = 1; i <= data.term; i++) {
        const dueDate = new Date(currentDate);
        if (data.frequency === 'MONTHLY') dueDate.setMonth(dueDate.getMonth() + i);
        else if (data.frequency === 'BIWEEKLY') dueDate.setDate(dueDate.getDate() + (i * 15));
        else dueDate.setDate(dueDate.getDate() + (i * 7));

        installments.push({
          loanId: newLoan.id,
          number: i,
          dueDate,
          amount: installmentAmount,
          capital: capitalPerInstallment,
          interest: interestPerInstallment,
          balance: principalAmount - (capitalPerInstallment * (i - 1)),
          paidAmount: 0,
          status: 'PENDING'
        });
      }

      await tx.installment.createMany({ data: installments });

      const refinancedLoan = await tx.loan.findUnique({
        where: { id: newLoan.id },
        include: { client: true, installments: true }
      });

      await this.audit.logAction(adminId, 'REFINANCE_LOAN', 'Loan', newLoan.id, {
        previousLoanId: oldLoan.id,
        newAmount: principalAmount,
      });

      return refinancedLoan;
    });
  }
}


