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
    const { phone, message, channel } = JSON.parse(event.body);

    // Hardcoded API key for testing
    const HARDCODED_API_KEY = 'G3ozx5xtEqGAGi3VdsQGKGHxuwqSJDTn38vEUEREQweQ';

    // Validate required fields
    if (!phone || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Make request to FluxSMS API
    const response = await axios.post(
      'https://api.pesaflux.co.ke/v1/sendsms',
      {
        api_key: HARDCODED_API_KEY,
        phone: phone,
        message: message,
        sender_id: 'fluxsms',
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
        success: response.data['response-code'] === 200,
        messageId: response.data.message_id,
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
