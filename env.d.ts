/// <reference types="expo/types" />

declare module '@env' {
  export const EXPO_PUBLIC_HUGGINGFACE_API_KEY: string;
  export const EXPO_PUBLIC_VOICE_ENABLED: string;
  export const EXPO_PUBLIC_VOICE_SYNTHESIS_RATE: string;
  export const EXPO_PUBLIC_VOICE_SYNTHESIS_PITCH: string;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';