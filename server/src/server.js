import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import ImageKit from 'imagekit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { generateBase32Secret, verifyTotpToken, getOtpAuthUri } from './utils/totp.js';
import { INITIAL_CATALOG } from './data/initialCatalog.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local uploads directory (persisted in server/public/uploads or server/uploads)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());

// Serve local uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

// ==========================================
// Mode Configuration (STORAGE_MODE & DB_MODE)
// ==========================================
// STORAGE_MODE: 'local' | 'cloud' (Default: 'local' if USE_LOCAL_STORAGE=true or STORAGE_MODE=local)
const STORAGE_MODE = (process.env.STORAGE_MODE || (process.env.USE_LOCAL_STORAGE === 'true' ? 'local' : 'cloud')).toLowerCase();

// DB_MODE: 'local' | 'cloud' (Default: 'local' if USE_LOCAL_DB=true or DB_MODE=local)
const DB_MODE = (process.env.DB_MODE || (process.env.USE_LOCAL_DB === 'true' ? 'local' : 'cloud')).toLowerCase();

// ==========================================
// ImageKit.io CDN Storage Configuration (Cloud Mode)
// ==========================================
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

let imagekit = null;
if (STORAGE_MODE === 'cloud' && IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  });
  console.log('⚡ [Storage: Cloud] ImageKit.io Global Image CDN initialized successfully (20GB Free Tier)');
} else if (STORAGE_MODE === 'local') {
  console.log('📁 [Storage: Local] Using Local Disk Storage (/uploads folder). Zero CDN quota consumed.');
}

// Optional Cloudflare R2 / S3 Fallback
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'joysfairycharms-media';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

let s3Client = null;
if (STORAGE_MODE === 'cloud' && R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

// Multer in-memory storage for handling file streams
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==========================================
// MongoDB Connection & Models (Local vs Cloud Atlas)
// ==========================================
const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/charms';
const CLOUD_MONGODB_URI = process.env.MONGODB_URI;

const ACTIVE_MONGODB_URI = DB_MODE === 'local' ? LOCAL_MONGODB_URI : CLOUD_MONGODB_URI;

if (ACTIVE_MONGODB_URI) {
  const isLocalDb = DB_MODE === 'local';
  mongoose.connect(ACTIVE_MONGODB_URI, { dbName: 'charms' })
    .then(() => {
      if (isLocalDb) {
        console.log(`🏠 [Database: Local] Connected successfully to Local MongoDB (mongodb://127.0.0.1:27017/charms)`);
      } else {
        console.log(`🍃 [Database: Cloud] Connected successfully to MongoDB Atlas: "${mongoose.connection.name}"`);
      }
    })
    .catch((err) => {
      console.error(`❌ [Database: ${isLocalDb ? 'Local' : 'Cloud'} MongoDB Error]:`, err.message);
      if (isLocalDb) {
        console.log('ℹ️ Tip: Ensure local MongoDB daemon (`mongod`) is running, or switch DB_MODE=cloud in .env');
      }
    });
} else {
  console.log('⚠️ [Database] No MONGODB_URI found. Running in memory fallback.');
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, default: '' },
  salt: { type: String, default: '' },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  isEmailVerified: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: '' },
  isTwoFactorEnabled: { type: Boolean, default: false },
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

// Product Schema
const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  collection: { type: String, default: 'Beaded' }, // 'Beaded', 'Cuff', 'Chain', 'Couple'
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  basePrice: { type: Number, required: true },
  gemstone: { type: String, default: '' },
  material: { type: String, default: '' },
  beadSize: { type: String, default: '8mm' },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  image: { type: String, default: '' },
  fallbackImage: { type: String, default: '/images/bracelet-jade.svg' },
  availableSizes: { type: [Number], default: [15, 16, 17, 18, 19, 20] },
  customizable: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
  stock: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

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
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// In-memory fallback / OTP cache
let otps = new Map(); // email -> { code, expiresAt }
let fallbackOrders = [];
let fallbackUsers = [];
let fallbackProducts = [...INITIAL_CATALOG];

