const { Client, Environment } = require('square');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { sourceId, amount, customerData, orderDetails } = JSON.parse(event.body);

    // --- Build dynamic note and reliable amount ---
    const items = Array.isArray(orderDetails?.cart) ? orderDetails.cart : [];
    const itemNames = items.map(i => (i?.name || 'Shower Door').trim()).filter(Boolean);
    const namesForNote = itemNames.length ? itemNames.join(', ') : 'Shower Door';

    const DEPOSIT_PER_ITEM_CENTS = 17500;
    const computedAmount = BigInt((items.length || 1) * DEPOSIT_PER_ITEM_CENTS);
    const amountToCharge = (typeof amount === 'number' && amount > 0)
      ? BigInt(amount)
      : computedAmount;

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: Environment.Sandbox
    });

    const { result } = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: Date.now().toString() + Math.random().toString(36),
      amountMoney: {
        amount: amountToCharge,
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      note: `${namesForNote} deposit - ${customerData.name}`,
      buyerEmailAddress: customerData.email
    });

    // --- Sanitize BigInt for JSON ---
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
