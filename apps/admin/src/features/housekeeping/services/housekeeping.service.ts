import { api } from '@/lib/api/client';

export interface HousekeepingTaskItem {
  id: string;
  roomNumber: string;
  taskType: 'checkout_clean' | 'stayover_clean' | 'deep_clean' | 'inspection';
  priority: 'high' | 'normal';
  status: 'assigned' | 'in_progress' | 'completed' | 'verified';
  housekeeperName?: string;
  notes?: string;
}

export interface CreateHousekeepingTaskDto {
  roomId?: string;
  roomNumber: string;
  taskType: 'checkout_clean' | 'stayover_clean' | 'deep_clean' | 'inspection';
  priority: 'high' | 'normal';
  notes?: string;
}

export const housekeepingService = {
  getTasks: async (): Promise<HousekeepingTaskItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/housekeeping/tasks');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((t: any) => ({
        id: t.id,
        roomNumber: t.room?.roomNumber || t.roomNumber || '',
        taskType: t.taskType || 'checkout_clean',
        priority: t.priority || 'normal',
        status: t.status || 'assigned',
        housekeeperName: t.housekeeper?.name || t.assignedTo || '',
        notes: t.completionNotes || t.notes,
      }));
    } catch (error) {
      return [];
    }
  },

  createTask: async (dto: CreateHousekeepingTaskDto): Promise<HousekeepingTaskItem> => {
    const res = await api.post<any>('/api/v1/housekeeping/tasks', dto);
    return {
      id: res.id || `hk-${Date.now()}`,
      roomNumber: dto.roomNumber,
      taskType: dto.taskType,
      priority: dto.priority,
      status: 'assigned',
      housekeeperName: '',
      notes: dto.notes,
    };
  },

  updateTaskStatus: async (
    id: string,
    status: 'assigned' | 'in_progress' | 'completed' | 'verified',
  ): Promise<any> => {
    return await api.patch(`/api/v1/housekeeping/tasks/${id}/status`, { status });
  },

  transitionRoomCleanliness: async (
    roomId: string,
    status: 'clean' | 'dirty' | 'inspected' | 'ooo',
  ): Promise<any> => {
    return await api.patch('/api/v1/housekeeping/status', { status }, {
      params: { roomId },
    });
  },
};