// Auto-seed Products in MongoDB if empty
async function seedProductsIfEmpty() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 [MongoDB Seeder] Seeding initial handcrafted product catalog...');
      await Product.insertMany(INITIAL_CATALOG);
      console.log(`✅ [MongoDB Seeder] Successfully seeded ${INITIAL_CATALOG.length} products.`);
    }
  } catch (err) {
    console.error('⚠️ [MongoDB Seeder Error]:', err.message);
  }
}

mongoose.connection.on('connected', () => {
  seedProductsIfEmpty();
});

// ==========================================
// 1. Password, Email Verification & TOTP 2FA Routes
// ==========================================

// Helper: Hash password with salt
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

// Brevo (Sendinblue) Verification Email Sender
async function sendBrevoVerificationEmail(toEmail, code, type = 'verify') {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log(`[ℹ️ Brevo Dev Mode] ${type} code for ${toEmail}: ${code}`);
    return false;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'joy@joysfairycharms.com';
  const senderName = process.env.BREVO_SENDER_NAME || "Joy's Fairy Charms";

  const isReset = type === 'reset';
  const subject = isReset 
    ? `Password Reset Code: ${code}` 
    : `Verify Your Atelier Account: ${code}`;

  const emailPayload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail }],
    subject,
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
            ${isReset ? 'Use the verification code below to reset your password:' : 'Thank you for joining our Atelier. Please verify your email address:'}
          </p>
          <div class="code-box">${code}</div>
          <p style="font-size: 12px; color: #738274;">
            This code expires in <strong>15 minutes</strong>. If you did not request this, please disregard this email.
          </p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Joy’s Fairy Charms Atelier. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });
    return response.ok;
  } catch (e) {
    console.error('[❌ Brevo Error]:', e.message);
    return false;
  }
}

