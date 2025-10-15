# Taka Money - Garbage Collection Reminder System

A modern, interactive web application for managing garbage collection business with automated SMS/WhatsApp reminder functionality.

## Features

### 🎯 Core Functionality
- **Client Management**: Add, edit, and manage client information
- **Message Sending**: Send SMS or WhatsApp messages to individual or multiple clients
- **Automated Reminders**: Set up automatic reminders for various scenarios
- **Message Templates**: Create reusable message templates with variables
- **Dashboard Analytics**: Monitor business performance and client communications

### 📱 Message Types
1. **Invoice Reminders**: Remind clients to pay before due date
2. **Payment Receipts**: Acknowledge received payments
3. **Dunning Notices**: Follow up on overdue payments
4. **General Messages**: Send any custom information (e.g., garbage bag removal reminders)

### 🔔 Automated Reminder Features
- **Immediate Sending**: Send messages right away
- **Scheduled Sending**: Schedule messages for specific times
- **Recurring Messages**: Set up weekly reminders on specific days
- **Conditional Triggers**: Send based on client status and balance
- **Multi-channel Support**: Send via SMS, WhatsApp, or both

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Build Tool**: Vite
- **SMS API**: FluxSMS (PesaFlux)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Key**
   The API key is already configured in `src/services/smsService.ts`:
   ```typescript
   const API_KEY = 'G3ozx5xtEqGAGi3VdsQGKGHxuwqSJDTn38vEUEREQweQ';
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Usage Guide

### Managing Clients
1. Navigate to the **Clients** tab
2. Click **Add Client** to create a new client
3. Fill in client details (name, phone, email, address, balance)
4. Set client status (Active, Inactive, Overdue)
5. Edit or delete clients as needed

### Sending Messages
1. Go to the **Messages** tab
2. Select message type (Invoice, Receipt, Dunning, or General)
3. Choose channel (SMS or WhatsApp)
4. Optionally select a template
5. Compose your message using variables:
   - `{name}` - Client name
   - `{amount}` - Balance amount
   - `{phone}` - Client phone
   - `{dueDate}` - Due date
6. Select recipients from the client list
7. Click **Send** to deliver messages

### Creating Automated Reminders
1. Navigate to **Auto Reminders** tab
2. Click **Create Reminder**
3. Configure:
   - Reminder name and type
   - Message channel
   - Template content
   - Schedule type (Immediate, Scheduled, or Recurring)
   - Time and frequency settings
4. Enable/disable reminders with the power button
5. Edit or delete as needed

### Managing Templates
1. Go to **Templates** tab
2. Click **Create Template**
3. Set template name and type
4. Write template content with variables
5. Use the variable buttons to insert placeholders
6. Copy, edit, or delete templates

## API Integration

The application uses the FluxSMS API for sending messages:

- **Base URL**: `https://api.pesaflux.co.ke/fluxsms`
- **Endpoints**:
  - `POST /send` - Send SMS/WhatsApp message
  - `GET /balance` - Check account balance

### Phone Number Format
Phone numbers are automatically formatted to Kenyan international format (+254):
- `0712345678` → `+254712345678`
- `712345678` → `+254712345678`
- `254712345678` → `+254712345678`

## Project Structure

```
FLUX SMS/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # Main layout with sidebar
│   │   ├── StatCard.tsx            # Dashboard stat cards
│   │   ├── Dashboard.tsx           # Dashboard overview
│   │   ├── Clients.tsx             # Client management
│   │   ├── Messages.tsx            # Message sending
│   │   ├── AutomatedReminders.tsx  # Reminder automation
│   │   └── Templates.tsx           # Template management
│   ├── services/
│   │   └── smsService.ts           # SMS API integration
│   ├── store/
│   │   └── useStore.ts             # Zustand state management
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── utils/
│   │   ├── cn.ts                   # Class name utility
│   │   └── formatters.ts           # Formatting utilities
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Features in Detail

### Dashboard
- Total clients count
- Active clients tracking
- Total outstanding balance
- Messages sent statistics
- Recent message history
- Overdue clients list
- Success rate metrics

### Client Management
- Search functionality
- Client status badges
- Balance tracking
- Last payment dates
- Contact information
- Quick edit/delete actions

### Message System
- Bulk message sending
- Template selection
- Variable replacement
- Multi-channel support
- Message history
- Status tracking (Sent, Failed, Pending, Scheduled)

### Automated Reminders
- Multiple schedule types
- Time-based triggers
- Recurring day selection
- Enable/disable toggle
- Template integration
- Conditional sending

## Best Practices

1. **Phone Numbers**: Always include country code (+254 for Kenya)
2. **Message Length**: Keep SMS under 160 characters for single message
3. **Testing**: Test with a small group before bulk sending
4. **Templates**: Use clear, professional language
5. **Timing**: Schedule messages during business hours (9 AM - 6 PM)
6. **Frequency**: Avoid over-messaging clients

## Troubleshooting

### Messages Not Sending
- Verify API key is correct
- Check phone number format
- Ensure sufficient API balance
- Check internet connection

### Template Variables Not Working
- Ensure variables are wrapped in curly braces: `{name}`
- Check spelling matches available variables
- Verify client data contains the required fields

## Support

For API-related issues, contact FluxSMS support:
- Website: https://api.pesaflux.co.ke
- Documentation: https://api.pesaflux.co.ke/fluxsms/documentation

## License

This project is proprietary software for Taka Money garbage collection business.

## Version

**v1.0.0** - Initial Release

---

Built with ❤️ for efficient business communication management.
