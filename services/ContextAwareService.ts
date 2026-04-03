// Context-Aware Response Generation Service
import { HuggingFaceService } from './HuggingFaceService';
import { ChatStorageService, ChatSession } from './ChatStorageService';
import { IMessage } from 'react-native-gifted-chat';

export interface ConversationState {
  userProfile: {
    age?: number;
    gender?: string;
    knownConditions?: string[];
    medications?: string[];
    allergies?: string[];
  };
  conversationHistory: string[];
  currentContext: string;
  sessionLanguage: "english" | "urdu";
  sentiment: "positive" | "negative" | "neutral" | "urgent";
}

export interface ContextAwareResponse {
  text: string;
  confidence: number;
  followUpQuestions: string[];
  relatedTopics: string[];
  urgency: "normal" | "caution" | "warning" | "emergency";
  personalizationLevel: number; // 0-1, how much context was used
}

// ============ BUILD CONVERSATION STATE ============
export const buildConversationState = async (
  session: ChatSession,
  messages: IMessage[],
  language: "english" | "urdu" = "english"
): Promise<ConversationState> => {
  // Extract conversation history
  const conversationHistory = messages
    .sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt;
      return aTime - bTime;
    })
    .map((msg) => `${msg.user.name}: ${msg.text}`)
    .slice(-10); // Last 10 messages

  // Extract user health context
  const userProfile = extractHealthProfile(messages);

  // Determine overall sentiment and urgency
  const sentiment = detectSentiment(messages);
  const currentContext = determineContext(messages, session.context);

  return {
    userProfile,
    conversationHistory,
    currentContext,
    sessionLanguage: language,
    sentiment,
  };
};

// ============ EXTRACT HEALTH PROFILE ============
function extractHealthProfile(messages: IMessage[]): ConversationState['userProfile'] {
  const profile: ConversationState['userProfile'] = {
    age: undefined,
    gender: undefined,
    knownConditions: [],
    medications: [],
    allergies: [],
  };

  // Common health conditions to extract
  const conditionKeywords = [
    "diabetes", "hypertension", "asthma", "arthritis", "migraine",
    "thyroid", "anemia", "ulcer", "hepatitis", "covid",
    "ذیابیطس", "بلڈ پریشر", "دمہ", "غدود", "بخار"
  ];

  // Medication keywords
  const medicationKeywords = [
    "aspirin", "metformin", "lisinopril", "atorvastatin",
    "insulin", "paracetamol", "amoxicillin", "omeprazole",
    "گولی", "دوا", "انسولین", "ادویات"
  ];

  for (const message of messages) {
    const text = message.text.toLowerCase();

    // Extract conditions
    for (const condition of conditionKeywords) {
      if (text.includes(condition) && !profile.knownConditions?.includes(condition)) {
        profile.knownConditions?.push(condition);
      }
    }

    // Extract medications
    for (const med of medicationKeywords) {
      if (text.includes(med) && !profile.medications?.includes(med)) {
        profile.medications?.push(med);
      }
    }

    // Extract age
    const ageMatch = text.match(/(\d+)\s*(?:years? old|سال|year|yo)/i);
    if (ageMatch) {
      profile.age = parseInt(ageMatch[1]);
    }

    // Extract gender
    if (text.includes("boy") || text.includes("male") || text.includes("man") || text.includes("لڑکا") || text.includes("مرد")) {
      profile.gender = "male";
    } else if (text.includes("girl") || text.includes("female") || text.includes("woman") || text.includes("لڑکی") || text.includes("عورت")) {
      profile.gender = "female";
    }

    // Extract allergies
    if (text.includes("allerg") || text.includes("حساسیت")) {
      const allergyMatch = text.match(/allerg(?:y|ies)?\s+to\s+([\w\s,]+)/i);
      if (allergyMatch) {
        profile.allergies?.push(allergyMatch[1]);
      }
    }
  }

  return profile;
}

// ============ DETECT SENTIMENT ============
function detectSentiment(messages: IMessage[]): "positive" | "negative" | "neutral" | "urgent" {
  const recentMessages = messages.slice(-3).map((m) => m.text.toLowerCase());
  const allText = recentMessages.join(" ");

  // Urgency indicators
  const urgencyKeywords = [
    "emergency", "urgent", "severe", "critical", "dying",
    "فوری", "شدید", "خطرناک", "ہنگامی", "موت"
  ];

  if (urgencyKeywords.some((k) => allText.includes(k))) {
    return "urgent";
  }

  // Positive indicators
  const positiveKeywords = [
    "better", "improving", "good", "fine", "great", "thanks",
    "بہتر", "اچھا", "شکریہ", "بہت ہے"
  ];

  if (positiveKeywords.some((k) => allText.includes(k))) {
    return "positive";
  }

  // Negative indicators
  const negativeKeywords = [
    "worse", "pain", "suffer", "bad", "trouble", "problems",
    "خراب", "درد", "مسئلہ", "پریشان", "تنگ"
  ];

  if (negativeKeywords.some((k) => allText.includes(k))) {
    return "negative";
  }

  return "neutral";
}

