'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '@/features/finance/hooks/use-finance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function FinancePage() {
  const { pnl, isPnlLoading, runNightAudit, isRunningAudit, auditResult } = useFinance();

  const handleRunAudit = async () => {
    if (confirm('Execute Automated Night Audit for the active hotel ledger? This will post room charges, compute taxes, and close today’s financial period.')) {
      try {
        await runNightAudit();
      } catch (err: any) {
        alert(err.message || 'Audit execution failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" /> Accounting & Night Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            General ledger, P&L statements, automated room charge posting, and tax reconciliations (Chapter 7).
          </p>
        </div>
        <Button variant="default" onClick={handleRunAudit} disabled={isRunningAudit} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isRunningAudit ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Running Night Audit...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" /> Execute Night Audit
            </>
          )}
        </Button>
      </div>

      {/* Audit Banner */}
      {auditResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Night Audit Run Successfully!</p>
              <p className="text-slate-600 mt-0.5">
                Processed {auditResult.roomsProcessed} room(s). Posted{' '}
                {formatCurrency(auditResult.roomRevenuePosted)} in room revenue and{' '}
                {formatCurrency(auditResult.taxPosted)} in tax.
              </p>
            </div>
          </div>
          <Badge variant="success">Audit Complete</Badge>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 border-b-0">
            <CardDescription className="font-medium text-slate-500">Total Gross Revenue</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {formatCurrency(pnl?.totalRevenue || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-slate-500">Synchronized from general ledger</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 border-b-0">
            <CardDescription className="font-medium text-slate-500">Room Division Revenue</CardDescription>
            <CardTitle className="text-2xl text-slate-900">
              {formatCurrency(pnl?.roomRevenue || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-slate-500">Night audit folio charges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 border-b-0">
            <CardDescription className="font-medium text-slate-500">POS & Banquet Revenue</CardDescription>
            <CardTitle className="text-2xl text-slate-900">
              {formatCurrency(pnl?.posRevenue || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-slate-500">F&B Outlets and room service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 border-b-0">
            <CardDescription className="font-medium text-slate-500">Net Operating Income</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">
              {formatCurrency(pnl?.netOperatingIncome || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-slate-500">Operating margins & EBITDA</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounting Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 font-bold">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Automated Night Audit Engine
            </CardTitle>
            <CardDescription>
              Backend batch worker closes daily business date and calculates taxes (Chapter 7.2).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-700">
            <p>
              The OmniStay 360 Night Audit module performs end-of-day rollover:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Validates all arrivals and flags no-show reservations</li>
              <li>Calculates room rack rates, seasonal surge, and city VAT</li>
              <li>Posts daily room charges to guest folios</li>
              <li>Reconciles POS cashier drawers and credit card settlement gateways</li>
              <li>Rolls forward system business date</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 font-bold">
              <TrendingUp className="w-5 h-5 text-teal-600" /> General Ledger Accounts
            </CardTitle>
            <CardDescription>
              USALI & GAAP compliant double-entry bookkeeping ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">1010 - Operating Cash & Bank</span>
              <span className="font-mono text-blue-600 font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">1200 - Guest Accounts Receivable</span>
              <span className="font-mono text-blue-600 font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">4010 - Room Night Revenue</span>
              <span className="font-mono text-slate-800 font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">2200 - Hospitality City Tax Payable</span>
              <span className="font-mono text-amber-600 font-semibold">$0.00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
