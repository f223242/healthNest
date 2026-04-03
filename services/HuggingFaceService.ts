// Complete Medical AI Service - For FYP Demonstration Only
import { EXPO_PUBLIC_HUGGINGFACE_API_KEY } from "@env";
import { validateChatMessage } from './InputValidationService';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ MOCK PATIENT DATA STORAGE (For Demo Only) ============
interface PatientData {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  symptoms?: string[];
  labReports?: any[];
  createdAt: string;
  updatedAt: string;
}

// Store patient data locally (for demo purposes only)
export const storePatientData = async (patientData: Partial<PatientData>): Promise<boolean> => {
  try {
    const existingData = await getPatientData();
    const newPatient = {
      id: Date.now().toString(),
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedData = [...(existingData || []), newPatient];
    await AsyncStorage.setItem('@healthnest_patients', JSON.stringify(updatedData));
    console.log("✅ Patient data stored (demo mode)");
    return true;
  } catch (error) {
    console.error("Failed to store patient data:", error);
    return false;
  }
};

// Get all patient data
export const getPatientData = async (): Promise<PatientData[]> => {
  try {
    const data = await AsyncStorage.getItem('@healthnest_patients');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get patient data:", error);
    return [];
  }
};

// Clear patient data (for testing)
export const clearPatientData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@healthnest_patients');
    console.log("Patient data cleared");
  } catch (error) {
    console.error("Failed to clear patient data:", error);
  }
};

// ============ SYMPTOM ANALYSIS (Information Only, Not Diagnosis) ============
export const analyzeSymptoms = (
  symptoms: string[],
  language: "english" | "urdu" = "english"
): string => {
  const symptomString = symptoms.join(", ").toLowerCase();
  
  if (language === "urdu") {
    let response = "🔍 **علامات کا تجزیہ (صرف معلوماتی مقاصد کے لیے):**\n\n";
    
    if (symptomString.includes("بخار") || symptomString.includes("fever")) {
      response += "🤒 **بخار:**\n• ممکنہ وجوہات: انفیکشن، وائرل، فلو\n• مشورہ: آرام کریں، پانی پیئں\n• ڈاکٹر سے ملیں اگر: 3 دن سے زیادہ ہو\n\n";
    }
    if (symptomString.includes("کھانسی") || symptomString.includes("cough")) {
      response += "🤧 **کھانسی:**\n• ممکنہ وجوہات: زکام، الرجی، انفیکشن\n• مشورہ: گرم پانی پیئں، شہد استعمال کریں\n• ڈاکٹر سے ملیں اگر: 2 ہفتے سے زیادہ ہو\n\n";
    }
    if (symptomString.includes("سر درد") || symptomString.includes("headache")) {
      response += "🧠 **سر درد:**\n• ممکنہ وجوہات: تناؤ، تھکاوٹ، پانی کی کمی\n• مشورہ: آرام کریں، پانی پیئں\n• ڈاکٹر سے ملیں اگر: شدید یا بار بار ہو\n\n";
    }
    
    response += "⚠️ **یاد رکھیں:** یہ صرف معلوماتی تجزیہ ہے۔ حتمی تشخیص کے لیے ڈاکٹر سے ضرور ملیں۔";
    return response;
  } else {
    let response = "🔍 **Symptom Analysis (Information Only):**\n\n";
    
    if (symptomString.includes("fever")) {
      response += "🤒 **Fever:**\n• Possible causes: Infection, viral, flu\n• Advice: Rest, stay hydrated\n• See doctor if: Persists > 3 days\n\n";
    }
    if (symptomString.includes("cough")) {
      response += "🤧 **Cough:**\n• Possible causes: Cold, allergy, infection\n• Advice: Drink warm water, use honey\n• See doctor if: Persists > 2 weeks\n\n";
    }
    if (symptomString.includes("headache")) {
      response += "🧠 **Headache:**\n• Possible causes: Stress, fatigue, dehydration\n• Advice: Rest, stay hydrated\n• See doctor if: Severe or frequent\n\n";
    }
    
    response += "⚠️ **Remember:** This is informational only. Consult a doctor for proper diagnosis.";
    return response;
  }
};

