import { api } from '@/lib/api/client';

export interface SmartLockItem {
  id: string;
  roomNumber: string;
  vendor: string;
  battery: number;
  status: string;
  pin: string;
  macAddress?: string;
}

export interface RegisterSmartLockDto {
  roomNumber: string;
  vendor: string;
  macAddress?: string;
  initialPin?: string;
}

export const iotService = {
  getLocks: async (): Promise<SmartLockItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/iot/locks');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((l: any, idx: number) => ({
        id: l.id || `lock-${idx + 1}`,
        roomNumber: l.roomNumber || '',
        vendor: l.vendor || '',
        battery: Number(l.batteryLevel ?? 0),
        status: l.isLocked !== false ? 'Online / Locked' : 'Online / Unlocked',
        pin: l.activePin || '',
        macAddress: l.macAddress,
      }));
    } catch (error) {
      return [];
    }
  },

  registerLock: async (dto: RegisterSmartLockDto): Promise<SmartLockItem> => {
    const res = await api.post<any>('/api/v1/iot/locks', dto);
    return {
      id: res.id || `lock-${Date.now()}`,
      roomNumber: dto.roomNumber,
      vendor: dto.vendor,
      battery: 100,
      status: 'Online / Locked',
      pin: dto.initialPin || '',
    };
  },

  unlock: async (id: string): Promise<any> => {
    return await api.post(`/api/v1/iot/locks/${id}/unlock`, {
      method: 'BLE_COMMAND',
      operator: 'FRONT_DESK_ADMIN',
    });
  },

  generateKey: async (id: string, roomNumber: string): Promise<any> => {
    return await api.post(`/api/v1/iot/locks/${id}/keys`, {
      roomNumber,
      keyType: 'PIN_CODE',
    });
  },
};
