import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  HRM_REPOSITORY_TOKEN,
  type IHrmRepository,
} from '../../domain/repositories/hrm.repository.interface.js';
import type {
  CreateBranchDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
} from '../../presentation/dto/employee.dto.js';

@Injectable()
export class EmployeeApplicationService {
  constructor(
    @Inject(HRM_REPOSITORY_TOKEN)
    private readonly repo: IHrmRepository,
  ) {}

  async createBranch(tenantId: string, dto: CreateBranchDto) {
    return this.repo.createBranch({
      tenantId,
      name: dto.name,
      address: dto.address,
    });
  }

  async getBranches(tenantId: string) {
    let branches = await this.repo.findBranches(tenantId);
    if (!branches || branches.length === 0) {
      await this.seedDefaultHrmInfrastructure(tenantId);
      branches = await this.repo.findBranches(tenantId);
    }
    return branches;
  }

  async createDepartment(dto: CreateDepartmentDto) {
    return this.repo.createDepartment({
      branchId: dto.branchId,
      name: dto.name,
    });
  }

  async createDesignation(dto: CreateDesignationDto) {
    return this.repo.createDesignation({
      departmentId: dto.departmentId,
      name: dto.name,
    });
  }

  async createEmployee(tenantId: string, dto: CreateEmployeeDto) {
    const existing = await this.repo.findEmployeeByCode(tenantId, dto.employeeCode);
    if (existing) {
      throw new ConflictException(`Employee code ${dto.employeeCode} is already assigned`);
    }

    const employee = await this.repo.createEmployee({
      tenantId,
      branchId: dto.branchId,
      departmentId: dto.departmentId,
      designationId: dto.designationId,
      employeeCode: dto.employeeCode,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      joiningDate: new Date(dto.joiningDate),
      salaryBasic: dto.salaryBasic,
      status: 'active',
    });

    await this.repo.upsertSalary({
      employeeId: employee.id,
      basicSalary: dto.salaryBasic,
      payslipType: 'monthly',
    });

    return employee;
  }

  async getEmployees(tenantId: string) {
    let employees = await this.repo.findEmployees(tenantId);
    if (!employees || employees.length === 0) {
      await this.seedDefaultHrmInfrastructure(tenantId);
      employees = await this.repo.findEmployees(tenantId);
    }
    return employees;
  }