// ============ ADVANCED API ENDPOINTS ============
const HF_CHAT_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_INFERENCE_URL = "https://router.huggingface.co/hf-inference/models/";

// ============ ADVANCED MODELS ============
const MODELS = {
  chat: "Qwen/Qwen2.5-72B-Instruct",
  labAnalysis: "Qwen/Qwen2.5-72B-Instruct",
  urdu: "Qwen/Qwen2.5-72B-Instruct",
  medical: "Qwen/Qwen2.5-72B-Instruct",
  translation: "Helsinki-NLP/opus-mt-en-ur",
  whisper: "openai/whisper-large-v3-turbo",
  vision: "Qwen/Qwen2.5-VL-72B-Instruct",
};

// ============ MAIN RESPONSE GENERATION ============
export const generateHFResponse = async (
  prompt: string,
  context?: string,
  language: "english" | "urdu" = "english"
): Promise<string> => {
  try {
    console.log("🚀 Processing prompt:", prompt.substring(0, 50));

    if (!prompt || prompt.trim().length < 3) {
      return language === "urdu"
        ? "❌ براہ کرم مزید تفصیل سے بتائیں۔"
        : "❌ Please provide more details.";
    }

    const lowerPrompt = prompt.toLowerCase();

    // Check for symptom analysis
    if (lowerPrompt.includes("symptom") || lowerPrompt.includes("علامات")) {
      // Extract symptoms from prompt
      const symptoms = extractSymptoms(prompt);
      if (symptoms.length > 0) {
        return analyzeSymptoms(symptoms, language);
      }
    }

    // Check for patient data storage
    if (lowerPrompt.includes("save") || lowerPrompt.includes("store") || lowerPrompt.includes("محفوظ")) {
      // This is for demo - in real app, you'd have proper forms
      return language === "urdu"
        ? "✅ **مریض کی معلومات محفوظ کر دی گئی (ڈیمو موڈ)**\n\nیہ صرف ڈیمو کے لیے ہے۔ اصل ایپ میں یہ معلومات محفوظ رہیں گی۔\n\n⚠️ یاد رکھیں: میں AI ہوں، ڈاکٹر نہیں۔"
        : "✅ **Patient data stored (Demo Mode)**\n\nThis is for demo purposes only. In a real app, this data would be securely stored.\n\n⚠️ Remember: I'm AI, not a doctor.";
    }

    if (isLabReportQuery(lowerPrompt)) {
      return await analyzeLabReport(prompt, language);
    }

    if (isDoctorQuery(lowerPrompt)) {
      return await recommendDoctor(prompt, language);
    }

    const aiResponse = await callAdvancedHFAPI(prompt, language);

    if (aiResponse && aiResponse.length > 10) {
      const disclaimer = language === "urdu"
        ? "\n\n⚠️ یہ AI کا مشورہ ہے۔ حقیقی ڈاکٹر کی رائے ضروری ہے۔"
        : "\n\n⚠️ This is AI guidance. Consult a real doctor.";
      return aiResponse + disclaimer;
    }

    return getKnowledgeBaseResponse(prompt, language);

  } catch (err) {
    console.error("❌ Main error:", err);
    return getKnowledgeBaseResponse(prompt, language);
  }
};

// Helper to extract symptoms from text
function extractSymptoms(text: string): string[] {
  const symptoms: string[] = [];
  const symptomKeywords = ["fever", "cough", "headache", "nausea", "vomiting", "diarrhea", "rash", "pain", "fatigue", "dizziness", "بخار", "کھانسی", "سر درد"];
  
  for (const symptom of symptomKeywords) {
    if (text.toLowerCase().includes(symptom)) {
      symptoms.push(symptom);
    }
  }
  return symptoms;
}

