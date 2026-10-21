export interface LeadDto {
  id?: string;
  tenantId: string;
  stageId?: string | null;
  title: string;
  contactName: string;
  email?: string | null;
  phone?: string | null;
  leadScore?: number;
  source?: string;
  assignedTo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DealDto {
  id?: string;
  tenantId: string;
  stageId?: string | null;
  dealName: string;
  dealValue: number;
  expectedClose?: Date | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormBuilderDto {
  id?: string;
  tenantId: string;
  formName: string;
  formSchema: Record<string, any>;
  isActive?: boolean;
}

export interface FormResponseDto {
  id?: string;
  formId: string;
  formData: Record<string, any>;
  submitterIp?: string | null;
}

export interface GuestProfile360Dto {
  id?: string;
  userId: string;
  lifetimeSpend?: number;
  totalNights?: number;
  vipTier?: 'Silver' | 'Gold' | 'Platinum' | 'VIP Black';
  notes?: string | null;
}

export interface SupportTicketDto {
  id?: string;
  tenantId: string;
  ticketCode: string;
  guestName: string;
  guestEmail?: string | null;
  subject: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
}
