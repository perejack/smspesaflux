import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Copy } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MessageTemplate } from '../types';
import { cn } from '../utils/cn';
import toast, { Toaster } from 'react-hot-toast';

export const Templates: React.FC = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'general' as 'invoice' | 'receipt' | 'dunning' | 'general',
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract variables from content
    const variables = Array.from(
      new Set(
        (formData.content.match(/\{(\w+)\}/g) || []).map(v => v.slice(1, -1))
      )
    );

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        ...formData,
        variables,
      });
      toast.success('Template updated successfully');
    } else {
      addTemplate({
        ...formData,
        variables,
      });
      toast.success('Template created successfully');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'general',
      content: '',
    });
    setEditingTemplate(null);
    setShowModal(false);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      content: template.content,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
      toast.success('Template deleted successfully');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Template copied to clipboard');
  };

  const templatesByType = {
    invoice: templates.filter(t => t.type === 'invoice'),
    receipt: templates.filter(t => t.type === 'receipt'),
    dunning: templates.filter(t => t.type === 'dunning'),
    general: templates.filter(t => t.type === 'general'),
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Message Templates</h2>
          <p className="text-sm sm:text-base text-gray-600">Create and manage reusable message templates</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Create Template</span>
        </button>
      </div>

      {/* Templates by Type */}
      <div className="space-y-6">
        {Object.entries(templatesByType).map(([type, typeTemplates]) => (
          <div key={type}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize flex items-center gap-2">
              <span
                className={cn(
                  'w-3 h-3 rounded-full',
                  type === 'invoice' && 'bg-blue-500',
                  type === 'receipt' && 'bg-green-500',
                  type === 'dunning' && 'bg-red-500',
                  type === 'general' && 'bg-gray-500'
                )}
              />
              {type} Templates ({typeTemplates.length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {typeTemplates.map((template) => (
                <div
                  key={template.id}
                  className="card hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          type === 'invoice' && 'bg-blue-50 text-blue-600',
                          type === 'receipt' && 'bg-green-50 text-green-600',
                          type === 'dunning' && 'bg-red-50 text-red-600',
                          type === 'general' && 'bg-gray-50 text-gray-600'
                        )}
                      >
                        <FileText size={18} />
                      </div>
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-gray-700 line-clamp-4">{template.content}</p>
                  </div>

                  {template.variables.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <span
                            key={variable}
                            className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded"
                          >
                            {'{' + variable + '}'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(template.content)}
                      className="flex-1 btn btn-secondary flex items-center justify-center gap-2 text-sm"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 btn btn-secondary flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {typeTemplates.length === 0 && (
              <div className="card text-center py-8 bg-gray-50">
                <p className="text-gray-500 text-sm">No {type} templates yet</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Template Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Payment Reminder Template"
                />
              </div>

              <div>
                <label className="label">Template Type *</label>
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
                <label className="label">Template Content *</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input min-h-[150px] resize-none"
                  placeholder="Dear {name}, this is a reminder that your payment of {amount} is due on {dueDate}..."
                />
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-1">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {['{name}', '{amount}', '{phone}', '{dueDate}'].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea');
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = formData.content;
                            const newText = text.substring(0, start) + variable + text.substring(end);
                            setFormData({ ...formData, content: newText });
                            setTimeout(() => {
                              textarea.focus();
                              textarea.setSelectionRange(start + variable.length, start + variable.length);
                            }, 0);
                          }
                        }}
                        className="text-xs px-2 py-1 bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