// ============ ADVANCED HUGGING FACE API CALL ============
async function callAdvancedHFAPI(
  prompt: string,
  language: "english" | "urdu"
): Promise<string> {
  const apiKey = EXPO_PUBLIC_HUGGINGFACE_API_KEY?.trim();

  if (!apiKey || apiKey.length < 10 || apiKey === "undefined") {
    console.log("❌ No valid API key");
    return "";
  }

  const systemPrompt = language === "urdu"
    ? `آپ ٹورا ہیں، ہیلتھ نیسٹ کا طبی AI معاون۔ آپ کو صرف صحت، طب، بیماریوں اور علاج سے متعلق سوالات کے جوابات دینے ہیں۔ اگر کوئی غیر متعلقہ سوال پوچھے، تو شائستگی سے معذرت کریں اور بتائیں کہ آپ صرف صحت پر بات کر سکتے ہیں۔ نہایت سادہ اور عام فہم اردو میں جواب دیں۔`
    : `You are Tora, HealthNest's Medical AI Assistant. You must ONLY answer questions related to health, medicine, diseases, or treatments. If the user asks about ANY other topic, politely decline and explicitly state you are a health assistant. Provide clear, simple, layman-friendly English responses.`;

  try {
    console.log("📡 Trying Chat API with Qwen model...");
    
    const chatResponse = await fetch(HF_CHAT_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODELS.chat,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 300,
        top_p: 0.85,
      }),
    });

    if (chatResponse.status === 503) {
      console.log("⏳ Chat model loading, trying inference API...");
      return await callInferenceAPI(prompt, language, systemPrompt);
    }

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error(`❌ Chat API error (${chatResponse.status}):`, errorText.substring(0, 100));
      return await callInferenceAPI(prompt, language, systemPrompt);
    }

    let chatData;
    try {
      chatData = await chatResponse.json();
    } catch (jsonError) {
      console.error("❌ Failed to parse JSON response:", jsonError);
      return await callInferenceAPI(prompt, language, systemPrompt);
    }
    
    if (chatData.choices?.[0]?.message?.content) {
      let response = chatData.choices[0].message.content.trim();
      response = response.replace(/^Tora:\s*/i, "").replace(/^Assistant:\s*/i, "").trim();

      if (response.length > 10) {
        if (response.length > 800) {
          response = response.substring(0, 800).trim();
          const lastPeriod = response.lastIndexOf(".");
          if (lastPeriod > 100) response = response.substring(0, lastPeriod + 1);
        }
        console.log("✅ Chat API response success");
        return response;
      }
    }

  } catch (error) {
    console.error("Chat API error:", error instanceof Error ? error.message : String(error));
  }

  return await callInferenceAPI(prompt, language, systemPrompt);
}

