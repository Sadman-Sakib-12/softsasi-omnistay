import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateServiceChargePoolDto, RunMonthlyPayrollDto, SetSalaryDto } from '../dto/payroll.dto.js';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async setSalary(dto: SetSalaryDto) {
    return this.prisma.setSalary.upsert({
      where: { id: dto.employeeId }, // using employeeId in custom lookup
      update: { basicSalary: dto.basicSalary, payslipType: dto.payslipType || 'monthly' },
      create: {
        employeeId: dto.employeeId,
        basicSalary: dto.basicSalary,
        payslipType: dto.payslipType || 'monthly',
      },
    });
  }

  async createServiceChargePool(dto: CreateServiceChargePoolDto) {
    const sharePerPax = Number((dto.totalPool / dto.paxStaff).toFixed(2));

    return this.prisma.serviceChargePool.upsert({
      where: { month: dto.month },
      update: {
        totalPool: dto.totalPool,
        paxStaff: dto.paxStaff,
        sharePerPax,
      },
      create: {
        month: dto.month,
        totalPool: dto.totalPool,
        paxStaff: dto.paxStaff,
        sharePerPax,
      },
    });
  }

  async getServiceChargePool(month: string) {
    return this.prisma.serviceChargePool.findUnique({ where: { month } });
  }

  async runMonthlyPayroll(tenantId: string, dto: RunMonthlyPayrollDto) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: 'active', deletedAt: null },
      include: {
        salaries: true,
        loans: { where: { status: 'active', remainingAmt: { gt: 0 } } },
      },
    });

    if (employees.length === 0) {
      throw new BadRequestException('No active employees found for payroll processing');
    }

    // Check service charge pool for this month
    const pool = await this.prisma.serviceChargePool.findUnique({
      where: { month: dto.salaryMonth },
    });
    const serviceChargeShare = pool ? Number(pool.sharePerPax) : 0;

    const generatedSlips = [];

    for (const emp of employees) {
      const basic = Number(emp.salaryBasic || 3000);
      const hourlyRate = Number((basic / 160).toFixed(2)); // Standard 160 hrs/mo

      // 1. Calculate Overtime Hours from attendances
      const attendances = await this.prisma.attendanceEmployee.findMany({
        where: {
          employeeId: emp.id,
          date: {
            gte: new Date(`${dto.salaryMonth}-01`),
            lte: new Date(`${dto.salaryMonth}-31`),
          },
        },
      });

      const totalOtHours = attendances.reduce((acc, a) => acc + Number(a.overtimeHours || 0), 0);
      const otAmount = Number((totalOtHours * hourlyRate * 1.5).toFixed(2));

      // 2. Allowances (Night shift stipend / service charge share)
      let allowancesTotal = serviceChargeShare;

      // 3. Deductions: 10% statutory tax withholding
      const taxDeduction = Number((basic * 0.1).toFixed(2));

      // 4. Loan deductions
      let loanDeductTotal = 0;
      for (const loan of emp.loans) {
        const deductAmt = Math.min(Number(loan.monthlyDeduct), Number(loan.remainingAmt));
        if (deductAmt > 0) {
          loanDeductTotal += deductAmt;

          // Record repayment
          await this.prisma.loanRepayment.create({
            data: {
              loanId: loan.id,
              amountPaid: deductAmt,
            },
          });

          const newRemaining = Number(loan.remainingAmt) - deductAmt;
          await this.prisma.loan.update({
            where: { id: loan.id },
            data: {
              remainingAmt: newRemaining,
              status: newRemaining <= 0 ? 'completed' : 'active',
            },
          });
        }
      }

      // Compute Net Salary
      const totalEarnings = basic + otAmount + allowancesTotal;
      const totalDeductions = taxDeduction + loanDeductTotal;
      const netSalary = Number(Math.max(0, totalEarnings - totalDeductions).toFixed(2));

      // Create or update PaySlip
      const paySlip = await this.prisma.paySlip.upsert({
        where: {
          employeeId_salaryMonth: {
            employeeId: emp.id,
            salaryMonth: dto.salaryMonth,
          },
        },
        update: {
          basicSalary: basic,
          netSalary,
          status: 'paid',
          pdfUrl: `https://cdn.omnistay.com/payslips/${dto.salaryMonth}/${emp.employeeCode}.pdf`,
        },
        create: {
          employeeId: emp.id,
          salaryMonth: dto.salaryMonth,
          basicSalary: basic,
          netSalary,
          status: 'paid',
          pdfUrl: `https://cdn.omnistay.com/payslips/${dto.salaryMonth}/${emp.employeeCode}.pdf`,
        },
      });

      // Log sub-items
      if (otAmount > 0) {
        await this.prisma.overtimeRecord.create({
          data: {
            paySlipId: paySlip.id,
            title: `Overtime (${totalOtHours} hrs @ 1.5x)`,
            hoursCount: totalOtHours,
            ratePerHour: Number((hourlyRate * 1.5).toFixed(2)),
            amount: otAmount,
          },
        });
      }

      if (serviceChargeShare > 0) {
        await this.prisma.allowance.create({
          data: {
            paySlipId: paySlip.id,
            title: '10% Guest Service Charge Pool Share',
            amount: serviceChargeShare,
          },
        });
      }

      await this.prisma.saturationDeduction.create({
        data: {
          paySlipId: paySlip.id,
          title: 'Statutory Tax Withholding (10%)',
          amount: taxDeduction,
        },
      });

      if (loanDeductTotal > 0) {
        await this.prisma.saturationDeduction.create({
          data: {
            paySlipId: paySlip.id,
            title: 'Staff Loan Monthly Repayment',
            amount: loanDeductTotal,
          },
        });
      }

      generatedSlips.push({
        paySlipId: paySlip.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        basicSalary: basic,
        overtimePay: otAmount,
        serviceChargeShare,
        taxDeduction,
        loanDeduction: loanDeductTotal,
        netSalary,
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
    return this.prisma.paySlip.findMany({
      where: { employeeId },
      include: {
        allowances: true,
        deductions: true,
        overtimes: true,
      },
      orderBy: { salaryMonth: 'desc' },
    });
  }
}
