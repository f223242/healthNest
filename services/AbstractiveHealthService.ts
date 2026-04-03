// Abstractive Health API for Lab Report Analysis with Enhanced Processing
import { EXPO_PUBLIC_ABSTRACTIVE_API_KEY } from "@env";
import { validateLabReport } from './InputValidationService';

export interface LabReportAnalysis {
  summary: string;
  normalValues: string[];
  abnormalValues: string[];
  recommendations: string[];
  requiresDoctor: boolean;
  urgency: "Normal" | "Caution" | "Warning" | "Emergency";
  confidence: number;
  interpreAtion: string;
}

export const analyzeLabReportWithAbstractive = async (
  reportText: string,
  language: "english" | "urdu" = "english"
): Promise<LabReportAnalysis> => {
  try {
    // Validate input
    const validation = validateLabReport(reportText);
    if (!validation.isValid) {
      return getDefaultAnalysis(reportText, language);
    }

    // Try Abstractive Health API first
    if (EXPO_PUBLIC_ABSTRACTIVE_API_KEY && EXPO_PUBLIC_ABSTRACTIVE_API_KEY !== "undefined") {
      try {
        const response = await fetch("https://api.abstractivehealth.com/v1/summarize", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${EXPO_PUBLIC_ABSTRACTIVE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: reportText,
            type: "lab_report",
            language: language === "urdu" ? "ur" : "en",
            format: "layman",
            include_recommendations: true,
            include_urgency: true,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            summary: data.summary || extractSimpleSummary(reportText, language),
            normalValues: data.normal_values || [],
            abnormalValues: data.abnormal_values || [],
            recommendations: data.recommendations || generateRecommendations(data.abnormal_values, language),
            requiresDoctor: data.requires_doctor || (data.abnormal_values?.length > 0),
            urgency: determineUrgency(data.abnormal_values, reportText),
            confidence: data.confidence || 0.8,
            interpreAtion: data.interpretation || extractInterpretation(reportText, language),
          };
        }
      } catch (apiError) {
        console.error("Abstractive API error:", apiError);
      }
    }
    
    // Fallback to local analysis (works offline)
    return localLabReportAnalysis(reportText, language);
    
  } catch (error) {
    console.error("Lab report analysis error:", error);
    return localLabReportAnalysis(reportText, language);
  }
};

function getDefaultAnalysis(reportText: string, language: "english" | "urdu"): LabReportAnalysis {
  return {
    summary: language === "urdu" ? "رپورٹ پروسیس میں خرابی ہوئی۔" : "Error processing report.",
    normalValues: [],
    abnormalValues: [],
    recommendations: [],
    requiresDoctor: true,
    urgency: "Normal",
    confidence: 0,
    interpreAtion: language === "urdu" ? "براہ مہربانی دوبارہ کوشش کریں۔" : "Please try again.",
  };
}