// ============ INFERENCE API CALL (Fallback) ============
async function callInferenceAPI(
  prompt: string,
  language: "english" | "urdu",
  systemPrompt: string
): Promise<string> {
  const apiKey = EXPO_PUBLIC_HUGGINGFACE_API_KEY?.trim();
  if (!apiKey || apiKey === "undefined") return "";

  try {
    console.log("📡 Trying Inference API...");
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;

    const response = await fetch(`${HF_INFERENCE_URL}${MODELS.medical}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.6,
          top_p: 0.85,
          do_sample: true,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
    });

    if (response.status === 503) {
      console.log("⏳ Model loading, please wait...");
      return "";
    }

    if (!response.ok) {
      console.error(`❌ Inference API error (${response.status})`);
      return "";
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("❌ Failed to parse inference response:", jsonError);
      return "";
    }

    let text = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text;
    } else if (data?.generated_text) {
      text = data.generated_text;
    }

    if (text) {
      text = text.replace(fullPrompt, "").replace(/^Assistant:\s*/i, "").replace(/^Tora:\s*/i, "").trim();
    }

    if (text && text.length > 10) {
      console.log("✅ Inference API response success");
      return text;
    }

  } catch (error) {
    console.error("Inference API error:", error instanceof Error ? error.message : String(error));
  }

  return "";
}

// ============ LAB REPORT ANALYSIS ============
export const analyzeLabReport = async (
  reportText: string,
  language: "english" | "urdu" = "english"
): Promise<string> => {
  try {
    const apiKey = EXPO_PUBLIC_HUGGINGFACE_API_KEY?.trim();

    if (!apiKey || apiKey.length < 10 || apiKey === "undefined") {
      return getFallbackLabAnalysis(reportText, language);
    }

    const systemPrompt = language === "urdu"
      ? `آپ ٹورا ہیں، طبی تجزیہ کار۔ اس لیب رپورٹ کو ایک عام آدمی کے لیے نہایت آسان اردو میں سمجھائیں۔ صرف اہم نتائج، کسی بیماری کے خطرے، اور آسان حل کو نمایاں کریں۔ پیچیدہ طبی اصطلاحات سے گریز کریں۔`
      : `You are Tora, a medical analyst. Summarize this lab report in extremely simple layman's terms. Highlight any abnormal results, explain what they mean simply, and suggest basic actionable steps. Avoid complex medical jargon entirely.`;

    const analysisPrompt = language === "urdu"
      ? `لیب رپورٹ:\n${reportText}\n\nتجزیہ کریں:`
      : `Lab Report:\n${reportText}\n\nAnalyze:`;

    const response = await fetch(HF_CHAT_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODELS.labAnalysis,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (response.ok) {
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        return getFallbackLabAnalysis(reportText, language);
      }
      
      if (data.choices?.[0]?.message?.content) {
        let analysis = data.choices[0].message.content.trim();
        if (analysis.length > 1000) {
          analysis = analysis.substring(0, 1000);
          const lastPeriod = analysis.lastIndexOf(".");
          if (lastPeriod > 100) analysis = analysis.substring(0, lastPeriod + 1);
        }
        const disclaimer = language === "urdu"
          ? "\n\n⚠️ **اہم:** یہ AI کا تجزیہ ہے۔ حتمی تشخیص کے لیے اپنے ڈاکٹر سے ملیں۔"
          : "\n\n⚠️ **Important:** This is AI analysis. Consult your doctor for final diagnosis.";
        return analysis + disclaimer;
      }
    }

    return getFallbackLabAnalysis(reportText, language);

  } catch (error) {
    console.error("Lab analysis error:", error);
    return getFallbackLabAnalysis(reportText, language);
  }
};

function getFallbackLabAnalysis(reportText: string, language: "english" | "urdu"): string {
  const hasHighGlucose = /glucose.*[2-9]\d{2}|fasting.*[1-2]\d{2}|شوگر.*[2-9]\d{2}/i.test(reportText);
  const hasLowHemoglobin = /hemoglobin.*[5-9]\.?[0-9]*|hb.*[5-9]\.?[0-9]*|ہیموگلوبن.*[5-9]/i.test(reportText);
  const hasHighCholesterol = /cholesterol.*[3-9]\d{2}|کولیسٹرول.*[3-9]\d{2}/i.test(reportText);

  if (language === "urdu") {
    let response = "🔬 **لیب رپورٹ کا تجزیہ:**\n\n";
    if (hasHighGlucose) {
      response += "⚠️ **خون میں شوگر کی سطح بہت زیادہ ہے**\n📌 ممکنہ: ذیابیطس\n👨‍⚕️ **ڈاکٹر:** ماہر امراضِ شوگر\n⏰ **جب ملیں:** فوری\n\n";
    }
    if (hasLowHemoglobin) {
      response += "⚠️ **ہیموگلوبن کی سطح کم ہے**\n📌 ممکنہ: انیمیا\n👨‍⚕️ **ڈاکٹر:** ہیماٹولوجسٹ\n📋 **کریں:** آئرن والی غذائیں\n\n";
    }
    if (hasHighCholesterol) {
      response += "⚠️ **کولیسٹرول کی سطح بہت زیادہ**\n📌 خطرہ: دل کے مسائل\n👨‍⚕️ **ڈاکٹر:** ماہر امراض قلب\n\n";
    }
    if (!hasHighGlucose && !hasLowHemoglobin && !hasHighCholesterol) {
      response += "✅ **تمام ویلیوز نارمل ہیں**\n\n";
    }
    response += "⚠️ حتمی تشخیص کے لیے اپنے ڈاکٹر سے ملیں۔";
    return response;
  } else {
    let response = "🔬 **Lab Report Analysis:**\n\n";
    if (hasHighGlucose) {
      response += "⚠️ **High Blood Glucose**\n📌 Possible: Diabetes\n👨‍⚕️ **Doctor:** Endocrinologist\n⏰ **When:** Immediately\n\n";
    }
    if (hasLowHemoglobin) {
      response += "⚠️ **Low Hemoglobin**\n📌 Possible: Anemia\n👨‍⚕️ **Doctor:** Hematologist\n📋 **Do:** Iron-rich foods\n\n";
    }
    if (hasHighCholesterol) {
      response += "⚠️ **High Cholesterol**\n📌 Risk: Heart issues\n👨‍⚕️ **Doctor:** Cardiologist\n\n";
    }
    if (!hasHighGlucose && !hasLowHemoglobin && !hasHighCholesterol) {
      response += "✅ **All values appear normal**\n\n";
    }
    response += "⚠️ Consult your doctor for accurate diagnosis.";
    return response;
  }
}

// ============ DOCTOR RECOMMENDATION ============
export const recommendDoctor = async (
  condition: string,
  language: "english" | "urdu" = "english"
): Promise<string> => {
  const lower = condition.toLowerCase();

  if (lower.includes("diabetes") || lower.includes("شوگر")) {
    return language === "urdu"
      ? "👨‍⚕️ **ماہر امراضِ شوگر (Endocrinologist)**\n\n✅ شوگر کے سائنسی ماہر\n⏰ **فوری ملیں**\n📋 لے جائیں: تمام شوگر کی ریڈنگز\n⚠️ میں AI ہوں، ڈاکٹر نہیں۔"
      : "👨‍⚕️ **Endocrinologist (Diabetes Specialist)**\n\n✅ Expert in diabetes\n⏰ **See immediately**\n📋 Bring: Sugar readings\n⚠️ I'm AI, not a doctor.";
  }

  if (lower.includes("heart") || lower.includes("bp") || lower.includes("دل")) {
    return language === "urdu"
      ? "👨‍⚕️ **ماہر امراض قلب (Cardiologist)**\n\n✅ دل اور بلڈ پریشر کے ماہر\n⏰ **فوری ملیں**\n📋 لے جائیں: بلڈ پریشر کی ریڈنگز\n⚠️ میں AI ہوں، ڈاکٹر نہیں۔"
      : "👨‍⚕️ **Cardiologist (Heart Specialist)**\n\n✅ Heart & BP expert\n⏰ **See immediately**\n📋 Bring: BP readings\n⚠️ I'm AI, not a doctor.";
  }

  return language === "urdu"
    ? "👨‍⚕️ **جنرل فزیشن**\n\n✅ شروع میں عام ڈاکٹر سے ملیں\n⏰ **جلد ملیں**\n📋 لے جائیں: علامات کی تفصیل\n⚠️ میں AI ہوں، ڈاکٹر نہیں۔"
    : "👨‍⚕️ **General Physician**\n\n✅ Start with your doctor\n⏰ **See soon**\n📋 Bring: Symptoms description\n⚠️ I'm AI, not a doctor.";
}

// ============ KNOWLEDGE BASE ============
function getKnowledgeBaseResponse(prompt: string, language: "english" | "urdu"): string {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("fever") || lowerPrompt.includes("بخار")) {
    return language === "urdu"
      ? "🤒 **بخار کی معلومات:**\n\n✅ آرام کریں\n✅ بہت پانی پیئں\n✅ ہلکی غذا کھائیں\n\n⚠️ **ڈاکٹر سے ملیں اگر:**\n• 3 دن سے زیادہ رہے\n• 104°F سے زیادہ ہو\n\n⚠️ میں AI ہوں، ڈاکٹر نہیں۔"
      : "🤒 **Fever Management:**\n\n✅ Rest\n✅ Drink plenty of water\n✅ Light diet\n\n⚠️ **See Doctor If:**\n• > 3 days\n• > 104°F\n\n⚠️ I'm AI, not a doctor.";
  }

  if (lowerPrompt.includes("headache") || lowerPrompt.includes("سر درد")) {
    return language === "urdu"
      ? "🧠 **سر درد کے علاج:**\n\n✅ تاریک کمرے میں آرام کریں\n✅ ٹھنڈا کمپریس لگائیں\n✅ پانی پیئں\n\n⚠️ **ڈاکٹر سے ملیں اگر:**\n• اچانک بہت شدید ہو\n\n⚠️ میں AI ہوں، ڈاکٹر نہیں۔"
      : "🧠 **Headache Relief:**\n\n✅ Rest in dark room\n✅ Apply cool compress\n✅ Drink water\n\n⚠️ **See Doctor If:**\n• Sudden severe\n\n⚠️ I'm AI, not a doctor.";
  }

  return language === "urdu"
    ? "🤖 **ہیلتھ نیسٹ - ٹورا سے خوش آمدید!**\n\n👋 میں ٹورا ہوں، آپ کا طبی AI معاون۔\n\n**پوچھیں:**\n🤒 علامات کے بارے میں\n📋 لیب رپورٹ کا تجزیہ\n👨‍⚕️ ڈاکٹر کی سفارش\n💊 صحت کے سوالات\n\n⚠️ میں AI ہوں، حقیقی ڈاکٹر نہیں۔\n\n**اپنا سوال پوچھیں:**"
    : "🤖 **Welcome to HealthNest - Tora AI!**\n\n👋 I'm Tora, your Medical AI Assistant.\n\n**Ask About:**\n🤒 Symptoms\n📋 Lab reports\n👨‍⚕️ Doctor recommendations\n💊 Health questions\n\n⚠️ I'm AI, not a real doctor.\n\n**What's your health question?**";
}

