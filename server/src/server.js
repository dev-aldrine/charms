import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// MongoDB Atlas Connection & Models
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('🍃 [MongoDB Atlas] Connected successfully to charms database'))
    .catch((err) => console.error('❌ [MongoDB Atlas Error]:', err.message));
} else {
  console.log('⚠️ [MongoDB Atlas] No MONGODB_URI found. Running in memory fallback.');
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    barangay: { type: String, default: '' },
    city: { type: String, default: '' },
    province: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  location: {
    lat: { type: Number, default: 14.5995 }, // Default Metro Manila
    lng: { type: Number, default: 120.9842 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    barangay: String,
    city: String,
    province: String,
    postalCode: String
  },
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      wristSize: Number,
      gemstone: String,
      material: String,
      image: String
    }
  ],
  grandTotal: Number,
  paymentStatus: { type: String, default: 'pending' }, // 'pending', 'paid', 'failed'
  paymentMethod: { type: String, default: 'qrph' },
  paymongoIntentId: String,
  fulfillmentStatus: { type: String, default: 'unfulfilled' }, // 'unfulfilled', 'crafting', 'shipped', 'delivered'
  paidAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', OrderSchema);

// In-memory fallback / OTP cache
let otps = new Map(); // email -> { code, expiresAt }
let fallbackOrders = [];
let fallbackUsers = [];

// ==========================================
// 1. Passwordless OTP Authentication Routes
// ==========================================

