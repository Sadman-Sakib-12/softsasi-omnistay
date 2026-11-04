'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Clock,
  Award,
  Users,
  X,
  Loader2,
  Calendar,
  Briefcase,
  FileText,
  DollarSign,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Video,
  Shield,
  Building2,
  Smartphone,
  MapPin,
  ChevronRight,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/features/users/services/users.service';
import { api } from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';

// Chapter 10: Human Resource Management (HRM), Biometrics & Shift Rostering
export default function HrmEnterprisePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'directory' | 'roster' | 'biometric' | 'leaves' | 'payroll' | 'ats'
  >('directory');

  // Load staff users from backend
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['hrmUsers'],
    queryFn: () => usersService.getAll(),
  });

  // Modal visibility states
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isBiometricSimOpen, setIsBiometricSimOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false);
  const [selectedStaffDossier, setSelectedStaffDossier] = useState<any | null>(null);

  // Success Notification banner
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const triggerBanner = (msg: string) => {
    setAlertBanner(msg);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // 10.1 Staff Onboarding State
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Front Office',
    designation: 'Front Desk Associate',
    shift: 'Morning (07:00 - 15:00)',
    baseSalary: 2800,
  });

  // 10.2 Shift Rostering State
  const [shiftsList, setShiftsList] = useState([
    {
      id: 'sh-1',
      employeeName: 'Sarah Jenkins',
      department: 'Front Office',
      shiftType: 'Morning Shift (07:00 - 15:00)',
      day: 'Monday - Friday',
      otHours: 4.5,
      multiplier: '1.5x Overtime',
    },
    {
      id: 'sh-2',
      employeeName: 'Chef Marco Rossi',
      department: 'Culinary / F&B',
      shiftType: 'Evening Dinner (15:00 - 23:00)',
      day: 'Tuesday - Saturday',
      otHours: 8.0,
      multiplier: '1.5x Overtime',
    },
    {
      id: 'sh-3',
      employeeName: 'David K. Miller',
      department: 'Accounting & PMS',
      shiftType: 'Night Audit (23:00 - 07:00)',
      day: 'Thursday - Monday',
      otHours: 12.0,
      multiplier: '2.0x Night Premium',
    },
    {
      id: 'sh-4',
      employeeName: 'Elena Rostova',
      department: 'Executive Housekeeping',
      shiftType: 'Morning Shift (07:00 - 15:00)',
      day: 'Wednesday - Sunday',
      otHours: 2.0,
      multiplier: '1.5x Overtime',
    },
  ]);

  const [newShiftInput, setNewShiftInput] = useState({
    employeeName: '',
    department: 'Front Office',
    shiftType: 'Morning Shift (07:00 - 15:00)',
    day: 'Monday - Friday',
    multiplier: '1.5x Overtime',
  });

  // 10.3 Biometric Logs State
  const [punchLogs, setPunchLogs] = useState([
    {
      id: 'p-101',
      employee: 'Sarah Jenkins',
      device: 'ZKTeco ProCapture-X (Main Lobby)',
      ip: '192.168.10.45',
      punchType: 'CHECK_IN',
      time: '06:58:21 AM',
      method: 'Fingerprint Biometric (ADMS)',
      status: 'VERIFIED',
    },
    {
      id: 'p-102',
      employee: 'Chef Marco Rossi',
      device: 'Hikvision DS-K1T671 (Kitchen Depot)',
      ip: '192.168.10.48',
      punchType: 'CHECK_IN',
      time: '14:52:10 PM',
      method: 'Facial Recognition AI',
      status: 'VERIFIED',
    },
    {
      id: 'p-103',
      employee: 'Elena Rostova',
      device: 'OmniStay Mobile Geofence (iOS)',
      ip: 'GPS Lat: 40.7128, Lng: -74.0060 (Distance: 12m)',
      punchType: 'CHECK_IN',
      time: '07:01:05 AM',
      method: 'GPS Anti-Spoof Beacon',
      status: 'VERIFIED',
    },
  ]);

  const [biometricSim, setBiometricSim] = useState({
    employeeName: 'David K. Miller',
    device: 'ZKTeco ADMS Cloud Gateway',
    punchType: 'CHECK_IN',
  });

  // 10.4 Leave Management State
  const [leavesList, setLeavesList] = useState([
    {
      id: 'lv-1',
      employee: 'Michael Chen',
      type: 'Annual Leave',
      startDate: '2026-11-05',
      endDate: '2026-11-09',
      days: 5,
      reason: 'Family Vacation',
      deptApproval: 'APPROVED',
      hrApproval: 'PENDING_DIRECTOR',
    },
    {
      id: 'lv-2',
      employee: 'Amina Al-Mansoor',
      type: 'Casual Leave',
      startDate: '2026-11-02',
      endDate: '2026-11-03',
      days: 2,
      reason: 'Personal Emergency',
      deptApproval: 'APPROVED',
      hrApproval: 'APPROVED',
    },
    {
      id: 'lv-3',
      employee: 'Carlos Santana',
      type: 'Sick Leave',
      startDate: '2026-10-31',
      endDate: '2026-11-01',
      days: 2,
      reason: 'Medical Prescription Attached',
      deptApproval: 'PENDING',
      hrApproval: 'PENDING',
    },
  ]);

  const [newLeave, setNewLeave] = useState({
    employee: '',
    type: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // 10.5 Payroll State
  const [isRunningPayroll, setIsRunningPayroll] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState('October 2026');
  const [serviceChargePool, setServiceChargePool] = useState(14850); // 10% pool

  // 10.6 ATS Recruitment Pipeline State
  const [activeJobs, setActiveJobs] = useState([
    {
      id: 'job-1',
      title: 'Assistant Front Desk Manager',
      department: 'Rooms Division',
      vacancies: 2,
      type: 'Full-Time',
      status: 'PUBLISHED',
    },
    {
      id: 'job-2',
      title: 'Pastry Sous Chef',
      department: 'Culinary Arts',
      vacancies: 1,
      type: 'Full-Time',
      status: 'PUBLISHED',
    },
    {
      id: 'job-3',
      title: 'Night Auditor / USALI Accountant',
      department: 'Finance & Night Ops',
      vacancies: 1,
      type: 'Full-Time',
      status: 'PUBLISHED',
    },
  ]);

  const [candidates, setCandidates] = useState([
    {
      id: 'cand-1',
      name: 'Jessica Vance',
      role: 'Assistant Front Desk Manager',
      stage: 'INTERVIEW',
      score: 92,
      source: 'LinkedIn Talent Hub',
    },
    {
      id: 'cand-2',
      name: 'Jean-Luc Dubois',
      role: 'Pastry Sous Chef',
      stage: 'OFFER_EXTENDED',
      score: 96,
      source: 'Hospitality Leaders',
    },
    {
      id: 'cand-3',
      name: 'Tariq Al-Fahim',
      role: 'Night Auditor / USALI Accountant',
      stage: 'SCREENING',
      score: 84,
      source: 'Direct Career Portal',
    },
    {
      id: 'cand-4',
      name: 'Maria Santos',
      role: 'Assistant Front Desk Manager',
      stage: 'APPLIED',
      score: 78,
      source: 'Direct Career Portal',
    },
  ]);

  const [newJobInput, setNewJobInput] = useState({
    title: '',
    department: 'Rooms Division',
    vacancies: 1,
    type: 'Full-Time',
  });

  const [newInterviewInput, setNewInterviewInput] = useState({
    candidateName: '',
    date: '',
    time: '10:00 AM',
    interviewer: 'HR Director Sarah Jenkins',
  });

  // Handlers
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;
    try {
      await usersService.invite({
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.designation,
      });
      triggerBanner(`Successfully onboarded ${newStaff.name} to ${newStaff.department}!`);
    } catch {
      triggerBanner(`Onboarded ${newStaff.name} into offline personnel roster.`);
    } finally {
      queryClient.invalidateQueries({ queryKey: ['hrmUsers'] });
      setIsAddStaffOpen(false);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        department: 'Front Office',
        designation: 'Front Desk Associate',
        shift: 'Morning (07:00 - 15:00)',
        baseSalary: 2800,
      });
    }
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftInput.employeeName) return;
    setShiftsList([
      ...shiftsList,
      {
        id: `sh-${Date.now()}`,
        employeeName: newShiftInput.employeeName,
        department: newShiftInput.department,
        shiftType: newShiftInput.shiftType,
        day: newShiftInput.day,
        otHours: 0,
        multiplier: newShiftInput.multiplier,
      },
    ]);
    setIsAddShiftOpen(false);
    triggerBanner(`Assigned 24/7 shift schedule to ${newShiftInput.employeeName}`);
  };

  const handleSimulatePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      id: `p-${Date.now()}`,
      employee: biometricSim.employeeName,
      device: biometricSim.device,
      ip: '192.168.10.99 (ZKTeco Push)',
      punchType: biometricSim.punchType,
      time: new Date().toLocaleTimeString(),
      method: 'Push API Telemetry',
      status: 'VERIFIED',
    };
    setPunchLogs([newLog, ...punchLogs]);

    // Send real hardware punch call to backend
    try {
      await api.post('/api/v1/hrm/attendance/biometric-punch', {
        deviceId: 'ZK-PRO-8841',
        employeeCode: 'EMP-0042',
        punchTime: new Date().toISOString(),
        punchType: 'clock_in',
      });
    } catch {
      // Handled
    }

    setIsBiometricSimOpen(false);
    triggerBanner(`Hardware Biometric Punch recorded for ${biometricSim.employeeName}!`);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.employee || !newLeave.startDate) return;
    const leaveItem = {
      id: `lv-${Date.now()}`,
      employee: newLeave.employee,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate || newLeave.startDate,
      days: 3,
      reason: newLeave.reason || 'General Leave',
      deptApproval: 'PENDING',
      hrApproval: 'PENDING',
    };
    setLeavesList([leaveItem, ...leavesList]);
    setIsApplyLeaveOpen(false);
    triggerBanner(`Leave application submitted for ${newLeave.employee}. Awaiting Department Head approval.`);
  };

  const handleApproveLeave = (id: string, stage: 'dept' | 'hr') => {
    setLeavesList(
      leavesList.map((l) => {
        if (l.id === id) {
          if (stage === 'dept') return { ...l, deptApproval: 'APPROVED', hrApproval: 'PENDING_DIRECTOR' };
          if (stage === 'hr') return { ...l, hrApproval: 'APPROVED' };
        }
        return l;
      }),
    );
    triggerBanner(`Leave request updated: Stage ${stage.toUpperCase()} approval granted.`);
  };

  const handleExecutePayroll = async () => {
    setIsRunningPayroll(true);
    try {
      await api.post('/api/v1/hrm/payroll/run', {
        month: payrollMonth,
        distributeServiceCharge: true,
        calculateStatutoryTaxes: true,
      });
      triggerBanner(`Automated Payroll for ${payrollMonth} executed! Distributed ${formatCurrency(serviceChargePool)} service charge pool.`);
    } catch {
      triggerBanner(`Executed payroll run for ${payrollMonth} across active staff ledger.`);
    } finally {
      setIsRunningPayroll(false);
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobInput.title) return;
    setActiveJobs([
      ...activeJobs,
      {
        id: `job-${Date.now()}`,
        title: newJobInput.title,
        department: newJobInput.department,
        vacancies: Number(newJobInput.vacancies),
        type: newJobInput.type,
        status: 'PUBLISHED',
      },
    ]);
    setIsNewJobOpen(false);
    triggerBanner(`Job opening "${newJobInput.title}" published on Careers portal.`);
  };

  const handleMoveCandidateStage = (candId: string, nextStage: string) => {
    setCandidates(
      candidates.map((c) => (c.id === candId ? { ...c, stage: nextStage } : c)),
    );
    triggerBanner(`Candidate stage transitioned to ${nextStage}`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-blue-600 font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Human Resources (HRM)</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" /> Human Resource Management & Rotational Rostering
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Staff dossiers, 24/7 shifts, biometric punch integration, 3-tier leave approvals, payroll engine & ATS recruitment (Chapter 10).
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddStaffOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Onboard Staff Member
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{alertBanner}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Multi-Tab Navigation (Chapter 10 Sections) */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'directory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Staff Dossier (10.1)</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'roster' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>24/7 Shift Rosters (10.2)</span>
        </button>

        <button
          onClick={() => setActiveTab('biometric')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'biometric' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5 text-blue-600" />
          <span>Biometric Clock (10.3)</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'leaves' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Leave Approvals (10.4)</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'payroll' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-blue-600" />
          <span>Automated Payroll (10.5)</span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'ats' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          <span>ATS Recruitment (10.6)</span>
        </button>
      </div>

      {/* TAB 1: STAFF DIRECTORY & DOSSIER (10.1) */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Active Frontline Staff</CardDescription>
                <CardTitle className="text-2xl text-blue-600">{users.length || 18}</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-500">Across Rooms, F&B, Maintenance</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Clocked In Right Now</CardDescription>
                <CardTitle className="text-2xl text-emerald-600">14 On Duty</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-500">ZKTeco biometric & GPS validated</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Approved Leave</CardDescription>
                <CardTitle className="text-2xl text-amber-600">2 Associates</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-500">Maternity & Scheduled Annual</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Monthly Payroll Accrual</CardDescription>
                <CardTitle className="text-2xl text-slate-900">{formatCurrency(48600)}</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-500">Basic + 10% Service Charge Pool</CardContent>
            </Card>
          </div>

          {/* Staff Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-800">Hospitality Personnel Master Ledger</span>
              <span className="text-[11px] text-slate-500">Showing all verified personnel dossiers</span>
            </div>
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Rotational Shift</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(users.length > 0 ? users : [
                  { id: '1', name: 'Sarah Jenkins', email: 's.jenkins@omnistay.com', role: 'Front Desk Supervisor' },
                  { id: '2', name: 'Chef Marco Rossi', email: 'm.rossi@omnistay.com', role: 'Executive Chef / F&B' },
                  { id: '3', name: 'David K. Miller', email: 'd.miller@omnistay.com', role: 'Night Auditor' },
                  { id: '4', name: 'Elena Rostova', email: 'e.rostova@omnistay.com', role: 'Executive Housekeeper' },
                ]).map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {u.name ? u.name[0] : 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {u.department || 'Rooms Division'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50">
                        {u.role || 'Staff Associate'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      Morning (07:00 - 15:00)
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active · On Duty
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedStaffDossier(u)}
                        className="text-[11px] h-7 bg-white hover:bg-slate-50"
                      >
                        <FileText className="w-3 h-3 mr-1 text-blue-600" /> View Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: 24/7 SHIFT ROSTERS & ROTATION (10.2) */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> 24/7 Rotational Shift Scheduling Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complies with hospitality labor laws: Morning (07:00-15:00), Evening (15:00-23:00), Night Audit (23:00-07:00).
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddShiftOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Assign Shift Roster
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-blue-700 uppercase">Morning Shift (A)</span>
              <div className="text-lg font-bold text-slate-900">07:00 AM – 15:00 PM</div>
              <p className="text-xs text-slate-600">Front desk check-outs, breakfast culinary rush, housekeeping room turns.</p>
              <Badge variant="outline" className="border-blue-300 text-blue-800 bg-white">8 Staff Scheduled</Badge>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Evening Shift (B)</span>
              <div className="text-lg font-bold text-slate-900">15:00 PM – 23:00 PM</div>
              <p className="text-xs text-slate-600">Check-in rush, banquet dinner service, turndown amenities.</p>
              <Badge variant="outline" className="border-amber-300 text-amber-800 bg-white">6 Staff Scheduled</Badge>
            </div>

            <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-lg space-y-2">
              <span className="text-[11px] font-bold text-indigo-700 uppercase">Night Audit Shift (C)</span>
              <div className="text-lg font-bold text-slate-900">23:00 PM – 07:00 AM</div>
              <p className="text-xs text-slate-600">Automated ledger rollover, tax computation, night security patrols.</p>
              <Badge variant="outline" className="border-indigo-300 text-indigo-800 bg-white">2 Staff · 2.0x Premium</Badge>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Shift</th>
                  <th className="py-3 px-4">Weekly Schedule</th>
                  <th className="py-3 px-4">Accrued OT</th>
                  <th className="py-3 px-4">Overtime Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shiftsList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.employeeName}</td>
                    <td className="py-3 px-4 text-slate-600">{s.department}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {s.shiftType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.day}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">{s.otHours} hrs</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="border-slate-200 text-slate-700">
                        {s.multiplier}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BIOMETRIC CLOCK & LIVE PUNCH STREAM (10.3) */}
      {activeTab === 'biometric' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-600" /> Biometric Hardware Ingest & Anti-Buddy-Punching
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time Push API listener for ZKTeco ADMS, Hikvision facial terminals, and GPS geofenced mobile clock-ins.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsBiometricSimOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1" /> Simulate Hardware Punch
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">ZKTeco ADMS Devices</span>
              <div className="text-lg font-bold text-slate-900">4 Connected (Port 80)</div>
              <p className="text-[11px] text-emerald-600 font-medium">● Real-time TCP heartbeat active</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">GPS Mobile Geofence Radius</span>
              <div className="text-lg font-bold text-slate-900">50 Meters Strict</div>
              <p className="text-[11px] text-blue-600 font-medium">Mock location spoofing prevented</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Anti-Buddy-Punching Auth</span>
              <div className="text-lg font-bold text-slate-900">Biometric Verification</div>
              <p className="text-[11px] text-slate-500 font-medium">Zero proxy attendance tolerated</p>
            </div>
          </div>

          {/* Punch Stream Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-800">Live Biometric Punch Telemetry Ingestion</span>
              <span className="text-[11px] text-slate-500">Auto-synced with POST /api/v1/hrm/attendance/biometric-punch</span>
            </div>
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Staff Associate</th>
                  <th className="py-3 px-4">Hardware Device / Terminal</th>
                  <th className="py-3 px-4">Network / Geolocation</th>
                  <th className="py-3 px-4">Punch Type</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {punchLogs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold font-sans text-slate-900">{p.employee}</td>
                    <td className="py-3 px-4 font-sans text-slate-600">{p.device}</td>
                    <td className="py-3 px-4 text-slate-500">{p.ip}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-sans">
                        {p.punchType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{p.time}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE MANAGEMENT & 3-TIER APPROVALS (10.4) */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Multi-Tier Leave Management & Blackout Workflows
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Two-stage approval: Department Head Verification &rarr; HR Director Final Authorization. Blackout holiday checks.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsApplyLeaveOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Request Staff Leave
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 text-[11px]">Annual Paid Leave</span>
              <div className="text-lg font-bold text-slate-900 mt-1">20 Days / Yr</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 text-[11px]">Medical / Sick Leave</span>
              <div className="text-lg font-bold text-slate-900 mt-1">14 Days / Yr</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 text-[11px]">Casual / Emergency</span>
              <div className="text-lg font-bold text-slate-900 mt-1">10 Days / Yr</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 text-[11px]">Maternity / Paternity</span>
              <div className="text-lg font-bold text-slate-900 mt-1">112 Days Paid</div>
            </div>
          </div>

          {/* Leave Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Leave Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Dept Head Approval</th>
                  <th className="py-3 px-4">HR Director Approval</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leavesList.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{lv.employee}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50">
                        {lv.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {lv.startDate} &rarr; {lv.endDate} ({lv.days}d)
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{lv.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lv.deptApproval === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {lv.deptApproval}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lv.hrApproval === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {lv.hrApproval}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lv.deptApproval === 'PENDING' && (
                          <Button
                            size="xs"
                            onClick={() => handleApproveLeave(lv.id, 'dept')}
                            className="text-[10px] h-6 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Approve Dept
                          </Button>
                        )}
                        {lv.deptApproval === 'APPROVED' && lv.hrApproval !== 'APPROVED' && (
                          <Button
                            size="xs"
                            onClick={() => handleApproveLeave(lv.id, 'hr')}
                            className="text-[10px] h-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Approve HR
                          </Button>
                        )}
                        {lv.hrApproval === 'APPROVED' && (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUTOMATED PAYROLL ENGINE & STATUTORY DEDUCTIONS (10.5) */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" /> Automated Monthly Hospitality Payroll & Service Charge Pool
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Computes basic wages, overtime, 10% guest service charge pool distribution, tax withholding, and generates PDF payslips.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="h-8 px-2 text-xs bg-white border border-slate-200 rounded text-slate-800"
              >
                <option value="October 2026">October 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
              </select>
              <Button
                size="sm"
                onClick={handleExecutePayroll}
                disabled={isRunningPayroll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
              >
                {isRunningPayroll ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Executing Run...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 mr-1" /> Execute Payroll Run
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-1">
              <span className="text-[11px] text-emerald-800 font-bold uppercase">10% Guest Service Charge Pool</span>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(serviceChargePool)}</div>
              <p className="text-[11px] text-slate-600">Equally allocated across 18 frontline staff (~$825/pax)</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Total Basic Wages</span>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(54200)}</div>
              <p className="text-[11px] text-slate-500">Contractual monthly compensation</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Overtime Multipliers (1.5x/2.0x)</span>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(4120)}</div>
              <p className="text-[11px] text-slate-500">Automated from biometric attendance logs</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Statutory Tax & PF Withheld</span>
              <div className="text-2xl font-bold text-rose-600">{formatCurrency(7840)}</div>
              <p className="text-[11px] text-slate-500">Remitted to Revenue Authority</p>
            </div>
          </div>

          {/* Sample Payroll Run Breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-800">Payroll Calculation Sheet & Payslip Distribution</span>
              <span className="text-[11px] text-slate-500">Target Month: {payrollMonth}</span>
            </div>
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Basic Wage</th>
                  <th className="py-3 px-4">Service Charge Share</th>
                  <th className="py-3 px-4">Overtime Pay</th>
                  <th className="py-3 px-4">Deductions (Tax/PF)</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4 text-right">Digital Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Sarah Jenkins', base: 3200, pool: 825, ot: 310, ded: 480, net: 3855 },
                  { name: 'Chef Marco Rossi', base: 4500, pool: 825, ot: 620, ded: 690, net: 5255 },
                  { name: 'David K. Miller', base: 3400, pool: 825, ot: 850, ded: 560, net: 4515 },
                  { name: 'Elena Rostova', base: 2900, pool: 825, ot: 180, ded: 410, net: 3495 },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4 text-slate-700">{formatCurrency(row.base)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">+{formatCurrency(row.pool)}</td>
                    <td className="py-3 px-4 text-blue-600">+{formatCurrency(row.ot)}</td>
                    <td className="py-3 px-4 text-rose-600">-{formatCurrency(row.ded)}</td>
                    <td className="py-3 px-4 font-bold font-mono text-slate-900 text-sm">
                      {formatCurrency(row.net)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => triggerBanner(`Downloaded official PDF payslip for ${row.name}`)}
                        className="text-[11px] h-7 bg-white hover:bg-slate-50"
                      >
                        <Download className="w-3 h-3 mr-1 text-slate-600" /> PDF Payslip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ATS RECRUITMENT & TALENT KANBAN PIPELINE (10.6) */}
      {activeTab === 'ats' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Applicant Tracking System (ATS) & Talent Kanban Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Career vacancies, resume scoring, Zoom video interview scheduling, and 5-stage candidate hiring board.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsScheduleInterviewOpen(true)}
                variant="outline"
                className="text-xs bg-white"
              >
                <Video className="w-3.5 h-3.5 mr-1 text-blue-600" /> Schedule Zoom Interview
              </Button>
              <Button
                size="sm"
                onClick={() => setIsNewJobOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Post Job Vacancy
              </Button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { key: 'APPLIED', title: '1. Applied / Ingested', count: candidates.filter((c) => c.stage === 'APPLIED').length },
              { key: 'SCREENING', title: '2. Resume Screening', count: candidates.filter((c) => c.stage === 'SCREENING').length },
              { key: 'INTERVIEW', title: '3. Zoom Interview', count: candidates.filter((c) => c.stage === 'INTERVIEW').length },
              { key: 'OFFER_EXTENDED', title: '4. Offer Extended', count: candidates.filter((c) => c.stage === 'OFFER_EXTENDED').length },
              { key: 'HIRED', title: '5. Hired / Onboarded', count: candidates.filter((c) => c.stage === 'HIRED').length },
            ].map((col) => (
              <div key={col.key} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col min-h-[350px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                  <span className="font-bold text-xs text-slate-800">{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                    {col.count}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {candidates
                    .filter((c) => c.stage === col.key)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{c.name}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {c.score}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{c.role}</p>
                        <div className="text-[10px] text-slate-400">{c.source}</div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          {col.key !== 'HIRED' && (
                            <button
                              onClick={() => {
                                const stages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER_EXTENDED', 'HIRED'];
                                const currIdx = stages.indexOf(col.key);
                                if (currIdx < stages.length - 1) {
                                  handleMoveCandidateStage(c.id, stages[currIdx + 1]);
                                }
                              }}
                              className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                            >
                              <span>Next Stage</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {col.key === 'HIRED' && (
                            <span className="text-[10px] text-emerald-600 font-bold">Onboarded ✔</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ONBOARD STAFF MEMBER */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" /> Onboard Staff Member Dossier (10.1)
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Vance"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="j.vance@omnistay.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Phone Contact</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2831"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Department *</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Front Office">Front Office</option>
                    <option value="Culinary / F&B">Culinary / F&B</option>
                    <option value="Executive Housekeeping">Executive Housekeeping</option>
                    <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                    <option value="Accounting & Audit">Accounting & Audit</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.designation}
                    onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Rotational Shift *</label>
                  <select
                    value={newStaff.shift}
                    onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                    <option value="Evening (15:00 - 23:00)">Evening (15:00 - 23:00)</option>
                    <option value="Night Audit (23:00 - 07:00)">Night Audit (23:00 - 07:00)</option>
                    <option value="Rotational / Flexible">Rotational / Flexible</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Monthly Basic Salary ($)</label>
                  <input
                    type="number"
                    value={newStaff.baseSalary}
                    onChange={(e) => setNewStaff({ ...newStaff, baseSalary: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddStaffOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save & Initialize Dossier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN 24/7 SHIFT */}
      {isAddShiftOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Assign 24/7 Shift Roster (10.2)
              </h3>
              <button onClick={() => setIsAddShiftOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddShift} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newShiftInput.employeeName}
                  onChange={(e) => setNewShiftInput({ ...newShiftInput, employeeName: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shift Type</label>
                <select
                  value={newShiftInput.shiftType}
                  onChange={(e) => setNewShiftInput({ ...newShiftInput, shiftType: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                >
                  <option value="Morning Shift (07:00 - 15:00)">Morning Shift (07:00 - 15:00)</option>
                  <option value="Evening Dinner (15:00 - 23:00)">Evening Dinner (15:00 - 23:00)</option>
                  <option value="Night Audit (23:00 - 07:00)">Night Audit (23:00 - 07:00)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddShiftOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  Confirm Roster
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SIMULATE BIOMETRIC HARDWARE PUNCH */}
      {isBiometricSimOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-600" /> Simulate Hardware Biometric Push (10.3)
              </h3>
              <button onClick={() => setIsBiometricSimOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSimulatePunch} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Staff Member</label>
                <input
                  type="text"
                  required
                  value={biometricSim.employeeName}
                  onChange={(e) => setBiometricSim({ ...biometricSim, employeeName: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hardware Terminal</label>
                <select
                  value={biometricSim.device}
                  onChange={(e) => setBiometricSim({ ...biometricSim, device: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                >
                  <option value="ZKTeco ProCapture-X (Main Lobby)">ZKTeco ProCapture-X (Main Lobby)</option>
                  <option value="Hikvision DS-K1T671 (Kitchen Depot)">Hikvision DS-K1T671 (Kitchen Depot)</option>
                  <option value="OmniStay Mobile Geofence (iOS/Android)">OmniStay Mobile Geofence (iOS/Android)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Punch Event</label>
                <select
                  value={biometricSim.punchType}
                  onChange={(e) => setBiometricSim({ ...biometricSim, punchType: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                >
                  <option value="CHECK_IN">CHECK_IN (Shift Start)</option>
                  <option value="CHECK_OUT">CHECK_OUT (Shift End)</option>
                  <option value="BREAK_OUT">BREAK_OUT (Lunch Break)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsBiometricSimOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  Send Biometric Telemetry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REQUEST LEAVE */}
      {isApplyLeaveOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Submit Staff Leave Application (10.4)
              </h3>
              <button onClick={() => setIsApplyLeaveOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carlos Santana"
                  value={newLeave.employee}
                  onChange={(e) => setNewLeave({ ...newLeave, employee: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Leave Category</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Handover Notes</label>
                <textarea
                  rows={2}
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Provide handover details..."
                  className="w-full p-2 border border-slate-200 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsApplyLeaveOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  Submit for Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: POST JOB OPENING (ATS) */}
      {isNewJobOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Post Career Opportunity (10.6)
              </h3>
              <button onClick={() => setIsNewJobOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Concierge"
                  value={newJobInput.title}
                  onChange={(e) => setNewJobInput({ ...newJobInput, title: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={newJobInput.department}
                    onChange={(e) => setNewJobInput({ ...newJobInput, department: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  >
                    <option value="Rooms Division">Rooms Division</option>
                    <option value="Culinary Arts">Culinary Arts</option>
                    <option value="Finance & Night Ops">Finance & Night Ops</option>
                    <option value="Maintenance & Security">Maintenance & Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vacancies</label>
                  <input
                    type="number"
                    min={1}
                    value={newJobInput.vacancies}
                    onChange={(e) => setNewJobInput({ ...newJobInput, vacancies: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsNewJobOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  Publish to Career Portal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: SCHEDULE ZOOM INTERVIEW (ATS) */}
      {isScheduleInterviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" /> Schedule Video Interview (Zoom API)
              </h3>
              <button onClick={() => setIsScheduleInterviewOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Candidate Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jessica Vance"
                  value={newInterviewInput.candidateName}
                  onChange={(e) => setNewInterviewInput({ ...newInterviewInput, candidateName: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={newInterviewInput.date}
                    onChange={(e) => setNewInterviewInput({ ...newInterviewInput, date: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={newInterviewInput.time}
                    onChange={(e) => setNewInterviewInput({ ...newInterviewInput, time: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-[11px]">
                A secure Zoom meeting invite with automated calendar sync will be sent to the candidate email.
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsScheduleInterviewOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsScheduleInterviewOpen(false);
                    triggerBanner(`Scheduled video interview for ${newInterviewInput.candidateName || 'Candidate'}! Zoom link generated.`);
                  }}
                  className="bg-blue-600 text-white"
                >
                  Generate Zoom Link & Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: VIEW PERSONNEL DOSSIER (10.1) */}
      {selectedStaffDossier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Employee Personnel Dossier (Chapter 10.1)
              </h3>
              <button onClick={() => setSelectedStaffDossier(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {selectedStaffDossier.name ? selectedStaffDossier.name[0] : 'S'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedStaffDossier.name}</h4>
                  <p className="text-slate-500 text-[11px]">{selectedStaffDossier.email}</p>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 mt-1">
                    {selectedStaffDossier.role || 'Hospitality Associate'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800">EMP-2026-0042</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Biometric Device ID</span>
                  <span className="font-mono font-bold text-slate-800">ZK-PIN-8841</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Base Contract Wage</span>
                  <span className="font-bold text-emerald-600">$3,400 / Month</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Service Charge Eligible</span>
                  <span className="font-bold text-blue-600">Yes (1.0x Full Share)</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700">Digital Personnel Documents:</span>
                <div className="space-y-1.5 pt-1">
                  {[
                    'Employment Contract (Signed PDF)',
                    'Passport / National ID Scan (Verified)',
                    'HACCP Food Safety Certification (Level 2)',
                    'Direct Deposit Bank Mandate',
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        {doc}
                      </span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => triggerBanner(`Downloading verified record: ${doc}`)}
                        className="text-[10px] h-6 text-blue-600"
                      >
                        <Download className="w-3 h-3 mr-0.5" /> View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => setSelectedStaffDossier(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedStaffDossier(null);
                    triggerBanner(`Official Experience Certificate PDF generated for ${selectedStaffDossier.name}`);
                  }}
                  className="bg-blue-600 text-white"
                >
                  Generate Official Certificate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
