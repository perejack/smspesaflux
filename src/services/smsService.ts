import axios from 'axios';

const API_KEY = 'hknzdbzybgjxxnvmwkkmqvbafduirwgdboaqnvyw';

// Use Netlify functions to avoid CORS issues
const FUNCTIONS_BASE_URL = '/.netlify/functions';

export interface SendSMSParams {
  phone: string;
  message: string;
  channel?: 'sms' | 'whatsapp';
}

export interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private apiKey: string;

  constructor() {
    this.apiKey = API_KEY;
  }

  async sendSMS({ phone, message, channel = 'sms' }: SendSMSParams): Promise<SendSMSResponse> {
    try {
      // Format phone number to international format
      const formattedPhone = this.formatPhoneNumber(phone);

      // Use Netlify serverless function to proxy the request
      const response = await axios.post(
        `${FUNCTIONS_BASE_URL}/send-sms`,
        {
          apiKey: this.apiKey,
          phone: formattedPhone,
          message: message,
          channel: channel,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return {
          success: true,
          messageId: response.data.messageId,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to send message',
        };
      }
    } catch (error: any) {
      console.error('SMS Service Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to send message',
      };
    }
  }

  async sendBulkSMS(messages: SendSMSParams[]): Promise<SendSMSResponse[]> {
    const results = await Promise.all(
      messages.map(msg => this.sendSMS(msg))
    );
    return results;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Convert to international format (+254...)
    if (cleaned.startsWith('254')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+254${cleaned.slice(1)}`;
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return `+254${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  async checkBalance(): Promise<{ balance: number; error?: string }> {
    try {
      // Use Netlify serverless function to proxy the request
      const response = await axios.get(`${FUNCTIONS_BASE_URL}/check-balance`, {
        params: { apiKey: this.apiKey },
      });

      return {
        balance: response.data.balance || 0,
      };
    } catch (error: any) {
      return {
        balance: 0,
        error: error.message,
      };
    }
  }
}

export const smsService = new SMSService();
