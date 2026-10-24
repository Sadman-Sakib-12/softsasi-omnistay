import React from 'react';

export default function UsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-xl" />
      <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800" />
    </div>
  );
}