// 1. Register Account with Password (Sends 1-time email verification)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser && existingUser.passwordHash) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const { hash, salt } = hashPassword(password);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    otps.set(`verify_${cleanEmail}`, { code, expiresAt });

    if (existingUser) {
      existingUser.passwordHash = hash;
      existingUser.salt = salt;
      if (name) existingUser.name = name;
      await existingUser.save();
    } else {
      await User.create({
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        passwordHash: hash,
        salt,
        role: 'client',
        isEmailVerified: false
      });
      console.log(`👤 [New User Registered]: ${cleanEmail} (Role: client)`);
    }

    console.log(`\n[🔐 EMAIL VERIFICATION CODE] For: ${cleanEmail} -> ${code}\n`);
    await sendBrevoVerificationEmail(cleanEmail, code, 'verify');

    res.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: 'Account created! Please enter the 6-digit verification code sent to your email.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Verify Email Code
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    const cleanEmail = email?.trim()?.toLowerCase();
    const record = otps.get(`verify_${cleanEmail}`);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No verification code found or code expired.' });
    }

    if (Date.now() > record.expiresAt) {
      otps.delete(`verify_${cleanEmail}`);
      return res.status(400).json({ success: false, message: 'Verification code expired. Please request a new code.' });
    }

    if (record.code !== code?.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect 6-digit code. Please try again.' });
    }

    otps.delete(`verify_${cleanEmail}`);

    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { isEmailVerified: true, updatedAt: new Date() },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        email: user.email,
        role: user.role || 'client',
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        address: user.address,
        location: user.location,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Login with Email + Password (checks for 2FA requirement)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    // Migration helper: If user exists from old OTP flow without passwordHash yet, prompt them or register
    if (!user.passwordHash || !user.salt) {
      return res.status(400).json({ 
        success: false, 
        message: 'This account was created without a password. Please use the Register tab to create your password and verify.' 
      });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    // If email is not yet verified, request verification
    if (!user.isEmailVerified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      otps.set(`verify_${cleanEmail}`, { code, expiresAt: Date.now() + 15 * 60 * 1000 });
      console.log(`[🔐 EMAIL VERIFICATION CODE] For: ${cleanEmail} -> ${code}`);
      await sendBrevoVerificationEmail(cleanEmail, code, 'verify');

      return res.json({
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        message: 'Please verify your email address with the 6-digit code sent to your inbox.'
      });
    }

    // If 2FA is enabled on this account, request 2FA authenticator token
    if (user.isTwoFactorEnabled) {
      return res.json({
        success: true,
        requires2FA: true,
        email: cleanEmail,
        message: 'Please enter the 6-digit code from your Authenticator app.'
      });
    }

    // Direct Login (Zero Brevo emails needed!)
    res.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user._id,
        email: user.email,
        role: user.role || 'client',
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        address: user.address,
        location: user.location,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Verify 2FA TOTP Code on Login
app.post('/api/auth/verify-2fa', async (req, res) => {
  try {
    const { email, token } = req.body;
    const cleanEmail = email?.trim()?.toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'Two-factor authentication is not active for this account.' });
    }

    const isValid = verifyTotpToken(user.twoFactorSecret, token);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit Authenticator code. Please check your authenticator app.' });
    }

    res.json({
      success: true,
      message: 'Two-Factor Authentication verified!',
      user: {
        id: user._id,
        email: user.email,
        role: user.role || 'client',
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        address: user.address,
        location: user.location,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Setup 2FA (Generate QR / Secret key for Google Authenticator)
app.post('/api/auth/2fa/setup', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim()?.toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const secret = generateBase32Secret(20);
    const otpauthUri = getOtpAuthUri(secret, cleanEmail);
    // Google Charts QR Code API for scanning in Google Authenticator / Authy
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpauthUri)}`;

    // Store temporarily in memory or user pending state
    otps.set(`2fa_setup_${cleanEmail}`, { secret, expiresAt: Date.now() + 15 * 60 * 1000 });

    res.json({
      success: true,
      secret,
      qrCodeUrl,
      otpauthUri
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Confirm & Enable 2FA
app.post('/api/auth/2fa/enable', async (req, res) => {
  try {
    const { email, token } = req.body;
    const cleanEmail = email?.trim()?.toLowerCase();
    const pendingSetup = otps.get(`2fa_setup_${cleanEmail}`);

    if (!pendingSetup) {
      return res.status(400).json({ success: false, message: '2FA setup session expired. Please start over.' });
    }

    const isValid = verifyTotpToken(pendingSetup.secret, token);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit code. Please enter the code currently showing in your authenticator app.' });
    }

    otps.delete(`2fa_setup_${cleanEmail}`);

    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { twoFactorSecret: pendingSetup.secret, isTwoFactorEnabled: true, updatedAt: new Date() },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Two-Factor Authentication is now enabled on your account!',
      user: {
        id: user._id,
        email: user.email,
        role: user.role || 'client',
        name: user.name,
        isTwoFactorEnabled: true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Disable 2FA
app.post('/api/auth/2fa/disable', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.trim()?.toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (!verifyPassword(password, user.passwordHash, user.salt)) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    user.twoFactorSecret = '';
    user.isTwoFactorEnabled = false;
    await user.save();

    res.json({
      success: true,
      message: 'Two-Factor Authentication has been disabled.',
      isTwoFactorEnabled: false
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Resend Verification Code
app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim()?.toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(`verify_${cleanEmail}`, { code, expiresAt: Date.now() + 15 * 60 * 1000 });

    console.log(`[🔐 RESENT EMAIL CODE] For: ${cleanEmail} -> ${code}`);
    await sendBrevoVerificationEmail(cleanEmail, code, 'verify');

    res.json({ success: true, message: `A new 6-digit code was sent to ${cleanEmail}` });
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
        role: user.role || 'client',
        name: user.name || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        address: user.address || {},
        location: user.location || { lat: 14.5995, lng: 120.9842 },
        isTwoFactorEnabled: user.isTwoFactorEnabled || false,
        isEmailVerified: user.isEmailVerified || false,
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
    const { email, name, phone, avatarUrl, address, location, role } = req.body;
    console.log('📥 [Incoming Profile Update]:', { email, name, phone, address, location, role });

    if (!email) return res.status(400).json({ message: 'Email required' });
    const cleanEmail = email.trim().toLowerCase();

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
    if (role !== undefined && ['client', 'admin'].includes(role)) updateFields.role = role;
    if (address !== undefined) {
      updateFields.address = {
        street: address.street || '',
        barangay: address.barangay || '',
        city: address.city || '',
        province: address.province || 'Metro Manila',
        postalCode: address.postalCode || '',
        notes: address.notes || ''
      };
    }
    if (location !== undefined) {
      updateFields.location = {
        lat: location.lat || 14.5995,
        lng: location.lng || 120.9842
      };
    }
    updateFields.updatedAt = new Date();

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOneAndUpdate(
        { email: cleanEmail },
        { $set: updateFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      console.log(`🍃 [MongoDB Atlas Updated]:`, JSON.stringify(user));
    } else {
      user = fallbackUsers.find(u => u.email === cleanEmail);
      if (!user) {
        user = { id: `usr_${Date.now()}`, email: cleanEmail, role: 'client', createdAt: new Date() };
        fallbackUsers.push(user);
      }
      Object.assign(user, updateFields);
      console.log(`ℹ️ [Fallback Mode Updated]:`, JSON.stringify(user));
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id || user.id,
        email: user.email,
        role: user.role || 'client',
        name: user.name || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        address: user.address || {},
        location: user.location || { lat: 14.5995, lng: 120.9842 },
        isTwoFactorEnabled: user.isTwoFactorEnabled || false,
        isEmailVerified: user.isEmailVerified || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('❌ [Profile Update Error]:', err);
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
// Client Remote Debugging & Geolocation Proxy
// ==========================================
app.post('/api/debug/log', (req, res) => {
  const { event, message, data } = req.body;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\x1b[36m[📱 Phone Client Debug ${timestamp}]\x1b[0m \x1b[33m${event}:\x1b[0m ${message}`, data ? JSON.stringify(data) : '');
  res.json({ success: true });
});

