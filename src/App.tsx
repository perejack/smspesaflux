import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Messages } from './components/Messages';
import { AutomatedReminders } from './components/AutomatedReminders';
import { Templates } from './components/Templates';
import { schedulerService } from './services/schedulerService';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const handleTabChange = (event: any) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('tabChange', handleTabChange);
    return () => window.removeEventListener('tabChange', handleTabChange);
  }, []);

  // Start the scheduler service for automated reminders
  useEffect(() => {
    schedulerService.start();
    
    return () => {
      schedulerService.stop();
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'messages':
        return <Messages />;
      case 'reminders':
        return <AutomatedReminders />;
      case 'templates':
        return <Templates />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

export default App;
