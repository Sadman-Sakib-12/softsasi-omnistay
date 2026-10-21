import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  HRM_REPOSITORY_TOKEN,
  type IHrmRepository,
} from '../../domain/repositories/hrm.repository.interface.js';
import { calculatePayrollSalary } from '../../domain/rules/hrm.rule.js';
import type {
  CreateServiceChargePoolDto,
  RunMonthlyPayrollDto,
  SetSalaryDto,
} from '../../presentation/dto/payroll.dto.js';

@Injectable()
export class PayrollApplicationService {
  constructor(
    @Inject(HRM_REPOSITORY_TOKEN)
    private readonly repo: IHrmRepository,
  ) {}

  async setSalary(dto: SetSalaryDto) {
    return this.repo.upsertSalary(dto);
  }

  async createServiceChargePool(dto: CreateServiceChargePoolDto) {
    const sharePerPax = Number((dto.totalPool / dto.paxStaff).toFixed(2));
    return this.repo.upsertServiceChargePool({
      month: dto.month,
      totalPool: dto.totalPool,
      paxStaff: dto.paxStaff,
      sharePerPax,
    });
  }

  async getServiceChargePool(month: string) {
    return this.repo.findServiceChargePool(month);
  }

  async runMonthlyPayroll(tenantId: string, dto: RunMonthlyPayrollDto) {
    const employees = await this.repo.findActiveEmployeesForPayroll(tenantId);

    if (employees.length === 0) {
      throw new BadRequestException('No active employees found for payroll processing');
    }

    const pool = await this.repo.findServiceChargePool(dto.salaryMonth);
    const serviceChargeShare = pool ? Number(pool.sharePerPax) : 0;

    const generatedSlips = [];

    for (const emp of employees) {
      const basic = Number(emp.salaryBasic || 3000);
      const hourlyRate = Number((basic / 160).toFixed(2));

      // Overtime hours
      const attendances = await this.repo.findEmployeeAttendances(
        emp.id,
        new Date(`${dto.salaryMonth}-01`),
        new Date(`${dto.salaryMonth}-31`),
      );

      const totalOtHours = attendances.reduce(
        (acc: number, a: any) => acc + Number(a.overtimeHours || 0),
        0,
      );

      // Loan deductions
      let loanDeductTotal = 0;
      for (const loan of emp.loans || []) {
        const deductAmt = Math.min(Number(loan.monthlyDeduct), Number(loan.remainingAmt));
        if (deductAmt > 0) {
          loanDeductTotal += deductAmt;

          await this.repo.createLoanRepayment({
            loanId: loan.id,
            amountPaid: deductAmt,
          });

          const newRemaining = Number(loan.remainingAmt) - deductAmt;
          await this.repo.updateLoan(loan.id, {
            remainingAmt: newRemaining,
            status: newRemaining <= 0 ? 'completed' : 'active',
          });
        }
      }

      // Compute salary via Pure Domain Rule
      const salaryCalc = calculatePayrollSalary(
        basic,
        totalOtHours,
        hourlyRate,
        serviceChargeShare,
        loanDeductTotal,
        0.1,
      );

      const paySlip = await this.repo.upsertPaySlip({
        employeeId: emp.id,
        salaryMonth: dto.salaryMonth,
        basicSalary: basic,
        netSalary: salaryCalc.netSalary,
        status: 'paid',
        pdfUrl: `https://cdn.omnistay.com/payslips/${dto.salaryMonth}/${emp.employeeCode}.pdf`,
      });

      if (salaryCalc.otAmount > 0) {
        await this.repo.createOvertimeRecord({
          paySlipId: paySlip.id,
          title: `Overtime (${totalOtHours} hrs @ 1.5x)`,
          hoursCount: totalOtHours,
          ratePerHour: Number((hourlyRate * 1.5).toFixed(2)),
          amount: salaryCalc.otAmount,
        });
      }

      if (serviceChargeShare > 0) {
        await this.repo.createAllowance({
          paySlipId: paySlip.id,
          title: '10% Guest Service Charge Pool Share',
          amount: serviceChargeShare,
        });
      }

      await this.repo.createDeduction({
        paySlipId: paySlip.id,
        title: 'Statutory Tax Withholding (10%)',
        amount: salaryCalc.taxDeduction,
      });

      if (loanDeductTotal > 0) {
        await this.repo.createDeduction({
          paySlipId: paySlip.id,
          title: 'Staff Loan Monthly Repayment',
          amount: loanDeductTotal,
        });
      }

      generatedSlips.push({
        paySlipId: paySlip.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        basicSalary: basic,
        overtimePay: salaryCalc.otAmount,
        serviceChargeShare,
        taxDeduction: salaryCalc.taxDeduction,
        loanDeduction: loanDeductTotal,
        netSalary: salaryCalc.netSalary,
        pdfUrl: paySlip.pdfUrl,
      });
    }

    return {
      success: true,
      month: dto.salaryMonth,
      processedEmployeesCount: generatedSlips.length,
      totalPayrollDisbursed: Number(
        generatedSlips.reduce((sum, s) => sum + s.netSalary, 0).toFixed(2),
      ),
      payslips: generatedSlips,
    };
  }

  async getEmployeePaySlips(employeeId: string) {
    return this.repo.findEmployeePaySlips(employeeId);
  }

  async getMonthlyPayroll(tenantId: string, month: string) {
    return this.repo.findPaySlips(tenantId, month);
  }
}
