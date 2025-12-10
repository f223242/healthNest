// Usage: node set-admin-claim.js <USER_UID> [true|false]
// Requires: npm i firebase-admin
// Place your service account JSON at ./serviceAccountKey.json

const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountPath = './serviceAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error('serviceAccountKey.json not found in project root. Download from Firebase Console and save it at this path.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const uid = process.argv[2];
const flag = process.argv[3] === 'false' ? false : true;

if (!uid) {
  console.error('Usage: node set-admin-claim.js <USER_UID> [true|false]');
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: flag })
  .then(() => {
    console.log(`Set admin=${flag} for uid=${uid}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error setting custom claim:', err);
    process.exit(1);
  });
