// AI Doctor Service - Provides doctor recommendations
// Works offline with fallback recommendations

export interface DoctorRecommendation {
  specialist: string;
  urgency: "Immediate" | "Within 24 hours" | "Within a week" | "Routine";
  questionsToAsk: string[];
  whatToTell: string[];
  warningSigns?: string[];
}

export const getDoctorRecommendation = async (
  condition: string,
  language: "english" | "urdu" = "english"
): Promise<DoctorRecommendation> => {
  const lowerCondition = condition.toLowerCase();
  
  // Diabetes / Sugar related
  if (lowerCondition.includes("diabetes") || lowerCondition.includes("sugar") || 
      lowerCondition.includes("glucose") || lowerCondition.includes("شوگر")) {
    return {
      specialist: language === "urdu" ? "ماہر امراضِ شوگر (Endocrinologist)" : "Endocrinologist",
      urgency: "Within 24 hours",
      questionsToAsk: language === "urdu" ? [
        "میرے شوگر کے نمبرز کتنے خطرناک ہیں؟",
        "مجھے کتنی بار شوگر چیک کرنی چاہیے؟",
        "کیا مجھے انسولین کی ضرورت ہے؟",
        "میری خوراک میں کیا تبدیلیاں کروں؟"
      ] : [
        "How serious are my sugar levels?",
        "How often should I check my blood sugar?",
        "Do I need insulin?",
        "What dietary changes should I make?"
      ],
      whatToTell: language === "urdu" ? [
        "اپنے شوگر کی ریڈنگز بتائیں",
        "کب سے شوگر ہے بتائیں",
        "اب تک کون سی دوائی لے رہے ہیں",
        "کھانے پینے کی عادات بتائیں"
      ] : [
        "Share your blood sugar readings",
        "Tell when you were first diagnosed",
        "List current medications",
        "Describe your diet and eating habits"
      ],
      warningSigns: language === "urdu" ? [
        "بہت زیادہ پیاس لگنا",
        "بار بار پیشاب آنا",
        "وزن کم ہونا",
        "نظر دھندلی ہونا"
      ] : [
        "Excessive thirst",
        "Frequent urination",
        "Unexplained weight loss",
        "Blurred vision"
      ]
    };
  }
  
  // Fever related
  if (lowerCondition.includes("fever") || lowerCondition.includes("temperature") || 
      lowerCondition.includes("بخار")) {
    return {
      specialist: language === "urdu" ? "جنرل فزیشن" : "General Physician",
      urgency: "Within 24 hours",
      questionsToAsk: language === "urdu" ? [
        "یہ بخار کس چیز کی وجہ سے ہے؟",
        "مجھے کون سی دوائی لینی چاہیے؟",
        "کیا اینٹی بائیوٹک کی ضرورت ہے؟"
      ] : [
        "What's causing this fever?",
        "What medication should I take?",
        "Do I need antibiotics?"
      ],
      whatToTell: language === "urdu" ? [
        "بخار کب سے ہے",
        "کتنا درجہ حرارت ہے",
        "اور کون سی علامات ہیں"
      ] : [
        "When did fever start",
        "What's the temperature",
        "Any other symptoms"
      ],
      warningSigns: language === "urdu" ? [
        "تیز بخار (102°F سے زیادہ)",
        "سانس لینے میں مشکل",
        "دورے پڑنا"
      ] : [
        "High fever (above 102°F)",
        "Difficulty breathing",
        "Seizures"
      ]
    };
  }
  
  // Headache / Migraine
  if (lowerCondition.includes("headache") || lowerCondition.includes("migraine") || 
      lowerCondition.includes("سر درد")) {
    return {
      specialist: language === "urdu" ? "نیورولوجسٹ" : "Neurologist",
      urgency: "Within a week",
      questionsToAsk: language === "urdu" ? [
        "یہ درد کس قسم کا ہے؟",
        "کس چیز سے درد بڑھتا ہے؟",
        "کیا یہ مائیگرین ہے؟"
      ] : [
        "What type of headache is this?",
        "What triggers the pain?",
        "Is this migraine?"
      ],
      whatToTell: language === "urdu" ? [
        "درد کہاں ہے",
        "کتنی دیر سے ہے",
        "درد کی شدت بتائیں"
      ] : [
        "Where is the pain located",
        "How long has it been going on",
        "Rate the pain (1-10)"
      ],
      warningSigns: language === "urdu" ? [
        "اچانک شدید درد",
        "بولی میں تبدیلی",
        "اعضاء میں کمزوری"
      ] : [
        "Sudden severe pain",
        "Speech changes",
        "Weakness in limbs"
      ]
    };
  }
  
  // Blood Pressure
  if (lowerCondition.includes("blood pressure") || lowerCondition.includes("bp") || 
      lowerCondition.includes("بلڈ پریشر")) {
    return {
      specialist: language === "urdu" ? "کارڈیالوجسٹ" : "Cardiologist",
      urgency: "Within a week",
      questionsToAsk: language === "urdu" ? [
        "میرا بلڈ پریشر کتنا خطرناک ہے؟",
        "مجھے کون سی دوائی لینی چاہیے؟",
        "خوراک میں کیا تبدیلیاں کروں؟"
      ] : [
        "How serious is my blood pressure?",
        "What medication should I take?",
        "What dietary changes should I make?"
      ],
      whatToTell: language === "urdu" ? [
        "اپنے بلڈ پریشر کی ریڈنگز بتائیں",
        "کب سے ہے بتائیں",
        "اب تک کون سی دوائی لے رہے ہیں"
      ] : [
        "Share your blood pressure readings",
        "Tell when it started",
        "List current medications"
      ],
      warningSigns: language === "urdu" ? [
        "شدید سر درد",
        "سینے میں درد",
        "سانس لینے میں مشکل"
      ] : [
        "Severe headache",
        "Chest pain",
        "Difficulty breathing"
      ]
    };
  }
  
  // Default recommendation
  return {
    specialist: language === "urdu" ? "جنرل فزیشن" : "General Physician",
    urgency: "Routine",
    questionsToAsk: language === "urdu" ? [
      "میری علامات کی کیا وجہ ہو سکتی ہے؟",
      "مجھے کون سے ٹیسٹ کروانے چاہئیں؟",
      "کیا مجھے کسی ماہر کے پاس جانا چاہیے؟"
    ] : [
      "What could be causing my symptoms?",
      "What tests should I take?",
      "Should I see a specialist?"
    ],
    whatToTell: language === "urdu" ? [
      "تمام علامات بتائیں",
      "پہلے سے موجود بیماریاں بتائیں",
      "موجودہ دوائیں بتائیں"
    ] : [
      "List all your symptoms",
      "Share any existing conditions",
      "List current medications"
    ]
  };
};