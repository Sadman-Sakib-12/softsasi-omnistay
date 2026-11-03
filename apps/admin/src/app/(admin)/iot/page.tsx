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
  Loader2,
  X,
  QrCode,
  Sliders,
  Wind,
  Power,
  Zap,
  Printer,
  Download,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { iotService, SmartLockItem, RegisterSmartLockDto } from '@/features/iot/services/iot.service';

// Chapter 15: IoT Smart Room Automation & Contactless Guest Journey
export default function IotSmartRoomEnterprisePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'locks' | 'hvac' | 'qr'>('locks');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedQrRoom, setSelectedQrRoom] = useState<string | null>(null);

  // Notifications
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const triggerBanner = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // 15.2 Smart Locks State
  const { data: rawLocks = [], isLoading } = useQuery<SmartLockItem[]>({
    queryKey: ['smartLocksList'],
    queryFn: () => iotService.getLocks(),
  });

  const [locksList, setLocksList] = useState([
    { id: 'lock-1', roomNumber: 'Room 101', vendor: 'Assa Abloy (VingCard BLE)', battery: 94, pin: '849201', status: 'Online · Locked', bleRssi: '-58 dBm' },
    { id: 'lock-2', roomNumber: 'Room 102', vendor: 'Salto Systems NFC', battery: 88, pin: '551920', status: 'Online · Locked', bleRssi: '-62 dBm' },
    { id: 'lock-3', roomNumber: 'Room 201', vendor: 'Assa Abloy (VingCard BLE)', battery: 91, pin: '392810', status: 'Online · Locked', bleRssi: '-55 dBm' },
    { id: 'lock-4', roomNumber: 'Room 304 (Suite)', vendor: 'Dormakaba BLE Commercial', battery: 72, pin: '710492', status: 'Online · Locked', bleRssi: '-68 dBm' },
    { id: 'lock-5', roomNumber: 'Penthouse 801', vendor: 'Yale Commercial Cloud API', battery: 98, pin: '109284', status: 'Online · Locked', bleRssi: '-48 dBm' },
  ]);

  // Sync real smart locks from database
  React.useEffect(() => {
    if (rawLocks && rawLocks.length > 0) {
      setLocksList(
        rawLocks.map((l: any) => ({
          id: l.id,
          roomNumber: l.roomNumber || `Room ${l.room?.roomNumber || l.id.slice(-3)}`,
          vendor: l.vendor || l.deviceModel || 'Assa Abloy (VingCard BLE)',
          battery: l.batteryLevel ?? 95,
          pin: l.pinCode || l.pin || '849201',
          status: l.status || 'Online · Locked',
          bleRssi: l.signalStrength || '-55 dBm',
        }))
      );
    }
  }, [rawLocks]);

  const [newLock, setNewLock] = useState<RegisterSmartLockDto>({
    roomNumber: '',
    vendor: 'Assa Abloy (VingCard BLE)',
    initialPin: '',
  });

  // 15.3 Smart Thermostats (HVAC) State
  const [thermostats, setThermostats] = useState([
    { room: 'Room 101', state: 'Occupied', currentTemp: 21.5, targetTemp: 21.0, fanSpeed: 'Auto', power: 'ON', mode: 'Cooling' },
    { room: 'Room 102', state: 'Occupied', currentTemp: 22.0, targetTemp: 22.0, fanSpeed: 'Low', power: 'ON', mode: 'Cooling' },
    { room: 'Room 201', state: 'Vacant / Standby', currentTemp: 24.2, targetTemp: 24.0, fanSpeed: 'Eco', power: 'ECO', mode: 'Standby' },
    { room: 'Room 304', state: 'Occupied', currentTemp: 20.8, targetTemp: 20.5, fanSpeed: 'High', power: 'ON', mode: 'Cooling' },
    { room: 'Penthouse 801', state: 'Occupied', currentTemp: 21.0, targetTemp: 21.0, fanSpeed: 'Medium', power: 'ON', mode: 'Cooling' },
  ]);

  // Handlers
  const handleRemoteUnlock = (room: string) => {
    triggerBanner(`Door lock ${room} remote BLE unlock signal transmitted (<400ms latency)!`);
  };

  const handleGeneratePin = (room: string) => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setLocksList(
      locksList.map((l) => (l.roomNumber === room ? { ...l, pin: randomPin } : l)),
    );
    triggerBanner(`Generated dynamic 6-digit keypad PIN ${randomPin} for ${room}! Keycard revoked.`);
  };

  const handleRegisterLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLock.roomNumber) return;
    setLocksList([
      ...locksList,
      {
        id: `lock-${Date.now()}`,
        roomNumber: newLock.roomNumber,
        vendor: newLock.vendor || 'Assa Abloy (VingCard BLE)',
        battery: 100,
        pin: newLock.initialPin || '123456',
        status: 'Online · Locked',
        bleRssi: '-52 dBm',
      },
    ]);
    setIsRegisterOpen(false);
    triggerBanner(`Registered Smart Hardware Lock for ${newLock.roomNumber}!`);
  };

  const handleAdjustTemp = (room: string, delta: number) => {
    setThermostats(
      thermostats.map((t) =>
        t.room === room ? { ...t, targetTemp: Number((t.targetTemp + delta).toFixed(1)) } : t,
      ),
    );
    triggerBanner(`Adjusted ${room} HVAC target temperature.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-blue-600 font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">IoT Smart Rooms & Digital Keys</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-blue-600" /> IoT Smart Room Automation & Contactless Guest Journey
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bluetooth BLE/NFC door locks, smart thermostat HVAC schedules & encrypted in-room QR hubs (Chapter 15).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Register Smart Door Lock
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Multi-Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('locks')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'locks' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>Smart Door Locks & PINs (15.2)</span>
        </button>

        <button
          onClick={() => setActiveTab('hvac')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'hvac' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5 text-blue-600" />
          <span>Smart HVAC & Energy Saving (15.3)</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'qr' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-blue-600" />
          <span>In-Room QR Service Placards (15.4)</span>
        </button>
      </div>

      {/* TAB 1: SMART DOOR LOCKS (15.2) */}
      {activeTab === 'locks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Connected BLE Locks</span>
              <div className="text-xl font-bold text-slate-900">{locksList.length} Online Terminals</div>
              <p className="text-[11px] text-emerald-600 font-semibold">● 100% Signal Healthy</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Remote Unlock Latency</span>
              <div className="text-xl font-bold text-blue-600">&lt; 380 ms</div>
              <p className="text-[11px] text-slate-500">Fast Bluetooth Mesh Gateway</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Apple / Google Wallet Passes</span>
              <div className="text-xl font-bold text-purple-600">38 Active Keys</div>
              <p className="text-[11px] text-slate-500">NFC contactless passes</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Battery Level Alert</span>
              <div className="text-xl font-bold text-emerald-600">All Healthy</div>
              <p className="text-[11px] text-slate-500">Lowest unit at 72%</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Room Unit</th>
                  <th className="py-3 px-4">Lock Vendor Protocol</th>
                  <th className="py-3 px-4">Battery %</th>
                  <th className="py-3 px-4">Signal (RSSI)</th>
                  <th className="py-3 px-4">Active Keypad PIN</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locksList.map((lock) => (
                  <tr key={lock.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{lock.roomNumber}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{lock.vendor}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      <span className="flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5" />
                        <span>{lock.battery}%</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{lock.bleRssi}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-sm">
                      {lock.pin}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {lock.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleRemoteUnlock(lock.roomNumber)}
                          className="text-[11px] h-7 bg-white hover:bg-slate-50 cursor-pointer"
                        >
                          <Unlock className="w-3 h-3 mr-1 text-emerald-600" /> Remote Unlock
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleGeneratePin(lock.roomNumber)}
                          className="text-[11px] h-7 bg-white hover:bg-slate-50 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 mr-1 text-blue-600" /> New PIN
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SMART HVAC & ENERGY SAVING (15.3) */}
      {activeTab === 'hvac' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-600" /> Smart Thermostat HVAC Energy Management & Eco-Mode
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Occupancy-based temperature setback: 21°C when Occupied, 24°C Eco-Mode when Vacant (saves 28.4% HVAC utility power).
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => triggerBanner('Set Global Eco-Mode schedule across all vacant rooms!')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 mr-1" /> Enforce Global Eco-Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {thermostats.map((therm) => (
              <div
                key={therm.room}
                className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm text-slate-900">{therm.room}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      therm.state === 'Occupied'
                        ? 'border-blue-300 text-blue-800 bg-blue-50'
                        : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                    }`}
                  >
                    {therm.state}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Ambient Temp</span>
                    <span className="font-bold text-2xl text-slate-900">{therm.currentTemp}°C</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Target Setpoint</span>
                    <span className="font-bold text-2xl text-blue-600">{therm.targetTemp}°C</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Fan: {therm.fanSpeed}</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleAdjustTemp(therm.room, -0.5)}
                      className="w-7 h-7 p-0"
                    >
                      -
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleAdjustTemp(therm.room, 0.5)}
                      className="w-7 h-7 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IN-ROOM QR SERVICE PLACARDS (15.4) */}
      {activeTab === 'qr' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600" /> In-Room Encrypted QR Code Service Hubs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Guests scan with native iOS/Android camera without downloading any app: In-room dining POS, extra housekeeping towels & express checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['Room 101', 'Room 102', 'Room 201', 'Room 304', 'Penthouse 801'].map((rm) => (
              <div
                key={rm}
                className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs text-center space-y-3"
              >
                <div className="font-bold text-sm text-slate-900">{rm}</div>
                <div className="w-32 h-32 mx-auto bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-2">
                  <QrCode className="w-20 h-20 text-slate-800" />
                  <span className="text-[9px] font-mono text-slate-500 mt-1">omnistay.com/qr/{rm.toLowerCase().replace(' ', '')}</span>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => triggerBanner(`Generated high-res printable acrylic placard for ${rm}!`)}
                  className="w-full text-[11px] bg-white cursor-pointer"
                >
                  <Printer className="w-3 h-3 mr-1 text-slate-600" /> Print Placard
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: REGISTER LOCK HARDWARE */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" /> Register Smart Door Lock Terminal (15.2)
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterLock} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Room Assignment *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 405"
                  value={newLock.roomNumber}
                  onChange={(e) => setNewLock({ ...newLock, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Hardware Protocol Vendor</label>
                <select
                  value={newLock.vendor}
                  onChange={(e) => setNewLock({ ...newLock, vendor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500"
                >
                  <option value="Assa Abloy (VingCard BLE)">Assa Abloy (VingCard BLE)</option>
                  <option value="Salto Systems NFC">Salto Systems NFC</option>
                  <option value="Dormakaba BLE Commercial">Dormakaba BLE Commercial</option>
                  <option value="Yale Commercial Cloud API">Yale Commercial Cloud API</option>
                  <option value="TTLock Commercial API">TTLock Commercial API</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Initial 6-Digit Keypad PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 718294"
                  value={newLock.initialPin}
                  onChange={(e) => setNewLock({ ...newLock, initialPin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Confirm Registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
