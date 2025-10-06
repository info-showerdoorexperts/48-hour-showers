const { Client, Environment } = require('square');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { sourceId, amount, customerData } = JSON.parse(event.body);

    // Initialize Square client
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: Environment.Sandbox // Change to Environment.Production when going live
    });

    // Create the payment
    const { result } = await client.paymentsApi.createPayment({
      sourceId: sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: amount, // Amount in cents (175.00 = 17500)
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      // Optional: Store customer info with the payment
      note: `Shower door deposit - ${customerData.name}`,
      buyerEmailAddress: customerData.email
    });

    // Payment successful
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from your frontend
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        payment: result.payment
      })
    };

  } catch (error) {
    console.error('Payment error:', error);
    
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Payment failed'
      })
    };
  }
};
