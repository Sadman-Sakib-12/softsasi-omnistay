'use client';

import React from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Main Sidebar (Dark Navy per PDF Figure 2.1, 3.1, 4.1) */}
      <AdminSidebar />

      {/* Content Area with Clean White/Light Background */}
      <div className="flex flex-1 flex-col overflow-hidden z-10 relative bg-slate-50">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
