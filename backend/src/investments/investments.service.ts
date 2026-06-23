import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  async create(adminId: number, data: { investorName: string, amount: number, interestRate: number }) {
    return this.prisma.investment.create({
      data: {
        userId: adminId,
        investorName: data.investorName,
        amount: data.amount,
        interestRate: data.interestRate,
      },
    });
  }

  async findAll(adminId: number) {
    return this.prisma.investment.findMany({
      where: { userId: adminId },
      orderBy: { startDate: 'desc' },
    });
  }
}
