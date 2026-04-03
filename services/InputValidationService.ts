// Input Validation Service for Chatbot
import { EXPO_PUBLIC_MIN_MESSAGE_LENGTH, EXPO_PUBLIC_MAX_MESSAGE_LENGTH, EXPO_PUBLIC_MIN_HEALTH_QUERY_LENGTH, EXPO_PUBLIC_PROFANITY_FILTER_ENABLED } from "@env";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings: string[];
  language: "english" | "urdu" | "mixed";
  sanitized: string;
}

// Profanity list
const PROFANITY_LIST = [
  'damn', 'hell', 'crap', 'asshole', 'bastard', 'bitch', 'shit',
  'ہرام', 'بدمعاش', 'حرام',
];

// Medical keywords for context validation
const MEDICAL_KEYWORDS = [
  'fever', 'headache', 'pain', 'diabetes', 'blood', 'pressure', 'cholesterol',
  'symptom', 'disease', 'medicine', 'doctor', 'hospital', 'report', 'lab',
  'بخار', 'سر درد', 'درد', 'ذیابیطس', 'خون', 'دوا', 'ڈاکٹر', 'رپورٹ',
];

export const detectLanguage = (text: string): "english" | "urdu" | "mixed" => {
  const urduRegex = /[\u0600-\u06FF]/g;
  const englishRegex = /[a-zA-Z]/g;

  const urduMatches = text.match(urduRegex) || [];
  const englishMatches = text.match(englishRegex) || [];

  if (urduMatches.length > 0 && englishMatches.length > 0) {
    return "mixed";
  } else if (urduMatches.length > englishMatches.length) {
    return "urdu";
  }
  return "english";
};

export const sanitizeInput = (text: string): string => {
  // Remove extra whitespace
  let sanitized = text.trim().replace(/\s+/g, " ");

  // Remove special characters but keep medical-related symbols
  sanitized = sanitized.replace(/[<>{}]/g, "");

  // Remove URLs (potential malicious content)
  sanitized = sanitized.replace(/https?:\/\/\S+/g, "[URL_REMOVED]");

  // Remove email addresses
  sanitized = sanitized.replace(/\S+@\S+\.\S+/g, "[EMAIL_REMOVED]");

  return sanitized;
};

export const hasProfanity = (text: string): boolean => {
  if (!EXPO_PUBLIC_PROFANITY_FILTER_ENABLED || EXPO_PUBLIC_PROFANITY_FILTER_ENABLED === "false") {
    return false;
  }

  const lowerText = text.toLowerCase();
  return PROFANITY_LIST.some((word) => lowerText.includes(word));
};

export const isMedicalContext = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return MEDICAL_KEYWORDS.some((keyword) => lowerText.includes(keyword));
};

export const validateChatMessage = (
  message: string,
  isHealthQuery: boolean = false
): ValidationResult => {
  const warnings: string[] = [];
  let isValid = true;
  let error: string | undefined;

  // Minimum length validation
  const minLen = parseInt(EXPO_PUBLIC_MIN_MESSAGE_LENGTH || "2");
  if (message.trim().length < minLen) {
    isValid = false;
    error = `Message must be at least ${minLen} characters long`;
    return { isValid, error, warnings, language: "english", sanitized: message };
  }

  // Maximum length validation
  const maxLen = parseInt(EXPO_PUBLIC_MAX_MESSAGE_LENGTH || "5000");
  if (message.length > maxLen) {
    isValid = false;
    error = `Message exceeds maximum length of ${maxLen} characters`;
    return { isValid, error, warnings, language: "english", sanitized: message };
  }

  // Health query specific validation
  if (isHealthQuery) {
    const minHealthLen = parseInt(EXPO_PUBLIC_MIN_HEALTH_QUERY_LENGTH || "5");
    if (message.trim().length < minHealthLen) {
      isValid = false;
      error = `Health query must be at least ${minHealthLen} characters. Please provide more details about your symptoms or health concern.`;
      return { isValid, error, warnings, language: "english", sanitized: message };
    }

    // Check if it's actually a health-related message
    if (!isMedicalContext(message) && !message.toLowerCase().includes("help")) {
      warnings.push("Your message doesn't seem to be health-related. Are you sure you want to ask this?");
    }
  }

  // Profanity check
  if (hasProfanity(message)) {
    warnings.push("Your message contains potentially offensive language. Please rephrase.");
  }

  // Language detection
  const language = detectLanguage(message);

  // Sanitize input
  const sanitized = sanitizeInput(message);

  // Check for only special characters or numbers
  if (!/[a-zA-Z\u0600-\u06FF]/.test(sanitized)) {
    isValid = false;
    error = "Message must contain valid text content";
    return { isValid, error, warnings, language, sanitized };
  }

  return {
    isValid,
    error,
    warnings,
    language,
    sanitized,
  };
};

export const validateLabReport = (text: string): ValidationResult => {
  const warnings: string[] = [];
  let isValid = true;
  let error: string | undefined;

  if (!text || text.trim().length === 0) {
    isValid = false;
    error = "Lab report cannot be empty";
    return { isValid, error, warnings, language: "english", sanitized: text };
  }

  const language = detectLanguage(text);

  // Check for lab-related keywords
  const labKeywords = [
    "hemoglobin", "glucose", "hba1c", "cholesterol", "wbc", "rbc", "platelets",
    "value", "normal", "high", "low", "report", "test", "level",
    "ہیموگلوبن", "گلوکوز", "کولیسٹرول", "ویلیو", "نارمل", "رپورٹ", "ٹیسٹ",
  ];

  const hasLabContent = labKeywords.some((keyword) =>
    text.toLowerCase().includes(keyword)
  );

  if (!hasLabContent) {
    warnings.push(
      "This doesn't appear to be a lab report. Lab reports typically contain test names, values, and normal ranges."
    );
  }

  // Check for numeric values
  const hasNumbers = /\d+(?:\.\d+)?/.test(text);
  if (!hasNumbers) {
    warnings.push("No numeric values found. Lab reports usually contain test values.");
  }

  const sanitized = sanitizeInput(text);

  return {
    isValid,
    error,
    warnings,
    language,
    sanitized,
  };
};

export const formatMessageForAPI = (
  message: string,
  language: "english" | "urdu" = "english"
): string => {
  const validation = validateChatMessage(message, true);

  if (!validation.isValid) {
    throw new Error(validation.error || "Invalid message");
  }

  // Add context based on language
  let formatted = validation.sanitized;

  if (language === "urdu" && validation.language !== "urdu") {
    formatted = `[Urdu Response Requested] ${formatted}`;
  } else if (language === "english" && validation.language === "urdu") {
    formatted = `[English Response Requested] ${formatted}`;
  }

  return formatted;
};

export const validateLanguageCode = (code: string): boolean => {
  const validLanguages = ["en-US", "en-GB", "ur-PK", "ur", "en", "english", "urdu"];
  return validLanguages.includes(code);
};

export const validateFileSize = (sizeInBytes: number, maxSizeInMB: number = 5): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

export const validateFileType = (
  fileName: string,
  allowedTypes: string[] = ["pdf", "jpg", "jpeg", "png", "txt"]
): boolean => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};