// Local analysis function with enhanced detection
const localLabReportAnalysis = (reportText: string, language: "english" | "urdu"): LabReportAnalysis => {
  const normalValues: string[] = [];
  const abnormalValues: string[] = [];
  
  // Comprehensive lab tests with normal ranges
  const tests = [
    { name: "Hemoglobin", pattern: /hemoglobin:?\s*(\d+(?:\.\d+)?)/i, normalMin: 12, normalMax: 16, unit: "g/dL", severity: "high" },
    { name: "Glucose (Fasting)", pattern: /glucose\s*(?:fasting)?:?\s*(\d+(?:\.\d+)?)/i, normalMin: 70, normalMax: 100, unit: "mg/dL", severity: "high" },
    { name: "Glucose (Random)", pattern: /glucose\s*(?:random)?:?\s*(\d+(?:\.\d+)?)/i, normalMin: 70, normalMax: 140, unit: "mg/dL", severity: "medium" },
    { name: "HbA1c", pattern: /hba1c:?\s*(\d+(?:\.\d+)?)/i, normalMin: 4, normalMax: 5.6, unit: "%", severity: "high" },
    { name: "Cholesterol", pattern: /cholesterol:?\s*(\d+(?:\.\d+)?)/i, normalMin: 125, normalMax: 200, unit: "mg/dL", severity: "medium" },
    { name: "LDL", pattern: /ldl:?\s*(\d+(?:\.\d+)?)/i, normalMin: 0, normalMax: 100, unit: "mg/dL", severity: "medium" },
    { name: "HDL", pattern: /hdl:?\s*(\d+(?:\.\d+)?)/i, normalMin: 40, normalMax: 60, unit: "mg/dL", severity: "low" },
    { name: "Triglycerides", pattern: /triglycerides:?\s*(\d+(?:\.\d+)?)/i, normalMin: 0, normalMax: 150, unit: "mg/dL", severity: "medium" },
    { name: "WBC", pattern: /wbc:?\s*(\d+(?:\.\d+)?)/i, normalMin: 4, normalMax: 11, unit: "K/uL", severity: "high" },
    { name: "RBC", pattern: /rbc:?\s*(\d+(?:\.\d+)?)/i, normalMin: 4.5, normalMax: 5.9, unit: "M/uL", severity: "high" },
    { name: "Platelets", pattern: /platelets:?\s*(\d+(?:\.\d+)?)/i, normalMin: 150, normalMax: 450, unit: "K/uL", severity: "high" },
    { name: "Hemoglobin A1C", pattern: /hbA1c:?\s*(\d+(?:\.\d+)?)/i, normalMin: 4, normalMax: 5.6, unit: "%", severity: "high" },
    { name: "Potassium", pattern: /potassium:?\s*(\d+(?:\.\d+)?)/i, normalMin: 3.5, normalMax: 5, unit: "mEq/L", severity: "high" },
    { name: "Sodium", pattern: /sodium:?\s*(\d+(?:\.\d+)?)/i, normalMin: 136, normalMax: 145, unit: "mEq/L", severity: "high" },
    { name: "Creatinine", pattern: /creatinine:?\s*(\d+(?:\.\d+)?)/i, normalMin: 0.7, normalMax: 1.3, unit: "mg/dL", severity: "high" },
    { name: "TSH", pattern: /tsh:?\s*(\d+(?:\.\d+)?)/i, normalMin: 0.4, normalMax: 4, unit: "mIU/L", severity: "medium" },
  ];
  
  let urgency: "Normal" | "Caution" | "Warning" | "Emergency" = "Normal";
  let criticalCount = 0;
  
  for (const test of tests) {
    const match = reportText.match(test.pattern);
    if (match) {
      const value = parseFloat(match[1]);
      const isAbnormal = value < test.normalMin || value > test.normalMax;
      const result = `${test.name}: ${value} ${test.unit}`;
      
      if (isAbnormal) {
        abnormalValues.push(result);
        if (test.severity === "high") criticalCount++;
      } else {
        normalValues.push(result);
      }
    }
  }
  
  // Determine urgency based on abnormalities
  if (criticalCount >= 3) {
    urgency = "Emergency";
  } else if (criticalCount === 2) {
    urgency = "Warning";
  } else if (abnormalValues.length > 0) {
    urgency = "Caution";
  }
  
  // Generate summary
  let summary = "";
  let recommendations: string[] = [];
  let requiresDoctor = false;
  
  if (abnormalValues.length === 0 && normalValues.length > 0) {
    summary = language === "urdu"
      ? "آپ کی رپورٹ میں تمام ویلیوز نارمل ہیں۔"
      : "All values in your report are normal.";
    recommendations = language === "urdu"
      ? ["صحت مند طرز زندگی جاری رکھیں", "متوازن غذا کھائیں"]
      : ["Maintain a healthy lifestyle", "Eat a balanced diet"];
  } else if (abnormalValues.length > 0) {
    summary = language === "urdu"
      ? `آپ کی رپورٹ میں ${abnormalValues.length} غیر نارمل ویلیوز پائی گئیں۔`
      : `${abnormalValues.length} abnormal values found in your report.`;
    recommendations = language === "urdu"
      ? ["فوری طور پر ڈاکٹر سے رجوع کریں", "یہ رپورٹ ڈاکٹر کو ضرور دکھائیں"]
      : ["Consult a doctor immediately", "Show this report to your doctor"];
    requiresDoctor = true;
  } else {
    summary = language === "urdu"
      ? "رپورٹ میں کوئی واضح ویلیوز نہیں ملی۔ براہ کرم واضح تصویر اپ لوڈ کریں۔"
      : "No clear values found. Please upload a clear image.";
  }
  
return {
  summary,
  normalValues,
  abnormalValues,
  recommendations,
  requiresDoctor,
  urgency,
  confidence: 0.75,
  interpreAtion: language === "urdu"
    ? "تفصیلی تجزیہ مکمل ہوا"
    : "Detailed analysis complete",
};
};

