import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md text-center mb-6">
        The requested admin route or resource does not exist or has been relocated in the OmniStay system.
      </p>
      <Link href="/dashboard">
        <Button variant="glow">
          <Home className="w-4 h-4 mr-2" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
