export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  status: 'active' | 'inactive' | 'overdue';
  createdAt: Date;
  lastPayment?: Date;
}

export interface Message {
  id: string;
  clientId: string;
  type: 'invoice' | 'receipt' | 'dunning' | 'general';
  channel: 'sms' | 'whatsapp';
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

export interface AutomatedReminder {
  id: string;
  name: string;
  type: 'invoice' | 'receipt' | 'dunning' | 'general';
  channel: 'sms' | 'whatsapp' | 'both';
  template: string;
  enabled: boolean;
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    time?: string; // HH:mm format
    daysBeforeDue?: number;
    recurringDays?: number[];
  };
  conditions?: {
    minBalance?: number;
    maxBalance?: number;
    clientStatus?: string[];
  };
  createdAt: Date;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'receipt' | 'dunning' | 'general';
  content: string;
  variables: string[];
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  overdueClients: number;
  totalBalance: number;
  messagesSent: number;
  messagesScheduled: number;
  successRate: number;
}
