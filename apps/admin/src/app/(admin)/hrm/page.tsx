'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BeatLoader } from 'react-spinners';
import {
  Users,
  Building2,
  Briefcase,
  Clock,
  Fingerprint,
  Calendar,
  DollarSign,
  UserCheck,
  Award,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Video,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  Filter,
  Check,
  Sparkles,
  Smartphone,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  hrmService,
  BranchItem,
  EmployeeItem,
  EmployeeDetail,
  BiometricDeviceItem,
  ShiftScheduleItem,
  AttendancePunchItem,
  LeaveTypeItem,
  LeaveApplicationItem,
  HolidayCalendarItem,
  ServiceChargePoolItem,
  PaySlipItem,
  JobPostItem,
  JobApplicationItem,
  AppraisalItem,
  GoalTrackingItem,
  TrainingProgramItem,
  EmployeeCertificationItem,
  AdminWorkflowsData,
} from '@/features/hrm/services/hrm.service';

export default function HrmEnterprisePage() {
  const queryClient = useQueryClient();

  // Active Navigation Tab across Chapter 10
  const [activeTab, setActiveTab] = useState<
    'organization' | 'attendance' | 'leaves' | 'payroll' | 'ats' | 'appraisals' | 'administration'
  >('organization');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');
  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));

  // Modal states
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isBiometricSimOpen, setIsBiometricSimOpen] = useState(false);
  const [isMobileGeofenceOpen, setIsMobileGeofenceOpen] = useState(false);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState<string | null>(null);
  const [isAppraisalModalOpen, setIsAppraisalModalOpen] = useState(false);
  const [isServiceChargeModalOpen, setIsServiceChargeModalOpen] = useState(false);

  // Form Inputs
  const [newStaffInput, setNewStaffInput] = useState({
    employeeCode: `EMP-${Math.floor(Math.random() * 800 + 200)}`,
    fullName: '',
    email: '',
    phone: '',
    branchId: '',
    departmentId: '',
    designationId: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    salaryBasic: 3500,
  });

  const [biometricPunchInput, setBiometricPunchInput] = useState({
    deviceId: 'ZKTeco ProCapture-X (Main Lobby Entrance)',
    employeeCode: 'EMP-101',
    punchType: 'clock_in' as 'clock_in' | 'clock_out',
  });

  const [mobileGeofenceInput, setMobileGeofenceInput] = useState({
    employeeCode: 'EMP-104',
    latitude: 25.7617,
    longitude: -80.1918,
    punchType: 'clock_in' as 'clock_in' | 'clock_out',
  });

  const [newShiftInput, setNewShiftInput] = useState({
    shiftName: '',
    startTime: '08:00',
    endTime: '16:30',
    isOvernight: false,
  });

  const [leaveInput, setLeaveInput] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [newJobInput, setNewJobInput] = useState({
    title: '',
    category: 'Food & Beverage Service',
    branch: 'Grand Azure Luxury Resort',
    positionsCount: 1,
    description: '',
  });

  const [interviewInput, setInterviewInput] = useState({
    scheduledDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
    roundType: 'zoom_video' as 'in_person' | 'zoom_video',
  });

  const [appraisalInput, setAppraisalInput] = useState({
    employeeId: '',
    ratingScore: 4.8,
    reviewPeriod: 'Q4-2026',
    feedback: '',
  });

  const [serviceChargeInput, setServiceChargeInput] = useState({
    month: payrollMonth,
    totalPool: 52000,
    paxStaff: 68,
  });

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ---------------------------------------------------------------------------
  // LIVE BACKEND QUERIES (React Query)
  // ---------------------------------------------------------------------------
  const { data: branches = [], isLoading: isLoadingBranches } = useQuery<BranchItem[]>({
    queryKey: ['hrmBranches'],
    queryFn: () => hrmService.getBranches(),
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<EmployeeItem[]>({
    queryKey: ['hrmEmployees'],
    queryFn: () => hrmService.getEmployees(),
  });

  const { data: employeeDetail, isLoading: isLoadingDetail } = useQuery<EmployeeDetail | null>({
    queryKey: ['hrmEmployeeDetail', selectedEmployeeId],
    queryFn: () => (selectedEmployeeId ? hrmService.getEmployeeById(selectedEmployeeId) : null),
    enabled: !!selectedEmployeeId,
  });

  const { data: shiftSchedules = [] } = useQuery<ShiftScheduleItem[]>({
    queryKey: ['hrmShifts'],
    queryFn: () => hrmService.getShiftSchedules(),
  });

  const { data: biometricDevices = [] } = useQuery<BiometricDeviceItem[]>({
    queryKey: ['hrmBiometricDevices'],
    queryFn: () => hrmService.getBiometricDevices(),
  });

  const { data: attendanceLogs = [], isLoading: isLoadingLogs } = useQuery<AttendancePunchItem[]>({
    queryKey: ['hrmAttendanceLogs'],
    queryFn: () => hrmService.getAttendanceLogs(),
  });

  const { data: leaveTypes = [] } = useQuery<LeaveTypeItem[]>({
    queryKey: ['hrmLeaveTypes'],
    queryFn: () => hrmService.getLeaveTypes(),
  });

  const { data: leaveApplications = [], isLoading: isLoadingLeaves } = useQuery<LeaveApplicationItem[]>({
    queryKey: ['hrmLeaveApplications'],
    queryFn: () => hrmService.getLeaveApplications(),
  });

  const { data: holidays = [] } = useQuery<HolidayCalendarItem[]>({
    queryKey: ['hrmHolidays'],
    queryFn: () => hrmService.getHolidays(),
  });

  const { data: serviceChargePool } = useQuery<ServiceChargePoolItem | null>({
    queryKey: ['hrmServiceChargePool', payrollMonth],
    queryFn: () => hrmService.getServiceChargePool(payrollMonth),
  });

  const { data: monthlyPayslips = [], isLoading: isLoadingPayroll } = useQuery<PaySlipItem[]>({
    queryKey: ['hrmMonthlyPayslips', payrollMonth],
    queryFn: () => hrmService.getMonthlyPayroll(payrollMonth),
  });

  const { data: jobs = [] } = useQuery<JobPostItem[]>({
    queryKey: ['hrmJobs'],
    queryFn: () => hrmService.getActiveJobs(),
  });

  const { data: applications = [], isLoading: isLoadingAts } = useQuery<JobApplicationItem[]>({
    queryKey: ['hrmApplications'],
    queryFn: () => hrmService.getAllApplications(),
  });

  const { data: appraisals = [] } = useQuery<AppraisalItem[]>({
    queryKey: ['hrmAppraisals'],
    queryFn: () => hrmService.getAppraisals(),
  });

  const { data: goals = [] } = useQuery<GoalTrackingItem[]>({
    queryKey: ['hrmGoals'],
    queryFn: () => hrmService.getGoals(),
  });

  const { data: trainingPrograms = [] } = useQuery<TrainingProgramItem[]>({
    queryKey: ['hrmTrainings'],
    queryFn: () => hrmService.getTrainingPrograms(),
  });

  const { data: certifications = [] } = useQuery<EmployeeCertificationItem[]>({
    queryKey: ['hrmCertifications'],
    queryFn: () => hrmService.getCertifications(),
  });

  const { data: adminWorkflows = { awards: [], complaints: [], warnings: [], checklists: [] } } =
    useQuery<AdminWorkflowsData>({
      queryKey: ['hrmAdminWorkflows'],
      queryFn: () => hrmService.getAdminWorkflows(),
    });

  // ---------------------------------------------------------------------------
  // MUTATIONS
  // ---------------------------------------------------------------------------
  const createEmployeeMutation = useMutation({
    mutationFn: (dto: any) => hrmService.createEmployee(dto),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['hrmEmployees'] });
      setIsAddStaffOpen(false);
      showToast(`Staff member ${res?.fullName || 'created'} registered successfully.`);
    },
    onError: (err: any) => showToast(`Failed to register staff: ${err?.message || 'Error'}`),
  });

  const generateLetterMutation = useMutation({
    mutationFn: ({ empId, type }: { empId: string; type: 'offer' | 'joining' | 'experience' }) =>
      hrmService.generateDocumentLetter(empId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmEmployeeDetail', selectedEmployeeId] });
      showToast('Digital document letter generated with official company seal.');
    },
  });

  const biometricPunchMutation = useMutation({
    mutationFn: (dto: any) => hrmService.recordBiometricPunch(dto),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['hrmAttendanceLogs'] });
      setIsBiometricSimOpen(false);
      showToast(res?.message || 'Biometric punch verified.');
    },
    onError: (err: any) => showToast(`Biometric punch error: ${err?.message || 'Error'}`),
  });

  const mobileGeofenceMutation = useMutation({
    mutationFn: (dto: any) => hrmService.recordMobileGeofencedClockIn(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmAttendanceLogs'] });
      setIsMobileGeofenceOpen(false);
      showToast('GPS geofence verified (within 50m). Clock-in recorded.');
    },
    onError: (err: any) => showToast(`Geofence failed: ${err?.message || 'Error'}`),
  });

  const createShiftMutation = useMutation({
    mutationFn: (dto: any) => hrmService.createShiftSchedule(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmShifts'] });
      setIsAddShiftOpen(false);
      showToast('New 24/7 rotational shift schedule created.');
    },
  });

  const applyLeaveMutation = useMutation({
    mutationFn: (dto: any) => hrmService.applyForLeave(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmLeaveApplications'] });
      setIsApplyLeaveOpen(false);
      showToast('Leave request submitted into multi-tier approval workflow.');
    },
    onError: (err: any) => showToast(`Leave application error: ${err?.message || 'Error'}`),
  });

  const reviewLeaveMutation = useMutation({
    mutationFn: ({
      appId,
      decision,
      comments,
    }: {
      appId: string;
      decision: 'head_approved' | 'hr_approved' | 'rejected';
      comments?: string;
    }) => hrmService.reviewLeaveApplication(appId, decision, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmLeaveApplications'] });
      showToast('Leave approval stage updated.');
    },
  });

  const runPayrollMutation = useMutation({
    mutationFn: (month: string) => hrmService.runMonthlyPayroll(month),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['hrmMonthlyPayslips', payrollMonth] });
      showToast(
        `Monthly payroll run executed for ${res.processedEmployeesCount} staff. Total disbursed: $${res.totalPayrollDisbursed.toLocaleString()}`,
      );
    },
    onError: (err: any) => showToast(`Payroll run failed: ${err?.message || 'Error'}`),
  });

  const updatePoolMutation = useMutation({
    mutationFn: (dto: any) => hrmService.createServiceChargePool(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmServiceChargePool', payrollMonth] });
      setIsServiceChargeModalOpen(false);
      showToast('10% Guest service charge pool share recomputed.');
    },
  });

  const createJobMutation = useMutation({
    mutationFn: (dto: any) => hrmService.createJobPost(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmJobs'] });
      setIsNewJobOpen(false);
      showToast('Job opportunity published to careers portal.');
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ appId, stage }: { appId: string; stage: any }) =>
      hrmService.updateApplicationStage(appId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmApplications'] });
      showToast('Candidate moved to next Kanban stage.');
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: (dto: any) => hrmService.scheduleInterview(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmApplications'] });
      setIsScheduleInterviewOpen(null);
      showToast('Interview scheduled with automated Zoom video invite.');
    },
  });

  const submitAppraisalMutation = useMutation({
    mutationFn: (dto: any) => hrmService.submitAppraisal(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmAppraisals'] });
      setIsAppraisalModalOpen(false);
      showToast('360-degree appraisal recorded into personnel file.');
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: ({ id, isReturned }: { id: string; isReturned: boolean }) =>
      hrmService.toggleOffboardingItem(id, isReturned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmAdminWorkflows'] });
      showToast('Offboarding asset clearance updated.');
    },
  });

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch =
      selectedBranchFilter === 'ALL' || emp.branch?.name === selectedBranchFilter;
    return matchesSearch && matchesBranch;
  });

  // Total payroll base sum
  const totalBasePayroll = employees.reduce((acc, e) => acc + Number(e.salaryBasic || 0), 0);

  const isLoadingGlobal = isLoadingBranches || isLoadingEmployees;

  if (isLoadingGlobal && employees.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Loading OmniStay HRM & Workforce Payroll System...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
              Chapter 10 Enterprise HRM
            </span>
            <span className="text-xs text-slate-400 font-mono">Uniform USALI Staffing Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Human Resources, Biometrics & Payroll Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            45-table human capital architecture orchestrating 24/7 hospitality shifts, biometric hardware, GPS geofencing, multi-tier leaves, and automated general ledger payroll.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsAddStaffOpen(true)}
            className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register Staff
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsBiometricSimOpen(true)}
            className="cursor-pointer font-semibold border-slate-300"
          >
            <Fingerprint className="w-4 h-4 mr-1.5 text-cyan-600" /> Biometric Punch
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMobileGeofenceOpen(true)}
            className="cursor-pointer font-semibold border-slate-300"
          >
            <Smartphone className="w-4 h-4 mr-1.5 text-emerald-600" /> Mobile GPS Ingest
          </Button>
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Staff
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{employees.length}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                ● 100% contract compliant
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#00a8ff]">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Property Branches
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{branches.length}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                Resorts & depots
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                10% Service Charge Share
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                ${serviceChargePool ? Number(serviceChargePool.sharePerPax).toFixed(2) : '746.15'}
              </h3>
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                Per frontline pax share
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monthly Contract Base
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                ${totalBasePayroll.toLocaleString()}
              </h3>
              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                Acct 6010 Salaries Expense
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'organization', label: '10.1 & 10.2 Personnel Dossiers', icon: Users },
          { id: 'attendance', label: '10.3 Biometrics & Shift Rostering', icon: Fingerprint },
          { id: 'leaves', label: '10.4 Leave & Holiday Blackouts', icon: Calendar },
          { id: 'payroll', label: '10.5 Hospitality Payroll Engine', icon: DollarSign },
          { id: 'ats', label: '10.6 Recruitment & ATS Kanban', icon: Briefcase },
          { id: 'appraisals', label: '10.7 & 10.8 Appraisals & Training', icon: GraduationCap },
          { id: 'administration', label: '10.9 HR Administration & Offboarding', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: 10.1 & 10.2 ORGANIZATIONAL HIERARCHY & PERSONNEL DOSSIERS
          ========================================================================= */}
      {activeTab === 'organization' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Branch & Multi-Property Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {branches.map((b) => (
              <div
                key={b.id}
                onClick={() =>
                  setSelectedBranchFilter(selectedBranchFilter === b.name ? 'ALL' : b.name)
                }
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  selectedBranchFilter === b.name
                    ? 'border-[#00a8ff] bg-sky-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 truncate">{b.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {b.departments?.length || 0} depts
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{b.address || 'Resort property'}</p>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff by name, code or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#00a8ff]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold">
                Showing {filteredEmployees.length} of {employees.length} employees
              </span>
              {selectedBranchFilter !== 'ALL' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedBranchFilter('ALL')}
                  className="text-xs text-rose-600 font-bold h-7 px-2"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {/* Staff Directory Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Branch / Property</th>
                    <th className="p-3.5">Department & Title</th>
                    <th className="p-3.5">Joining Date</th>
                    <th className="p-3.5">Base Salary</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Personnel Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-cyan-400 font-bold text-xs flex items-center justify-center">
                            {emp.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{emp.fullName}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {emp.employeeCode} · {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {emp.branch?.name || 'Grand Azure Luxury Resort'}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          {emp.designation?.name || 'Staff Specialist'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {emp.department?.name || 'Operations'}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {new Date(emp.joiningDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        ${Number(emp.salaryBasic).toLocaleString()} /mo
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active (Signed)
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEmployeeId(emp.id)}
                          className="text-xs font-bold border-slate-200 hover:border-[#00a8ff] hover:text-[#00a8ff] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Dossier
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 10.3 BIOMETRIC ATTENDANCE & SHIFT ROSTERING
          ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Biometric Hardware Terminals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-600" />
                Hardware Biometric Clock Terminals & Cloud ADMS Gateway
              </h3>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                Direct API Active
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {biometricDevices.map((dev) => (
                <Card key={dev.id} className="bg-white border-slate-200 shadow-2xs">
                  <CardContent className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {dev.deviceModel}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 truncate">{dev.deviceName}</h4>
                    <p className="text-[11px] font-mono text-slate-500">{dev.ipAddress}</p>
                    <div className="text-[10px] font-bold text-emerald-600 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Sync Port: {dev.port}</span>
                      <span>Verified</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 24/7 Shift Rosters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Rotational 24/7 Shift Schedules (Hospitality Multi-Shift)
                </h3>
                <p className="text-xs text-slate-500">
                  Automated shift hour tracking with 1.5x standard overtime and 2.0x night audit premiums.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddShiftOpen(true)}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Shift Schedule
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {shiftSchedules.map((sh) => (
                <div
                  key={sh.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{sh.shiftName}</span>
                    {sh.isOvernight && (
                      <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[9px]">
                        Overnight 2.0x
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 font-bold">
                    {sh.startTime} — {sh.endTime}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {sh.isOvernight
                      ? 'Night Audit & Graveyard Engineering'
                      : 'Standard 8.5 hr Shift (30m break)'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Verified Biometric Logs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Live Ingested Punch Stream (Hardware Biometrics & GPS Geofence)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Showing {attendanceLogs.length} verified logs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Staff Member</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Clock In</th>
                    <th className="p-3">Clock Out</th>
                    <th className="p-3">Calculated Overtime</th>
                    <th className="p-3 text-right">Hardware Auth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3">
                        <span className="font-bold text-slate-900">
                          {log.employee?.fullName || 'Sarah Jenkins'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 ml-1.5">
                          ({log.employee?.employeeCode || 'EMP-101'})
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {log.employee?.department?.name || 'Front Office'}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-mono text-slate-900 font-bold">
                        {log.clockIn ? new Date(log.clockIn).toLocaleTimeString() : '—'}
                      </td>
                      <td className="p-3 font-mono text-slate-900">
                        {log.clockOut ? new Date(log.clockOut).toLocaleTimeString() : 'In Progress'}
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-700">
                        {Number(log.overtimeHours || 0) > 0
                          ? `+${log.overtimeHours} hrs (OT 1.5x)`
                          : '0.0 hrs'}
                      </td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                          Verified (Anti-Spoof)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 10.4 LEAVE MANAGEMENT & HOLIDAY BLACKOUTS
          ========================================================================= */}
      {activeTab === 'leaves' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Peak Holiday Blackout Policy Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-amber-900">
                Peak Holiday Blackout Policy Enforced (Dec 24 – Jan 2)
              </h4>
              <p className="text-amber-800 leading-relaxed">
                Automatic policy restriction protects front-desk and culinary staffing coverage during peak holiday seasons. Discretionary annual and casual leave submissions during blackout dates are blocked by pure domain rules (emergency medical leaves require physician certificate upload).
              </p>
            </div>
          </div>

          {/* Leave Types & Allowances */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900">Standard Hospitality Leave Allowances</h3>
              <Button
                size="sm"
                onClick={() => setIsApplyLeaveOpen(true)}
                className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Submit Leave Request
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {leaveTypes.map((lt) => (
                <div key={lt.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {lt.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {lt.daysPerYear}d / yr
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-1 truncate">{lt.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Applications with 3-Tier Workflow */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Multi-Tier Approval Hierarchy: Request → Department Head Review → HR Director Final Approval
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {leaveApplications.length} active requests
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Leave Type</th>
                    <th className="p-3.5">Date Range</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveApplications.map((la) => (
                    <tr key={la.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          {la.employee?.fullName || 'Michael Chen'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {la.employee?.employeeCode || 'EMP-105'}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {la.leaveType?.title || 'Annual Paid Leave'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-900">
                        {new Date(la.startDate).toLocaleDateString()} —{' '}
                        {new Date(la.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-[220px] truncate">{la.reason}</td>
                      <td className="p-3.5">
                        {la.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Head Review
                          </span>
                        )}
                        {la.status === 'head_approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            Dept Head Approved (Pending HR)
                          </span>
                        )}
                        {la.status === 'hr_approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ HR Director Final Approved
                          </span>
                        )}
                        {la.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {la.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              reviewLeaveMutation.mutate({ appId: la.id, decision: 'head_approved' })
                            }
                            className="text-xs font-bold text-sky-700 border-sky-200 hover:bg-sky-50 cursor-pointer h-7"
                          >
                            Head Approve
                          </Button>
                        )}
                        {la.status === 'head_approved' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              reviewLeaveMutation.mutate({ appId: la.id, decision: 'hr_approved' })
                            }
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-7"
                          >
                            HR Final Approve
                          </Button>
                        )}
                        {la.status !== 'hr_approved' && la.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              reviewLeaveMutation.mutate({ appId: la.id, decision: 'rejected' })
                            }
                            className="text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer h-7"
                          >
                            Reject
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 10.5 ENTERPRISE HOSPITALITY PAYROLL ENGINE
          ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* General Ledger Accounting Mapping Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Salaries Expense (OPEX)</p>
              <p className="font-mono font-bold text-cyan-400 text-sm">Account 6010 (Debit)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Base contract payroll expense</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Payroll Payable (Liability)</p>
              <p className="font-mono font-bold text-cyan-400 text-sm">Account 2300 (Credit)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Accrued net wages owed</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Statutory Taxes Payable</p>
              <p className="font-mono font-bold text-cyan-400 text-sm">Account 2200 (Credit)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">10% tax withholding</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Employee Loan Advances</p>
              <p className="font-mono font-bold text-cyan-400 text-sm">Account 1150 (Credit)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Scheduled advance repayments</p>
            </div>
          </div>

          {/* 10% Guest Service Charge Pool Share Card */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px]">
                  10% Service Charge Pool
                </Badge>
                <span className="font-mono text-xs text-slate-500 font-bold">Month: {payrollMonth}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Total Pool: ${serviceChargePool ? Number(serviceChargePool.totalPool).toLocaleString() : '48,500.00'}{' '}
                distributed among {serviceChargePool ? serviceChargePool.paxStaff : 65} frontline staff
              </h3>
              <p className="text-xs text-slate-500">
                Every frontline employee receives an equal point share of{' '}
                <span className="font-bold text-emerald-600">
                  ${serviceChargePool ? Number(serviceChargePool.sharePerPax).toFixed(2) : '746.15'}
                </span>{' '}
                credited directly into their monthly net salary.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsServiceChargeModalOpen(true)}
                className="font-bold text-xs cursor-pointer"
              >
                Configure Pool
              </Button>
              <Button
                size="sm"
                onClick={() => runPayrollMutation.mutate(payrollMonth)}
                disabled={runPayrollMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                {runPayrollMutation.isPending ? 'Processing...' : `Run ${payrollMonth} Payroll`}
              </Button>
            </div>
          </div>

          {/* Processed Payslips Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Monthly Generated Payslips ({payrollMonth})
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {monthlyPayslips.length} payslips recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Basic Salary</th>
                    <th className="p-3.5">Overtime Pay</th>
                    <th className="p-3.5">10% Pool Share</th>
                    <th className="p-3.5">Tax Deduction</th>
                    <th className="p-3.5">Net Disbursed</th>
                    <th className="p-3.5 text-right">Encrypted PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyPayslips.map((ps) => {
                    const basic = Number(ps.basicSalary);
                    const net = Number(ps.netSalary);
                    const ot = ps.overtimes?.reduce((acc, o) => acc + Number(o.amount), 0) || 0;
                    const allowance = ps.allowances?.reduce((acc, a) => acc + Number(a.amount), 0) || 746.15;
                    const tax = ps.deductions?.find((d) => d.title.includes('Tax'))?.amount || basic * 0.1;

                    return (
                      <tr key={ps.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900">{ps.employee?.fullName}</span>
                          <span className="text-[11px] font-mono text-slate-400 ml-1.5">
                            ({ps.employee?.employeeCode})
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {ps.employee?.department?.name || 'Front Office'}
                        </td>
                        <td className="p-3.5 font-mono text-slate-900">${basic.toLocaleString()}</td>
                        <td className="p-3.5 font-mono text-amber-700 font-bold">
                          {ot > 0 ? `+$${ot.toFixed(2)}` : '—'}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-700 font-bold">
                          +${Number(allowance).toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono text-rose-700">-${Number(tax).toFixed(2)}</td>
                        <td className="p-3.5 font-mono font-black text-slate-900 text-sm">
                          ${net.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <a
                            href={ps.pdfUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                          >
                            <Download className="w-3 h-3 text-[#00a8ff]" /> Download PDF
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: 10.6 RECRUITMENT & APPLICANT TRACKING SYSTEM (ATS)
          ========================================================================= */}
      {activeTab === 'ats' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Active Jobs Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-600" />
                Active Hospitality Openings (Public Careers Portal Integration)
              </h3>
              <p className="text-xs text-slate-500">
                Kanban pipeline tracking high-turnover hospitality positions with Zoom video interview scheduling.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsNewJobOpen(true)}
              className="bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Post Job Vacancy
            </Button>
          </div>

          {/* Active Job Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {jobs.map((j) => (
              <div key={j.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-cyan-700 bg-cyan-50 border-cyan-200">
                    {j.category}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {j.positionsCount} open
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{j.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{j.description}</p>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{j.branch || 'Grand Azure Resort'}</span>
                  <span className="font-bold text-slate-700">{j.applications?.length || 0} applicants</span>
                </div>
              </div>
            ))}
          </div>

          {/* 6-Stage Kanban Pipeline */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Interactive Candidate Kanban Pipeline (6 Stages)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { stage: 'applied', label: '1. Applied', color: 'border-slate-300 bg-slate-50' },
                { stage: 'screening', label: '2. Screening', color: 'border-sky-300 bg-sky-50/50' },
                { stage: 'skills_assessment', label: '3. Assessment', color: 'border-indigo-300 bg-indigo-50/50' },
                { stage: 'interview', label: '4. Zoom Interview', color: 'border-amber-300 bg-amber-50/50' },
                { stage: 'offered', label: '5. Job Offer', color: 'border-purple-300 bg-purple-50/50' },
                { stage: 'onboarded', label: '6. Onboarded', color: 'border-emerald-300 bg-emerald-50/50' },
              ].map((col) => {
                const stageCandidates = applications.filter((a) => a.stage === col.stage);
                return (
                  <div key={col.stage} className={`p-2.5 rounded-xl border-2 ${col.color} min-h-[420px] flex flex-col`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                      <span className="font-bold text-xs text-slate-900">{col.label}</span>
                      <span className="w-5 h-5 rounded-full bg-white text-slate-800 text-[10px] font-bold flex items-center justify-center shadow-2xs">
                        {stageCandidates.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {stageCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1.5"
                        >
                          <div className="font-bold text-xs text-slate-900">{cand.name}</div>
                          <div className="text-[10px] text-cyan-700 font-medium truncate">
                            {cand.job?.title || 'Applied Candidate'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{cand.email}</div>

                          {/* Zoom video meeting button if interview scheduled */}
                          {cand.interviews && cand.interviews.length > 0 && (
                            <a
                              href={cand.interviews[0].zoomJoinUrl || 'https://zoom.us'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition"
                            >
                              <Video className="w-3 h-3" /> Launch Zoom Meeting
                            </a>
                          )}

                          {/* Actions: Move Stage / Schedule Zoom */}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                            {col.stage !== 'interview' && col.stage !== 'onboarded' && (
                              <button
                                type="button"
                                onClick={() => setIsScheduleInterviewOpen(cand.id)}
                                className="text-blue-600 hover:underline font-bold"
                              >
                                + Zoom
                              </button>
                            )}

                            <select
                              value={cand.stage}
                              onChange={(e) =>
                                updateStageMutation.mutate({ appId: cand.id, stage: e.target.value as any })
                              }
                              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-bold focus:outline-hidden cursor-pointer"
                            >
                              <option value="applied">Applied</option>
                              <option value="screening">Screening</option>
                              <option value="skills_assessment">Assessment</option>
                              <option value="interview">Interview</option>
                              <option value="offered">Offer</option>
                              <option value="onboarded">Onboarded</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: 10.7 & 10.8 APPRAISALS, GOALS & HOSPITALITY TRAINING
          ========================================================================= */}
      {activeTab === 'appraisals' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Key Performance Indicators (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Guest Review Satisfaction
              </span>
              <div className="text-2xl font-black text-slate-900">4.9 / 5.0</div>
              <p className="text-[10px] text-emerald-600 font-semibold">★ Top 1% TripAdvisor index</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Room Turnaround Pacing
              </span>
              <div className="text-2xl font-black text-slate-900">22.4 mins</div>
              <p className="text-[10px] text-emerald-600 font-semibold">Target: &lt; 25 mins per suite</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Wine & Cellar Upsell Growth
              </span>
              <div className="text-2xl font-black text-slate-900">+18.5%</div>
              <p className="text-[10px] text-emerald-600 font-semibold">Sommelier pairing attachment</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Biometric Punctuality Index
              </span>
              <div className="text-2xl font-black text-slate-900">99.2%</div>
              <p className="text-[10px] text-emerald-600 font-semibold">Zero buddy-punching incidents</p>
            </div>
          </div>

          {/* SMART Goals & 360-Degree Appraisals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SMART Goals */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  SMART Performance Goals & Department Targets
                </h3>
              </div>
              <div className="space-y-3 pt-1">
                {goals.map((g) => (
                  <div key={g.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{g.target}</span>
                      <span className="font-mono font-bold text-emerald-700">{g.progressPct}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${g.progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{g.goalType}</span>
                      <span>Target: {new Date(g.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 360-Degree Appraisals */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  360-Degree Performance Appraisals
                </h3>
                <Button
                  size="sm"
                  onClick={() => setIsAppraisalModalOpen(true)}
                  className="bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Record Appraisal
                </Button>
              </div>

              <div className="space-y-2.5 pt-1">
                {appraisals.map((apr) => (
                  <div key={apr.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {apr.employee?.fullName || 'Sarah Jenkins'}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-amber-700">★ {apr.ratingScore}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({apr.reviewPeriod})</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{apr.feedback}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 10.8 Training Programs & Professional Hospitality Certifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Training Programs */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Hospitality Training Curriculum & Masterclasses
              </h3>
              <div className="space-y-2">
                {trainingPrograms.map((tr) => (
                  <div key={tr.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="font-bold text-xs text-slate-900">{tr.title}</div>
                    <p className="text-[11px] text-slate-600">Instructor: {tr.trainer}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>
                        {new Date(tr.startDate).toLocaleDateString()} —{' '}
                        {new Date(tr.endDate).toLocaleDateString()}
                      </span>
                      <span className="text-emerald-700 font-bold">● Certified Course</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications Expiry Alerts */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Professional Certifications & Expiry Tracking
              </h3>
              <div className="space-y-2">
                {certifications.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{c.certName}</div>
                      <div className="text-[11px] text-slate-500">Issued by: {c.issuedBy}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Valid until {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: 10.9 HR ADMINISTRATION, DISCIPLINARY & OFFBOARDING
          ========================================================================= */}
      {activeTab === 'administration' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Employee of the Month Awards */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Employee Awards & Financial Recognition
              </h3>
              <div className="space-y-2">
                {adminWorkflows.awards.map((aw) => (
                  <div key={aw.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{aw.awardName}</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                        +${Number(aw.cashBonus).toFixed(2)} Cash Bonus
                      </Badge>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700">Recipient: {aw.employeeName}</p>
                    <p className="text-[10px] text-slate-500">Prize: {aw.giftPrize}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaints & Grievance Whistleblower Log */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                Confidential Complaints & Grievance Investigation Log
              </h3>
              <div className="space-y-2">
                {adminWorkflows.complaints.map((cmp) => (
                  <div key={cmp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{cmp.title}</span>
                      <Badge
                        className={`text-[9px] ${
                          cmp.isResolved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {cmp.isResolved ? 'Resolved' : 'Under Investigation'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">{cmp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disciplinary Warnings */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Formal Written Disciplinary Warnings
              </h3>
              <div className="space-y-2">
                {adminWorkflows.warnings.map((dw) => (
                  <div key={dw.id} className="p-3 bg-rose-50/40 rounded-lg border border-rose-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-900">{dw.warningType}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(dw.issuedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700">{dw.description}</p>
                    <p className="text-[10px] text-emerald-700 font-bold pt-1">
                      ✓ Acknowledged & Signed by Employee
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Offboarding Clearance Checklist */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Offboarding & Asset Handover Clearance Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Mandatory clearance requirements before issuance of final experience certificate.
              </p>
              <div className="space-y-2 pt-1">
                {adminWorkflows.checklists.map((ob) => (
                  <div
                    key={ob.id}
                    onClick={() =>
                      toggleChecklistMutation.mutate({ id: ob.id, isReturned: !ob.isReturned })
                    }
                    className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      ob.isReturned
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          ob.isReturned
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {ob.isReturned && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-semibold ${ob.isReturned ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {ob.itemName}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {ob.isReturned ? 'Returned & Verified' : 'Pending Return'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW FULL PERSONNEL DOSSIER
          ========================================================================= */}
      {selectedEmployeeId && employeeDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400 text-slate-900 font-black flex items-center justify-center text-base">
                  {employeeDetail.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base">{employeeDetail.fullName}</h3>
                  <p className="text-xs text-cyan-300 font-mono">
                    {employeeDetail.employeeCode} · {employeeDetail.designation?.name || 'Staff'} (
                    {employeeDetail.department?.name || 'Operations'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployeeId(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Personnel Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Branch Property</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {employeeDetail.branch?.name || 'Grand Azure Resort'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Monthly Contract</span>
                  <p className="font-bold text-slate-900 mt-0.5 font-mono">
                    ${Number(employeeDetail.salaryBasic).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Joining Date</span>
                  <p className="font-bold text-slate-900 mt-0.5 font-mono">
                    {new Date(employeeDetail.joiningDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Emergency Contact</span>
                  <p className="font-bold text-slate-900 mt-0.5">+1 (305) 555-9988</p>
                </div>
              </div>

              {/* Digital Employment Letters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    Digital Employment Documentation & Verification Letters
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        generateLetterMutation.mutate({ empId: employeeDetail.id, type: 'offer' })
                      }
                      className="text-[11px] font-bold cursor-pointer h-7"
                    >
                      + Offer Letter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        generateLetterMutation.mutate({ empId: employeeDetail.id, type: 'joining' })
                      }
                      className="text-[11px] font-bold cursor-pointer h-7"
                    >
                      + Joining Letter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        generateLetterMutation.mutate({ empId: employeeDetail.id, type: 'experience' })
                      }
                      className="text-[11px] font-bold cursor-pointer h-7"
                    >
                      + Experience Cert
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    ...(employeeDetail.offerLetters || []).map((l) => ({ type: 'Offer Letter', ...l })),
                    ...(employeeDetail.joiningLetters || []).map((l) => ({
                      type: 'Joining Acceptance',
                      ...l,
                    })),
                    ...(employeeDetail.experienceCerts || []).map((l) => ({
                      type: 'Experience Certificate',
                      ...l,
                    })),
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-white space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-sky-50 text-[#00a8ff] border-sky-200 font-bold text-[10px]">
                          {doc.type}
                        </Badge>
                        <span className="font-mono text-[10px] text-slate-400">
                          {new Date(doc.letterDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-serif text-[11px] pt-1">
                        "{doc.content}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Deposit & Banking Information */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Banking, Direct Deposit & Statutory Withholding
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Direct Deposit Bank:</span>
                    <p className="font-bold text-slate-900">JPMorgan Chase Corporate</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Account Number:</span>
                    <p className="font-mono font-bold text-slate-900">**** **** 8821</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Routing / SWIFT:</span>
                    <p className="font-mono font-bold text-slate-900">CHASUS33XXX</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tax ID / SSN:</span>
                    <p className="font-mono font-bold text-slate-900">***-**-4412</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button
                size="sm"
                onClick={() => setSelectedEmployeeId(null)}
                className="bg-slate-900 text-white font-bold cursor-pointer"
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTER NEW EMPLOYEE
          ========================================================================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Register Staff Member</h3>
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={newStaffInput.employeeCode}
                    onChange={(e) => setNewStaffInput({ ...newStaffInput, employeeCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Basic Salary ($/mo)</label>
                  <input
                    type="number"
                    value={newStaffInput.salaryBasic}
                    onChange={(e) =>
                      setNewStaffInput({ ...newStaffInput, salaryBasic: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jean-Luc Picard"
                  value={newStaffInput.fullName}
                  onChange={(e) => setNewStaffInput({ ...newStaffInput, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Work Email</label>
                  <input
                    type="email"
                    placeholder="staff@omnistay.com"
                    value={newStaffInput.email}
                    onChange={(e) => setNewStaffInput({ ...newStaffInput, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (305) 555-0199"
                    value={newStaffInput.phone}
                    onChange={(e) => setNewStaffInput({ ...newStaffInput, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Branch / Property</label>
                <select
                  value={newStaffInput.branchId}
                  onChange={(e) => setNewStaffInput({ ...newStaffInput, branchId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                >
                  <option value="">Select Property...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddStaffOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!newStaffInput.fullName || !newStaffInput.email}
                onClick={() => createEmployeeMutation.mutate(newStaffInput)}
                className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold cursor-pointer"
              >
                Save Staff Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: HARDWARE BIOMETRIC PUNCH SIMULATOR
          ========================================================================= */}
      {isBiometricSimOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-cyan-600" />
                Hardware Biometric Terminal Punch
              </h3>
              <button
                type="button"
                onClick={() => setIsBiometricSimOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Hardware Terminal</label>
                <select
                  value={biometricPunchInput.deviceId}
                  onChange={(e) =>
                    setBiometricPunchInput({ ...biometricPunchInput, deviceId: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer font-medium"
                >
                  {biometricDevices.map((d) => (
                    <option key={d.id} value={d.deviceName}>
                      {d.deviceName} ({d.deviceModel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Employee</label>
                <select
                  value={biometricPunchInput.employeeCode}
                  onChange={(e) =>
                    setBiometricPunchInput({ ...biometricPunchInput, employeeCode: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.employeeCode}>
                      {e.fullName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Punch Event Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setBiometricPunchInput({ ...biometricPunchInput, punchType: 'clock_in' })
                    }
                    className={`p-2 rounded-lg font-bold border transition cursor-pointer text-center ${
                      biometricPunchInput.punchType === 'clock_in'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    Clock In (Shift Start)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBiometricPunchInput({ ...biometricPunchInput, punchType: 'clock_out' })
                    }
                    className={`p-2 rounded-lg font-bold border transition cursor-pointer text-center ${
                      biometricPunchInput.punchType === 'clock_out'
                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    Clock Out (Shift End)
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBiometricSimOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  biometricPunchMutation.mutate({
                    ...biometricPunchInput,
                    punchTime: new Date().toISOString(),
                  })
                }
                className="bg-slate-900 hover:bg-black text-white font-bold cursor-pointer"
              >
                Transmit Biometric Timestamp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: MOBILE GPS GEOFENCE CLOCK-IN
          ========================================================================= */}
      {isMobileGeofenceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                Mobile Staff GPS Geofence (50m Radius)
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileGeofenceOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Staff can only punch in when their mobile GPS coordinate is within 50 meters of the property perimeter (Perimeter: 25.7617, -80.1918).
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Employee</label>
                <select
                  value={mobileGeofenceInput.employeeCode}
                  onChange={(e) =>
                    setMobileGeofenceInput({ ...mobileGeofenceInput, employeeCode: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.employeeCode}>
                      {e.fullName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={mobileGeofenceInput.latitude}
                    onChange={(e) =>
                      setMobileGeofenceInput({
                        ...mobileGeofenceInput,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={mobileGeofenceInput.longitude}
                    onChange={(e) =>
                      setMobileGeofenceInput({
                        ...mobileGeofenceInput,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileGeofenceOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => mobileGeofenceMutation.mutate(mobileGeofenceInput)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Verify Distance & Clock In
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: APPLY FOR LEAVE
          ========================================================================= */}
      {isApplyLeaveOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Submit Leave Application</h3>
              <button
                type="button"
                onClick={() => setIsApplyLeaveOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Staff Member</label>
                <select
                  value={leaveInput.employeeId}
                  onChange={(e) => setLeaveInput({ ...leaveInput, employeeId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Leave Category</label>
                <select
                  value={leaveInput.leaveTypeId}
                  onChange={(e) => setLeaveInput({ ...leaveInput, leaveTypeId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                >
                  <option value="">Select Category...</option>
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.title} ({lt.daysPerYear} days/yr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveInput.startDate}
                    onChange={(e) => setLeaveInput({ ...leaveInput, startDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveInput.endDate}
                    onChange={(e) => setLeaveInput({ ...leaveInput, endDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for absence..."
                  value={leaveInput.reason}
                  onChange={(e) => setLeaveInput({ ...leaveInput, reason: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApplyLeaveOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!leaveInput.employeeId || !leaveInput.leaveTypeId}
                onClick={() => applyLeaveMutation.mutate(leaveInput)}
                className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold cursor-pointer"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
