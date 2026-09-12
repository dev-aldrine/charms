import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'charms' });
    const col = mongoose.connection.db.collection('users');
    
    // Update role to 'admin' and remove the accidental literal quoted key '"role"'
    await col.updateOne(
      { email: 'poweruzerz@gmail.com' },
      { 
        $set: { role: 'admin' },
        $unset: { '"role"': '' }
      }
    );

    const user = await col.findOne({ email: 'poweruzerz@gmail.com' });
    console.log('✅ Updated User in DB:');
    console.log({
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
