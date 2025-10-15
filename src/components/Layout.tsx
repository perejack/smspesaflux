import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Bell, 
  FileText, 
  Menu, 
  X,
  Trash2
} from 'lucide-react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'clients', label: 'Clients', icon: <Users size={20} /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
  { id: 'reminders', label: 'Auto Reminders', icon: <Bell size={20} /> },
  { id: 'templates', label: 'Templates', icon: <FileText size={20} /> },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

  const handleNavClick = (itemId: string) => {
    setActiveTab(itemId);
    window.dispatchEvent(new CustomEvent('tabChange', { detail: itemId }));
    // Auto-close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 sm:p-2 rounded-lg">
                <Trash2 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Taka Money</h1>
                <p className="text-xs text-gray-500 hidden md:block">Reminder Management System</p>
              </div>
              <h1 className="text-base font-bold text-gray-900 sm:hidden">Taka Money</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 sm:top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-20 overflow-y-auto',
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
          'lg:translate-x-0' // Always visible on large screens
        )}
      >
        <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base',
                activeTab === item.id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'pt-14 sm:pt-20 transition-all duration-300 min-h-screen',
          'lg:ml-64' // Offset for sidebar on large screens
        )}
      >
        <div className="p-3 sm:p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};
