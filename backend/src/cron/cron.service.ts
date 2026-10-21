import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOverdueInstallments() {
    this.logger.debug('Running midnight cron to check for overdue installments...');
    
    const now = new Date();
    
    // Find installments that are PENDING and dueDate is in the past
    const overdueInstallments = await this.prisma.installment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: now,
        },
        loan: {
          status: 'ACTIVE',
        }
      },
      include: {
        loan: true,
      }
    });

    if (overdueInstallments.length > 0) {
      this.logger.debug(`Found ${overdueInstallments.length} overdue installments.`);
      
      for (const inst of overdueInstallments) {
        const graceDays = inst.loan.graceDays || 0;
        const cutoffDate = new Date(inst.dueDate);
        cutoffDate.setDate(cutoffDate.getDate() + graceDays);

        // Solo marcar en mora si ya sobrepasó los días de gracia
        if (now > cutoffDate) {
          await this.prisma.loan.update({
            where: { id: inst.loanId },
            data: { status: 'ARREARS' },
          });

          await this.audit.logAction(
            inst.loan.userId,
            'MARK_LOAN_ARREARS',
            'Loan',
            inst.loanId,
            { installmentId: inst.id, dueDate: inst.dueDate, graceDays }
          );
        }
      }
      
      this.logger.debug('Successfully updated loans to ARREARS status respecting grace periods.');
    } else {
      this.logger.debug('No overdue installments found.');
    }
  }
}
