import { api } from '@/lib/api/client';

export interface BranchItem {
  id: string;
  name: string;
  address?: string;
  departments?: DepartmentItem[];
}

export interface DepartmentItem {
  id: string;
  branchId: string;
  name: string;
  designations?: DesignationItem[];
}

export interface DesignationItem {
  id: string;
  departmentId: string;
  name: string;
}

export interface EmployeeItem {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  joiningDate: string;
  salaryBasic: number;
  status: string;
  branch?: { id: string; name: string };
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
  documents?: Array<{ id: string; docType: string; docUrl: string }>;
  salaries?: Array<{ id: string; basicSalary: number; payslipType: string }>;
}

export interface EmployeeDetail extends EmployeeItem {
  offerLetters?: Array<{ id: string; letterDate: string; content: string }>;
  joiningLetters?: Array<{ id: string; letterDate: string; content: string }>;
  experienceCerts?: Array<{ id: string; letterDate: string; content: string }>;
  loans?: Array<{ id: string; loanTitle: string; amount: number; monthlyDeduct: number; remainingAmt: number; status: string }>;
  appraisals?: Array<{ id: string; ratingScore: number; reviewPeriod: string; feedback?: string }>;
}

export interface BiometricDeviceItem {
  id: string;
  deviceName: string;
  ipAddress: string;
  port: number;
  deviceModel: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShiftScheduleItem {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
}

export interface AttendancePunchItem {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  overtimeHours?: number;
  status: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    department?: { name: string };
    designation?: { name: string };
  };
}

export interface LeaveTypeItem {
  id: string;
  title: string;
  daysPerYear: number;
  isPaid: boolean;
}

export interface LeaveApplicationItem {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'head_approved' | 'hr_approved' | 'rejected';
  leaveType?: { title: string; isPaid: boolean };
  employee?: { fullName: string; employeeCode: string; department?: { name: string } };
}

export interface HolidayCalendarItem {
  id: string;
  holidayName: string;
  startDate: string;
  endDate: string;
}

export interface ServiceChargePoolItem {
  id: string;
  month: string;
  totalPool: number;
  paxStaff: number;
  sharePerPax: number;
}

export interface PaySlipItem {
  id: string;
  employeeId: string;
  salaryMonth: string;
  basicSalary: number;
  netSalary: number;
  status: string;
  pdfUrl?: string;
  createdAt: string;
  employee?: {
    fullName: string;
    employeeCode: string;
    department?: { name: string };
    designation?: { name: string };
  };
  allowances?: Array<{ id: string; title: string; amount: number }>;
  deductions?: Array<{ id: string; title: string; amount: number }>;
  overtimes?: Array<{ id: string; title: string; hoursCount: number; amount: number }>;
}

export interface MonthlyPayrollRunResult {
  success: boolean;
  month: string;
  processedEmployeesCount: number;
  totalPayrollDisbursed: number;
  payslips: Array<{
    paySlipId: string;
    employeeCode: string;
    fullName: string;
    basicSalary: number;
    overtimePay: number;
    serviceChargeShare: number;
    taxDeduction: number;
    loanDeduction: number;
    netSalary: number;
    pdfUrl?: string;
  }>;
}

export interface JobPostItem {
  id: string;
  title: string;
  category: string;
  branch?: string;
  positionsCount: number;
  status: string;
  description: string;
  applications?: Array<{ id: string; stage: string; name: string; email: string }>;
}

export interface JobApplicationItem {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  stage: 'applied' | 'screening' | 'skills_assessment' | 'interview' | 'offered' | 'onboarded';
  createdAt: string;
  job?: { title: string; category: string };
  interviews?: Array<{
    id: string;
    roundType: string;
    scheduledDate: string;
    zoomJoinUrl?: string;
    status: string;
  }>;
}

export interface AppraisalItem {
  id: string;
  employeeId: string;
  ratingScore: number;
  reviewPeriod: string;
  feedback?: string;
  createdAt: string;
  employee?: {
    fullName: string;
    employeeCode: string;
    department?: { name: string };
    designation?: { name: string };
  };
}

