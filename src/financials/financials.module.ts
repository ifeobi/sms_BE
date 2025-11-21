import { Module } from '@nestjs/common';
import { FinancialsController } from './financials.controller';
import { FinancialsService } from './financials.service';
import { PaymentsService } from './payments.service';
import { RevenuesService } from './revenues.service';
import { ExpensesService } from './expenses.service';
import { FeeStructuresService } from './fee-structures.service';
import { BudgetsService } from './budgets.service';
import { RefundsService } from './refunds.service';
import { InvoicesService } from './invoices.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialsController],
  providers: [
    FinancialsService,
    PaymentsService,
    RevenuesService,
    ExpensesService,
    FeeStructuresService,
    BudgetsService,
    RefundsService,
    InvoicesService,
  ],
  exports: [
    FinancialsService,
    PaymentsService,
    RevenuesService,
    ExpensesService,
    FeeStructuresService,
    BudgetsService,
    RefundsService,
    InvoicesService,
  ],
})
export class FinancialsModule {}

