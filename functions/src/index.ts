import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

/**
 * Cloud Function to update user password after OTP verification
 * This uses Firebase Admin SDK which can update passwords without the old password
 */
export const resetPasswordWithOTP = functions.https.onCall(async (data, context) => {
  const { email, phoneNumber, newPassword, otpVerified } = data;

  // Validate input
  if (!email || !phoneNumber || !newPassword) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email, phone number, and new password are required"
    );
  }

  if (!otpVerified) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "OTP must be verified before resetting password"
    );
  }

  // Password validation
  if (newPassword.length < 8) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Password must be at least 8 characters"
    );
  }

  try {
    // Verify OTP was actually verified in Firestore
    const otpDoc = await admin.firestore()
      .collection("passwordResetOTPs")
      .doc(phoneNumber.replace(/\+/g, ""))
      .get();

    if (!otpDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "No OTP verification found for this phone number"
      );
    }

    const otpData = otpDoc.data();
    if (!otpData?.verified) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "OTP has not been verified"
      );
    }

    // Check if OTP verification is not expired (within 10 minutes)
    const verifiedAt = otpData.verifiedAt ? new Date(otpData.verifiedAt) : null;
    if (verifiedAt) {
      const now = new Date();
      const diffMinutes = (now.getTime() - verifiedAt.getTime()) / (1000 * 60);
      if (diffMinutes > 10) {
        throw new functions.https.HttpsError(
          "deadline-exceeded",
          "OTP verification has expired. Please start over."
        );
      }
    }

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Update the password using Admin SDK
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    // Mark OTP as used
    await admin.firestore()
      .collection("passwordResetOTPs")
      .doc(phoneNumber.replace(/\+/g, ""))
      .update({
        used: true,
        usedAt: new Date().toISOString(),
        verified: false, // Reset verified flag
      });

    console.log(`Password updated successfully for user: ${email}`);

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  } catch (error: any) {
    console.error("Error resetting password:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    if (error.code === "auth/user-not-found") {
      throw new functions.https.HttpsError(
        "not-found",
        "No user found with this email address"
      );
    }

    throw new functions.https.HttpsError(
      "internal",
      "Failed to reset password. Please try again."
    );
  }
});

/**
 * Cloud Function to send OTP via SMS (optional - for real SMS integration)
 * You can integrate with Twilio or other SMS providers here
 */
export const sendOTPSMS = functions.https.onCall(async (data, context) => {
  const { phoneNumber, otp } = data;

  if (!phoneNumber || !otp) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Phone number and OTP are required"
    );
  }

  // TODO: Integrate with Twilio or other SMS provider
  // For now, just log the OTP (for development)
  console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

  // Example Twilio integration (uncomment and configure when ready):
  /*
  const twilio = require('twilio');
  const client = twilio(
    functions.config().twilio.account_sid,
    functions.config().twilio.auth_token
  );
  
  await client.messages.create({
    body: `Your HealthNest verification code is: ${otp}`,
    from: functions.config().twilio.phone_number,
    to: phoneNumber,
  });
  */

  return {
    success: true,
    message: "OTP sent successfully",
  };
});

/**
 * Callable Cloud Function: find user by phone and generate password-reset OTP
 * Runs with admin privileges so clients don't need read access to the users collection
 */
export const sendPasswordResetOTP = functions.https.onCall(async (data, context) => {
  const { phoneNumber } = data;

  if (!phoneNumber) {
    throw new functions.https.HttpsError('invalid-argument', 'Phone number is required');
  }

  try {
    // Normalize phone key for storage (digits-only)
    const digitsOnly = String(phoneNumber).replace(/\D+/g, '');
    // Query users collection for matching phoneNumber field
    const usersSnapshot = await admin.firestore().collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .get();

    // Try digits-only fallback if no match
    if (usersSnapshot.empty) {
      const alt = await admin.firestore().collection('users')
        .where('phoneNumber', '==', digitsOnly)
        .get();
      if (!alt.empty) {
        usersSnapshot.docs.push(...alt.docs);
      }
    }

    if (usersSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'No account found with this phone number');
    }

    const userDoc = usersSnapshot.docs[0];

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in a secure server-side collection with TTL/metadata
    const otpDocRef = admin.firestore().collection('passwordResetOTPs').doc(digitsOnly);
    await otpDocRef.set({
      phoneNumber: phoneNumber,
      uid: userDoc.id,
      email: userDoc.data()?.email || null,
      otp,
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Optionally: integrate with SMS provider here (Twilio) — omitted for dev
    console.log('🔐 PASSWORD RESET OTP (server):', otp, 'for', phoneNumber);

    return { success: true, otp, uid: userDoc.id, email: userDoc.data()?.email || null };
  } catch (error: any) {
    console.error('sendPasswordResetOTP function error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'Failed to generate OTP');
  }
});
