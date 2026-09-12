import crypto from 'crypto';

// Base32 alphabet used by standard TOTP (RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20) {
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_CHARS[bytes[i] % 32];
  }
  return secret;
}

export function base32ToBuffer(base32) {
  const clean = base32.toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

// Generate standard 6-digit TOTP code for a given timestamp
export function generateTotpCode(secretBase32, timeStepSeconds = 30, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 1000 / timeStepSeconds);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const key = base32ToBuffer(secretBase32);
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

// Verify TOTP code with standard ±1 time window clock drift tolerance
export function verifyTotpToken(secretBase32, token, window = 1) {
  if (!token || !secretBase32) return false;
  const cleanToken = token.trim();
  const now = Date.now();
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const checkTime = now + errorWindow * 30 * 1000;
    const generated = generateTotpCode(secretBase32, 30, checkTime);
    if (generated === cleanToken) {
      return true;
    }
  }
  return false;
}

// Helper to create standard otpauth:// URI for QR code generators
export function getOtpAuthUri(secretBase32, email, issuer = "Joy's Fairy Charms") {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