  async seedDefaultHrmInfrastructure(tenantId: string) {
    try {
      // 10.1 Branches
      const b1 = await this.repo.createBranch({
        tenantId,
        name: 'Corporate HQ (SoftSasi Omnistay)',
        address: 'Tower 1, Financial District, Manhattan, NY',
      });
      const b2 = await this.repo.createBranch({
        tenantId,
        name: 'Grand Azure Luxury Resort',
        address: '100 Ocean Drive, Miami Beach, FL',
      });
      const b3 = await this.repo.createBranch({
        tenantId,
        name: 'Downtown Metropolitan Hotel',
        address: '450 5th Ave, Manhattan, NY',
      });
      const b4 = await this.repo.createBranch({
        tenantId,
        name: 'Marina Island Fleet Depot',
        address: 'Pier 21, Fort Lauderdale, FL',
      });

      // Departments & Designations
      const dFront = await this.repo.createDepartment({ branchId: b2.id, name: 'Front Office' });
      const dCulinary = await this.repo.createDepartment({ branchId: b2.id, name: 'Culinary / Kitchen' });
      const dHousekeeping = await this.repo.createDepartment({ branchId: b2.id, name: 'Housekeeping' });
      const dFnB = await this.repo.createDepartment({ branchId: b2.id, name: 'Food & Beverage Service' });
      const dSpa = await this.repo.createDepartment({ branchId: b2.id, name: 'Spa & Recreation' });
      const dMaintenance = await this.repo.createDepartment({ branchId: b2.id, name: 'Engineering & Maintenance' });
      const dFinance = await this.repo.createDepartment({ branchId: b1.id, name: 'Finance & Accounting' });
      const dSecurity = await this.repo.createDepartment({ branchId: b2.id, name: 'Security' });

      const desFrontDesk = await this.repo.createDesignation({ departmentId: dFront.id, name: 'Front Desk Agent' });
      const desConcierge = await this.repo.createDesignation({ departmentId: dFront.id, name: 'Head Concierge' });
      const desExecChef = await this.repo.createDesignation({ departmentId: dCulinary.id, name: 'Executive Chef' });
      const desNightAudit = await this.repo.createDesignation({ departmentId: dFinance.id, name: 'Night Auditor' });
      const desHousekeeper = await this.repo.createDesignation({ departmentId: dHousekeeping.id, name: 'Housekeeping Specialist' });
      const desSommelier = await this.repo.createDesignation({ departmentId: dFnB.id, name: 'Head Sommelier' });
      const desTherapist = await this.repo.createDesignation({ departmentId: dSpa.id, name: 'Lead Massage Therapist' });
      const desEngineer = await this.repo.createDesignation({ departmentId: dMaintenance.id, name: 'HVAC Maintenance Technician' });
      const desGM = await this.repo.createDesignation({ departmentId: dFront.id, name: 'General Manager' });

      // 10.2 Staff Employees
      const staffDefs = [
        {
          code: 'EMP-101',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@omnistay.com',
          phone: '+1 (305) 555-0101',
          branchId: b2.id,
          deptId: dFront.id,
          desId: desFrontDesk.id,
          salary: 3200,
          joinDate: new Date('2024-03-15'),
        },
        {
          code: 'EMP-102',
          name: 'Chef Marco Rossi',
          email: 'marco.rossi@omnistay.com',
          phone: '+1 (305) 555-0102',
          branchId: b2.id,
          deptId: dCulinary.id,
          desId: desExecChef.id,
          salary: 6800,
          joinDate: new Date('2023-08-01'),
        },
        {
          code: 'EMP-103',
          name: 'David K. Miller',
          email: 'david.miller@omnistay.com',
          phone: '+1 (212) 555-0103',
          branchId: b1.id,
          deptId: dFinance.id,
          desId: desNightAudit.id,
          salary: 4100,
          joinDate: new Date('2024-01-10'),
        },
        {
          code: 'EMP-104',
          name: 'Elena Rostova',
          email: 'elena.rostova@omnistay.com',
          phone: '+1 (305) 555-0104',
          branchId: b2.id,
          deptId: dHousekeeping.id,
          desId: desHousekeeper.id,
          salary: 2900,
          joinDate: new Date('2024-05-20'),
        },
        {
          code: 'EMP-105',
          name: 'Michael Chen',
          email: 'michael.chen@omnistay.com',
          phone: '+1 (305) 555-0105',
          branchId: b2.id,
          deptId: dFnB.id,
          desId: desSommelier.id,
          salary: 4500,
          joinDate: new Date('2023-11-01'),
        },
        {
          code: 'EMP-106',
          name: 'Amina Al-Mansoor',
          email: 'amina.mansoor@omnistay.com',
          phone: '+1 (305) 555-0106',
          branchId: b2.id,
          deptId: dSpa.id,
          desId: desTherapist.id,
          salary: 3600,
          joinDate: new Date('2024-02-14'),
        },
        {
          code: 'EMP-107',
          name: 'Carlos Santana',
          email: 'carlos.santana@omnistay.com',
          phone: '+1 (305) 555-0107',
          branchId: b2.id,
          deptId: dMaintenance.id,
          desId: desEngineer.id,
          salary: 3400,
          joinDate: new Date('2024-06-01'),
        },
        {
          code: 'EMP-108',
          name: 'Alexandra Vance',
          email: 'alexandra.vance@omnistay.com',
          phone: '+1 (212) 555-0108',
          branchId: b1.id,
          deptId: dFront.id,
          desId: desGM.id,
          salary: 9800,
          joinDate: new Date('2022-04-10'),
        },
      ];

      const createdEmployees: any[] = [];
      for (const s of staffDefs) {
        const emp = await this.repo.createEmployee({
          tenantId,
          branchId: s.branchId,
          departmentId: s.deptId,
          designationId: s.desId,
          employeeCode: s.code,
          fullName: s.name,
          email: s.email,
          phone: s.phone,
          joiningDate: s.joinDate,
          salaryBasic: s.salary,
          status: 'active',
        });
        await this.repo.upsertSalary({
          employeeId: emp.id,
          basicSalary: s.salary,
          payslipType: 'monthly',
        });
        createdEmployees.push(emp);
      }

      // Generate offer and joining letters for sample staff
      if (createdEmployees[0]) {
        await this.generateDocumentLetter(createdEmployees[0].id, 'offer');
        await this.generateDocumentLetter(createdEmployees[0].id, 'joining');
      }

      // 10.3 Biometric Devices
      await this.repo.createBiometricDevice({
        deviceName: 'ZKTeco ProCapture-X (Main Lobby Entrance)',
        ipAddress: '192.168.10.45',
        port: 4370,
        deviceModel: 'ZKTeco ADMS Cloud Gateway',
        isActive: true,
      });
      await this.repo.createBiometricDevice({
        deviceName: 'Hikvision DS-K1T671 (Kitchen Culinary Depot)',
        ipAddress: '192.168.10.48',
        port: 8000,
        deviceModel: 'Hikvision AI Face Terminal',
        isActive: true,
      });
      await this.repo.createBiometricDevice({
        deviceName: 'Anviz FacePass 7 Pro (Executive Staff Entrance)',
        ipAddress: '192.168.10.52',
        port: 5005,
        deviceModel: 'Anviz Dual Sensor Biometric',
        isActive: true,
      });
      await this.repo.createBiometricDevice({
        deviceName: 'OmniStay Mobile GPS Geofence (iOS/Android Beacon)',
        ipAddress: 'GPS: 25.7617, -80.1918 (Radius: 50m)',
        port: 443,
        deviceModel: 'Mobile Geofence Sentinel',
        isActive: true,
      });

      // Shift Schedules
      await this.repo.createShiftSchedule({
        shiftName: 'Morning Shift (07:00 - 15:30)',
        startTime: '07:00',
        endTime: '15:30',
        isOvernight: false,
      });
      await this.repo.createShiftSchedule({
        shiftName: 'Afternoon Shift (15:00 - 23:30)',
        startTime: '15:00',
        endTime: '23:30',
        isOvernight: false,
      });
      await this.repo.createShiftSchedule({
        shiftName: 'Night Audit Shift (23:00 - 07:30)',
        startTime: '23:00',
        endTime: '07:30',
        isOvernight: true,
      });
      await this.repo.createShiftSchedule({
        shiftName: 'Split Dining Shift (11:00 - 15:00 & 18:00 - 22:30)',
        startTime: '11:00',
        endTime: '22:30',
        isOvernight: false,
      });

      // Today's Attendances
      const today = new Date();
      const todayDate = new Date(today.toISOString().split('T')[0]);
      if (createdEmployees[0]) {
        await this.repo.createAttendance({
          employeeId: createdEmployees[0].id,
          date: todayDate,
          clockIn: new Date(today.setHours(6, 58, 0)),
          clockOut: null,
          status: 'Present',
          overtimeHours: 1.5,
        });
      }
      if (createdEmployees[1]) {
        await this.repo.createAttendance({
          employeeId: createdEmployees[1].id,
          date: todayDate,
          clockIn: new Date(today.setHours(14, 52, 0)),
          clockOut: null,
          status: 'Present',
          overtimeHours: 2.0,
        });
      }
      if (createdEmployees[3]) {
        await this.repo.createAttendance({
          employeeId: createdEmployees[3].id,
          date: todayDate,
          clockIn: new Date(today.setHours(7, 1, 0)),
          clockOut: null,
          status: 'Present',
          overtimeHours: 0.5,
        });
      }

      // 10.4 Leave Types & Blackout Calendars
      const ltAnnual = await this.repo.createLeaveType({
        title: 'Annual Paid Leave',
        daysPerYear: 14,
        isPaid: true,
      });
      const ltSick = await this.repo.createLeaveType({
        title: 'Sick Leave (Medical Certificate Required)',
        daysPerYear: 10,
        isPaid: true,
      });
      const ltCasual = await this.repo.createLeaveType({
        title: 'Casual Leave',
        daysPerYear: 7,
        isPaid: true,
      });
      await this.repo.createLeaveType({
        title: 'Maternity / Paternity Leave',
        daysPerYear: 90,
        isPaid: true,
      });
      await this.repo.createLeaveType({
        title: 'Compassionate Leave',
        daysPerYear: 5,
        isPaid: true,
      });
      await this.repo.createLeaveType({
        title: 'Unpaid Discretionary Leave',
        daysPerYear: 30,
        isPaid: false,
      });

      // Holiday Blackout Calendars
      await this.repo.createHolidayCalendar({
        holidayName: 'Christmas & New Year Peak Blackout (Dec 24 - Jan 2)',
        startDate: new Date('2026-12-24'),
        endDate: new Date('2027-01-02'),
      });
      await this.repo.createHolidayCalendar({
        holidayName: 'Independence Day Gala Weekend',
        startDate: new Date('2026-07-03'),
        endDate: new Date('2026-07-05'),
      });

      // Sample Leave Applications
      if (createdEmployees[4]) {
        await this.repo.createLeaveApplication({
          employeeId: createdEmployees[4].id,
          leaveTypeId: ltAnnual.id,
          startDate: new Date('2026-11-15'),
          endDate: new Date('2026-11-19'),
          reason: 'Family Vacation & Annual Rest',
          status: 'pending',
        });
      }
      if (createdEmployees[5]) {
        await this.repo.createLeaveApplication({
          employeeId: createdEmployees[5].id,
          leaveTypeId: ltCasual.id,
          startDate: new Date('2026-11-10'),
          endDate: new Date('2026-11-11'),
          reason: 'Personal Urgent Matters',
          status: 'head_approved',
        });
      }
      if (createdEmployees[6]) {
        await this.repo.createLeaveApplication({
          employeeId: createdEmployees[6].id,
          leaveTypeId: ltSick.id,
          startDate: new Date('2026-11-01'),
          endDate: new Date('2026-11-02'),
          reason: 'Prescribed Medical Bed Rest (Certificate Attached)',
          status: 'hr_approved',
        });
      }

      // 10.5 Service Charge Pool ($48,500 across 65 staff = $746.15/share)
      const currentMonth = new Date().toISOString().slice(0, 7);
      await this.repo.upsertServiceChargePool({
        month: currentMonth,
        totalPool: 48500,
        paxStaff: 65,
        sharePerPax: 746.15,
      });

      // Sample payslip for Sarah Jenkins
      if (createdEmployees[0]) {
        const ps = await this.repo.upsertPaySlip({
          employeeId: createdEmployees[0].id,
          salaryMonth: currentMonth,
          basicSalary: 3200,
          netSalary: 3676.15,
          status: 'paid',
          pdfUrl: `https://cdn.omnistay.com/payslips/${currentMonth}/EMP-101.pdf`,
        });
        await this.repo.createOvertimeRecord({
          paySlipId: ps.id,
          title: 'Standard Overtime (4.5 hrs @ 1.5x)',
          hoursCount: 4.5,
          ratePerHour: 30.0,
          amount: 135.0,
        });
        await this.repo.createAllowance({
          paySlipId: ps.id,
          title: '10% Guest Service Charge Pool Share',
          amount: 746.15,
        });
        await this.repo.createDeduction({
          paySlipId: ps.id,
          title: 'Statutory Tax Withholding (10%)',
          amount: 405.0,
        });
      }

      // 10.6 Active Jobs
      const j1 = await this.repo.createJob({
        title: 'Executive Sommelier & Beverage Director',
        category: 'Food & Beverage Service',
        branch: 'Grand Azure Luxury Resort',
        positionsCount: 1,
        description: 'Lead world-class wine curation, cellar acquisitions, and VIP private tastings for 5-star resort outlets.',
        status: 'active',
      });
      const j2 = await this.repo.createJob({
        title: 'Night Audit Manager (PMS & Revenue Reconciliation)',
        category: 'Finance & Accounting',
        branch: 'Downtown Metropolitan Hotel',
        positionsCount: 2,
        description: 'Oversee 02:00 AM Night Audit daemon, guest folio accruals, room revenue reconciliation, and emergency night coverage.',
        status: 'active',
      });
      const j3 = await this.repo.createJob({
        title: 'Senior Spa Therapist & Wellness Specialist',
        category: 'Spa & Recreation',
        branch: 'Grand Azure Luxury Resort',
        positionsCount: 3,
        description: 'Perform bespoke Ayurvedic rituals, deep tissue treatments, and luxury skincare consultations.',
        status: 'active',
      });
      const j4 = await this.repo.createJob({
        title: 'Guest Experience & VIP Concierge Specialist',
        category: 'Front Office',
        branch: 'Grand Azure Luxury Resort',
        positionsCount: 2,
        description: 'Deliver bespoke itinerary planning, yacht charter bookings, and white-glove arrival experiences.',
        status: 'active',
      });

      // Candidates across Kanban stages
      const cand1 = await this.repo.createJobApplication({
        jobId: j1.id,
        name: 'Julien Mercier',
        email: 'julien.mercier@winecraft.fr',
        phone: '+33 6 12 34 56 78',
        stage: 'interview',
        resumeUrl: 'https://cdn.omnistay.com/resumes/julien_sommelier.pdf',
      });
      await this.repo.createInterviewSchedule({
        applicationId: cand1.id,
        roundType: 'zoom_video',
        scheduledDate: new Date(Date.now() + 48 * 3600 * 1000),
        zoomJoinUrl: 'https://zoom.us/j/9871234567?pwd=omnistay_sommelier',
        status: 'scheduled',
      });

      await this.repo.createJobApplication({
        jobId: j1.id,
        name: 'Sofia Valenti',
        email: 'sofia.valenti@tuscanycellars.it',
        phone: '+39 055 123456',
        stage: 'skills_assessment',
        resumeUrl: 'https://cdn.omnistay.com/resumes/sofia_valenti.pdf',
      });

      await this.repo.createJobApplication({
        jobId: j2.id,
        name: 'Robert Hastings',
        email: 'robert.hastings@auditpro.com',
        phone: '+1 (212) 555-8844',
        stage: 'applied',
        resumeUrl: 'https://cdn.omnistay.com/resumes/robert_hastings.pdf',
      });

      await this.repo.createJobApplication({
        jobId: j3.id,
        name: 'Mei Ling Tan',
        email: 'meiling.tan@ayurvedaretreat.sg',
        phone: '+65 9123 4567',
        stage: 'offered',
        resumeUrl: 'https://cdn.omnistay.com/resumes/meiling_tan.pdf',
      });

      // 10.7 Appraisals & Goal Tracking
      if (createdEmployees[0]) {
        await this.repo.createAppraisal({
          employeeId: createdEmployees[0].id,
          ratingScore: 4.8,
          reviewPeriod: 'Q3-2026',
          feedback: 'Exceptional guest satisfaction scores at Front Desk. Consistently praised for warmth and speed during peak check-in rushes.',
        });
      }
      if (createdEmployees[1]) {
        await this.repo.createAppraisal({
          employeeId: createdEmployees[1].id,
          ratingScore: 4.9,
          reviewPeriod: 'Q3-2026',
          feedback: 'Chef Marco elevated culinary margins by 14% while securing Michelin-guide recommendations for the Azure Grill.',
        });
      }

      await this.repo.createGoalTracking({
        goalType: 'Service Excellence KPI',
        target: 'Maintain 98% five-star rating across all TripAdvisor and Google Reviews',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        progressPct: 94,
        status: 'in_progress',
      });
      await this.repo.createGoalTracking({
        goalType: 'F&B Revenue Growth',
        target: 'Increase vintage wine upselling by 15% through Sommelier pairings',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-12-31'),
        progressPct: 88,
        status: 'in_progress',
      });

      // 10.8 Training Programs & Certifications
      const tr1 = await this.repo.createTrainingProgram({
        title: 'Food Safety & Hygiene Mastery (HACCP Level 2 Certification)',
        trainer: 'ServSafe Master Instructor Dr. Evelyn Reed',
        startDate: new Date('2026-10-15'),
        endDate: new Date('2026-10-18'),
      });
      await this.repo.createTrainingProgram({
        title: 'Sommelier Masterclass: Grand Cru Bordeaux & Champagne Service',
        trainer: 'Master of Wine Antoine Dubois',
        startDate: new Date('2026-11-20'),
        endDate: new Date('2026-11-22'),
      });
      await this.repo.createTrainingProgram({
        title: 'Luxury Hotel Fire Safety, Evacuation & First Aid Protocols',
        trainer: 'Miami Metro Fire Marshal & Red Cross',
        startDate: new Date('2026-12-05'),
        endDate: new Date('2026-12-06'),
      });

      await this.repo.createEmployeeCertification({
        certName: 'HACCP Level 2 Food Safety & Sanitation',
        issuedBy: 'ServSafe / National Restaurant Association',
        expiryDate: new Date('2028-10-15'),
      });
      await this.repo.createEmployeeCertification({
        certName: 'Court of Master Sommeliers - Certified Sommelier',
        issuedBy: 'Court of Master Sommeliers Americas',
        expiryDate: new Date('2029-06-20'),
      });
      await this.repo.createEmployeeCertification({
        certName: 'Red Cross First Aid & CPR/AED for Hospitality',
        issuedBy: 'American Red Cross',
        expiryDate: new Date('2027-04-10'),
      });

      // 10.9 HR Administration & Disciplinary Workflows
      await this.repo.createEmployeeAward({
        awardName: 'Employee of the Month (October 2026)',
        employeeName: 'Sarah Jenkins (Front Office)',
        giftPrize: 'Weekend Resort Stay + Spa Package',
        cashBonus: 500.0,
        awardDate: new Date('2026-10-31'),
      });
      await this.repo.createEmployeeComplaint({
        title: 'Kitchen Walk-In Cooler Thermostat Inconsistency',
        description: 'Pastry chef reported walk-in refrigerator temp fluctuation between 38F and 44F. Immediate engineering inspection requested.',
        isResolved: true,
      });
      await this.repo.createDisciplinaryWarning({
        warningType: 'First Formal Warning',
        description: 'Unexcused tardiness exceeding 30 minutes on consecutive morning banquet shifts without prior supervisor notification.',
        issuedDate: new Date('2026-10-12'),
      });
      await this.repo.createOffboardingChecklist({
        itemName: 'Return Master Keycard & Physical Room Keys',
        isReturned: true,
      });
      await this.repo.createOffboardingChecklist({
        itemName: 'Hand Over Company Uniforms & Name Badges',
        isReturned: true,
      });
      await this.repo.createOffboardingChecklist({
        itemName: 'Return IT Assets (Corporate Laptop & Walkie-Talkie)',
        isReturned: false,
      });
      await this.repo.createOffboardingChecklist({
        itemName: 'Sign Final Payroll Clearance & Non-Disclosure Agreement',
        isReturned: false,
      });

    } catch (err: any) {
      console.warn('seedDefaultHrmInfrastructure non-blocking error:', err?.message);
    }
  }

