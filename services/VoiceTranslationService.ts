// Voice Translation & Synthesis Service
import * as Speech from "expo-speech";
import { EXPO_PUBLIC_VOICE_ENABLED, EXPO_PUBLIC_VOICE_SYNTHESIS_RATE, EXPO_PUBLIC_VOICE_SYNTHESIS_PITCH } from "@env";
import { detectLanguage } from './InputValidationService';
import { HuggingFaceService } from './HuggingFaceService';

export interface VoiceConfig {
  language?: "english" | "urdu";
  rate?: number;
  pitch?: number;
  enabled?: boolean;
}

export interface TranscriptionResult {
  text: string;
  language: "english" | "urdu" | "mixed";
  confidence: number;
}

// ============ TEXT-TO-SPEECH SYNTHESIS ============
export const speakText = async (
  text: string,
  language: "english" | "urdu" = "english",
  options?: VoiceConfig
): Promise<void> => {
  try {
    const enabled = options?.enabled ?? (EXPO_PUBLIC_VOICE_ENABLED !== "false");

    if (!enabled) {
      console.log("Voice synthesis disabled");
      return;
    }

    const rate = options?.rate ?? parseFloat(EXPO_PUBLIC_VOICE_SYNTHESIS_RATE || "0.9");
    const pitch = options?.pitch ?? parseFloat(EXPO_PUBLIC_VOICE_SYNTHESIS_PITCH || "1.0");

    // Normalize speech rate
    const normalizedRate = Math.max(0.5, Math.min(2, rate));

    // Map language to voice options
    const languageCode = language === "urdu" ? "ur-PK" : "en-US";

    await Speech.speak(text, {
      language: languageCode,
      rate: normalizedRate,
      pitch: pitch,
      onDone: () => console.log("Speech synthesis completed"),
      onError: (error) => console.error("Speech synthesis error:", error),
    });
  } catch (error) {
    console.error("Error in speakText:", error);
  }
};

// ============ VOICE SYNTHESIS WITH CONTEXT ============
export const speakWithContext = async (
  text: string,
  context: "greeting" | "instruction" | "emergency" | "normal" = "normal",
  language: "english" | "urdu" = "english"
): Promise<void> => {
  try {
    let rate = 0.9;
    let pitch = 1.0;

    // Adjust speech parameters based on context
    switch (context) {
      case "emergency":
        rate = 1.2;
        pitch = 1.1;
        break;
      case "instruction":
        rate = 0.8;
        pitch = 1.0;
        break;
      case "greeting":
        rate = 0.9;
        pitch = 0.9;
        break;
      default:
        rate = 0.9;
        pitch = 1.0;
    }

    await speakText(text, language, { rate, pitch, enabled: true });
  } catch (error) {
    console.error("Error in speakWithContext:", error);
  }
};

// ============ LANGUAGE DETECTION FOR VOICE ============
export const detectVoiceLanguage = (text: string): "english" | "urdu" => {
  const detected = detectLanguage(text);
  // Handle mixed case - default to english
  if (detected === "mixed") {
    return "english";
  }
  return detected as "english" | "urdu";
};

// ============ REAL VOICE-TO-TEXT VIA HUGGINGFACE ============
export const transcribeVoiceInput = async (
  audioUri: string,
  language: "english" | "urdu" = "english"
): Promise<TranscriptionResult> => {
  try {
    const transcribedText = await HuggingFaceService.transcribeAudio(audioUri);

    if (!transcribedText || transcribedText.trim() === "") {
      return {
        text: "",
        language: language,
        confidence: 0,
      };
    }

    const detectedLang = detectLanguage(transcribedText);
    const resultLanguage = detectedLang as "english" | "urdu" | "mixed";

    return {
      text: transcribedText,
      language: resultLanguage,
      confidence: 0.85,
    };
  } catch (error) {
    console.error("Error in transcribeVoiceInput:", error);
    return {
      text: "",
      language: language,
      confidence: 0,
    };
  }
};

// ============ POST-PROCESSING TRANSCRIBED TEXT ============
export const processTranscribedText = (
  text: string,
  language: "english" | "urdu"
): string => {
  // Remove extra whitespace
  let processed = text.trim().replace(/\s+/g, " ");

  // Fix common speech-to-text errors
  const corrections: Record<string, string> = {
    // Common English errors
    "\\bwanna\\b": "want to",
    "\\bgotta\\b": "got to",
    "\\bkinda\\b": "kind of",
    "\\bgonna\\b": "going to",
    "\\bu\\b": "you",
    "\\br\\b": "are",

    // Common Urdu errors (fix the regex patterns)
    "بتا\\b": "بتائیں",
    "دی\\b": "دی گئی",
    "کر\\b": "کریں",
    "ہے\\b": "ہے",
    "میں\\b": "میں",
  };

  Object.entries(corrections).forEach(([pattern, replacement]) => {
    try {
      processed = processed.replace(new RegExp(pattern, "gi"), replacement);
    } catch (e) {
      // Skip invalid regex patterns
      console.log("Skipping invalid pattern:", pattern);
    }
  });

  // Capitalize first letter
  if (processed.length > 0) {
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
  }

  // End with period if not already ended with punctuation
  if (!/[.!?]$/.test(processed) && processed.length > 0) {
    processed += ".";
  }

  return processed;
};

