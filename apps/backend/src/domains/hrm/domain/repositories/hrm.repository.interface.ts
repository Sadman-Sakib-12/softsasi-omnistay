export const HRM_REPOSITORY_TOKEN = Symbol('IHrmRepository');

export interface IHrmRepository {
  // Branches, Departments & Employees
  createBranch(data: any): Promise<any>;
  findBranches(tenantId: string): Promise<any[]>;
  createDepartment(data: any): Promise<any>;
  createDesignation(data: any): Promise<any>;
  findEmployeeByCode(tenantId: string, employeeCode: string): Promise<any | null>;
  findEmployeeById(id: string): Promise<any | null>;
  createEmployee(data: any): Promise<any>;
  findEmployees(tenantId: string): Promise<any[]>;
  updateEmployee(id: string, data: Record<string, any>): Promise<any>;
  createDocumentLetter(type: 'offer' | 'joining' | 'experience', data: any): Promise<any>;

  // Attendance & Shifts
  findEmployeeByCodeSimple(employeeCode: string): Promise<any | null>;
  findAttendanceByDate(employeeId: string, date: Date): Promise<any | null>;
  createAttendance(data: any): Promise<any>;
  updateAttendance(id: string, data: Record<string, any>): Promise<any>;
  createShiftSchedule(data: any): Promise<any>;
  findShiftSchedules(): Promise<any[]>;
  findEmployeeAttendances(employeeId: string, startDate: Date, endDate: Date): Promise<any[]>;

  // Leaves
  createLeaveType(data: any): Promise<any>;
  findLeaveTypes(tenantId?: string): Promise<any[]>;
  findLeaveTypeById(id: string): Promise<any | null>;
  createLeaveApplication(data: any): Promise<any>;
  findLeaveApplications(employeeId?: string): Promise<any[]>;
  findLeaveApplicationById(id: string): Promise<any | null>;
  updateLeaveApplication(id: string, data: Record<string, any>): Promise<any>;

  // Payroll & Loans
  upsertSalary(data: any): Promise<any>;
  upsertServiceChargePool(data: any): Promise<any>;
  findServiceChargePool(month: string): Promise<any | null>;
  findActiveEmployeesForPayroll(tenantId: string): Promise<any[]>;
  createLoanRepayment(data: any): Promise<any>;
  updateLoan(id: string, data: Record<string, any>): Promise<any>;
  upsertPaySlip(data: any): Promise<any>;
  createOvertimeRecord(data: any): Promise<any>;
  createAllowance(data: any): Promise<any>;
  createDeduction(data: any): Promise<any>;
  findEmployeePaySlips(employeeId: string): Promise<any[]>;
  findPaySlips(tenantId: string, month: string): Promise<any[]>;

  // Recruitment
  createJob(data: any): Promise<any>;
  findJobs(tenantId?: string): Promise<any[]>;
  findJobById(id: string): Promise<any | null>;
  createJobApplication(data: any): Promise<any>;
  findJobApplicationById(id: string): Promise<any | null>;
  updateJobApplication(id: string, data: Record<string, any>): Promise<any>;
  createInterviewSchedule(data: any): Promise<any>;
  createAppraisal(data: any): Promise<any>;
  createEmployeeCertification(data: any): Promise<any>;
}