// Extract simple summary from report text
const extractSimpleSummary = (reportText: string, language: "english" | "urdu"): string => {
  const analysis = localLabReportAnalysis(reportText, language);
  return analysis.summary;
};

function extractInterpretation(reportText: string, language: "english" | "urdu"): string {
  if (reportText.length === 0) return language === "urdu" ? "رپورٹ خالی ہے" : "Empty report";
  if (reportText.length < 20) return language === "urdu" ? "ناکافی معلومات" : "Insufficient information";
  return language === "urdu" ? "تفصیلی تجزیہ درست ہے" : "Detailed analysis complete";
}

function generateRecommendations(abnormalValues: string[], language: "english" | "urdu"): string[] {
  if (!abnormalValues || abnormalValues.length === 0) {
    return language === "urdu"
      ? ["صحت مند طرز زندگی برقرار رکھیں", "متوازن غذا کھائیں"]
      : ["Maintain healthy lifestyle", "Eat balanced diet"];
  }

  const recommendations: string[] = [];

  // Check for diabetes-related values
  if (abnormalValues.some(v => v.toLowerCase().includes("glucose") || v.toLowerCase().includes("hba1c"))) {
    recommendations.push(language === "urdu" ? "شوگر کنٹرول کریں" : "Control blood sugar");
    recommendations.push(language === "urdu" ? "میٹھی چیزوں سے پرہیز کریں" : "Avoid sweets");
  }

  // Check for cholesterol
  if (abnormalValues.some(v => v.toLowerCase().includes("cholesterol") || v.toLowerCase().includes("ldl"))) {
    recommendations.push(language === "urdu" ? "چکنائی سے پرہیز کریں" : "Reduce fat intake");
    recommendations.push(language === "urdu" ? "سبزیوں کا استعمال بڑھائیں" : "Increase vegetables");
  }

  // Check for blood cell issues
  if (abnormalValues.some(v => v.toLowerCase().includes("wbc") || v.toLowerCase().includes("hemoglobin") || v.toLowerCase().includes("rbc"))) {
    recommendations.push(language === "urdu" ? "آرام کریں" : "Rest well");
    recommendations.push(language === "urdu" ? "لوہے والی غذا کھائیں" : "Eat iron-rich food");
  }

  return recommendations.length > 0 ? recommendations : (language === "urdu" ? ["ڈاکٹر سے ملیں"] : ["Consult doctor"]);
}

function determineUrgency(abnormalValues: string[], reportText: string): "Normal" | "Caution" | "Warning" | "Emergency" {
  if (!abnormalValues || abnormalValues.length === 0) return "Normal";

  const criticalKeywords = ["emergency", "critical", "فوری", "شدید"];
  if (criticalKeywords.some(k => reportText.toLowerCase().includes(k))) {
    return "Emergency";
  }

  if (abnormalValues.length > 2) return "Warning";
  if (abnormalValues.length > 0) return "Caution";

  return "Normal";
}