// ============ MULTILINGUAL VOICE VALIDATION ============
export const validateVoiceInput = (
  text: string,
  minLength: number = 5
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!text || text.trim().length === 0) {
    errors.push("Voice input is empty");
    return { isValid: false, errors };
  }

  if (text.length < minLength) {
    errors.push(`Voice input too short (minimum ${minLength} characters)`);
  }

  // Check if text contains meaningful content (not just numbers or special chars)
  // Fix: Add proper regex for Urdu and English
  const hasValidChars = /[a-zA-Z\u0600-\u06FF]/.test(text);
  if (!hasValidChars) {
    errors.push("No valid language content detected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============ VOICE OUTPUT SETTINGS ============
export const getVoiceSettings = (): VoiceConfig => {
  return {
    language: "english",
    rate: parseFloat(EXPO_PUBLIC_VOICE_SYNTHESIS_RATE || "0.9"),
    pitch: parseFloat(EXPO_PUBLIC_VOICE_SYNTHESIS_PITCH || "1.0"),
    enabled: EXPO_PUBLIC_VOICE_ENABLED !== "false",
  };
};

// ============ STOP SPEECH ============
export const stopSpeech = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error("Error stopping speech:", error);
  }
};

// ============ ADJUST VOICE PARAMETERS ============
export const adjustVoiceParameters = (
  rate: number,
  pitch: number
): VoiceConfig => {
  // Validate and clamp values
  const validatedRate = Math.max(0.5, Math.min(2, rate));
  const validatedPitch = Math.max(0.5, Math.min(2, pitch));

  return {
    language: "english",
    rate: validatedRate,
    pitch: validatedPitch,
  };
};

// ============ GET AVAILABLE VOICES ============
export const getAvailableVoices = (): VoiceConfig[] => {
  return [
    { language: "english", rate: 0.9, pitch: 1.0 },
    { language: "urdu", rate: 0.9, pitch: 1.0 },
  ];
};

// ============ VOICE RESPONSE WITH FALLBACK ============
export const speakWithFallback = async (
  text: string,
  language: "english" | "urdu" = "english",
  fallbackText?: string
): Promise<void> => {
  try {
    await speakText(text, language);
  } catch (error) {
    console.error("Voice synthesis failed, trying fallback:", error);
    if (fallbackText) {
      try {
        await speakText(fallbackText, language);
      } catch (fallbackError) {
        console.error("Fallback voice synthesis also failed:", fallbackError);
      }
    }
  }
};

// ============ BATCH VOICE SYNTHESIS ============
export const speakBatch = async (
  texts: string[],
  language: "english" | "urdu" = "english",
  delayBetween: number = 1000
): Promise<void> => {
  for (const text of texts) {
    await speakText(text, language);
    // Wait before next speech to avoid overlap
    await new Promise((resolve) => setTimeout(resolve, delayBetween));
  }
};

// ============ EMOTIONAL TONE ADJUSTMENT ============
export const speakWithEmotion = async (
  text: string,
  emotion: "calm" | "concerned" | "urgent" | "friendly" = "calm",
  language: "english" | "urdu" = "english"
): Promise<void> => {
  let rate = 0.9;
  let pitch = 1.0;

  switch (emotion) {
    case "calm":
      rate = 0.8;
      pitch = 0.8;
      break;
    case "concerned":
      rate = 0.9;
      pitch = 1.1;
      break;
    case "urgent":
      rate = 1.1;
      pitch = 1.2;
      break;
    case "friendly":
      rate = 0.9;
      pitch = 0.9;
      break;
  }

  await speakText(text, language, { rate, pitch });
};

// Export service
export const VoiceService = {
  speakText,
  speakWithContext,
  speakWithEmotion,
  speakWithFallback,
  speakBatch,
  transcribeVoiceInput,
  processTranscribedText,
  validateVoiceInput,
  stopSpeech,
  detectVoiceLanguage,
  getVoiceSettings,
  adjustVoiceParameters,
  getAvailableVoices,
};