import { colors, Fonts } from '@/constant/theme';
import { generateImageResponse, generateResponse } from '@/services/GeminiService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToraAIChatProps {
  chatContext: 'nurse' | 'medicine-delivery' | 'general' | 'person';
  userName?: string;
  personName?: string;
  personAvatar?: string;
  isAI?: boolean;
}

const ToraAIChat: React.FC<ToraAIChatProps> = ({
  chatContext,
  userName = 'User',
  personName,
  personAvatar,
  isAI = true
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Initial greeting based on context
    const getInitialMessage = () => {
      if (!isAI && personName) {
        return `Hello! How can I help you with your medicine delivery?`;
      }

      switch (chatContext) {
        case 'nurse':
          return `Hello ${userName}! I'm Tora, your AI health assistant. I can help you with medical advice, symptoms analysis, and connect you with our nursing staff. How can I assist you today?`;
        case 'medicine-delivery':
          return `Hi ${userName}! I'm Tora, your AI assistant. I can help you track your medicine delivery, answer questions about your medications, and assist with reorders. What do you need help with?`;
        default:
          return `Welcome ${userName}! I'm Tora, your AI health companion. I'm here to help with your health questions, appointments, and medical needs. How can I help you today?`;
      }
    };

    const chatUser = isAI
      ? {
        _id: 2,
        name: 'Tora',
        avatar: require('@/assets/png/logo.png'),
      }
      : {
        _id: 2,
        name: personName || 'Support',
        avatar: personAvatar,
      };

    setMessages([
      {
        _id: 1,
        text: getInitialMessage(),
        createdAt: new Date(),
        user: chatUser,
      },
    ]);
  }, [chatContext, userName, isAI, personName, personAvatar]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    // AI Response Logic
    setIsTyping(true);

    const userMessage = newMessages[0].text;

    // Construct System Context
    let systemContext = "";
    switch (chatContext) {
      case 'nurse':
        systemContext = `You are Tora, an expert AI nurse assistant. Your goal is to help users with medical advice, symptom analysis, and general health questions. Be professional, empathetic, and concise. If a symptom sounds serious (like high fever, severe pain, breathing issues), assume a triage role and suggest they consult a doctor immediately. Current user: ${userName}.`;
        break;
      case 'medicine-delivery':
        systemContext = `You are Tora, a medicine delivery support assistant. You help track orders, answer questions about medications, and assist with reorders. Be helpful and polite. Assume you have access to order #MD12345 which is arriving today by 5 PM. Current user: ${userName}.`;
        break;
      default:
        systemContext = `You are Tora, a friendly and knowledgeable personal health companion. You help with general health questions, appointments, and wellness advice. Be encouraging and supportive. Current user: ${userName}.`;
        break;
    }

    if (!isAI) {
      // Fallback for non-AI human support simulation
      setTimeout(() => {
        const responseMessage: IMessage = {
          _id: Math.random().toString(),
          text: "I'll help you with that right away!",
          createdAt: new Date(),
          user: { _id: 2, name: personName || 'Support', avatar: personAvatar },
        };
        setMessages((previousMessages) => GiftedChat.append(previousMessages, [responseMessage]));
        setIsTyping(false);
      }, 1000);
      return;
    }

    // Call Gemini API
    generateResponse(userMessage, systemContext).then((responseText) => {
      const responseUser = {
        _id: 2,
        name: 'Tora',
        avatar: require('@/assets/png/logo.png'),
      };

      const responseMessage: IMessage = {
        _id: Math.random().toString(),
        text: responseText,
        createdAt: new Date(),
        user: responseUser,
      };

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [responseMessage])
      );
      setIsTyping(false);
    }).catch(err => {
      console.error("AI Error:", err);
      setIsTyping(false);
    });

  }, [chatContext, isAI, personName, personAvatar]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to send images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true, // Request base64 for Gemini
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const imageMessage: IMessage = {
        _id: Math.random().toString(),
        text: "",
        createdAt: new Date(),
        user: {
          _id: 1,
          name: userName,
        },
        image: asset.uri,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [imageMessage])
      );

      if (isAI && asset.base64) {
        setIsTyping(true);
        generateImageResponse("Analyze this medical related image and describe what it might indicate. Be cautious and advise consulting a doctor.", asset.base64)
          .then(responseText => {
            const aiResponse: IMessage = {
              _id: Math.random().toString(),
              text: responseText,
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'Tora',
                avatar: require('@/assets/png/logo.png'),
              },
            };
            setMessages((prev) => GiftedChat.append(prev, [aiResponse]));
            setIsTyping(false);
          })
          .catch(err => {
            console.error("Image Analysis Error", err);
            setIsTyping(false);
          });
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const imageMessage: IMessage = {
        _id: Math.random().toString(),
        text: "",
        createdAt: new Date(),
        user: {
          _id: 1,
          name: userName,
        },
        image: asset.uri,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [imageMessage])
      );

      if (isAI && asset.base64) {
        setIsTyping(true);
        generateImageResponse("Analyze this medical/health related photo.", asset.base64)
          .then(responseText => {
            const aiResponse: IMessage = {
              _id: Math.random().toString(),
              text: responseText,
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'Tora',
                avatar: require('@/assets/png/logo.png'),
              },
            };
            setMessages((prev) => GiftedChat.append(prev, [aiResponse]));
            setIsTyping(false);
          })
          .catch(err => {
            console.error("Camera Image Analysis Error", err);
            setIsTyping(false);
          });
      }
    }
  };

  const showImageOptions = () => {
    // Open image picker directly to avoid dismissing keyboard
    pickImage();
  };

  const handleVoicePress = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
    } else {
      // Start recording
      setIsRecording(true);
      // Auto stop after 60 seconds
      setTimeout(() => {
        setIsRecording((current) => (current ? false : current));
      }, 60000);
    }
  };

  const renderBubble = (props: any) => {
    // Destructure key to avoid spread warning
    const { key, ...restProps } = props;
    return (
      <Bubble
        key={key}
        {...restProps}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
            borderBottomRightRadius: 4,
            borderTopRightRadius: 16,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            padding: 2,
            marginBottom: 2,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          },
          left: {
            backgroundColor: colors.white,
            borderBottomLeftRadius: 4,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            padding: 2,
            marginBottom: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            marginLeft: -4,
          },
        }}
        textStyle={{
          right: {
            color: colors.white,
            fontFamily: Fonts.regular,
            fontSize: 15,
            lineHeight: 22,
          },
          left: {
            color: colors.text,
            fontFamily: Fonts.regular,
            fontSize: 15,
            lineHeight: 22,
          },
        }}
        timeTextStyle={{
          right: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10, fontFamily: Fonts.regular },
          left: { color: colors.gray, fontSize: 10, fontFamily: Fonts.regular },
        }}
      />
    );
  };

  const renderSend = (props: any) => {
    const { key, ...restProps } = props;
    return (
      <View style={styles.sendRow}>
        <TouchableOpacity
          onPress={handleVoicePress}
          style={[styles.actionButton, isRecording && styles.recordingButton]}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={20}
            color={isRecording ? colors.white : colors.primary}
          />
        </TouchableOpacity>

        <Send {...restProps} key={key} containerStyle={styles.sendContainer}>
          <LinearGradient
            colors={[colors.primary, '#00D68F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Ionicons name="send" size={18} color={colors.white} style={{ marginLeft: 2 }} />
          </LinearGradient>
        </Send>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    const { key, ...restProps } = props;
    return (
      <InputToolbar
        key={key}
        {...restProps}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
        renderActions={() => (
          <TouchableOpacity onPress={showImageOptions} style={styles.attachButton}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
          name: userName,
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        isTyping={isTyping}
        messagesContainerStyle={styles.messagesContainer}
        alwaysShowSend
        scrollToBottom
        minInputToolbarHeight={60}
        bottomOffset={Platform.OS === 'ios' ? 15 : 0} // Adjustment for better spacing
        keyboardShouldPersistTaps="never"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Softer background
  },
  messagesContainer: {
    backgroundColor: '#F8F9FA',
    paddingBottom: 20,
  },
  inputToolbar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  inputPrimary: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    marginLeft: 4,
    marginBottom: 4,
  },
  sendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 4,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    marginRight: 4,
  },
  recordingButton: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
});

export default ToraAIChat;