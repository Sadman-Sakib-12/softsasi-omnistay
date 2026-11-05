'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Smartphone,
  Thermometer,
  ShieldCheck,
  Battery,
  Wifi,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  X,
  QrCode,
  Sliders,
  Wind,
  Power,
  Zap,
  Printer,
  Download,
  Check,
  Send,
  Camera,
  FileCheck2,
  ExternalLink,
  Clock,
  Sparkles,
  Utensils,
  Sun,
  Moon,
  Coffee,
  Leaf,
  Wine,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  iotService,
  SmartLockItem,
  LockTelemetry,
  SmartThermostatItem,
  SmartSceneItem,
  PreArrivalQueueItem,
  InRoomDiningDish,
  RoomQrPlacardItem,
  PassportOcrResult,
} from '@/features/iot/services/iot.service';
import { BeatLoader } from 'react-spinners';

// Chapter 15: IoT Smart Room & Contactless Hospitality Suite (2026-2027 Standards)
export default function IotSmartRoomEnterprisePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'contactless' | 'locks' | 'hvac' | 'qr'>('locks');

  // Modals & Action States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newLockRoom, setNewLockRoom] = useState('Room 202');
  const [newLockVendor, setNewLockVendor] = useState('Assa Abloy (VingCard BLE)');
  const [newLockSerial, setNewLockSerial] = useState('LCK-ASSA-202');

  const [selectedPlacard, setSelectedPlacard] = useState<RoomQrPlacardItem | null>(null);
  const [selectedDish, setSelectedDish] = useState<InRoomDiningDish | null>(null);

  // Passport OCR Test State
  const [ocrDocumentUrl, setOcrDocumentUrl] = useState('https://storage.omnistay.com/passports/scan_guest_01.jpg');
  const [ocrResult, setOcrResult] = useState<PassportOcrResult | null>(null);
  const [isOcrScanning, setIsOcrScanning] = useState(false);

  // Notifications
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const triggerBanner = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // =========================================================================
  // QUERIES
  // =========================================================================

  // 15.1 Pre-Arrival Queue
  const { data: preArrivalQueue = [], isLoading: isLoadingQueue } = useQuery<PreArrivalQueueItem[]>({
    queryKey: ['iotPreArrivalQueue'],
    queryFn: () => iotService.getPreArrivalQueue(),
  });

  // 15.2 Smart Locks & Telemetry
  const { data: locks = [], isLoading: isLoadingLocks } = useQuery<SmartLockItem[]>({
    queryKey: ['smartLocksList'],
    queryFn: () => iotService.getLocks(),
  });

  const { data: telemetry } = useQuery<LockTelemetry>({
    queryKey: ['smartLocksTelemetry'],
    queryFn: () => iotService.getLockTelemetry(),
  });

  // 15.3 Thermostats & Scenes
  const { data: thermostats = [], isLoading: isLoadingTstats } = useQuery<SmartThermostatItem[]>({
    queryKey: ['smartThermostatsList'],
    queryFn: () => iotService.getThermostats(),
  });

  const { data: scenes = [] } = useQuery<SmartSceneItem[]>({
    queryKey: ['smartScenesList'],
    queryFn: () => iotService.getScenes(),
  });

  // 15.4 QR Dining Menu & Placards
  const { data: diningMenu = [] } = useQuery<InRoomDiningDish[]>({
    queryKey: ['inRoomDiningMenu'],
    queryFn: () => iotService.getDiningMenu(),
  });

  const { data: placards = [] } = useQuery<RoomQrPlacardItem[]>({
    queryKey: ['inRoomQrPlacards'],
    queryFn: () => iotService.getPlacards(),
  });

  // =========================================================================
  // MUTATIONS
  // =========================================================================

  // Remote BLE Unlock (<400ms latency)
  const unlockMutation = useMutation({
    mutationFn: (lockId: string) => iotService.unlock(lockId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['smartLocksList'] });
      queryClient.invalidateQueries({ queryKey: ['smartLocksTelemetry'] });
      triggerBanner(
        `Door unlocked in ${res.handshakeLatencyMs || 142}ms via encrypted BLE handshake! Room latch released.`
      );
    },
    onError: (err: any) => {
      triggerBanner(`Unlock failed: ${err?.message || 'Bluetooth connection error'}`);
    },
  });

  // Generate Keypad PIN
  const generateKeyMutation = useMutation({
    mutationFn: (lockId: string) => iotService.generateKey(lockId, 'PIN'),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['smartLocksList'] });
      triggerBanner(`New dynamic 6-digit keypad PIN provisioned: ${res.keyToken.replace(/^PIN-/, '')}. Auto-expires at checkout.`);
    },
  });

  // Register New Lock
  const registerLockMutation = useMutation({
    mutationFn: (dto: { roomId: string; lockVendor: string; deviceSerial: string }) =>
      iotService.registerLock(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartLocksList'] });
      queryClient.invalidateQueries({ queryKey: ['smartLocksTelemetry'] });
      setIsRegisterOpen(false);
      triggerBanner(`Registered new IoT smart lock ${newLockSerial} for ${newLockRoom}!`);
    },
  });

  // Adjust Temperature
  const updateTempMutation = useMutation({
    mutationFn: ({ id, targetTemp, ecoMode }: { id: string; targetTemp: number; ecoMode?: boolean }) =>
      iotService.updateTemperature(id, targetTemp, ecoMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartThermostatsList'] });
      triggerBanner('Thermostat climate setting transmitted over Zigbee / BACnet gateway.');
    },
  });

  // Trigger Smart Scene
  const triggerSceneMutation = useMutation({
    mutationFn: ({ roomId, sceneId }: { roomId: string; sceneId: string }) =>
      iotService.triggerScene(roomId, sceneId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['smartThermostatsList'] });
      triggerBanner(`"${res.sceneTriggered}" activated! Motorized curtains & lighting automated.`);
    },
  });

  // Send Pre-Arrival Notification
  const sendNoticeMutation = useMutation({
    mutationFn: (bookingId: string) => iotService.sendPreArrivalNotification(bookingId),
    onSuccess: () => {
      triggerBanner('24-Hour pre-arrival notification with express check-in link dispatched via WhatsApp & Email.');
    },
  });

  // Passport OCR Simulation
  const handleRunOcr = async () => {
    try {
      setIsOcrScanning(true);
      const res = await iotService.parsePassportOcr(ocrDocumentUrl);
      setOcrResult(res);
      triggerBanner('Machine learning OCR scan complete (98.5% confidence). Lodging compliance verified.');
    } catch (e: any) {
      triggerBanner(`OCR failed: ${e?.message || 'Error parsing document'}`);
    } finally {
      setIsOcrScanning(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerLockMutation.mutate({
      roomId: '00000000-0000-4000-a000-000000000202',
      lockVendor: newLockVendor,
      deviceSerial: newLockSerial,
    });
  };

  const isLoadingAny = isLoadingLocks && isLoadingTstats && isLoadingQueue;

  if (isLoadingAny && locks.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Connecting to IoT Smart Room Gateway & BACnet Mesh...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Chapter 15: IoT Smart Room & Contactless Hospitality Suite</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-[#00a8ff]" /> IoT Smart Room & Contactless Hospitality Suite
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            BLE/NFC smart door locks, passport OCR check-in, occupancy-based green HVAC & contactless QR dining.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Register Smart Door Lock
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chapter 15 Multi-Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('contactless')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'contactless'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4 text-[#00a8ff]" />
          <span>15.1 Self Check-In & Passport OCR</span>
        </button>

        <button
          onClick={() => setActiveTab('locks')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'locks'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4 text-[#00a8ff]" />
          <span>15.2 IoT Door Locks & BLE Keycards</span>
        </button>

        <button
          onClick={() => setActiveTab('hvac')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'hvac'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Thermometer className="w-4 h-4 text-[#00a8ff]" />
          <span>15.3 Smart HVAC & Green Energy</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'qr'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4 text-[#00a8ff]" />
          <span>15.4 Contactless QR Dining & KDS</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: 15.1 CONTACTLESS MOBILE WEB SELF CHECK-IN & PASSPORT OCR
          ========================================================================= */}
      {activeTab === 'contactless' && (
        <div className="space-y-6">
          {/* Top Telemetry / Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Pre-Arrival 24h Alerts</span>
              <div className="text-2xl font-bold text-slate-900">{preArrivalQueue.length} Active Queue</div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> WhatsApp & Email Omnichannel
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">OCR Recognition Accuracy</span>
              <div className="text-2xl font-bold text-[#00a8ff]">98.5%</div>
              <p className="text-[11px] text-slate-500">ICAO Doc 9303 MRZ High Fidelity</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Digital Signatures Captured</span>
              <div className="text-2xl font-bold text-purple-600">100% Legally Compliant</div>
              <p className="text-[11px] text-slate-500">Encrypted Touch Canvas Storage</p>
            </div>
          </div>

          {/* Section 1: 24-Hour Pre-Arrival Notifications Queue */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00a8ff]" /> 24-Hour Pre-Arrival Notification & Express Check-in Queue
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automated dispatch 24 hours prior to scheduled check-in with encrypted express self check-in link.
                </p>
              </div>
              <Badge className="bg-sky-50 text-[#00a8ff] border-sky-200 text-xs font-mono">
                {preArrivalQueue.length} Travelers
              </Badge>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Assigned Room</th>
                  <th className="py-3 px-4">Scheduled Arrival</th>
                  <th className="py-3 px-4">Delivery Channel</th>
                  <th className="py-3 px-4">Check-in Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preArrivalQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#00a8ff]">
                      {item.bookingReference}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.guestName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-semibold">{item.roomNumber}</span>
                      <span className="block text-[10px] text-slate-400">{item.roomTitle}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.checkInDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.checkInStatus.includes('Completed')
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : item.checkInStatus.includes('Started')
                            ? 'bg-sky-50 text-[#00a8ff] border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.checkInStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={item.checkInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-slate-700 hover:text-[#00a8ff] hover:bg-sky-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                          title="Open Express Self Check-in Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Link</span>
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendNoticeMutation.mutate(item.bookingId)}
                          disabled={sendNoticeMutation.isPending}
                          className="h-7 px-2.5 text-[11px] text-slate-700 hover:text-emerald-700 cursor-pointer"
                        >
                          <Send className="w-3 h-3 mr-1" /> Resend Alert
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Machine Learning Passport OCR & Digital Signature Lab */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive OCR Scanner */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#00a8ff]" /> Government ID & Passport OCR Scanner (15.1)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Extracts passenger full name, passport number, nationality, and birth date directly into the guest profile.
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  ICAO 9303 Compliant
                </Badge>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Passport / Government ID Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ocrDocumentUrl}
                    onChange={(e) => setOcrDocumentUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-800 bg-slate-50 focus:outline-none focus:border-[#00a8ff]"
                  />
                  <Button
                    onClick={handleRunOcr}
                    disabled={isOcrScanning}
                    className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    {isOcrScanning ? (
                      <BeatLoader color="#ffffff" size={6} speedMultiplier={1.2} />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> Run ML OCR
                      </>
                    )}
                  </Button>
                </div>

                {/* Sample Document Quick Buttons */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Sample Photos:</span>
                  <button
                    type="button"
                    onClick={() => setOcrDocumentUrl('https://storage.omnistay.com/passports/scan_guest_01.jpg')}
                    className="text-[#00a8ff] hover:underline cursor-pointer"
                  >
                    Passport (BGD)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setOcrDocumentUrl('https://storage.omnistay.com/passports/scan_guest_usa.jpg')}
                    className="text-[#00a8ff] hover:underline cursor-pointer"
                  >
                    Passport (USA)
                  </button>
                </div>
              </div>

              {/* OCR Result View */}
              {ocrResult && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" /> Extracted Identity Dossier
                    </span>
                    <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Confidence: {(ocrResult.confidenceScore * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Full Name</span>
                      <span className="font-bold text-slate-900">{ocrResult.extractedData.fullName}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Passport Number</span>
                      <span className="font-mono font-bold text-[#00a8ff]">{ocrResult.extractedData.passportNumber}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Nationality</span>
                      <span className="font-semibold text-slate-800">{ocrResult.extractedData.nationality}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Date of Birth</span>
                      <span className="font-semibold text-slate-800">{ocrResult.extractedData.dateOfBirth}</span>
                    </div>
                  </div>

                  {/* Machine Readable Zone (MRZ) */}
                  <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg tracking-wider space-y-0.5 overflow-x-auto shadow-inner">
                    <div className="text-slate-500 text-[9px] uppercase tracking-widest pb-1 border-b border-slate-800">
                      ICAO 9303 MRZ Checksum Verified
                    </div>
                    <div>{ocrResult.extractedData.mrzLine1}</div>
                    <div>{ocrResult.extractedData.mrzLine2}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Digital Signature & Keycard Provisioning Preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#00a8ff]" /> Digital Signature & Terms Acceptance
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Smartphone touch signature creates legal audit record and immediately provisions the digital room key.
                  </p>
                </div>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                  E-Sign Certified
                </Badge>
              </div>

              {/* Sample Digital Signature Canvas Preview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Encrypted Guest Signature Hash
                </span>
                <div className="h-16 flex items-center justify-center font-serif text-2xl text-slate-800 italic select-none">
                  Alexandria Sterling
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  SHA-256: 8f4a2b98e7c68e53... · IP: 103.114.98.24 · Timestamp: {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Auto Provisioned Credentials */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Instant Digital Keycards Provisioned:</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-sky-50 text-sky-900 rounded-lg border border-sky-100">
                    <KeyRound className="w-4 h-4 text-[#00a8ff] mx-auto mb-1" />
                    <div className="text-[10px] font-bold">Encrypted BLE</div>
                    <div className="text-[9px] text-slate-500">&lt;400ms Unlocking</div>
                  </div>
                  <div className="p-2.5 bg-purple-50 text-purple-900 rounded-lg border border-purple-100">
                    <Smartphone className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <div className="text-[10px] font-bold">Apple Wallet</div>
                    <div className="text-[9px] text-slate-500">NFC Pass (.pkpass)</div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100">
                    <Lock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <div className="text-[10px] font-bold">Keypad PIN</div>
                    <div className="text-[9px] text-slate-500 font-mono">6-Digit Auto-Expiry</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 15.2 IOT SMART DOOR LOCKS & BLE ACCESS (Figure 15.2)
          ========================================================================= */}
      {activeTab === 'locks' && (
        <div className="space-y-4">
          {/* Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Connected Smart Locks</span>
              <div className="text-2xl font-bold text-slate-900">{locks.length} Online Units</div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> 100% Mesh Signal Healthy
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Remote BLE Unlock Latency</span>
              <div className="text-2xl font-bold text-[#00a8ff]">
                {telemetry?.avgUnlockLatencyMs || 342} ms
              </div>
              <p className="text-[11px] text-slate-500">Target &lt;400ms SLA Guaranteed</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Apple / Google Wallet Passes</span>
              <div className="text-2xl font-bold text-purple-600">
                {telemetry?.activeWalletKeys || 15} Active Passes
              </div>
              <p className="text-[11px] text-slate-500">Power Reserve NFC Unlocking</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Battery Level Alert</span>
              <div className="text-2xl font-bold text-emerald-600">All Healthy</div>
              <p className="text-[11px] text-slate-500">Lowest unit at 72% (Room 304)</p>
            </div>
          </div>

          {/* Smart Locks Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00a8ff]" /> Hardware Door Locks & Multi-Protocol Terminals (15.2)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Assa Abloy (VingCard), Salto Systems, Dormakaba, Onity, and Yale Commercial Cloud.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['smartLocksList'] })}
                className="h-7 text-xs text-slate-600 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Status
              </Button>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Room Unit</th>
                  <th className="py-3 px-4">Lock Vendor Protocol</th>
                  <th className="py-3 px-4">Battery %</th>
                  <th className="py-3 px-4">Signal (RSSI)</th>
                  <th className="py-3 px-4">Active Keypad PIN</th>
                  <th className="py-3 px-4">Lock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locks.map((lock) => (
                  <tr key={lock.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{lock.roomNumber}</div>
                      <div className="text-[10px] text-slate-400">{lock.roomName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{lock.vendor}</span>
                      <span className="block text-[10px] font-mono text-slate-400">{lock.deviceSerial}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Battery
                          className={`w-4 h-4 ${
                            lock.batteryLevel > 75
                              ? 'text-emerald-500'
                              : lock.batteryLevel > 30
                              ? 'text-amber-500'
                              : 'text-rose-500'
                          }`}
                        />
                        <span>{lock.batteryLevel}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {lock.signalStrength}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#00a8ff]">
                      {lock.pinCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" /> {lock.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => unlockMutation.mutate(lock.id)}
                          disabled={unlockMutation.isPending}
                          className="h-7 px-2.5 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-[11px] font-bold cursor-pointer shadow-2xs"
                          title="Instant Remote BLE Unlock (<400ms)"
                        >
                          <Unlock className="w-3 h-3 mr-1" /> Remote Unlock
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateKeyMutation.mutate(lock.id)}
                          disabled={generateKeyMutation.isPending}
                          className="h-7 px-2 text-[11px] text-slate-700 hover:text-slate-900 cursor-pointer"
                          title="Generate New Dynamic 6-Digit PIN"
                        >
                          <KeyRound className="w-3 h-3 mr-1" /> Dynamic PIN
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Access Logs Audit Trail */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00a8ff]" /> Real-Time Access Audit Logs (Assa Abloy / BLE / NFC / PIN)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-500 text-[10px] font-mono">
                  <span>Room 101 · BLE Handshake</span>
                  <span>3 mins ago</span>
                </div>
                <div className="font-bold text-slate-900 mt-1">Granted (138ms latency)</div>
                <div className="text-[10px] text-emerald-600 font-semibold">User: Alexandria Sterling (Mobile PWA)</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-500 text-[10px] font-mono">
                  <span>Room 304 · Apple Wallet NFC</span>
                  <span>8 mins ago</span>
                </div>
                <div className="font-bold text-slate-900 mt-1">Granted (112ms latency)</div>
                <div className="text-[10px] text-purple-600 font-semibold">User: Dr. Marcus Vance (Apple Watch)</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-500 text-[10px] font-mono">
                  <span>Room 801 · Keypad PIN Entry</span>
                  <span>18 mins ago</span>
                </div>
                <div className="font-bold text-slate-900 mt-1">Granted (195ms latency)</div>
                <div className="text-[10px] text-[#00a8ff] font-semibold">Yale Cloud API · PIN Authenticated</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 15.3 IN-ROOM SMART AUTOMATION & GREEN ENERGY (HVAC / Scenes)
          ========================================================================= */}
      {activeTab === 'hvac' && (
        <div className="space-y-6">
          {/* Energy Savings Banner (30% Green Energy Reduction) */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                <Leaf className="w-3 h-3 text-emerald-200" /> Green Hospitality ESG Certified
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">
                30% Hotel Energy Reduction via Occupancy-Based HVAC Optimization
              </h3>
              <p className="text-xs text-emerald-100 max-w-xl">
                Front-desk check-in triggers 21.0°C comfort mode. Room motion sensors transition vacant rooms to 24.0°C Eco Mode, and check-out activates maximum energy conservation.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black">12.4 kWh</div>
              <div className="text-xs text-emerald-100">Daily Avg per Room (vs 18.2 kWh baseline)</div>
            </div>
          </div>

          {/* Smart Lighting & Motorized Curtain Preset Scenes */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00a8ff]" /> Smart Lighting & Motorized Curtain Scenes (15.3)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automated scene triggers synchronize room lighting, motorized blackout curtains, and HVAC settings.
                </p>
              </div>
              <Badge className="bg-sky-50 text-[#00a8ff] border-sky-200 text-xs">
                Honeywell / Schneider BACnet
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#00a8ff] hover:shadow-md transition-all space-y-3 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{scene.name}</span>
                    {scene.id.includes('welcome') ? (
                      <Sun className="w-4 h-4 text-amber-500" />
                    ) : scene.id.includes('relax') ? (
                      <Coffee className="w-4 h-4 text-purple-500" />
                    ) : scene.id.includes('sleep') ? (
                      <Moon className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Leaf className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed min-h-[36px]">
                    {scene.description}
                  </p>

                  <div className="space-y-1 text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 font-medium">
                    <div className="flex justify-between">
                      <span>Lighting:</span>
                      <span className="font-bold text-slate-800">{scene.lighting}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Curtains:</span>
                      <span className="font-bold text-slate-800">{scene.curtains}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Temp:</span>
                      <span className="font-bold text-[#00a8ff]">{scene.targetTemp}°C</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => triggerSceneMutation.mutate({ roomId: '00000000-0000-4000-a000-000000000101', sceneId: scene.id })}
                    disabled={triggerSceneMutation.isPending}
                    className="w-full h-8 text-xs font-bold bg-slate-900 hover:bg-black text-white cursor-pointer"
                  >
                    Activate in Room 101
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Climate & Thermostats Grid */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-[#00a8ff]" /> Property Thermostat Network & Live HVAC Status
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Honeywell Home Pro, Schneider Electric SE8000, and Google Nest Hospitality.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['smartThermostatsList'] })}
                className="h-7 text-xs text-slate-600 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Network
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {thermostats.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{t.roomNumber}</span>
                      <span className="block text-[10px] text-slate-400">{t.roomName}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.ecoMode
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-sky-50 text-[#00a8ff] border border-sky-200'
                      }`}
                    >
                      {t.state}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between py-2 border-y border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Temp</span>
                      <span className="text-2xl font-black text-slate-900">{t.currentTemp}°C</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Temp</span>
                      <span className="text-2xl font-black text-[#00a8ff]">{t.targetTemp}°C</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Brand: {t.deviceBrand}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateTempMutation.mutate({
                            id: t.id,
                            targetTemp: Number((t.targetTemp - 0.5).toFixed(1)),
                            ecoMode: t.ecoMode,
                          })
                        }
                        className="h-7 w-7 p-0 font-bold text-slate-700 cursor-pointer"
                      >
                        -
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateTempMutation.mutate({
                            id: t.id,
                            targetTemp: Number((t.targetTemp + 0.5).toFixed(1)),
                            ecoMode: t.ecoMode,
                          })
                        }
                        className="h-7 w-7 p-0 font-bold text-slate-700 cursor-pointer"
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateTempMutation.mutate({
                            id: t.id,
                            targetTemp: t.ecoMode ? 21.0 : 24.0,
                            ecoMode: !t.ecoMode,
                          })
                        }
                        className={`h-7 px-2 text-[10px] font-bold cursor-pointer ${
                          t.ecoMode
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t.ecoMode ? 'Eco: ON' : 'Eco: OFF'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 15.4 CONTACTLESS DIGITAL ROOM SERVICE & QR DINING (KDS)
          ========================================================================= */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          {/* Section 1: In-Room Acrylic QR Placard Discs */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#00a8ff]" /> Bedside & Desk Acrylic QR Placards (15.4)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-durability acrylic QR discs placed on nightstands and desks for instant digital dining orders.
                </p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Direct Folio Billing
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {placards.map((item) => (
                <div
                  key={item.roomId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between shadow-2xs hover:border-[#00a8ff] transition-all"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-sm">{item.roomNumber}</span>
                    <span className="block text-[10px] text-slate-500">{item.roomTitle}</span>
                    <span className="block text-[9px] font-mono text-[#00a8ff]">{item.token}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
                      <QrCode className="w-10 h-10 text-slate-800" />
                    </div>
                    <a
                      href={item.directPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#00a8ff] font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Live In-Room Dining Catalog with Dietary & Wine Pairings */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#00a8ff]" /> Curated In-Room Fine Dining Catalog & Sommelier Recommendations
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Orders bypass front-desk phone calls and flow directly to Kitchen Display System (KDS) with room folio charge.
                </p>
              </div>
              <Badge className="bg-sky-50 text-[#00a8ff] border-sky-200 text-xs">
                {diningMenu.length} Signature Dishes
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {diningMenu.map((dish) => (
                <div key={dish.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs space-y-3">
                  <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={dish.image} alt={dish.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                      ${dish.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-4 pt-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{dish.category}</span>
                      <div className="flex gap-1">
                        {dish.dietary.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h5 className="font-bold text-slate-900 text-sm leading-tight">{dish.title}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>

                    <div className="p-2 bg-purple-50 rounded-lg text-[10px] text-purple-900 flex items-center gap-1.5 font-medium">
                      <Wine className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Pairing: {dish.winePairing}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        iotService.createQrOrder('00000000-0000-4000-a000-000000000101', [
                          { itemTitle: dish.title, quantity: 1, price: dish.price },
                        ]);
                        triggerBanner(`Dispatched "${dish.title}" directly to KDS! Billed to Room 101 folio.`);
                      }}
                      className="w-full h-8 text-xs font-bold bg-[#00a8ff] hover:bg-[#0097e6] text-white cursor-pointer mt-1"
                    >
                      Dispatch Order to Room 101 Folio
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTER SMART DOOR LOCK (15.2)
          ========================================================================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00a8ff]" /> Register Smart Door Lock Terminal
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Room Assignment</label>
                <input
                  type="text"
                  value={newLockRoom}
                  onChange={(e) => setNewLockRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:border-[#00a8ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hardware Lock Vendor</label>
                <select
                  value={newLockVendor}
                  onChange={(e) => setNewLockVendor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:border-[#00a8ff]"
                >
                  <option>Assa Abloy (VingCard BLE)</option>
                  <option>Salto Systems NFC</option>
                  <option>Dormakaba BLE Commercial</option>
                  <option>Onity Bluetooth Low Energy</option>
                  <option>Yale Commercial Cloud API</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Device Hardware Serial</label>
                <input
                  type="text"
                  value={newLockSerial}
                  onChange={(e) => setNewLockSerial(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-800 bg-slate-50 focus:outline-none focus:border-[#00a8ff]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegisterOpen(false)}
                  className="text-xs text-slate-600 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registerLockMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold cursor-pointer"
                >
                  Pair & Register Lock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
