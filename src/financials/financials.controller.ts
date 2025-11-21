import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinancialsService } from './financials.service';
import { PaymentsService } from './payments.service';
import { RevenuesService } from './revenues.service';
import { ExpensesService } from './expenses.service';
import { FeeStructuresService } from './fee-structures.service';
import { BudgetsService } from './budgets.service';
import { RefundsService } from './refunds.service';
import { InvoicesService } from './invoices.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { QueryFinancialsDto } from './dto/query-financials.dto';

@ApiTags('Financials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financials')
export class FinancialsController {
  constructor(
    private readonly financialsService: FinancialsService,
    private readonly paymentsService: PaymentsService,
    private readonly revenuesService: RevenuesService,
    private readonly expensesService: ExpensesService,
    private readonly feeStructuresService: FeeStructuresService,
    private readonly budgetsService: BudgetsService,
    private readonly refundsService: RefundsService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get financial dashboard stats' })
  getDashboardStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.getDashboardStats(
      req.user.schoolId,
      startDate,
      endDate,
    );
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get financial analytics' })
  getAnalytics(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financialsService.getAnalytics(
      req.user.schoolId,
      startDate,
      endDate,
    );
  }

  // Payments endpoints
  @Post('payments')
  @ApiOperation({ summary: 'Create a payment' })
  createPayment(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.schoolId, createPaymentDto);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments' })
  findAllPayments(@Request() req: any, @Query() query: QueryFinancialsDto) {
    return this.paymentsService.findAll(req.user.schoolId, query);
  }

  @Get('payments/stats')
  @ApiOperation({ summary: 'Get payment statistics' })
  getPaymentStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getStats(req.user.schoolId, startDate, endDate);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  findOnePayment(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch('payments/:id/status')
  @ApiOperation({ summary: 'Update payment status' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.paymentsService.updateStatus(id, status, req.user.id);
  }

  // Revenue endpoints
  @Post('revenues')
  @ApiOperation({ summary: 'Create revenue' })
  createRevenue(
    @Request() req: any,
    @Body() createRevenueDto: CreateRevenueDto,
  ) {
    return this.revenuesService.create(
      req.user.schoolId,
      req.user.id,
      createRevenueDto,
    );
  }

  @Get('revenues')
  @ApiOperation({ summary: 'Get all revenues' })
  findAllRevenues(@Request() req: any, @Query() query: QueryFinancialsDto) {
    return this.revenuesService.findAll(req.user.schoolId, query);
  }

  @Get('revenues/:id')
  @ApiOperation({ summary: 'Get revenue by ID' })
  findOneRevenue(@Param('id') id: string) {
    return this.revenuesService.findOne(id);
  }

  // Expense endpoints
  @Post('expenses')
  @ApiOperation({ summary: 'Create expense' })
  createExpense(
    @Request() req: any,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(
      req.user.schoolId,
      req.user.id,
      createExpenseDto,
    );
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Get all expenses' })
  findAllExpenses(@Request() req: any, @Query() query: QueryFinancialsDto) {
    return this.expensesService.findAll(req.user.schoolId, query);
  }

  @Get('expenses/:id')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOneExpense(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch('expenses/:id/approve')
  @ApiOperation({ summary: 'Approve expense' })
  approveExpense(@Param('id') id: string, @Request() req: any) {
    return this.expensesService.approve(id, req.user.id);
  }

  @Patch('expenses/:id/reject')
  @ApiOperation({ summary: 'Reject expense' })
  rejectExpense(@Param('id') id: string, @Request() req: any) {
    return this.expensesService.reject(id, req.user.id);
  }

  // Fee Structure endpoints
  @Post('fee-structures')
  @ApiOperation({ summary: 'Create fee structure' })
  createFeeStructure(
    @Request() req: any,
    @Body() createFeeStructureDto: CreateFeeStructureDto,
  ) {
    return this.feeStructuresService.create(
      req.user.schoolId,
      createFeeStructureDto,
    );
  }

  @Get('fee-structures')
  @ApiOperation({ summary: 'Get all fee structures' })
  findAllFeeStructures(
    @Request() req: any,
    @Query('academicYear') academicYear?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.feeStructuresService.findAll(
      req.user.schoolId,
      academicYear,
      isActive === 'true',
    );
  }

  @Get('fee-structures/:id')
  @ApiOperation({ summary: 'Get fee structure by ID' })
  findOneFeeStructure(@Param('id') id: string) {
    return this.feeStructuresService.findOne(id);
  }

  @Patch('fee-structures/:id')
  @ApiOperation({ summary: 'Update fee structure' })
  updateFeeStructure(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateFeeStructureDto>,
  ) {
    return this.feeStructuresService.update(id, updateData);
  }

  @Delete('fee-structures/:id')
  @ApiOperation({ summary: 'Delete fee structure' })
  removeFeeStructure(@Param('id') id: string) {
    return this.feeStructuresService.remove(id);
  }

  // Budget endpoints
  @Post('budgets')
  @ApiOperation({ summary: 'Create budget' })
  createBudget(@Request() req: any, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.schoolId, createBudgetDto);
  }

  @Get('budgets')
  @ApiOperation({ summary: 'Get all budgets' })
  findAllBudgets(
    @Request() req: any,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.budgetsService.findAll(req.user.schoolId, academicYear);
  }

  @Get('budgets/vs-actual')
  @ApiOperation({ summary: 'Get budget vs actual comparison' })
  getBudgetVsActual(
    @Request() req: any,
    @Query('academicYear') academicYear: string,
  ) {
    return this.budgetsService.getBudgetVsActual(req.user.schoolId, academicYear);
  }

  @Get('budgets/:id')
  @ApiOperation({ summary: 'Get budget by ID' })
  findOneBudget(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  // Refund endpoints
  @Post('refunds')
  @ApiOperation({ summary: 'Request refund' })
  createRefund(@Request() req: any, @Body() createRefundDto: CreateRefundDto) {
    return this.refundsService.create(req.user.id, createRefundDto);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Get all refunds' })
  findAllRefunds(
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    return this.refundsService.findAll(req.user.schoolId, status);
  }

  @Patch('refunds/:id/approve')
  @ApiOperation({ summary: 'Approve refund' })
  approveRefund(@Param('id') id: string, @Request() req: any) {
    return this.refundsService.approve(id, req.user.id);
  }

  @Patch('refunds/:id/process')
  @ApiOperation({ summary: 'Process refund' })
  processRefund(@Param('id') id: string) {
    return this.refundsService.process(id);
  }

  // Invoice endpoints
  @Post('invoices')
  @ApiOperation({ summary: 'Generate invoice' })
  generateInvoice(
    @Request() req: any,
    @Body('studentId') studentId: string,
    @Body('feeStructureId') feeStructureId: string,
  ) {
    return this.invoicesService.generateInvoice(
      req.user.schoolId,
      studentId,
      feeStructureId,
    );
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  findAllInvoices(
    @Request() req: any,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    return this.invoicesService.findAll(req.user.schoolId, studentId, status);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOneInvoice(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }
}