export interface GoalTrackingItem {
  id: string;
  goalType: string;
  target: string;
  startDate: string;
  endDate: string;
  progressPct: number;
  status: string;
}

export interface TrainingProgramItem {
  id: string;
  title: string;
  trainer: string;
  startDate: string;
  endDate: string;
  attendees?: Array<{ id: string; attendeeName: string; isCompleted: boolean }>;
}

export interface EmployeeCertificationItem {
  id: string;
  certName: string;
  issuedBy: string;
  expiryDate?: string;
}

export interface EmployeeAwardItem {
  id: string;
  awardName: string;
  employeeName: string;
  giftPrize?: string;
  cashBonus: number;
  awardDate: string;
}

export interface EmployeeComplaintItem {
  id: string;
  title: string;
  description: string;
  isResolved: boolean;
  lodgedAt: string;
}

export interface DisciplinaryWarningItem {
  id: string;
  warningType: string;
  description: string;
  issuedDate: string;
}

export interface OffboardingChecklistItem {
  id: string;
  itemName: string;
  isReturned: boolean;
  verifiedAt?: string;
}

export interface AdminWorkflowsData {
  awards: EmployeeAwardItem[];
  complaints: EmployeeComplaintItem[];
  warnings: DisciplinaryWarningItem[];
  checklists: OffboardingChecklistItem[];
}

