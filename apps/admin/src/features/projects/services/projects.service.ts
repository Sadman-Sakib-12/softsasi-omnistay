import { api } from '@/lib/api/client';

export interface ProjectItem {
  id: string;
  name: string;
  budget: number;
  spent: number;
  stage: string;
  progress: number;
  description?: string;
}

export interface BugItem {
  id: string;
  title: string;
  severity: 'Critical' | 'Major' | 'Minor';
  status: string;
  description?: string;
}

export interface CreateProjectDto {
  name: string;
  totalBudget: number;
  description?: string;
}

export interface CreateBugDto {
  title: string;
  severity: string;
  description?: string;
  systemComponent?: string;
}

export const projectsService = {
  getProjects: async (): Promise<ProjectItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/projects');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((p: any) => ({
        id: p.id,
        name: p.name || p.title || '',
        budget: Number(p.budget || p.totalBudget || 0),
        spent: Number(p.spent || p.actualExpenditure || 0),
        stage: p.status || p.stage || 'Planning',
        progress: Number(p.progress || (p.budget ? Math.min(100, Math.round((Number(p.spent || 0) / Number(p.budget)) * 100)) : 0)),
        description: p.description,
      }));
    } catch (error) {
      return [];
    }
  },

  createProject: async (dto: CreateProjectDto): Promise<ProjectItem> => {
    const res = await api.post<any>('/api/v1/projects', dto);
    return {
      id: res.id || `p-${Date.now()}`,
      name: dto.name,
      budget: dto.totalBudget,
      spent: 0,
      stage: 'Planning',
      progress: 0,
      description: dto.description,
    };
  },

  getBugs: async (): Promise<BugItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/projects/bugs');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((b: any) => ({
        id: b.id || b.bugId || `BUG-${Date.now()}`,
        title: b.title || '',
        severity: b.severity || 'Medium',
        status: b.status || 'New',
        description: b.description,
      }));
    } catch (error) {
      return [];
    }
  },

  createBug: async (dto: CreateBugDto): Promise<BugItem> => {
    const res = await api.post<any>('/api/v1/projects/bugs', dto);
    return {
      id: res.id || `BUG-${Date.now()}`,
      title: dto.title,
      severity: dto.severity as any,
      status: 'New',
      description: dto.description,
    };
  },

  updateBugStatus: async (id: string, status: string): Promise<any> => {
    return await api.patch(`/api/v1/projects/bugs/${id}/status`, { status });
  },
};
