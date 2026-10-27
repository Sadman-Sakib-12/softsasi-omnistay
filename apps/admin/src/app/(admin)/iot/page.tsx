'use client';

import React, { useState } from 'react';
import { KeyRound, Smartphone, Thermometer, ShieldCheck, Battery, Wifi, CheckCircle2, Lock, Unlock, Plus, RefreshCw, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { iotService, SmartLockItem, RegisterSmartLockDto } from '@/features/iot/services/iot.service';

export default function IotSmartRoomPage() {
  const queryClient = useQueryClient();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newLock, setNewLock] = useState<RegisterSmartLockDto>({
    roomNumber: '',
    vendor: '',
    initialPin: '',
  });
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data: locks = [], isLoading } = useQuery<SmartLockItem[]>({
    queryKey: ['smartLocksList'],
    queryFn: () => iotService.getLocks(),
  });

  const unlockMutation = useMutation({
    mutationFn: (id: string) => iotService.unlock(id),
    onSuccess: (_, id) => {
      setActionMessage(`Door lock #${id} remote BLE unlock command sent successfully (<400ms)!`);
      queryClient.invalidateQueries({ queryKey: ['smartLocksList'] });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  const generateKeyMutation = useMutation({
    mutationFn: ({ id, roomNumber }: { id: string; roomNumber: string }) =>
      iotService.generateKey(id, roomNumber),
    onSuccess: (res, vars) => {
      setActionMessage(res?.key ? `Generated new PIN ${res.key} for ${vars.roomNumber}` : `Generated new key token for ${vars.roomNumber}`);
      queryClient.invalidateQueries({ queryKey: ['smartLocksList'] });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterSmartLockDto) => iotService.registerLock(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartLocksList'] });
      setIsRegisterOpen(false);
      setActionMessage(`New smart lock registered for ${newLock.roomNumber}`);
      setNewLock({ roomNumber: '', vendor: '', initialPin: '' });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerMutation.mutateAsync(newLock);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">IoT Smart Rooms</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-[#00a8ff]" /> IoT Smart Room & Keycard Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bluetooth BLE/NFC door locks, smart thermostat HVAC energy saving, and digital PIN keys (Chapter 15).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['smartLocksList'] })}
            variant="outline"
            size="sm"
            className="text-xs bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Telemetry
          </Button>
          <Button
            onClick={() => setIsRegisterOpen(true)}
            size="sm"
            className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Register Lock Hardware
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active BLE Door Locks', val: `${locks.length} Connected` },
          { label: 'Smart Thermostat Mode', val: 'Eco-Smart 21°C' },
          { label: 'Digital Passes Active', val: '8 Apple/Google Wallets' },
          { label: 'Energy Cost Savings', val: '28.4% Utility Reduction' },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium">{s.label}</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Smart Locks Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Room Unit</th>
              <th className="py-3 px-4">Lock Hardware Vendor</th>
              <th className="py-3 px-4">Battery</th>
              <th className="py-3 px-4">Active Keypad PIN</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
                  <span className="mt-2 block text-xs">Loading lock devices...</span>
                </td>
              </tr>
            ) : locks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No smart locks registered yet.
                </td>
              </tr>
            ) : (
              locks.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{l.roomNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{l.vendor}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5" />
                      <span>{l.battery}%</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{l.pin}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => unlockMutation.mutate(l.id)}
                        className="text-[11px] h-7 bg-white hover:bg-slate-50"
                      >
                        <Unlock className="w-3 h-3 mr-1 text-emerald-600" /> Remote Unlock
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => generateKeyMutation.mutate({ id: l.id, roomNumber: l.roomNumber })}
                        className="text-[11px] h-7 bg-white hover:bg-slate-50"
                      >
                        <RefreshCw className="w-3 h-3 mr-1 text-blue-600" /> New PIN
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Lock Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#00a8ff]" /> Register Smart Door Lock Terminal
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Room Assignment</label>
                <input
                  type="text"
                  required
                  value={newLock.roomNumber}
                  onChange={(e) => setNewLock({ ...newLock, roomNumber: e.target.value })}
                  placeholder="e.g. Room 402"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Hardware Vendor Protocol</label>
                <select
                  value={newLock.vendor}
                  onChange={(e) => setNewLock({ ...newLock, vendor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                  required
                >
                  <option value="" disabled>Select Hardware Vendor Protocol...</option>
                  <option value="Assa Abloy (VingCard BLE)">Assa Abloy (VingCard BLE)</option>
                  <option value="Salto Systems NFC">Salto Systems NFC</option>
                  <option value="Dormakaba BLE">Dormakaba BLE</option>
                  <option value="Yale Commercial Cloud">Yale Commercial Cloud</option>
                  <option value="TTLock Commercial API">TTLock Commercial API</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Initial 6-Digit PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newLock.initialPin}
                  onChange={(e) => setNewLock({ ...newLock, initialPin: e.target.value })}
                  placeholder="e.g. 648102"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={registerMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {registerMutation.isPending ? 'Registering...' : 'Confirm Registration'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
