import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Power, Clock, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AutomatedReminder } from '../types';
import { cn } from '../utils/cn';
import toast, { Toaster } from 'react-hot-toast';

export const AutomatedReminders: React.FC = () => {
  const { automatedReminders, addAutomatedReminder, updateAutomatedReminder, deleteAutomatedReminder, toggleReminder } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<AutomatedReminder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'general' as 'invoice' | 'receipt' | 'dunning' | 'general',
    channel: 'sms' as 'sms' | 'whatsapp' | 'both',
    template: '',
    enabled: true,
    scheduleType: 'immediate' as 'immediate' | 'scheduled' | 'recurring',
    time: '09:00',
    daysBeforeDue: 3,
    recurringDays: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reminderData = {
      name: formData.name,
      type: formData.type,
      channel: formData.channel,
      template: formData.template,
      enabled: formData.enabled,
      schedule: {
        type: formData.scheduleType,
        time: formData.scheduleType !== 'immediate' ? formData.time : undefined,
        daysBeforeDue: formData.type === 'invoice' ? formData.daysBeforeDue : undefined,
        recurringDays: formData.scheduleType === 'recurring' ? formData.recurringDays : undefined,
      },
    };

    if (editingReminder) {
      updateAutomatedReminder(editingReminder.id, reminderData);
      toast.success('Reminder updated successfully');
    } else {
      addAutomatedReminder(reminderData);
      toast.success('Reminder created successfully');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'general',
      channel: 'sms',
      template: '',
      enabled: true,
      scheduleType: 'immediate',
      time: '09:00',
      daysBeforeDue: 3,
      recurringDays: [],
    });
    setEditingReminder(null);
    setShowModal(false);
  };

  const handleEdit = (reminder: AutomatedReminder) => {
    setEditingReminder(reminder);
    setFormData({
      name: reminder.name,
      type: reminder.type,
      channel: reminder.channel,
      template: reminder.template,
      enabled: reminder.enabled,
      scheduleType: reminder.schedule.type,
      time: reminder.schedule.time || '09:00',
      daysBeforeDue: reminder.schedule.daysBeforeDue || 3,
      recurringDays: reminder.schedule.recurringDays || [],
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this automated reminder?')) {
      deleteAutomatedReminder(id);
      toast.success('Reminder deleted successfully');
    }
  };

  const handleToggle = (id: string) => {
    toggleReminder(id);
    toast.success('Reminder status updated');
  };

  const toggleRecurringDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day].sort()
    }));
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-fade-in">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Automated Reminders</h2>
          <p className="text-gray-600">Set up automatic message scheduling for your clients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Reminder
        </button>
      </div>

      {/* Reminders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automatedReminders.map((reminder) => (
          <div
            key={reminder.id}
            className={cn(
              'card hover:shadow-lg transition-all duration-200',
              !reminder.enabled && 'opacity-60'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{reminder.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      reminder.type === 'invoice' && 'bg-blue-100 text-blue-700',
                      reminder.type === 'receipt' && 'bg-green-100 text-green-700',
                      reminder.type === 'dunning' && 'bg-red-100 text-red-700',
                      reminder.type === 'general' && 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {reminder.type}
                  </span>
                  <span className="text-xs text-gray-500">{reminder.channel}</span>
                </div>
              </div>
              <button
                onClick={() => handleToggle(reminder.id)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  reminder.enabled
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                )}
              >
                <Power size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span className="capitalize">{reminder.schedule.type}</span>
                {reminder.schedule.time && <span>at {reminder.schedule.time}</span>}
              </div>
              
              {reminder.schedule.daysBeforeDue && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{reminder.schedule.daysBeforeDue} days before due</span>
                </div>
              )}

              {reminder.schedule.recurringDays && reminder.schedule.recurringDays.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>
                    {reminder.schedule.recurringDays.map(d => daysOfWeek[d]).join(', ')}
                  </span>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 line-clamp-3">{reminder.template}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEdit(reminder)}
                className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(reminder.id)}
                className="flex-1 btn btn-danger flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {automatedReminders.length === 0 && (
        <div className="card text-center py-12">
          <Bell className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 mb-2">No automated reminders yet</p>
          <p className="text-sm text-gray-400">Create your first reminder to automate client communications</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingReminder ? 'Edit Reminder' : 'Create Automated Reminder'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Reminder Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Weekly Payment Reminder"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Message Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="input"
                  >
                    <option value="invoice">Invoice Reminder</option>
                    <option value="receipt">Payment Receipt</option>
                    <option value="dunning">Overdue Notice</option>
                    <option value="general">General Message</option>
                  </select>
                </div>

                <div>
                  <label className="label">Channel *</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                    className="input"
                  >
                    <option value="sms">SMS Only</option>
                    <option value="whatsapp">WhatsApp Only</option>
                    <option value="both">Both SMS & WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Message Template *</label>
                <textarea
                  required
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  className="input min-h-[100px] resize-none"
                  placeholder="Dear {name}, this is a reminder..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use variables: {'{name}'}, {'{amount}'}, {'{phone}'}, {'{dueDate}'}
                </p>
              </div>

              <div>
                <label className="label">Schedule Type *</label>
                <select
                  value={formData.scheduleType}
                  onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as any })}
                  className="input"
                >
                  <option value="immediate">Send Immediately</option>
                  <option value="scheduled">Scheduled Time</option>
                  <option value="recurring">Recurring Days</option>
                </select>
              </div>

              {formData.scheduleType !== 'immediate' && (
                <div>
                  <label className="label">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input"
                  />
                </div>
              )}

              {formData.type === 'invoice' && (
                <div>
                  <label className="label">Days Before Due Date</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.daysBeforeDue}
                    onChange={(e) => setFormData({ ...formData, daysBeforeDue: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
              )}

              {formData.scheduleType === 'recurring' && (
                <div>
                  <label className="label">Recurring Days</label>
                  <div className="flex gap-2 flex-wrap">
                    {daysOfWeek.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleRecurringDay(index)}
                        className={cn(
                          'px-4 py-2 rounded-lg border-2 transition-all',
                          formData.recurringDays.includes(index)
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="enabled" className="text-sm text-gray-700">
                  Enable this reminder immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingReminder ? 'Update' : 'Create'} Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
