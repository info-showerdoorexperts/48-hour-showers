const { Client, Environment } = require('square');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse body
    const { sourceId, amount, customerData, orderDetails } = JSON.parse(event.body);

    // ✅ Get door/product name dynamically (fallback to "Shower Door")
    const productName =
      orderDetails?.cart?.[0]?.name?.trim() || "Shower Door";

    const note = `${productName} deposit - ${customerData.name}`;

    // Initialize Square client
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: Environment.Sandbox
    });

    // Create payment
    const { result } = await client.paymentsApi.createPayment({
      sourceId: sourceId,
      idempotencyKey: Date.now().toString() + Math.random().toString(36),
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      // Use dynamic product-specific note
      note,
      buyerEmailAddress: customerData.email
    });

    // Convert BigInt values to strings for JSON serialization
    const paymentData = {
      id: result.payment.id,
      status: result.payment.status,
      amount: result.payment.amountMoney.amount.toString(),
      createdAt: result.payment.createdAt
    };

    // Return success
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
