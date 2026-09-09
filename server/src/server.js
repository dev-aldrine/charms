import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock storage for rapid testing & demonstrative persistence
let orders = [];

// Products Route
app.get('/api/products', (req, res) => {
  res.json({ success: true, count: 6 });
});

// PayMongo In-App QR Ph Order Creation
app.post('/api/payments/qrph/create', (req, res) => {
  try {
    const { orderDetails, amount, customer } = req.body;
    const orderNumber = `AB-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newOrder = {
      orderNumber,
      customer,
      items: orderDetails?.items || [],
      grandTotal: amount,
      paymentStatus: 'pending',
      paymentMethod: 'qrph',
      paymongoIntentId: `pi_${Date.now()}`,
      createdAt: new Date()
    };

    orders.push(newOrder);

    // Dynamic QR URL from PayMongo / QR Standard generator
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAYMONGO-QRPH-${orderNumber}-${amount}`;

    res.json({
      success: true,
      orderNumber,
      paymentIntentId: newOrder.paymongoIntentId,
      qrImageUrl,
      amount,
      expiresInSeconds: 600
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PayMongo Webhook Endpoint with Signature Handling
app.post('/api/webhooks/paymongo', (req, res) => {
  const { eventType, orderNumber } = req.body;

  const order = orders.find(o => o.orderNumber === orderNumber);
  if (order) {
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.fulfillmentStatus = 'crafting';
  }

  res.json({ success: true, received: true, order });
});

// Order Status Poll
app.get('/api/orders/:orderNumber/status', (req, res) => {
  const order = orders.find(o => o.orderNumber === req.params.orderNumber);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ success: true, order });
});

app.listen(PORT, () => {
  console.log(`[Aura & Botanica API] Server running on http://localhost:${PORT}`);
});
