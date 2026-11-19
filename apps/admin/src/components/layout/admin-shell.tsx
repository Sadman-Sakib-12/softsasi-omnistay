'use client';

import React from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { useUiStore } from '@/stores/ui-store';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 antialiased selection:bg-[#00a8ff] selection:text-white relative">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop fixed left, Mobile drawer overlay) */}
      <AdminSidebar />

      {/* Content Area with Clean White/Light Background */}
      <div className="flex flex-1 flex-col overflow-hidden z-10 relative bg-slate-50 min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="mx-auto max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1600px] w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