  async getEmployeeById(id: string) {
    const emp = await this.repo.findEmployeeById(id);
    if (!emp) throw new NotFoundException(`Employee ${id} not found`);
    return emp;
  }

  async terminateEmployee(id: string, reason = 'Resignation / Discharge') {
    return this.repo.updateEmployee(id, {
      status: 'terminated',
      deletedAt: new Date(),
      exitReason: reason,
    });
  }

  async generateDocumentLetter(
    employeeId: string,
    type: 'offer' | 'joining' | 'experience',
    content?: string,
  ) {
    const emp = await this.getEmployeeById(employeeId);
    const date = new Date();

    if (type === 'offer') {
      return this.repo.createDocumentLetter('offer', {
        employeeId,
        letterDate: date,
        content:
          content ||
          `Offer of Employment extended to ${emp.fullName} for position in ${
            emp.department?.name || 'Operations'
          } with basic salary $${emp.salaryBasic}.`,
      });
    }

    if (type === 'joining') {
      const joiningStr = emp.joiningDate instanceof Date ? emp.joiningDate.toISOString().split('T')[0] : String(emp.joiningDate).split('T')[0];
      return this.repo.createDocumentLetter('joining', {
        employeeId,
        letterDate: date,
        content:
          content ||
          `Joining Acceptance Letter: ${emp.fullName} officially reported to duty on ${joiningStr}.`,
      });
    }

    return this.repo.createDocumentLetter('experience', {
      employeeId,
      letterDate: date,
      content:
        content ||
        `Certificate of Service: ${emp.fullName} served with distinction as ${
          emp.designation?.name || 'Staff'
        } at OmniStay 360.`,
    });
  }
}
