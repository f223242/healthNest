// Enhanced Custom Hook for ToraAIChat Integration
import { useState, useCallback, useEffect } from 'react';
import { IMessage } from 'react-native-gifted-chat';
import { generateHFResponse } from '@/services/HuggingFaceService';
import { ChatStorageService, ChatSession } from '@/services/ChatStorageService';
import { validateChatMessage, detectLanguage } from '@/services/InputValidationService';
import { VoiceService } from '@/services/VoiceTranslationService';

interface UseToraAIChatOptions {
  chatContext?: "nurse" | "medicine-delivery" | "general" | "person" | "lab-report";
  userName?: string;
  enableStorage?: boolean;
  enableVoice?: boolean;
}

export const useToraAIChat = (options: UseToraAIChatOptions = {}) => {
  const {
    chatContext = "general",
    userName = "User",
    enableStorage = true,
    enableVoice = true,
  } = options;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<"english" | "urdu">("english");
  const [isRecording, setIsRecording] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [contextMessages, setContextMessages] = useState<string[]>([]);

  // ============ SESSION MANAGEMENT ============
  useEffect(() => {
    if (enableStorage) {
      initializeSession();
    }
  }, [enableStorage, chatContext]);

  const initializeSession = async () => {
    try {
      let sessionId = await ChatStorageService.getCurrentSession();

      if (!sessionId) {
        const newSession = await ChatStorageService.createNewSession(
          chatContext as any,
          language
        );
        sessionId = newSession.id;
      }

      const session = await ChatStorageService.loadChatSession(sessionId);
      if (session) {
        setCurrentSession(session);
        setMessages(session.messages);
      }
    } catch (error) {
      console.error("Error initializing session:", error);
    }
  };

  // ============ MESSAGE HANDLING ============
  const handleSendMessage = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (newMessages.length === 0) return;

      const userMessage = newMessages[0];
      const messageText = userMessage.text;

      // Validate message
      const validation = validateChatMessage(messageText, true);
      if (!validation.isValid) {
        console.warn("Invalid message:", validation.error);
        return;
      }

      // Update messages
      setMessages((prev) =>
        [userMessage, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );

      // Auto-detect language
      const detectedLang = detectLanguage(messageText) as "english" | "urdu" | "mixed";
      if (detectedLang !== "mixed") {
        setLanguage(detectedLang);
      }

      // Save to storage
      if (enableStorage && currentSession) {
        try {
          await ChatStorageService.addMessageToSession(currentSession.id, userMessage);
        } catch (error) {
          console.error("Error saving message to storage:", error);
        }
      }

      // Generate AI response
      const responseLanguage = (validation.language === "mixed") ? language : validation.language as "english" | "urdu";
      await generateAIResponse(messageText, responseLanguage);
    },
    [currentSession, enableStorage, language]
  );

  const generateAIResponse = useCallback(
    async (messageText: string, msgLanguage: "english" | "urdu" = "english") => {
      setIsTyping(true);

      try {
        // Build system context
        const systemContext = buildSystemContext(messageText, msgLanguage);

        // Generate response
        const responseText = await generateHFResponse(
          messageText,
          systemContext,
          msgLanguage
        );

        // Create AI response message
        const aiMessage: IMessage = {
          _id: Math.random().toString(),
          text: responseText,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: msgLanguage === "urdu" ? "ٹورا" : "Tora",
            avatar: require("@/assets/png/logo.png"),
          },
        };

        // Add to messages
        setMessages((prev) =>
          [aiMessage, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );

        // Save to storage
        if (enableStorage && currentSession) {
          try {
            await ChatStorageService.addMessageToSession(currentSession.id, aiMessage);
          } catch (error) {
            console.error("Error saving AI response:", error);
          }
        }

        // Speak response
        if (enableVoice) {
          await VoiceService.speakText(responseText, msgLanguage);
        }

        // Update context for next message
        setContextMessages((prev) => [messageText, ...prev].slice(0, 5));
      } catch (error) {
        console.error("Error generating AI response:", error);

        // Send error message
        const errorMessage: IMessage = {
          _id: Math.random().toString(),
          text:
            msgLanguage === "urdu"
              ? "معذرت، مجھے جواب دینے میں مسئلہ ہو رہا ہے۔ براہ کرم دوبارہ کوشش کریں۔"
              : "Sorry, I'm having trouble responding. Please try again.",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: msgLanguage === "urdu" ? "ٹورا" : "Tora",
            avatar: require("@/assets/png/logo.png"),
          },
        };
        setMessages((prev) =>
          [errorMessage, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      } finally {
        setIsTyping(false);
      }
    },
    [currentSession, enableStorage, enableVoice]
  );

  // ============ VOICE HANDLING ============
  const handleVoiceRecord = useCallback(async () => {
    if (isRecording) {
      await VoiceService.stopSpeech();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Implement actual voice recording here
      // For now, simulate with a sample transcription
      setTimeout(async () => {
        const result = await VoiceService.transcribeVoiceInput("", language);
        if (result.text) {
          const userMessage: IMessage = {
            _id: Math.random().toString(),
            text: result.text,
            createdAt: new Date(),
            user: {
              _id: 1,
              name: userName,
            },
          };
          await handleSendMessage([userMessage]);
        }
        setIsRecording(false);
      }, 3000);
    }
  }, [isRecording, language, userName, handleSendMessage]);

  // ============ CONTEXT BUILDING ============
  const buildSystemContext = useCallback(
    (userMessage: string, msgLanguage: "english" | "urdu"): string => {
      const baseContext =
        msgLanguage === "urdu"
          ? `آپ ٹورا ہیں، HealthNest کے لیے AI ہیلتھ اسسٹنٹ۔
- صارف: ${userName}
- سیاق: ${chatContext}
- پچھلے سوالات: ${contextMessages.join(", ") || "کوئی نہیں"}
- آپ سادہ اردو میں جوابات دیں
- اگر خطرناک ہو تو ڈاکٹر سے ملنے کو کہیں
- ہمیشہ یاد دلائیں کہ آپ AI ہیں، ڈاکٹر نہیں

صارف کا سوال: ${userMessage}`
          : `You are Tora, an AI Health Assistant for HealthNest.
- User: ${userName}
- Context: ${chatContext}
- Previous questions: ${contextMessages.join(", ") || "None"}
- Provide simple, clear explanations
- Recommend doctor consultation for serious conditions
- Always remind that you're an AI, not a doctor

User's question: ${userMessage}`;

      return baseContext;
    },
    [userName, chatContext, contextMessages]
  );

  // ============ UTILITY FUNCTIONS ============
  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "english" ? "urdu" : "english"));
  }, []);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    setContextMessages([]);

    if (enableStorage && currentSession) {
      try {
        await ChatStorageService.deleteChatSession(currentSession.id);
        setCurrentSession(null);
      } catch (error) {
        console.error("Error clearing session:", error);
      }
    }
  }, [currentSession, enableStorage]);

  const getContextSummary = useCallback(() => {
    return {
      totalMessages: messages.length,
      currentLanguage: language,
      chatContext,
      recentQuestions: contextMessages,
      isRecording,
      isTyping,
    };
  }, [messages.length, language, chatContext, contextMessages, isRecording, isTyping]);

  return {
    // State
    messages,
    isTyping,
    language,
    isRecording,
    currentSession,
    contextMessages,

    // Actions
    handleSendMessage,
    handleVoiceRecord,
    toggleLanguage,
    clearMessages,
    generateAIResponse,

    // Utilities
    getContextSummary,
    setLanguage,
  };
};