// ============ HELPER FUNCTIONS ============
function isLabReportQuery(prompt: string): boolean {
  const keywords = ["report", "lab", "test", "result", "glucose", "hemoglobin", "cholesterol", "platelet", "hba1c", "رپورٹ", "لیب", "ٹیسٹ", "ہیموگلوبن"];
  return keywords.some(k => prompt.toLowerCase().includes(k));
}

function isDoctorQuery(prompt: string): boolean {
  const keywords = ["doctor", "specialist", "appointment", "consult", "physician", "ڈاکٹر", "ماہر", "ملاقات"];
  return keywords.some(k => prompt.toLowerCase().includes(k));
}

// ============ TRANSLATION ============
export const translateToUrdu = async (text: string): Promise<string> => {
  const translations: Record<string, string> = {
    "fever": "بخار", "headache": "سر درد", "cough": "کھانسی",
    "diabetes": "ذیابیطس", "doctor": "ڈاکٹر", "medicine": "دوا",
    "blood": "خون", "sugar": "شوگر", "report": "رپورٹ",
    "normal": "نارمل", "abnormal": "غیر نارمل", "high": "زیادہ",
    "low": "کم", "pain": "درد", "symptoms": "علامات"
  };
  
  let translated = text;
  for (const [eng, urd] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(`\\b${eng}\\b`, "gi"), urd);
  }
  return translated;
};