app.get('/api/location/lookup', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const cleanIp = clientIp.split(',')[0].trim().replace(/^.*:/, '');
    const url = cleanIp && cleanIp !== '127.0.0.1' && cleanIp !== 'localhost' && !cleanIp.startsWith('192.168.')
      ? `https://ipapi.co/${cleanIp}/json/`
      : 'https://ipapi.co/json/';

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JoysFairyCharms/1.0' }
    });
    const data = await response.json();
    if (data && (data.latitude || data.lat)) {
      res.json({ 
        success: true, 
        data: {
          latitude: data.latitude || data.lat || 14.5995,
          longitude: data.longitude || data.lon || 120.9842,
          city: data.city || 'Metro Manila',
          region: data.region || 'National Capital Region'
        } 
      });
    } else {
      // Default Philippine / Metro Manila fallback coordinates
      res.json({
        success: true,
        data: {
          latitude: 14.5995,
          longitude: 120.9842,
          city: 'Metro Manila',
          region: 'National Capital Region'
        }
      });
    }
  } catch (err) {
    // Graceful fallback to Metro Manila coordinates
    res.json({
      success: true,
      data: {
        latitude: 14.5995,
        longitude: 120.9842,
        city: 'Metro Manila',
        region: 'National Capital Region'
      }
    });
  }
});

// ==========================================
// 2. Products API (Public Read & Admin CRUD)
// ==========================================

