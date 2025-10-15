const axios = require('axios');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { phone, message, channel, apiKey } = JSON.parse(event.body);

    // Validate required fields
    if (!phone || !message || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Make request to FluxSMS API
    const response = await axios.post(
      'https://api.pesaflux.co.ke/fluxsms/send',
      {
        api_key: apiKey,
        phone: phone,
        message: message,
        type: channel === 'whatsapp' ? 'whatsapp' : 'sms',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        messageId: response.data.message_id || response.data.id,
        data: response.data,
      }),
    };
  } catch (error) {
    console.error('SMS API Error:', error.response?.data || error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send message',
      }),
    };
  }
};