// ============ DETERMINE CONTEXT ============
function determineContext(
  messages: IMessage[],
  sessionContext: string
): string {
  const recentText = messages.slice(-1).map((m) => m.text).join(" ").toLowerCase();

  // Determine query type
  if (recentText.includes("report") || recentText.includes("lab")) {
    return "lab-report-analysis";
  } else if (recentText.includes("doctor") || recentText.includes("specialist")) {
    return "doctor-recommendation";
  } else if (recentText.includes("symptom") || recentText.includes("pain")) {
    return "symptom-analysis";
  } else if (recentText.includes("medicine") || recentText.includes("drug")) {
    return "medication-info";
  } else if (recentText.includes("emergency") || recentText.includes("urgent")) {
    return "emergency";
  }

  return sessionContext || "general-health";
}

// ============ GENERATE CONTEXT-AWARE RESPONSE ============
export const generateContextAwareResponse = async (
  userMessage: string,
  conversationState: ConversationState,
  language: "english" | "urdu" = "english"
): Promise<ContextAwareResponse> => {
  try {
    // Build personalized system context
    const systemPrompt = buildPersonalizedSystemPrompt(conversationState, language);

    // Generate base response
    const baseResponse = await HuggingFaceService.generateResponse(
      userMessage,
      systemPrompt,
      language
    );

    // Personalize response based on context
    let personalizedResponse = baseResponse;
    let personalizationLevel = 0.5;

    // Add personalization based on known conditions
    if (conversationState.userProfile.knownConditions?.length) {
      personalizedResponse = addConditionContext(
        personalizedResponse,
        conversationState.userProfile.knownConditions,
        language
      );
      personalizationLevel += 0.2;
    }

    // Add personalization based on age
    if (conversationState.userProfile.age) {
      personalizedResponse = addAgeContext(
        personalizedResponse,
        conversationState.userProfile.age,
        language
      );
      personalizationLevel += 0.15;
    }

    // Generate follow-up questions
    const followUpQuestions = generateFollowUpQuestions(
      userMessage,
      conversationState.currentContext,
      language
    );

    // Determine urgency
    const urgency = determineUrgency(baseResponse, conversationState.sentiment);

    // Extract related topics
    const relatedTopics = extractRelatedTopics(userMessage, language);

    return {
      text: personalizedResponse,
      confidence: 0.85,
      followUpQuestions,
      relatedTopics,
      urgency,
      personalizationLevel: Math.min(personalizationLevel, 1),
    };
  } catch (error) {
    console.error("Error generating context-aware response:", error);
    return {
      text: "I apologize for the difficulty. Please try again.",
      confidence: 0,
      followUpQuestions: [],
      relatedTopics: [],
      urgency: "normal",
      personalizationLevel: 0,
    };
  }
};

// ============ BUILD PERSONALIZED SYSTEM PROMPT ============
function buildPersonalizedSystemPrompt(
  state: ConversationState,
  language: "english" | "urdu"
): string {
  if (language === "urdu") {
    let prompt = `آپ ٹورا ہیں، ہیلتھ نیسٹ کا AI اسسٹنٹ۔\n\n`;

    // Add user profile info
    if (state.userProfile.age) {
      prompt += `صارف کی عمر: ${state.userProfile.age} سال\n`;
    }

    if (state.userProfile.gender) {
      prompt += `صارف کی جنس: ${state.userProfile.gender === "male" ? "مرد" : "عورت"}\n`;
    }

    if (state.userProfile.knownConditions?.length) {
      prompt += `معلوم بیماریاں: ${state.userProfile.knownConditions.join(", ")}\n`;
    }

    if (state.userProfile.allergies?.length) {
      prompt += `الرجی: ${state.userProfile.allergies.join(", ")}\n`;
    }

    prompt += `\nتاریخ کا تناظر: ${state.conversationHistory.slice(-2).join("\n")}\n\n`;
    prompt += `موجودہ سیاق: ${state.currentContext}\n`;
    prompt += `احساس: ${state.sentiment}\n\n`;
    prompt += `براہ کرم سادہ اردو میں جواب دیں اور اگر ضروری ہو تو ڈاکٹر سے ملنے کا مشورہ دیں۔`;

    return prompt;
  } else {
    let prompt = `You are Tora, HealthNest's AI Health Assistant.\n\n`;

    // Add user profile info
    if (state.userProfile.age) {
      prompt += `User's age: ${state.userProfile.age} years\n`;
    }

    if (state.userProfile.gender) {
      prompt += `User's gender: ${state.userProfile.gender}\n`;
    }

    if (state.userProfile.knownConditions?.length) {
      prompt += `Known conditions: ${state.userProfile.knownConditions.join(", ")}\n`;
    }

    if (state.userProfile.allergies?.length) {
      prompt += `Allergies: ${state.userProfile.allergies.join(", ")}\n`;
    }

    prompt += `\nConversation context: ${state.conversationHistory.slice(-2).join("\n")}\n\n`;
    prompt += `Current context: ${state.currentContext}\n`;
    prompt += `Overall sentiment: ${state.sentiment}\n\n`;
    prompt += `Provide clear, personalized responses. Recommend doctor consultation when appropriate.`;

    return prompt;
  }
}

