import { useStore } from '../store/useStore';
import { smsService } from './smsService';
import { formatDate } from '../utils/formatters';

class SchedulerService {
  private intervalId: number | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Scheduler service started');

    // Check every minute for scheduled messages
    this.intervalId = setInterval(() => {
      this.checkAndSendScheduledMessages();
      this.checkAndSendAutomatedReminders();
    }, 60000); // Check every 60 seconds

    // Run immediately on start
    this.checkAndSendScheduledMessages();
    this.checkAndSendAutomatedReminders();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Scheduler service stopped');
  }

  private async checkAndSendScheduledMessages() {
    const { messages, clients, updateMessage } = useStore.getState();
    const now = new Date();

    // Find scheduled messages that are due
    const dueMessages = messages.filter(
      (msg) =>
        msg.status === 'scheduled' &&
        msg.scheduledFor &&
        new Date(msg.scheduledFor) <= now
    );

    for (const message of dueMessages) {
      const client = clients.find((c) => c.id === message.clientId);
      if (!client) continue;

      try {
        // Update status to pending
        updateMessage(message.id, { status: 'pending' });

        // Send the message
        const result = await smsService.sendSMS({
          phone: client.phone,
          message: message.content,
          channel: message.channel,
        });

        // Update status based on result
        updateMessage(message.id, {
          status: result.success ? 'sent' : 'failed',
          sentAt: result.success ? new Date() : undefined,
        });

        console.log(
          `Scheduled message ${message.id} ${result.success ? 'sent' : 'failed'} to ${client.name}`
        );
      } catch (error) {
        console.error('Error sending scheduled message:', error);
        updateMessage(message.id, { status: 'failed' });
      }
    }
  }

  private async checkAndSendAutomatedReminders() {
    const { automatedReminders, clients, addMessage } = useStore.getState();
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Find enabled reminders that should run now
    const activeReminders = automatedReminders.filter((reminder) => {
      if (!reminder.enabled) return false;

      const schedule = reminder.schedule;

      // Check if it's time to send
      if (schedule.type === 'scheduled' && schedule.time) {
        return schedule.time === currentTime;
      }

      if (schedule.type === 'recurring' && schedule.time && schedule.recurringDays) {
        return (
          schedule.time === currentTime &&
          schedule.recurringDays.includes(currentDay)
        );
      }

      return false;
    });

    for (const reminder of activeReminders) {
      // Filter clients based on reminder conditions
      let targetClients = clients;

      if (reminder.conditions) {
        targetClients = clients.filter((client) => {
          if (reminder.conditions!.minBalance && client.balance < reminder.conditions!.minBalance) {
            return false;
          }
          if (reminder.conditions!.maxBalance && client.balance > reminder.conditions!.maxBalance) {
            return false;
          }
          if (
            reminder.conditions!.clientStatus &&
            !reminder.conditions!.clientStatus.includes(client.status)
          ) {
            return false;
          }
          return true;
        });
      }

      // Filter by reminder type
      if (reminder.type === 'dunning') {
        targetClients = targetClients.filter((c) => c.status === 'overdue');
      } else if (reminder.type === 'invoice') {
        targetClients = targetClients.filter((c) => c.balance > 0);
      }

      // Send messages to target clients
      for (const client of targetClients) {
        try {
          // Replace variables in template
          const personalizedMessage = this.replaceVariables(reminder.template, client);

          // Determine channel
          const channels: ('sms' | 'whatsapp')[] =
            reminder.channel === 'both' ? ['sms'] : [reminder.channel];

          for (const channel of channels) {
            // Add message to store
            addMessage({
              clientId: client.id,
              type: reminder.type,
              channel: channel,
              content: personalizedMessage,
              status: 'pending',
            });

            // Send the message
            const result = await smsService.sendSMS({
              phone: client.phone,
              message: personalizedMessage,
              channel: channel,
            });

            console.log(
              `Automated reminder sent to ${client.name} via ${channel}: ${result.success ? 'success' : 'failed'}`
            );

            // Small delay between messages
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Error sending automated reminder to ${client.name}:`, error);
        }
      }
    }
  }

  private replaceVariables(template: string, client: any): string {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days from now

    return template
      .replace(/{name}/g, client.name)
      .replace(/{amount}/g, client.balance.toString())
      .replace(/{phone}/g, client.phone)
      .replace(/{dueDate}/g, formatDate(dueDate));
  }
}

export const schedulerService = new SchedulerService();