// Brevo (Sendinblue) Transactional Email Sender
async function sendBrevoOtpEmail(toEmail, code) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log('[ℹ️ Brevo] No BREVO_API_KEY found in .env. Running in dev mock mode.');
    return false;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'joy@joysfairycharms.com';
  const senderName = process.env.BREVO_SENDER_NAME || "Joy's Fairy Charms";

  const emailPayload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail }],
    subject: `Your Atelier Verification Code: ${code}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 40px 20px; color: #2C3E2D; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #E8E5DF; padding: 40px 30px; text-align: center; }
          .brand { font-size: 22px; font-weight: 700; letter-spacing: 0.05em; color: #2C3E2D; margin-bottom: 6px; }
          .subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #8F9E8B; margin-bottom: 30px; }
          .code-box { background: #F3EFEA; border-radius: 14px; padding: 18px 24px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2C3E2D; margin: 24px 0; font-family: monospace; }
          .footer { font-size: 11px; color: #8F9E8B; margin-top: 30px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">Joy’s Fairy Charms</div>
          <div class="subtitle">Bespoke Handcrafted Minerals</div>
          <p style="font-size: 14px; line-height: 1.6; color: #4A5B4C;">
            Here is your one-time verification code to sign into your Atelier account:
          </p>
          <div class="code-box">${code}</div>
          <p style="font-size: 12px; color: #738274;">
            This code will expire in <strong>10 minutes</strong>. If you did not request this login, please ignore this email.
          </p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Joy’s Fairy Charms Atelier. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });

  if (!response.ok) {
    const errData = await response.json();
    console.error('[❌ Brevo Error]:', errData);
    return false;
  }

  console.log(`[✅ Brevo Email Sent] Code successfully delivered to ${toEmail}`);
  return true;
}

// Send 6-digit OTP to Email
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otps.set(cleanEmail, { code, expiresAt });

    console.log(`\n========================================`);
    console.log(`[🔐 AUTH OTP CODE] For: ${cleanEmail}`);
    console.log(`[👉 CODE]: ${code}`);
    console.log(`========================================\n`);

    // Send via Brevo if API key configured
    const brevoSent = await sendBrevoOtpEmail(cleanEmail, code);

    res.json({
      success: true,
      message: `A 6-digit verification code was sent to ${cleanEmail}`,
      deliveredViaBrevo: brevoSent
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify OTP & Login / Register
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code, name } = req.body;
    const cleanEmail = email?.trim()?.toLowerCase();
    const record = otps.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No verification code requested or code expired.' });
    }

    if (Date.now() > record.expiresAt) {
      otps.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit code. Please try again.' });
    }

    // Code is valid - clear OTP
    otps.delete(cleanEmail);

    // Save to MongoDB (or fallback)
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0]
        });
      } else if (name && !user.name) {
        user.name = name;
        await user.save();
      }
    } else {
      user = fallbackUsers.find(u => u.email === cleanEmail);
      if (!user) {
        user = {
          id: `usr_${Date.now()}`,
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          createdAt: new Date()
        };
        fallbackUsers.push(user);
      }
    }

    res.json({
      success: true,
      message: 'Authenticated successfully!',
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        address: user.address || {},
        location: user.location || { lat: 14.5995, lng: 120.9842 },
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Full Profile
app.get('/api/auth/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const cleanEmail = email.trim().toLowerCase();

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = fallbackUsers.find(u => u.email === cleanEmail);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        address: user.address || {},
        location: user.location || { lat: 14.5995, lng: 120.9842 },
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update User Profile (Address, Phone, Name, Avatar, Location)
app.put('/api/auth/profile', async (req, res) => {
  try {
    const { email, name, phone, avatarUrl, address, location } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const cleanEmail = email.trim().toLowerCase();

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = new User({ email: cleanEmail });
      }
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      if (address !== undefined) user.address = { ...user.address, ...address };
      if (location !== undefined) user.location = location;
      user.updatedAt = new Date();
      await user.save();
    } else {
      user = fallbackUsers.find(u => u.email === cleanEmail);
      if (!user) {
        user = { id: `usr_${Date.now()}`, email: cleanEmail, createdAt: new Date() };
        fallbackUsers.push(user);
      }
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      if (address !== undefined) user.address = { ...user.address, ...address };
      if (location !== undefined) user.location = location;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        address: user.address,
        location: user.location,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Profile & History
app.get('/api/auth/user-orders', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const cleanEmail = email.trim().toLowerCase();

    let userOrders = [];
    if (mongoose.connection.readyState === 1) {
      userOrders = await Order.find({ 'customer.email': cleanEmail }).sort({ createdAt: -1 });
    } else {
      userOrders = fallbackOrders.filter(o => o.customer?.email?.toLowerCase() === cleanEmail);
    }

    res.json({ success: true, orders: userOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. Products Route
// ==========================================
app.get('/api/products', (req, res) => {
  res.json({ success: true, count: 20 });
});

// ==========================================
// 3. PayMongo In-App QR Ph Order Creation
// ==========================================
app.post('/api/payments/qrph/create', async (req, res) => {
  try {
    const { orderDetails, amount, customer } = req.body;
    const orderNumber = `AB-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newOrderData = {
      orderNumber,
      customer,
      items: orderDetails?.items || [],
      grandTotal: amount,
      paymentStatus: 'pending',
      paymentMethod: 'qrph',
      paymongoIntentId: `pi_${Date.now()}`,
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      await Order.create(newOrderData);
    } else {
      fallbackOrders.push(newOrderData);
    }

    // Dynamic QR URL from PayMongo / QR Standard generator
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAYMONGO-QRPH-${orderNumber}-${amount}`;

    res.json({
      success: true,
      orderNumber,
      paymentIntentId: newOrderData.paymongoIntentId,
      qrImageUrl,
      amount,
      expiresInSeconds: 600
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PayMongo Webhook Endpoint
app.post('/api/webhooks/paymongo', async (req, res) => {
  const { eventType, orderNumber } = req.body;

  let order;
  if (mongoose.connection.readyState === 1) {
    order = await Order.findOne({ orderNumber });
    if (order) {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.fulfillmentStatus = 'crafting';
      await order.save();
    }
  } else {
    order = fallbackOrders.find(o => o.orderNumber === orderNumber);
    if (order) {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.fulfillmentStatus = 'crafting';
    }
  }

  res.json({ success: true, received: true, order });
});

// Order Status Poll
app.get('/api/orders/:orderNumber/status', async (req, res) => {
  let order;
  if (mongoose.connection.readyState === 1) {
    order = await Order.findOne({ orderNumber: req.params.orderNumber });
  } else {
    order = fallbackOrders.find(o => o.orderNumber === req.params.orderNumber);
  }

  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ success: true, order });
});

// Export default for Vercel Serverless Function support
export default app;

// Listen only when run directly (local node execution)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Joy's Atelier API] Server running on http://localhost:${PORT}`);
  });
}