// ============ ADD CONDITION CONTEXT ============
function addConditionContext(
  response: string,
  conditions: string[],
  language: "english" | "urdu"
): string {
  // This would add specific condition-related warnings or notes
  let enhanced = response;

  for (const condition of conditions) {
    if (
      condition.toLowerCase().includes("diabetes") ||
      condition.toLowerCase().includes("شوگر")
    ) {
      const note =
        language === "urdu"
          ? "\n\n⚠️ **نوٹ:** چونکہ آپ کو ذیابیطس ہے، براہ کرم اپنے شوگر کی نگرانی کریں۔"
          : "\n\n⚠️ **Note:** Since you have diabetes, please monitor your blood sugar levels.";
      enhanced += note;
    }
  }

  return enhanced;
}

// ============ ADD AGE CONTEXT ============
function addAgeContext(
  response: string,
  age: number,
  language: "english" | "urdu"
): string {
  let enhanced = response;

  if (age < 18) {
    const note =
      language === "urdu"
        ? "\n\n🛡️ **نوٹ:** آپ نابالغ ہیں، کسی بڑے کو مطلع کریں۔"
        : "\n\n🛡️ **Note:** As you're a minor, please inform an adult.";
    enhanced += note;
  } else if (age > 65) {
    const note =
      language === "urdu"
        ? "\n\n⏰ **نوٹ:** بزرگ افراد کے لیے عام خطرات زیادہ ہو سکتے ہیں۔"
        : "\n\n⏰ **Note:** Risk factors may be higher for seniors.";
    enhanced += note;
  }

  return enhanced;
}

// ============ GENERATE FOLLOW-UP QUESTIONS ============
function generateFollowUpQuestions(
  userMessage: string,
  context: string,
  language: "english" | "urdu"
): string[] {
  const questions: string[] = [];

  if (context.includes("symptom")) {
    questions.push(
      language === "urdu"
        ? "یہ علامات کب سے ہیں؟"
        : "When did these symptoms start?"
    );
    questions.push(
      language === "urdu"
        ? "کیا آپ کو پہلے یہ علامات ہوئی ہیں؟"
        : "Have you experienced these symptoms before?"
    );
  }

  if (context.includes("medication")) {
    questions.push(
      language === "urdu"
        ? "کیا آپ کو اس دوا سے کوئی الرجی ہے؟"
        : "Any allergies to this medication?"
    );
    questions.push(
      language === "urdu"
        ? "کیا آپ دوسری دوائیں استعمال کر رہے ہیں؟"
        : "Are you taking other medications?"
    );
  }

  if (context.includes("doctor")) {
    questions.push(
      language === "urdu"
        ? "کون سے ماہر کے پاس جانا ہے؟"
        : "Which type of specialist do you need?"
    );
    questions.push(
      language === "urdu"
        ? "کیا آپ عام طور پر کسی ڈاکٹر سے مل رہے ہیں؟"
        : "Do you have a regular doctor?"
    );
  }

  return questions.slice(0, 2);
}

// ============ DETERMINE URGENCY ============
function determineUrgency(
  response: string,
  sentiment: "positive" | "negative" | "neutral" | "urgent"
): "normal" | "caution" | "warning" | "emergency" {
  if (
    sentiment === "urgent" ||
    response.toLowerCase().includes("emergency") ||
    response.toLowerCase().includes("فوری")
  ) {
    return "emergency";
  }

  if (
    response.includes("⚠️") ||
    response.toLowerCase().includes("serious") ||
    response.toLowerCase().includes("serious")
  ) {
    return "warning";
  }

  if (sentiment === "negative") {
    return "caution";
  }

  return "normal";
}

// ============ EXTRACT RELATED TOPICS ============
function extractRelatedTopics(
  userMessage: string,
  language: "english" | "urdu"
): string[] {
  const message = userMessage.toLowerCase();
  const topics: string[] = [];

  const topicMap: Record<string, string[]> = {
    nutrition: ["diet", "food", "nutrition", "غذا", "کھانا"],
    exercise: ["exercise", "workout", "gym", "ورزش"],
    mental_health: ["stress", "anxiety", "depression", "تناؤ"],
    sleep: ["sleep", "insomnia", "tired", "نیند"],
    medications: ["medicine", "drug", "pill", "دوا"],
  };

  for (const [topic, keywords] of Object.entries(topicMap)) {
    if (keywords.some((k) => message.includes(k))) {
      topics.push(topic);
    }
  }

  return topics.slice(0, 3);
}

// Export service
export const ContextAwareService = {
  buildConversationState,
  generateContextAwareResponse,
};
