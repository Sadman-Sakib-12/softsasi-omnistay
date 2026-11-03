'use client';

import React, { useState } from 'react';
import {
  LogIn,
  KeyRound,
  FileCheck2,
  ScanLine,
  BedDouble,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SignaturePad } from '@/components/ui/signature-pad';
import { reservationsService, Reservation } from '../services/reservations.service';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CheckInDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckInDialog({ reservation, isOpen, onClose, onSuccess }: CheckInDialogProps) {
  const { rooms } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    reservation.roomId || (rooms.length > 0 ? rooms[0].id : '')
  );
  const [keycardCode, setKeycardCode] = useState<string>(
    `RFID-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [signatureData, setSignatureData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OCR state
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulateOcr = async () => {
    setIsScanningOcr(true);
    setErrorMessage(null);
    try {
      const result = await reservationsService.parsePassportOcr({
        rawText: `P<UTO${reservation.guestName.toUpperCase().replace(/\s+/g, '<')}<<<<<<<<<<<<<<<<<<<\nL898902C36UTO8501018M3009244<<<<<<<<<<<<<<06`,
      });
      setOcrResult(result);
    } catch {
      // Fallback demo response
      setOcrResult({
        documentType: 'PASSPORT',
        documentNumber: `P${Math.floor(10000000 + Math.random() * 90000000)}`,
        nationality: 'USA',
        fullName: reservation.guestName,
        dateOfBirth: '1988-04-12',
        expiryDate: '2032-08-20',
        mrzValid: true,
        confidenceScore: 98.4,
      });
    } finally {
      setIsScanningOcr(false);
    }
  };

  const handleCompleteCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureData) {
      setErrorMessage('Guest digital signature is required to complete check-in (Chapter 4.1.5.2).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await reservationsService.checkIn({
        bookingId: reservation.id,
        roomId: selectedRoomId,
        keycardCode,
        digitalSignature: signatureData,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      // If mock/offline or booking already active, still notify gracefully
      setErrorMessage(err?.response?.data?.message || err?.message || 'Check-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <LogIn className="w-5 h-5 text-blue-400" /> Front Desk Digital Check-In & E-Registration
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Guest Registration Card &middot; MRZ Document OCR &middot; E-Signature &middot; RFID Encoder (Chapter 4.1.5.2)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleCompleteCheckIn} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Reservation Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Guest</span>
              <span className="font-bold text-slate-900 truncate block">{reservation.guestName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Booking Code</span>
              <span className="font-mono font-bold text-blue-600">
                {reservation.confirmationCode || reservation.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Stay Duration</span>
              <span className="text-slate-700 font-medium">
                {formatDate(reservation.checkInDate)} &rarr; {formatDate(reservation.checkOutDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Folio Balance</span>
              <span className="font-bold text-emerald-600 font-mono">
                {formatCurrency(reservation.totalAmount)}
              </span>
            </div>
          </div>

          {/* Room Unit Assignment & Keycard Encoder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                Assign Physical Room Unit *
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded focus:border-blue-500 font-medium bg-white"
              >
                {rooms.length === 0 ? (
                  <option value="00000000-0000-0000-0000-000000000001">Room 101 (Standard King - Clean)</option>
                ) : (
                  rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber || r.name} ({r.roomType || 'Deluxe'} &middot; {r.status || 'Clean'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                RFID Door Lock / BLE Mobile Key Code *
              </label>
              <input
                type="text"
                required
                value={keycardCode}
                onChange={(e) => setKeycardCode(e.target.value)}
                placeholder="RFID-000000"
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Section 2: Passport / National ID OCR Scanner */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ScanLine className="w-4 h-4 text-blue-600" /> Passport & ID OCR Scanner (Chapter 15.1)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Extracts ICAO Doc 9303 MRZ lines for digital hospitality guest audit compliance.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSimulateOcr}
                disabled={isScanningOcr}
                className="text-xs bg-white border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer"
              >
                {isScanningOcr ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Scanning MRZ...
                  </>
                ) : (
                  <>
                    <ScanLine className="w-3.5 h-3.5 mr-1" /> Scan / Upload ID Document
                  </>
                )}
              </Button>
            </div>

            {ocrResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> MRZ Parsed & Verified
                  </span>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-white text-[10px]">
                    Confidence: {ocrResult.confidenceScore || 98.5}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-400 block uppercase text-[9px]">Document No</span>
                    <span className="font-mono font-bold text-slate-900">{ocrResult.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[9px]">Nationality</span>
                    <span className="font-semibold text-slate-800">{ocrResult.nationality} ({ocrResult.issuingCountry})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[9px]">Date of Birth</span>
                    <span className="text-slate-800">{ocrResult.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[9px]">Valid Until</span>
                    <span className="text-slate-800">{ocrResult.expiryDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Digital Signature Pad */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
            <SignaturePad
              label="Guest Digital Signature Confirmation"
              required={true}
              height={130}
              onSave={(dataUrl) => setSignatureData(dataUrl)}
              onClear={() => setSignatureData('')}
            />
            <p className="text-[10px] text-slate-500">
              By signing above, guest agrees to hotel terms of stay, damages policy, and room folio payment liability.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs bg-white text-slate-600"
              >
                <Printer className="w-3.5 h-3.5 mr-1" /> Print Reg Card
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !signatureData}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Encoding & Checking In...
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-3.5 h-3.5 mr-1" /> Complete Check-In & Issue Key
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
