import { create } from 'zustand';
import { sessionManager } from '@/lib/auth/session';

export interface TenantInfo {
  id: string;
  name: string;
  domain?: string | null;
  subdomain?: string | null;
}

interface TenantState {
  currentTenantId: string;
  currentPropertyId: string | null;
  tenants: TenantInfo[];
  setTenantId: (tenantId: string) => void;
  setPropertyId: (propertyId: string | null) => void;
  setTenants: (tenants: TenantInfo[]) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenantId: sessionManager.getTenantId() || '',
  currentPropertyId: null,
  tenants: [],
  setTenantId: (tenantId) => {
    sessionManager.setTenantId(tenantId);
    set({ currentTenantId: tenantId });
  },
  setPropertyId: (propertyId) => set({ currentPropertyId: propertyId }),
  setTenants: (tenants) => set({ tenants }),
}));
