import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';

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

    // Simulate response
    setIsTyping(true);
    setTimeout(() => {
      let responseText = '';
      
      if (!isAI) {
        // Delivery person response
        responseText = "I'll help you with that right away!";
      } else {
        // AI response
        const userMessage = newMessages[0].text.toLowerCase();

        if (chatContext === 'nurse') {
          if (userMessage.includes('fever') || userMessage.includes('temperature')) {
            responseText = "I understand you're experiencing fever. It's important to monitor your temperature. If it's above 101°F (38.3°C) or persistent, I recommend consulting with our nursing staff. Would you like me to schedule a nurse consultation?";
          } else if (userMessage.includes('pain')) {
            responseText = "I'm sorry to hear you're in pain. Can you describe where the pain is located and its intensity on a scale of 1-10? This will help me provide better guidance.";
          } else {
            responseText = "I'm here to help with your health concerns. Could you provide more details about your symptoms or what you need assistance with?";
          }
        } else if (chatContext === 'medicine-delivery') {
          if (userMessage.includes('track') || userMessage.includes('order')) {
            responseText = "I can help you track your medicine delivery. Your order #MD12345 is currently in transit and expected to arrive today by 5 PM. You'll receive a notification when it's out for delivery.";
          } else if (userMessage.includes('reorder') || userMessage.includes('refill')) {
            responseText = "I can help you reorder your medications. Which medicine would you like to refill? I can pull up your recent orders if that helps.";
          } else {
            responseText = "I can assist you with medicine delivery tracking, reorders, and medication information. What would you like to know?";
          }
        } else {
          responseText = "Thank you for your message. I'm processing your request and will provide you with the best assistance. Is there anything specific you'd like to know?";
        }
      }

      const responseUser = isAI
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
    }, isAI ? 1500 : 1000);
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
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const imageMessage: IMessage = {
        _id: Math.random().toString(),
        text: "",
        createdAt: new Date(),
        user: {
          _id: 1,
          name: userName,
        },
        image: result.assets[0].uri,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [imageMessage])
      );

      // Simulate AI response to image
      setIsTyping(true);
      setTimeout(() => {
        const responseUser = isAI
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

        const aiResponse: IMessage = {
          _id: Math.random().toString(),
          text: isAI 
            ? "I've received your image. Let me analyze it... Based on what I can see, I'll do my best to assist you. Could you provide more context about what you'd like me to help with?"
            : "Thanks for the image! I can see it clearly.",
          createdAt: new Date(),
          user: responseUser,
        };
        setMessages((prev) => GiftedChat.append(prev, [aiResponse]));
        setIsTyping(false);
      }, 2000);
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
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const imageMessage: IMessage = {
        _id: Math.random().toString(),
        text: "",
        createdAt: new Date(),
        user: {
          _id: 1,
          name: userName,
        },
        image: result.assets[0].uri,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [imageMessage])
      );

      // Simulate AI response to image
      setIsTyping(true);
      setTimeout(() => {
        const responseUser = isAI
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

        const aiResponse: IMessage = {
          _id: Math.random().toString(),
          text: isAI
            ? "Thank you for sharing the photo. I'm analyzing it now. How can I help you with this?"
            : "Got the photo! Let me check what I can do.",
          createdAt: new Date(),
          user: responseUser,
        };
        setMessages((prev) => GiftedChat.append(prev, [aiResponse]));
        setIsTyping(false);
      }, 2000);
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
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
          },
          left: {
            backgroundColor: colors.lightGreen,
          },
        }}
        textStyle={{
          right: {
            color: colors.white,
            fontFamily: Fonts.regular,
          },
          left: {
            color: colors.black,
            fontFamily: Fonts.regular,
          },
        }}
      />
    );
  };

  const renderSend = (props: any) => {
    // const showVoice = chatContext !== 'medicine-delivery' && chatContext !== 'person';
    return (
      <View style={styles.sendRow}>
        { (
          <TouchableOpacity
            onPress={handleVoicePress}
            style={[styles.actionButton, isRecording && styles.recordingButton, { marginRight: 8 }]}
          >
            <Ionicons name={isRecording ? 'stop-circle' : 'mic'} size={20} color={isRecording ? colors.white : colors.primary} />
          </TouchableOpacity>
        )}
        <Send {...props} containerStyle={styles.sendContainer}>
          <LinearGradient
            colors={[colors.primary, '#00D68F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </LinearGradient>
        </Send>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    // const showVoice = chatContext !== 'medicine-delivery' && chatContext !== 'person';
    
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
        textInputStyle={styles.textInput}
        textInputProps={{
          ...props.textInputProps,
          placeholderTextColor: '#BDBDBD',
          style: {
            ...props.textInputProps?.style,
            color: colors.black ,
          },
        }}
        renderActions={() => (
          <TouchableOpacity onPress={showImageOptions} style={styles.plusButton}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.white,
  },
  messagesContainer: {
    backgroundColor: colors.white,
  
  },
  inputToolbar: {
    backgroundColor: colors.lightGray,
    borderRadius: 32,
    elevation: 2,
    marginBottom: 10,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  
  },
  inputPrimary: {
    alignItems: 'center',
  },
  textInput: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: '#E6E6E6',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
    
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 5,
    
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
   
  },
  sendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.lightGreen,
  },
  recordingButton: {
    backgroundColor: '#FF4444',
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    marginRight: 8,
  },
});

export default ToraAIChat;