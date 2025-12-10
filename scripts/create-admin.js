/**
 * Script to create an admin user in Firebase
 * 
 * Run this script using Node.js:
 * node scripts/create-admin.js
 * 
 * Prerequisites:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Download your Firebase service account key from:
 *    Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
 * 3. Save the JSON file as 'serviceAccountKey.json' in the scripts folder
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Option 1: Using service account key file
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Option 2: Using environment variables (for deployment)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
const auth = admin.auth();

// Admin credentials - CHANGE THESE!
const ADMIN_EMAIL = 'admin@healthnest.com';
const ADMIN_PASSWORD = 'Admin@123456';  // Change this to a strong password
const ADMIN_PHONE = '+923001234567';    // Change to your phone number

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Step 1: Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        phoneNumber: ADMIN_PHONE,
        emailVerified: true,
        displayName: 'Admin User',
      });
      console.log('✅ Admin user created in Firebase Auth:', userRecord.uid);
    } catch (authError) {
      if (authError.code === 'auth/email-already-exists') {
        console.log('Admin email already exists, fetching existing user...');
        userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
        console.log('✅ Found existing admin user:', userRecord.uid);
      } else {
        throw authError;
      }
    }

    // Step 2: Create/Update user document in Firestore
    const adminData = {
      email: ADMIN_EMAIL,
      role: 'admin',
      firstname: 'Admin',
      lastname: 'User',
      phoneNumber: ADMIN_PHONE,
      dateOfBirth: '1990-01-01',
      profileCompleted: true,
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      additionalInfo: {
        profileImage: null,
        address: 'Head Office',
        city: 'Karachi',
      },
    };

    await db.collection('users').doc(userRecord.uid).set(adminData, { merge: true });
    console.log('✅ Admin document created in Firestore');

    console.log('\n========================================');
    console.log('🎉 Admin user created successfully!');
    console.log('========================================');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('UID:', userRecord.uid);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    process.exit();
  }
}

createAdmin();
