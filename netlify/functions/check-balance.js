const axios = require('axios');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const apiKey = event.queryStringParameters?.apiKey;

    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'API key is required' }),
      };
    }

    // Make request to FluxSMS API
    const response = await axios.get('https://api.pesaflux.com/v1/sms/balance', { // Corrected API endpoint
      params: { api_key: apiKey },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        balance: response.data.balance || 0,
      }),
    };
  } catch (error) {
    console.error('Balance API Error:', error.response?.data || error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        balance: 0,
        error: error.message,
      }),
    };
  }
};
