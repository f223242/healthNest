import { colors, Fonts } from '@/constant/theme';
import { generateImageResponse, generateResponse } from '@/services/GeminiService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Bubble, Day, GiftedChat, IMessage, InputToolbar, Send, Time } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface ToraAIChatProps {
  chatContext?: 'nurse' | 'medicine-delivery' | 'general' | 'person';
  userName?: string;
  personName?: string;
  personAvatar?: string;
  isAI?: boolean;

  // Real Chat Props
  mode?: 'ai' | 'real';
  messages?: IMessage[];
  onSend?: (messages: IMessage[]) => void;
  user?: { _id: string | number; name?: string; avatar?: string };
}

const ToraAIChat: React.FC<ToraAIChatProps> = ({
  chatContext = 'general',
  userName = 'User',
  personName,
  personAvatar,
  isAI = true,
  mode = 'ai',
  messages: realMessages = [],
  onSend: onSendReal,
  user: realUser,
}) => {
  const [aiMessages, setAiMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const insets = useSafeAreaInsets();

  // Active messages based on mode
  const displayMessages = mode === 'real' ? realMessages : aiMessages;

  useEffect(() => {
    if (mode === 'real') return;

    // Initial greeting based on context for AI
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

    setAiMessages([
      {
        _id: 1,
        text: getInitialMessage(),
        createdAt: new Date(),
        user: chatUser,
      },
    ]);
  }, [chatContext, userName, isAI, personName, personAvatar, mode]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    if (mode === 'real') {
      if (onSendReal) {
        onSendReal(newMessages);
      }
      return;
    }

    setAiMessages((previousMessages) =>
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
        setAiMessages((previousMessages) => GiftedChat.append(previousMessages, [responseMessage]));
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

      setAiMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [responseMessage])
      );
      setIsTyping(false);
    }).catch(err => {
      console.error("AI Error:", err);
      setIsTyping(false);
    });

  }, [chatContext, isAI, personName, personAvatar, mode, onSendReal]);

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
      setAiMessages((previousMessages) =>
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
            setAiMessages((prev) => GiftedChat.append(prev, [aiResponse]));
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
    // ... similar to pickImage logic
  };

  const showImageOptions = () => {
    pickImage();
  };

  const handleVoicePress = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording((current) => (current ? false : current));
      }, 60000);
    }
  };

  const renderBubble = (props: any) => {
    const { key, ...restProps } = props;
    return (
      <Bubble
        key={key}
        {...restProps}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
            borderBottomRightRadius: 6,
            borderTopRightRadius: 18,
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: 18,
            paddingVertical: 2,
            paddingHorizontal: 4,
            marginBottom: 4,
            marginRight: 8,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 5,
            elevation: 4,
            maxWidth: '80%',
          },
          left: {
            backgroundColor: colors.white,
            borderBottomLeftRadius: 6,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderBottomRightRadius: 18,
            paddingVertical: 2,
            paddingHorizontal: 4,
            marginBottom: 4,
            marginLeft: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
            maxWidth: '80%',
            borderWidth: 1,
            borderColor: '#F0F0F0',
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

  const renderAvatar = (props: any) => {
    const { currentMessage } = props;
    const avatar = currentMessage?.user?.avatar;
    
    if (currentMessage?.user?._id === 1) {
      // Don't show avatar for current user
      return null;
    }

    return (
      <View style={styles.avatarContainer}>
        {typeof avatar === 'number' ? (
          <Image source={avatar} style={styles.avatar} />
        ) : avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Ionicons name="person" size={18} color={colors.white} />
          </View>
        )}
      </View>
    );
  };

  const renderDay = (props: any) => {
    return (
      <Day
        {...props}
        textStyle={styles.dayText}
        wrapperStyle={styles.dayWrapper}
      />
    );
  };

  const renderTime = (props: any) => {
    return (
      <Time
        {...props}
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
        {mode !== 'real' && (
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
        )}

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
        renderActions={mode === 'real' ? undefined : () => (
          <TouchableOpacity onPress={showImageOptions} style={styles.attachButton}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Animatable.View animation="fadeIn" delay={300}>
        <LinearGradient
          colors={[colors.lightGreen, colors.lightGreen]}
          style={styles.emptyIconContainer}
        >
          <Ionicons name="chatbubbles-outline" size={48} color={colors.primary} />
        </LinearGradient>
        <Text style={styles.emptyTitle}>Start a Conversation</Text>
        <Text style={styles.emptySubtitle}>
          {mode === 'real' ? 'Say hello to get started!' : 'Ask me anything about your health!'}
        </Text>
      </Animatable.View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
    >
      <GiftedChat
        messages={displayMessages}
        onSend={(messages) => onSend(messages)}
        user={mode === 'real' && realUser ? realUser : {
          _id: 1,
          name: userName,
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        renderAvatar={renderAvatar}
        renderDay={renderDay}
        renderTime={renderTime}
        renderChatEmpty={renderEmpty}
        isTyping={mode === 'real' ? false : isTyping}
        messagesContainerStyle={styles.messagesContainer}
        minInputToolbarHeight={70}
        textInputProps={{ 
          style: styles.textInput,
          placeholderTextColor: colors.gray,
          placeholder: mode === 'real' ? 'Type a message...' : 'Ask Tora anything...',
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  innerContainer: {
    flex: 1,
  },
  messagesContainer: {
    backgroundColor: '#F5F7FA',
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  inputToolbar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'android' ? 14 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  inputPrimary: {
    backgroundColor: '#F5F7FA',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minHeight: 50,
  },
  textInput: {
    color: colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
  },
  attachButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    marginLeft: 4,
  },
  sendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    marginRight: 6,
  },
  recordingButton: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1.5,
    borderColor: '#FF4444',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.white,
  },
  defaultAvatar: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayWrapper: {
    marginVertical: 16,
  },
  dayText: {
    color: colors.gray,
    fontSize: 12,
    fontFamily: Fonts.medium,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    transform: [{ scaleY: -1 }],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollToBottomContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
});

export default ToraAIChat;