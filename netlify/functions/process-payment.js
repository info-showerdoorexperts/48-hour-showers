const { Client, Environment } = require('square');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { sourceId, amount, customerData } = JSON.parse(event.body);

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: Environment.Sandbox
    });

    const { result } = await client.paymentsApi.createPayment({
      sourceId: sourceId,
      idempotencyKey: Date.now().toString() + Math.random().toString(36),
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      note: `Shower door deposit - ${customerData.name}`,
      buyerEmailAddress: customerData.email
    });

    // Convert BigInt values to strings for JSON serialization
    const paymentData = {
      id: result.payment.id,
      status: result.payment.status,
      amount: result.payment.amountMoney.amount.toString(),
      createdAt: result.payment.createdAt
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        payment: paymentData
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
