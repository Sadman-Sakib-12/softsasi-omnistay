export type EmployeeStatus = 'active' | 'on_leave' | 'terminated' | 'probation';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half_Day' | 'On_Leave';
export type JobApplicationStage = 'applied' | 'screening' | 'skills_test' | 'interview' | 'offer' | 'onboarded' | 'rejected';
export type LeaveApplicationStatus = 'pending' | 'head_approved' | 'hr_approved' | 'rejected';

export interface IEmployee {
  id: string;
  tenantId: string;
  branchId?: string;
  departmentId?: string;
  designationId?: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  joiningDate: string;
  salaryBasic: number;
  status: EmployeeStatus;
}

export interface IBiometricPunch {
  deviceId: string;
  employeeCode: string;
  punchTime: string;
  punchType: 'clock_in' | 'clock_out';
}

export interface IAttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  clockIn?: string;
  clockOut?: string;
  overtimeHours: number;
}

export interface IShiftSchedule {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
}

export interface IPaySlip {
  id: string;
  employeeId: string;
  salaryMonth: string;
  basicSalary: number;
  netSalary: number;
  status: 'unpaid' | 'paid';
  pdfUrl?: string;
}

export interface IServiceChargeDistribution {
  month: string;
  totalPool: number;
  eligibleStaffCount: number;
  sharePerEmployee: number;
}
