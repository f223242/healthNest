const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get arguments
const uid = process.argv[2];
const isAdmin = process.argv[3] === "true";

if (!uid) {
  console.log("❌ Please provide UID");
  process.exit(1);
}

// Set custom claim
admin
  .auth()
  .setCustomUserClaims(uid, { admin: isAdmin })
  .then(() => {
    console.log(`✅ Success! Admin claim set to ${isAdmin}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
