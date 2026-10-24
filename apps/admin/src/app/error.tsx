'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Application Exception</h1>
      <p className="text-xs text-rose-400 max-w-lg text-center mb-6 font-mono bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl">
        {error.message || 'An unexpected runtime error occurred.'}
      </p>
      <Button variant="outline" onClick={() => reset()}>
        <RefreshCcw className="w-4 h-4 mr-2" /> Retry Operation
      </Button>
    </div>
  );
}
