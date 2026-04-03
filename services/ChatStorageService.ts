// Chat Storage Service - Manages persistent chat history
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMessage } from "react-native-gifted-chat";

// Environment variables with fallback defaults
const EXPO_PUBLIC_CHAT_HISTORY_LIMIT = process.env.EXPO_PUBLIC_CHAT_HISTORY_LIMIT || "100";
const EXPO_PUBLIC_CHAT_AUTO_SAVE_INTERVAL = process.env.EXPO_PUBLIC_CHAT_AUTO_SAVE_INTERVAL || "30000";

export interface ChatSession {
  id: string;
  name: string;
  context: "nurse" | "medicine-delivery" | "general" | "person" | "lab-report";
  language: "english" | "urdu";
  messages: IMessage[];
  createdAt: number;
  updatedAt: number;
  summary?: string;
}

const STORAGE_KEYS = {
  CHAT_SESSIONS: "chat_sessions",
  CURRENT_SESSION: "current_chat_session",
  SESSION_PREFIX: "chat_session_",
  PREFERENCES: "chat_preferences",
};

export class ChatStorageService {
  static async saveChatSession(session: ChatSession): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.SESSION_PREFIX}${session.id}`;
      
      // Limit message history
      const maxMessages = parseInt(EXPO_PUBLIC_CHAT_HISTORY_LIMIT || "100");
      const limitedMessages = session.messages.slice(-maxMessages);
      
      const sessionToSave = {
        ...session,
        messages: limitedMessages,
        updatedAt: Date.now(),
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(sessionToSave));
      
      // Update session list
      await this.updateSessionsList(session.id, session.name);
    } catch (error) {
      console.error("Error saving chat session:", error);
      throw error;
    }
  }

  static async loadChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const key = `${STORAGE_KEYS.SESSION_PREFIX}${sessionId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (!data) return null;
      
      return JSON.parse(data) as ChatSession;
    } catch (error) {
      console.error("Error loading chat session:", error);
      return null;
    }
  }

  static async getAllSessions(): Promise<ChatSession[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.SESSION_PREFIX));
      
      const sessions: ChatSession[] = [];
      for (const key of sessionKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          sessions.push(JSON.parse(data) as ChatSession);
        }
      }
      
      // Sort by most recent
      return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error("Error loading all sessions:", error);
      return [];
    }
  }

  static async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.SESSION_PREFIX}${sessionId}`;
      await AsyncStorage.removeItem(key);
      
      // Update session list
      const sessions = await this.getAllSessions();
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHAT_SESSIONS,
        JSON.stringify(sessions.map(s => ({ id: s.id, name: s.name, updatedAt: s.updatedAt })))
      );
    } catch (error) {
      console.error("Error deleting chat session:", error);
      throw error;
    }
  }

  static async clearAllSessions(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.SESSION_PREFIX));
      
      await AsyncStorage.multiRemove(sessionKeys);
      await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_SESSIONS);
    } catch (error) {
      console.error("Error clearing all sessions:", error);
      throw error;
    }
  }

  private static async updateSessionsList(sessionId: string, sessionName: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const sessionsList = sessions.map((s) => ({
        id: s.id,
        name: s.name,
        updatedAt: s.updatedAt,
      }));
      
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessionsList));
    } catch (error) {
      console.error("Error updating sessions list:", error);
    }
  }

  static async setCurrentSession(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    } catch (error) {
      console.error("Error setting current session:", error);
    }
  }

  static async getCurrentSession(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  static async createNewSession(
    context: "nurse" | "medicine-delivery" | "general" | "person" | "lab-report",
    language: "english" | "urdu" = "english"
  ): Promise<ChatSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      id: sessionId,
      name: `Chat - ${new Date().toLocaleDateString()}`,
      context,
      language,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await this.saveChatSession(session);
    await this.setCurrentSession(sessionId);
    
    return session;
  }

  static async addMessageToSession(sessionId: string, message: IMessage): Promise<void> {
    try {
      const session = await this.loadChatSession(sessionId);
      
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      
      session.messages.push(message);
      session.updatedAt = Date.now();
      
      await this.saveChatSession(session);
    } catch (error) {
      console.error("Error adding message to session:", error);
      throw error;
    }
  }

  static async getSessionMessages(sessionId: string): Promise<IMessage[]> {
    try {
      const session = await this.loadChatSession(sessionId);
      return session?.messages || [];
    } catch (error) {
      console.error("Error getting session messages:", error);
      return [];
    }
  }

  static async saveUserPreferences(preferences: {
    language?: "english" | "urdu";
    defaultContext?: "nurse" | "medicine-delivery" | "general" | "person" | "lab-report";
    voiceEnabled?: boolean;
    autosaveEnabled?: boolean;
  }): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      const current = existing ? JSON.parse(existing) : {};
      const updated = { ...current, ...preferences, updatedAt: Date.now() };
      
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  }

  static async getUserPreferences(): Promise<{
    language?: "english" | "urdu";
    defaultContext?: string;
    voiceEnabled?: boolean;
    autosaveEnabled?: boolean;
  } | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting preferences:", error);
      return null;
    }
  }

  static async exportChatHistory(sessionId?: string): Promise<string> {
    try {
      let sessions: ChatSession[] = [];
      
      if (sessionId) {
        const session = await this.loadChatSession(sessionId);
        if (session) sessions = [session];
      } else {
        sessions = await this.getAllSessions();
      }
      
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.error("Error exporting chat history:", error);
      throw error;
    }
  }

  static async getStorageStats(): Promise<{
    totalSessions: number;
    totalMessages: number;
    oldestSession: ChatSession | null;
    newestSession: ChatSession | null;
    storageSize: number;
  }> {
    try {
      const sessions = await this.getAllSessions();
      let totalMessages = 0;
      
      for (const session of sessions) {
        totalMessages += session.messages.length;
      }
      
      const keys = await AsyncStorage.getAllKeys();
      let storageSize = 0;
      
      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          storageSize += data.length;
        }
      }
      
      return {
        totalSessions: sessions.length,
        totalMessages,
        oldestSession: sessions.length > 0 ? sessions[sessions.length - 1] : null,
        newestSession: sessions.length > 0 ? sessions[0] : null,
        storageSize,
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        totalSessions: 0,
        totalMessages: 0,
        oldestSession: null,
        newestSession: null,
        storageSize: 0,
      };
    }
  }

  static async optimizeStorage(): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const maxSessions = 50;
      
      // Delete oldest sessions if exceeding limit
      if (sessions.length > maxSessions) {
        const sessionsToDelete = sessions.slice(maxSessions);
        for (const session of sessionsToDelete) {
          await this.deleteChatSession(session.id);
        }
      }
      
      // Clean up messages in each session
      const maxMessages = parseInt(EXPO_PUBLIC_CHAT_HISTORY_LIMIT || "100");
      for (const session of sessions) {
        if (session.messages.length > maxMessages) {
          session.messages = session.messages.slice(-maxMessages);
          await this.saveChatSession(session);
        }
      }
    } catch (error) {
      console.error("Error optimizing storage:", error);
    }
  }
}
