'use client';

import React, { useState } from 'react';
import { KeyRound, Smartphone, Thermometer, ShieldCheck, Battery, Wifi, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function IotSmartRoomPage() {
  const [locks, setLocks] = useState([
    { id: 'lock-1', roomNumber: 'Room 101', vendor: 'Assa Abloy (VingCard BLE)', battery: 92, status: 'Online / Locked', pin: '849201' },
    { id: 'lock-2', roomNumber: 'Room 102', vendor: 'Salto Systems NFC', battery: 88, status: 'Online / Locked', pin: '391024' },
    { id: 'lock-3', roomNumber: 'Room 201', vendor: 'Dormakaba BLE', battery: 95, status: 'Online / Locked', pin: '719302' },
    { id: 'lock-4', roomNumber: 'Room 304', vendor: 'Yale Commercial Cloud', battery: 74, status: 'Online / Unlocked', pin: '519283' },
  ]);

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active BLE Door Locks', val: '4 Connected' },
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

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Room Unit</th>
              <th className="py-3 px-4">Lock Hardware Vendor</th>
              <th className="py-3 px-4">Battery</th>
              <th className="py-3 px-4">Active Keypad PIN</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locks.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{l.roomNumber}</td>
                <td className="py-3 px-4 text-slate-600">{l.vendor}</td>
                <td className="py-3 px-4 font-semibold text-emerald-600 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5" />
                  <span>{l.battery}%</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">{l.pin}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
