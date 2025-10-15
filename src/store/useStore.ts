import { create } from 'zustand';
import { Client, Message, AutomatedReminder, MessageTemplate, DashboardStats } from '../types';

interface AppState {
  clients: Client[];
  messages: Message[];
  automatedReminders: AutomatedReminder[];
  templates: MessageTemplate[];
  stats: DashboardStats;
  
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  
  // Automated reminder actions
  addAutomatedReminder: (reminder: Omit<AutomatedReminder, 'id' | 'createdAt'>) => void;
  updateAutomatedReminder: (id: string, updates: Partial<AutomatedReminder>) => void;
  deleteAutomatedReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  
  // Template actions
  addTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // Stats
  updateStats: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Default templates
const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Payment Reminder',
    type: 'invoice',
    content: 'Dear {name}, this is a reminder that your payment of {amount} is due on {dueDate}. Please pay before the deadline. Thank you!',
    variables: ['name', 'amount', 'dueDate'],
  },
  {
    id: '2',
    name: 'Payment Received',
    type: 'receipt',
    content: 'Dear {name}, we have received your payment of {amount}. Thank you for your prompt payment!',
    variables: ['name', 'amount'],
  },
  {
    id: '3',
    name: 'Overdue Notice',
    type: 'dunning',
    content: 'Dear {name}, your payment of {amount} is now overdue. Please settle your account as soon as possible to avoid service interruption.',
    variables: ['name', 'amount'],
  },
  {
    id: '4',
    name: 'Garbage Removal Reminder',
    type: 'general',
    content: 'Dear {name}, reminder to remove your garbage bag for collection. Thank you!',
    variables: ['name'],
  },
];

// Sample data
const sampleClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+254712345678',
    email: 'john@example.com',
    address: 'Nairobi, Kenya',
    balance: 5000,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastPayment: new Date('2024-10-01'),
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+254723456789',
    email: 'jane@example.com',
    address: 'Mombasa, Kenya',
    balance: 0,
    status: 'active',
    createdAt: new Date('2024-02-20'),
    lastPayment: new Date('2024-10-10'),
  },
  {
    id: '3',
    name: 'Bob Johnson',
    phone: '+254734567890',
    balance: 12000,
    status: 'overdue',
    createdAt: new Date('2024-03-10'),
    lastPayment: new Date('2024-08-15'),
  },
];

export const useStore = create<AppState>((set, get) => ({
  clients: sampleClients,
  messages: [],
  automatedReminders: [],
  templates: defaultTemplates,
  stats: {
    totalClients: 0,
    activeClients: 0,
    overdueClients: 0,
    totalBalance: 0,
    messagesSent: 0,
    messagesScheduled: 0,
    successRate: 0,
  },

  addClient: (client) => {
    const newClient: Client = {
      ...client,
      id: generateId(),
      createdAt: new Date(),
    };
    set((state) => ({ clients: [...state.clients, newClient] }));
    get().updateStats();
  },

  updateClient: (id, updates) => {
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().updateStats();
  },

  deleteClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }));
    get().updateStats();
  },

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      createdAt: new Date(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    get().updateStats();
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
    get().updateStats();
  },

  addAutomatedReminder: (reminder) => {
    const newReminder: AutomatedReminder = {
      ...reminder,
      id: generateId(),
      createdAt: new Date(),
    };
    set((state) => ({
      automatedReminders: [...state.automatedReminders, newReminder],
    }));
  },

  updateAutomatedReminder: (id, updates) => {
    set((state) => ({
      automatedReminders: state.automatedReminders.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  },

  deleteAutomatedReminder: (id) => {
    set((state) => ({
      automatedReminders: state.automatedReminders.filter((r) => r.id !== id),
    }));
  },

  toggleReminder: (id) => {
    set((state) => ({
      automatedReminders: state.automatedReminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  },

  addTemplate: (template) => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: generateId(),
    };
    set((state) => ({ templates: [...state.templates, newTemplate] }));
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    }));
  },

  updateStats: () => {
    const { clients, messages } = get();
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === 'active').length;
    const overdueClients = clients.filter((c) => c.status === 'overdue').length;
    const totalBalance = clients.reduce((sum, c) => sum + c.balance, 0);
    const messagesSent = messages.filter((m) => m.status === 'sent').length;
    const messagesScheduled = messages.filter((m) => m.status === 'scheduled').length;
    const totalMessages = messages.length;
    const successRate = totalMessages > 0 ? (messagesSent / totalMessages) * 100 : 0;

    set({
      stats: {
        totalClients,
        activeClients,
        overdueClients,
        totalBalance,
        messagesSent,
        messagesScheduled,
        successRate,
      },
    });
  },
}));

// Initialize stats
setTimeout(() => {
  useStore.getState().updateStats();
}, 0);