// ============ VOICE TRANSCRIPTION ============
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  try {
    const apiKey = EXPO_PUBLIC_HUGGINGFACE_API_KEY?.trim();

    if (!apiKey || apiKey.length < 10 || apiKey === "undefined") {
      console.log("❌ No valid API key for transcription");
      return "";
    }

    console.log("🎤 Starting transcription for:", audioUri);

    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: "base64",
    });

    const response = await fetch(`${HF_INFERENCE_URL}${MODELS.whisper}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: audioBase64,
        parameters: {
          task: "transcribe",
          return_timestamps: false,
        },
      }),
    });

    if (response.status === 503) {
      console.log("⏳ Whisper model is loading...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      const retryResponse = await fetch(`${HF_INFERENCE_URL}${MODELS.whisper}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: audioBase64,
          parameters: {
            task: "transcribe",
            return_timestamps: false,
          },
        }),
      });
      
      if (retryResponse.ok) {
        const data = await retryResponse.json();
        return data.text || "";
      }
      return "";
    }

    if (!response.ok) {
      console.error(`❌ Transcription API error (${response.status})`);
      return "";
    }

    const data = await response.json();
    return data.text || "";
    
  } catch (error) {
    console.error("❌ Transcription error:", error instanceof Error ? error.message : String(error));
    return "";
  }
};

// ============ EXPORT SERVICE ============
export const HuggingFaceService = {
  generateResponse: generateHFResponse,
  analyzeLabReport,
  recommendDoctor,
  translateToUrdu,
  transcribeAudio,
  analyzeSymptoms,
  storePatientData,
  getPatientData,
  clearPatientData,
};