export const hrmService = {
  // 10.1 & 10.2 Branches & Employees
  getBranches: async (): Promise<BranchItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/employees/branches');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getEmployees: async (): Promise<EmployeeItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/employees');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getEmployeeById: async (id: string): Promise<EmployeeDetail | null> => {
    try {
      const res = await api.get<any>(`/api/v1/hrm/employees/${id}`);
      return res?.data || res || null;
    } catch {
      return null;
    }
  },

  createEmployee: async (dto: {
    branchId?: string;
    departmentId?: string;
    designationId?: string;
    employeeCode: string;
    fullName: string;
    email: string;
    phone?: string;
    joiningDate: string;
    salaryBasic: number;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/employees', dto);
  },

  generateDocumentLetter: async (
    employeeId: string,
    type: 'offer' | 'joining' | 'experience',
    content?: string,
  ): Promise<any> => {
    return await api.post<any>(`/api/v1/hrm/employees/${employeeId}/letters/${type}`, { content });
  },

  // 10.3 Attendance & Biometrics
  getShiftSchedules: async (): Promise<ShiftScheduleItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/attendance/shifts');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createShiftSchedule: async (dto: {
    shiftName: string;
    startTime: string;
    endTime: string;
    isOvernight?: boolean;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/attendance/shifts', dto);
  },

  getBiometricDevices: async (): Promise<BiometricDeviceItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/attendance/devices');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getAttendanceLogs: async (): Promise<AttendancePunchItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/attendance/logs');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  recordBiometricPunch: async (dto: {
    deviceId: string;
    employeeCode: string;
    punchTime: string;
    punchType: 'clock_in' | 'clock_out';
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/attendance/biometric-punch', dto);
  },

  recordMobileGeofencedClockIn: async (dto: {
    employeeCode: string;
    latitude: number;
    longitude: number;
    punchType: 'clock_in' | 'clock_out';
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/attendance/mobile-clock-in', dto);
  },

  // 10.4 Leaves & Blackouts
  getLeaveTypes: async (): Promise<LeaveTypeItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/leaves/types');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getLeaveApplications: async (employeeId?: string): Promise<LeaveApplicationItem[]> => {
    try {
      const url = employeeId ? `/api/v1/hrm/leaves/applications?employeeId=${employeeId}` : '/api/v1/hrm/leaves/applications';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  applyForLeave: async (dto: {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/leaves/apply', dto);
  },

  reviewLeaveApplication: async (
    applicationId: string,
    decision: 'head_approved' | 'hr_approved' | 'rejected',
    comments?: string,
  ): Promise<any> => {
    return await api.patch<any>(`/api/v1/hrm/leaves/applications/${applicationId}/review`, { decision, comments });
  },

  getHolidays: async (): Promise<HolidayCalendarItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/leaves/holidays');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  // 10.5 Enterprise Hospitality Payroll Engine
  getServiceChargePool: async (month: string): Promise<ServiceChargePoolItem | null> => {
    try {
      const res = await api.get<any>(`/api/v1/hrm/payroll/service-charge-pool/${month}`);
      return res?.data || res || null;
    } catch {
      return null;
    }
  },

  createServiceChargePool: async (dto: {
    month: string;
    totalPool: number;
    paxStaff: number;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/payroll/service-charge-pool', dto);
  },

  runMonthlyPayroll: async (salaryMonth: string): Promise<MonthlyPayrollRunResult> => {
    const res = await api.post<any>('/api/v1/hrm/payroll/run', { salaryMonth });
    return res?.data || res;
  },

  getMonthlyPayroll: async (month: string): Promise<PaySlipItem[]> => {
    try {
      const res = await api.get<any>(`/api/v1/hrm/payroll/monthly/${month}`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  // 10.6 Recruitment & ATS
  getActiveJobs: async (): Promise<JobPostItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/recruitment/jobs');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createJobPost: async (dto: {
    title: string;
    category: string;
    branch?: string;
    positionsCount: number;
    description: string;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/recruitment/jobs', dto);
  },

  getAllApplications: async (jobId?: string): Promise<JobApplicationItem[]> => {
    try {
      const url = jobId ? `/api/v1/hrm/recruitment/applications?jobId=${jobId}` : '/api/v1/hrm/recruitment/applications';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  updateApplicationStage: async (
    applicationId: string,
    stage: 'applied' | 'screening' | 'skills_assessment' | 'interview' | 'offered' | 'onboarded',
  ): Promise<any> => {
    return await api.patch<any>(`/api/v1/hrm/recruitment/applications/${applicationId}/stage`, { stage });
  },

  scheduleInterview: async (dto: {
    applicationId: string;
    scheduledDate: string;
    roundType?: 'in_person' | 'zoom_video';
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/recruitment/interviews', dto);
  },

  // 10.7 Appraisals & Goals
  getAppraisals: async (employeeId?: string): Promise<AppraisalItem[]> => {
    try {
      const url = employeeId ? `/api/v1/hrm/recruitment/appraisals?employeeId=${employeeId}` : '/api/v1/hrm/recruitment/appraisals';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  submitAppraisal: async (dto: {
    employeeId: string;
    ratingScore: number;
    reviewPeriod: string;
    feedback?: string;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/recruitment/appraisals', dto);
  },

  getGoals: async (): Promise<GoalTrackingItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/recruitment/goals');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createGoal: async (dto: {
    goalType: string;
    target: string;
    startDate?: string;
    endDate?: string;
    progressPct?: number;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/hrm/recruitment/goals', dto);
  },

  // 10.8 Training & Certifications
  getTrainingPrograms: async (): Promise<TrainingProgramItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/recruitment/trainings');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  getCertifications: async (): Promise<EmployeeCertificationItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/recruitment/certifications');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  // 10.9 HR Administration & Workflows
  getAdminWorkflows: async (): Promise<AdminWorkflowsData> => {
    try {
      const res = await api.get<any>('/api/v1/hrm/recruitment/admin-workflows');
      return res?.data || res || { awards: [], complaints: [], warnings: [], checklists: [] };
    } catch {
      return { awards: [], complaints: [], warnings: [], checklists: [] };
    }
  },

  toggleOffboardingItem: async (id: string, isReturned: boolean): Promise<any> => {
    return await api.patch<any>(`/api/v1/hrm/recruitment/offboarding/${id}`, { isReturned });
  },
};
