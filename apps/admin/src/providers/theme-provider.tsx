'use client';

import React, { useEffect } from 'react';
import { useUiStore } from '@/stores/ui-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUiStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('omnistay_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [setTheme]);

  return <>{children}</>;
}