// 2.1 Get all active products (Public) or all products (Admin)
app.get('/api/products', async (req, res) => {
  try {
    const { includeInactive, collection, sort } = req.query;
    const filter = {};
    if (includeInactive !== 'true') {
      filter.isActive = { $ne: false };
    }
    if (collection && collection !== 'All') {
      filter.collection = collection;
    }

    let sortOption = { isFeatured: -1, createdAt: -1 };
    if (sort === 'price-asc') sortOption = { basePrice: 1 };
    else if (sort === 'price-desc') sortOption = { basePrice: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'name-asc') sortOption = { name: 1 };

    let products = [];
    if (mongoose.connection.readyState === 1) {
      products = await Product.find(filter).sort(sortOption);
    } else {
      products = fallbackProducts.filter(p => {
        if (includeInactive !== 'true' && p.isActive === false) return false;
        if (collection && collection !== 'All' && p.collection !== collection) return false;
        return true;
      });
    }

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('❌ [Get Products Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.2 Get single product by ID or Slug
app.get('/api/products/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let product;

    if (mongoose.connection.readyState === 1) {
      product = await Product.findOne({
        $or: [{ id: identifier }, { slug: identifier }]
      });
    } else {
      product = fallbackProducts.find(p => p.id === identifier || p.slug === identifier);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.3 Create New Product (Admin only)
app.post('/api/admin/products', async (req, res) => {
  try {
    const productData = req.body;
    if (!productData.name || !productData.basePrice) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    // Generate unique ID and Slug if not provided
    const id = productData.id || `prod_${Date.now()}`;
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProduct = {
      ...productData,
      id,
      slug,
      basePrice: Number(productData.basePrice),
      stock: productData.stock !== undefined ? Number(productData.stock) : 50,
      rating: productData.rating !== undefined ? Number(productData.rating) : 5.0,
      reviewsCount: productData.reviewsCount !== undefined ? Number(productData.reviewsCount) : 0,
      availableSizes: productData.availableSizes || [15, 16, 17, 18, 19, 20],
      tags: productData.tags || [],
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      await Product.create(newProduct);
    } else {
      fallbackProducts.unshift(newProduct);
    }

    console.log(`✨ [Admin Created Product]: ${newProduct.name} (${newProduct.id})`);
    res.json({ success: true, message: 'Product created successfully!', product: newProduct });
  } catch (err) {
    console.error('❌ [Create Product Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.4 Update Product (Admin only)
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    let updatedProduct;
    if (mongoose.connection.readyState === 1) {
      updatedProduct = await Product.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true }
      );
    } else {
      const idx = fallbackProducts.findIndex(p => p.id === id);
      if (idx !== -1) {
        fallbackProducts[idx] = { ...fallbackProducts[idx], ...updateData };
        updatedProduct = fallbackProducts[idx];
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    console.log(`✨ [Admin Updated Product]: ${updatedProduct.name} (${updatedProduct.id})`);
    res.json({ success: true, message: 'Product updated successfully!', product: updatedProduct });
  } catch (err) {
    console.error('❌ [Update Product Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.5 Delete Product (Admin only)
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Product.findOneAndDelete({ id });
    } else {
      fallbackProducts = fallbackProducts.filter(p => p.id !== id);
    }

    console.log(`🗑️ [Admin Deleted Product]: ${id}`);
    res.json({ success: true, message: 'Product deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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

// ==========================================
// Media Upload Endpoint (ImageKit.io / Cloudflare R2 / Fallback)
// ==========================================
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const { folder = 'products' } = req.body;
    const fileExt = path.extname(req.file.originalname) || '.webp';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;

    // 1. Local Disk Storage Mode
    if (STORAGE_MODE === 'local' || (!imagekit && !s3Client)) {
      const targetFolder = path.join(UPLOADS_DIR, folder);
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      const localFilePath = path.join(targetFolder, fileName);
      fs.writeFileSync(localFilePath, req.file.buffer);

      // Local public URL (e.g., /uploads/products/1234-abcd.png)
      const localUrl = `/uploads/${folder}/${fileName}`;

      console.log(`📁 [Local Upload Saved]: ${localFilePath} -> ${localUrl}`);
      return res.json({
        success: true,
        url: localUrl,
        fileName,
        provider: 'local-disk',
        message: 'Saved to local server storage.'
      });
    }

    // 2. Cloud Mode: ImageKit.io Upload (Auto-WebP, Global CDN, 20GB Free)
    if (imagekit) {
      const response = await imagekit.upload({
        file: req.file.buffer.toString('base64'), // Base64 buffer
        fileName: fileName,
        folder: `/${folder}`,
        useUniqueFileName: true,
      });

      return res.json({
        success: true,
        url: response.url,
        thumbnailUrl: response.thumbnailUrl,
        fileId: response.fileId,
        provider: 'imagekit'
      });
    }

    // 3. Cloud Mode: Cloudflare R2 / S3 Upload
    if (s3Client) {
      const fullPath = `${folder}/${fileName}`;
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fullPath,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(command);

      const publicUrl = R2_PUBLIC_URL 
        ? `${R2_PUBLIC_URL.replace(/\/$/, '')}/${fullPath}`
        : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fullPath}`;

      return res.json({
        success: true,
        url: publicUrl,
        key: fullPath,
        provider: 'r2'
      });
    }

    // 4. Fallback: Base64 data URI
    const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    return res.json({
      success: true,
      url: base64Data,
      provider: 'memory-fallback'
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
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
