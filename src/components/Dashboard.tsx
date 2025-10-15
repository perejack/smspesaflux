import React from 'react';
import { Users, DollarSign, MessageSquare, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { stats, clients, messages } = useStore();

  const recentMessages = messages.slice(-5).reverse();
  const overdueClients = clients.filter(c => c.status === 'overdue').slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Dashboard Overview</h2>
        <p className="text-sm sm:text-base text-gray-600">Monitor your business performance and client communications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Clients"
          value={stats.activeClients}
          icon={CheckCircle}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={DollarSign}
          color="purple"
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Messages Sent"
          value={stats.messagesSent}
          icon={MessageSquare}
          color="yellow"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Messages */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
            <MessageSquare className="text-gray-400" size={20} />
          </div>
          <div className="space-y-3">
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => {
                const client = clients.find(c => c.id === message.clientId);
                return (
                  <div key={message.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      message.status === 'sent' ? 'bg-green-100 text-green-600' :
                      message.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{client?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 truncate">{message.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          message.type === 'invoice' ? 'bg-blue-100 text-blue-700' :
                          message.type === 'receipt' ? 'bg-green-100 text-green-700' :
                          message.type === 'dunning' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {message.type}
                        </span>
                        <span className="text-xs text-gray-400">{message.channel}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">No messages yet</p>
            )}
          </div>
        </div>

        {/* Overdue Clients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overdue Clients</h3>
            <Clock className="text-red-400" size={20} />
          </div>
          <div className="space-y-3">
            {overdueClients.length > 0 ? (
              overdueClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{formatCurrency(client.balance)}</p>
                    <p className="text-xs text-gray-500">Overdue</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No overdue clients</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Success Rate</p>
              <p className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</p>
            </div>
            <TrendingUp size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Scheduled Messages</p>
              <p className="text-3xl font-bold">{stats.messagesScheduled}</p>
            </div>
            <Clock size={32} className="text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Overdue Clients</p>
              <p className="text-3xl font-bold">{stats.overdueClients}</p>
            </div>
            <Users size={32} className="text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
