import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    userId: number,
    action: string,
    entity: string,
    entityId: number,
    details: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details: JSON.stringify(details),
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
