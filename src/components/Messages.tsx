import React, { useState } from 'react';
import { Send, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { smsService } from '../services/smsService';
import toast, { Toaster } from 'react-hot-toast';
import { formatDateTime } from '../utils/formatters';
import { cn } from '../utils/cn';

export const Messages: React.FC = () => {
  const { clients, messages, addMessage, updateMessage, templates } = useStore();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'invoice' | 'receipt' | 'dunning' | 'general'>('general');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [messageContent, setMessageContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMessages = messages.filter(
    (msg) => filterType === 'all' || msg.type === filterType
  );

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setMessageContent(template.content);
      setMessageType(template.type);
    }
  };

  const replaceVariables = (content: string, client: any) => {
    return content
      .replace(/{name}/g, client.name)
      .replace(/{amount}/g, client.balance.toString())
      .replace(/{phone}/g, client.phone)
      .replace(/{dueDate}/g, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString());
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (selectedClients.length === 0) {
      toast.error('Please select at least one client');
      return;
    }

    setSending(true);
    const selectedClientData = clients.filter((c) => selectedClients.includes(c.id));

    try {
      for (const client of selectedClientData) {
        const personalizedMessage = replaceVariables(messageContent, client);

        // Add message to store
        const messageId = Math.random().toString(36).substr(2, 9);
        addMessage({
          clientId: client.id,
          type: messageType,
          channel: channel,
          content: personalizedMessage,
          status: 'pending',
        });

        // Send via SMS service
        const result = await smsService.sendSMS({
          phone: client.phone,
          message: personalizedMessage,
          channel: channel,
        });

        // Update message status
        updateMessage(messageId, {
          status: result.success ? 'sent' : 'failed',
          sentAt: result.success ? new Date() : undefined,
        });

        if (result.success) {
          toast.success(`Message sent to ${client.name}`);
        } else {
          toast.error(`Failed to send to ${client.name}: ${result.error}`);
        }

        // Small delay between messages
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Reset form
      setSelectedClients([]);
      setMessageContent('');
      setSelectedTemplate('');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const selectAllClients = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map((c) => c.id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toaster position="top-right" />
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Messages</h2>
        <p className="text-gray-600">Send SMS or WhatsApp messages to your clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Message */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h3>

          <div className="space-y-4">
            <div>
              <label className="label">Message Type</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as any)}
                className="input"
              >
                <option value="invoice">Invoice Reminder</option>
                <option value="receipt">Payment Receipt</option>
                <option value="dunning">Overdue Notice</option>
                <option value="general">General Message</option>
              </select>
            </div>

            <div>
              <label className="label">Channel</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setChannel('sms')}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-lg border-2 transition-all',
                    channel === 'sms'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  SMS
                </button>
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-lg border-2 transition-all',
                    channel === 'whatsapp'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  WhatsApp
                </button>
              </div>
            </div>

            <div>
              <label className="label">Use Template (Optional)</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="input"
              >
                <option value="">Select a template...</option>
                {templates
                  .filter((t) => t.type === messageType)
                  .map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="label">Message Content</label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="input min-h-[120px] resize-none"
                placeholder="Type your message here... Use {name}, {amount}, {dueDate} as variables"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{name}'}, {'{amount}'}, {'{phone}'}, {'{dueDate}'}
              </p>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={sending || selectedClients.length === 0}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send to {selectedClients.length} Client{selectedClients.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Select Recipients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Recipients</h3>
            <button onClick={selectAllClients} className="text-sm text-primary-600 hover:text-primary-700">
              {selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {clients.map((client) => (
              <label
                key={client.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                  selectedClients.includes(client.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => toggleClientSelection(client.id)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.phone}</p>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    client.status === 'active' && 'bg-green-100 text-green-700',
                    client.status === 'inactive' && 'bg-gray-100 text-gray-700',
                    client.status === 'overdue' && 'bg-red-100 text-red-700'
                  )}
                >
                  {client.status}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Message History</h3>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">All Types</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="dunning">Dunning</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Channel</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Message</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => {
                const client = clients.find((c) => c.id === message.clientId);
                return (
                  <tr key={message.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{client?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'text-xs px-2 py-1 rounded-full',
                          message.type === 'invoice' && 'bg-blue-100 text-blue-700',
                          message.type === 'receipt' && 'bg-green-100 text-green-700',
                          message.type === 'dunning' && 'bg-red-100 text-red-700',
                          message.type === 'general' && 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {message.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{message.channel}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                      {message.content}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'text-xs px-2 py-1 rounded-full',
                          message.status === 'sent' && 'bg-green-100 text-green-700',
                          message.status === 'failed' && 'bg-red-100 text-red-700',
                          message.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                          message.status === 'scheduled' && 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {message.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDateTime(message.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMessages.length === 0 && (
            <p className="text-center text-gray-500 py-8">No messages found</p>
          )}
        </div>
      </div>
    </div>
  );
};
