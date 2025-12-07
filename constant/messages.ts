export const firebaseMessages = {
  registerSuccess: {
    type: 'success',
    text1: 'Registration',
    text2: 'Account successfully created!',
  },
  loginSuccess: {
    type: 'success',
    text1: 'Login',
    text2: 'Login successful!',
  },
  logoutSuccess: {
    type: 'success',
    text1: 'Logout',
    text2: 'Logout successful!',
  },
  required: {
    type: 'error',
    text1: 'Required',
    text2: 'All fields must be filled!',
  },
  passwordMatch: {
    type: 'error',
    text1: 'Password match',
    text2: 'Password must be a match',
  },
  EmailVerification: {
    type: 'Verification',
    text1: 'Verification link',
    text2: 'Send email verification link at your email',
  },
  NotEmailVerfication: {
    type: 'Verification',
    text1: 'Email not Verify',
    text2: 'Check again',
  },
  errors: {
    'auth/email-already-in-use': {
      type: 'error',
      text1: 'Registration Failed',
      text2: 'This email is already registered.',
    },
    'auth/invalid-email': {
      type: 'error',
      text1: 'Invalid Email',
      text2: 'The email address format is invalid.',
    },
    'auth/weak-password': {
      type: 'error',
      text1: 'Weak Password',
      text2: 'Password is too weak (at least 6 characters required).',
    },
    'auth/missing-password': {
      type: 'error',
      text1: 'Missing Password',
      text2: 'Please enter a password.',
    },
    'auth/wrong-password': {
      type: 'error',
      text1: 'Wrong Password',
      text2: 'The password you entered is incorrect.',
    },
    'auth/user-not-found': {
      type: 'error',
      text1: 'User Not Found',
      text2: 'No account exists with this email.',
    },
    'auth/invalid-credential': {
      type: 'error',
      text1: 'Invalid Credentials',
      text2: 'Email or password is incorrect.',
    },
    'auth/invalid-login-credentials': {
      type: 'error',
      text1: 'Invalid Credentials',
      text2: 'Email or password is incorrect.',
    },
    'auth/operation-not-allowed': {
      type: 'error',
      text1: 'Not Allowed',
      text2: 'This registration method is not enabled.',
    },
    'auth/invalid-phone-number': {
      type: 'error',
      text1: 'Invalid Phone',
      text2: 'The phone number format is invalid.',
    },
    'auth/missing-phone-number': {
      type: 'error',
      text1: 'Missing Phone',
      text2: 'Please enter a phone number.',
    },
    'auth/too-many-requests': {
      type: 'error',
      text1: 'Too Many Requests',
      text2: 'Too many attempts. Please try again later.',
    },
    'auth/network-request-failed': {
      type: 'error',
      text1: 'Network Error',
      text2: 'Please check your internet connection.',
    },
    'auth/user-disabled': {
      type: 'error',
      text1: 'User Disabled',
      text2: 'This account has been disabled.',
    },
    'auth/invalid-verification-code': {
      type: 'error',
      text1: 'Invalid Code',
      text2: 'The verification code is incorrect.',
    },
    'auth/invalid-verification-id': {
      type: 'error',
      text1: 'Invalid ID',
      text2: 'The verification ID is incorrect.',
    },
    'auth/internal-error': {
      type: 'error',
      text1: 'Server Error',
      text2: 'Something went wrong. Please try again.',
    },
    'auth/timeout': {
      type: 'error',
      text1: 'Timeout',
      text2: 'The request took too long. Please try again.',
    },
    'auth/expired-action-code': {
      type: 'error',
      text1: 'Link Expired',
      text2: 'The reset link has expired. Please request a new one.',
    },
    'auth/invalid-action-code': {
      type: 'error',
      text1: 'Invalid Link',
      text2: 'The reset link is invalid or already used.',
    },
  },
  passwordResetSuccess: {
    type: 'success',
    text1: 'Email Sent',
    text2: 'Password reset link has been sent to your email.',
  },
};
