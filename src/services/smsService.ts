import axios from 'axios';

const API_KEY = 'G3ozx5xtEqGAGi3VdsQGKGHxuwqSJDTn38vEUEREQweQ';
const API_BASE_URL = 'https://api.pesaflux.co.ke/fluxsms';

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
  private baseUrl: string;

  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = API_BASE_URL;
  }

  async sendSMS({ phone, message, channel = 'sms' }: SendSMSParams): Promise<SendSMSResponse> {
    try {
      // Format phone number to international format
      const formattedPhone = this.formatPhoneNumber(phone);

      const response = await axios.post(
        `${this.baseUrl}/send`,
        {
          api_key: this.apiKey,
          phone: formattedPhone,
          message: message,
          type: channel === 'whatsapp' ? 'whatsapp' : 'sms',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success || response.status === 200) {
        return {
          success: true,
          messageId: response.data.message_id || response.data.id,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to send message',
        };
      }
    } catch (error: any) {
      console.error('SMS Service Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send message',
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
      const response = await axios.get(`${this.baseUrl}/balance`, {
        params: { api_key: this.apiKey },
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
