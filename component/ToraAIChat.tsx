import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Animatable from "react-native-animatable";
import {
  Bubble,
  Day,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
  Time,
} from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";

// Import services
import { useToraAIChat } from "@/hooks/useToraAIChat";
import { validateChatMessage } from "@/services/InputValidationService";
import {
  analyzeLabReport,
  recommendDoctor,
  translateToUrdu,
} from "@/services/HuggingFaceService";
import { VoiceService } from "@/services/VoiceTranslationService";

interface CustomMessage extends IMessage {
  edited?: boolean;
  editedAt?: Date;
}

interface ToraAIChatProps {
  chatContext?: "nurse" | "medicine-delivery" | "general" | "person" | "lab-report";
  userName?: string;
  personName?: string;
  personAvatar?: string;
  isAI?: boolean;
  mode?: "ai" | "real";
  messages?: CustomMessage[];
  onSend?: (messages: CustomMessage[]) => void;
  user?: { _id: string | number; name?: string; avatar?: string };
}

const QUICK_SUGGESTIONS = {
  english: [
    { text: "I have fever", icon: "🌡️" },
    { text: "My glucose is 280", icon: "🩸" },
    { text: "I have headache", icon: "🤕" },
    { text: "What doctor for diabetes?", icon: "🩺" },
    { text: "Analyze my lab report", icon: "📄" },
    { text: "Medicine for cough", icon: "💊" },
  ],
  urdu: [
    { text: "مجھے بخار ہے", icon: "🌡️" },
    { text: "میری شوگر 280 ہے", icon: "🩸" },
    { text: "مجھے سر درد ہے", icon: "🤕" },
    { text: "شوگر کے لیے کون سا ڈاکٹر؟", icon: "🩺" },
    { text: "لیب رپورٹ دیکھیں", icon: "📄" },
    { text: "کھانسی کی دوا", icon: "💊" },
  ],
};

const ToraAIChat: React.FC<ToraAIChatProps> = ({
  chatContext = "general",
  userName = "User",
  personName,
  personAvatar,
  isAI = true,
  mode = "ai",
  messages: realMessages = [],
  onSend: onSendReal,
  user: realUser,
}) => {
  const {
    messages: aiMessages,
    isTyping,
    language,
    isRecording,
    handleSendMessage,
    handleVoiceRecord,
    toggleLanguage,
  } = useToraAIChat({
    chatContext: chatContext as any,
    userName,
    enableStorage: true,
    enableVoice: true,
  });

  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isLocallyRecording, setIsLocallyRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [inputText, setInputText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<CustomMessage | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [editMessageText, setEditMessageText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const flatListRef = useRef<any>(null);

  const displayMessages = mode === "real" ? realMessages : aiMessages;

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  useEffect(() => {
    if (flatListRef.current && displayMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd?.({ animated: true });
      }, 100);
    }
  }, [displayMessages]);

  useEffect(() => {
    if (inputText.length > 0) {
      setShowSuggestions(false);
    }
  }, [inputText]);

  // ============ VOICE RECORDING ============
  const handleVoicePress = async () => {
    if (isLocallyRecording) {
      setIsLocallyRecording(false);
      try {
        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setRecording(null);

          if (uri) {
            const result = await VoiceService.transcribeVoiceInput(uri, language);
            if (result.text) {
              setInputText(result.text);
            }
          }
        }
      } catch (error) {
        Alert.alert("Error", language === "urdu" ? "وائس پروسیسنگ میں خرابی" : "Failed to process voice");
      }
    } else {
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status === 'granted') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
          const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );
          setRecording(newRecording);
          setIsLocallyRecording(true);
        }
      } catch (error) {
        Alert.alert('Error', language === "urdu" ? "ریکارڈنگ شروع کرنے میں خرابی" : "Failed to start recording");
      }
    }
  };

  const activeRecording = isLocallyRecording;

  // ============ MESSAGE ACTIONS ============
  const copyMessage = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(
      language === "urdu" ? "✅ کاپی ہوگیا" : "✅ Copied",
      language === "urdu" ? "پیغام کاپی ہوگیا" : "Message copied!"
    );
    setShowMessageActions(false);
  };

  const translateMessage = async (text: string) => {
    try {
      const urduText = await translateToUrdu(text);
      Alert.alert(
        language === "urdu" ? "📝 اردو ترجمہ" : "📝 Urdu Translation",
        urduText,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", language === "urdu" ? "ترجمہ ناکام ہوگیا" : "Translation failed");
    }
    setShowMessageActions(false);
  };

  const speakMessage = async (text: string) => {
    try {
      await Speech.speak(text, {
        language: language === "urdu" ? "ur-PK" : "en-US",
        rate: 0.9,
        pitch: 1.0,
      });
    } catch (error) {
      Alert.alert("Error", language === "urdu" ? "وائس میں پڑھنے میں خرابی" : "Failed to speak");
    }
    setShowMessageActions(false);
  };

  const editMessage = () => {
    if (selectedMessage) {
      setEditMessageText(selectedMessage.text);
      setShowEditModal(true);
      setShowMessageActions(false);
    }
  };

  const saveEditedMessage = async () => {
    if (!selectedMessage || !editMessageText.trim()) return;

    const editedMessage: CustomMessage = {
      ...selectedMessage,
      text: editMessageText.trim(),
      edited: true,
      editedAt: new Date(),
    };

    if (handleSendMessage) {
      await handleSendMessage([editedMessage]);
    }

    setShowEditModal(false);
    setEditMessageText("");
    setSelectedMessage(null);
  };

  const onLongPressMessage = (message: CustomMessage) => {
    setSelectedMessage(message);
    setShowMessageActions(true);
  };

  // ============ LAB REPORT UPLOAD ============
  const handleFileUpload = async (type: 'camera' | 'gallery' | 'document') => {
    setShowUploadOptions(false);
    setUploading(true);

    try {
      let fileUri = '';
      let fileName = '';

      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', language === 'urdu' ? 'کیمرہ تک رسائی ضروری ہے' : 'Camera access is needed');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: true,
        });
        if (!result.canceled && result.assets[0]) {
          fileUri = result.assets[0].uri;
          fileName = `report_${Date.now()}.jpg`;
        }
      } else if (type === 'gallery') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: true,
        });
        if (!result.canceled && result.assets[0]) {
          fileUri = result.assets[0].uri;
          fileName = `report_${Date.now()}.jpg`;
        }
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets[0]) {
          fileUri = result.assets[0].uri;
          fileName = result.assets[0].name || `report_${Date.now()}.pdf`;
        }
      }

      if (!fileUri) {
        setUploading(false);
        return;
      }

      const processingMsg: IMessage = {
        _id: Math.random().toString(),
        text: language === 'urdu' ? '📤 رپورٹ اپ لوڈ ہو رہی ہے...' : '📤 Uploading report...',
        createdAt: new Date(),
        user: { _id: 1, name: userName },
      };

      if (handleSendMessage) {
        await handleSendMessage([processingMsg]);
      }

      setTimeout(async () => {
        const sampleReports = [
          "Hemoglobin: 14 g/dL, Glucose: 280 mg/dL (HIGH), HbA1c: 8.5% (HIGH)",
          "Hemoglobin: 8 g/dL (LOW), RBC: 3.2 million (LOW), Iron: 30 μg/dL (LOW)",
          "Hemoglobin: 12 g/dL, WBC: 18,000 (HIGH), CRP: 45 mg/L (HIGH)",
          "All values normal. Hemoglobin: 14.2, Glucose: 95"
        ];

        const selectedReport = await new Promise<string>((resolve) => {
          Alert.alert(
            language === 'urdu' ? "ڈیمو موڈ" : "Demo Mode",
            language === 'urdu' ? "رپورٹ کی قسم منتخب کریں:" : "Select report type:",
            [
              { text: language === 'urdu' ? "نارمل" : "Normal", onPress: () => resolve(sampleReports[3]) },
              { text: language === 'urdu' ? "شوگر زیادہ" : "Diabetic", onPress: () => resolve(sampleReports[0]) },
              { text: language === 'urdu' ? "خون کی کمی" : "Anemic", onPress: () => resolve(sampleReports[1]) },
              { text: language === 'urdu' ? "انفیکشن" : "Infection", onPress: () => resolve(sampleReports[2]) },
            ],
            { cancelable: false }
          );
        });

        let analysis = await analyzeLabReport(selectedReport, language);
        let finalResponse = analysis;
        let doctorRecommended = false;

        if (analysis.includes('URGENT') || analysis.includes('⚠️') || analysis.includes('immediately')) {
          doctorRecommended = true;
          const doctorRec = await recommendDoctor(selectedReport, language);
          finalResponse += '\n\n' + doctorRec;
        }

        if (language === 'english') {
          try {
            const urduVersion = await translateToUrdu(finalResponse);
            finalResponse += '\n\n**اردو میں:**\n' + urduVersion;
          } catch (err) { }
        }

        const resultMessage: IMessage = {
          _id: Math.random().toString(),
          text: finalResponse,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: language === 'urdu' ? 'ٹورا' : 'Tora',
            avatar: require('@/assets/png/logo.png'),
          },
        };

        if (handleSendMessage) {
          await handleSendMessage([resultMessage]);
        }

        if (doctorRecommended) {
          const bookingMsg: IMessage = {
            _id: Math.random().toString(),
            text: language === 'urdu'
              ? '👨‍⚕️ کیا آپ ڈاکٹر سے ملاقات کا وقت بُک کرنا چاہیں گے؟'
              : '👨‍⚕️ Would you like to book a doctor appointment?',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: language === 'urdu' ? 'ٹورا' : 'Tora',
              avatar: require('@/assets/png/logo.png'),
            },
          };
          if (handleSendMessage) await handleSendMessage([bookingMsg]);
        }
      }, 1500);

    } catch (error) {
      Alert.alert('Error', language === 'urdu' ? 'رپورٹ کو سنبھالنے میں خرابی' : 'Failed to process report');
    } finally {
      setUploading(false);
    }
  };

  // ============ CHAT FUNCTIONS ============
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (mode === "real") {
        if (onSendReal) onSendReal(newMessages);
        return;
      }

      const userMessage = newMessages[0]?.text || '';
      const validation = validateChatMessage(userMessage);

      if (!validation.isValid) {
        Alert.alert('Invalid Message', language === 'urdu' ? 'براہ کرم درست پیغام درج کریں' : 'Please enter a valid message');
        return;
      }

      setShowSuggestions(false);
      setInputText("");
      Keyboard.dismiss();

      if (handleSendMessage) {
        await handleSendMessage(newMessages);
      }
    },
    [mode, onSendReal, handleSendMessage, language]
  );

  const handleSuggestionPress = async (suggestion: string) => {
    setShowSuggestions(false);
    setInputText("");
    const newMessage: IMessage = {
      _id: Math.random().toString(),
      text: suggestion,
      createdAt: new Date(),
      user: { _id: 1, name: userName },
    };
    await onSend([newMessage]);
  };

  const handleTextSend = async () => {
    if (inputText.trim().length === 0) return;
    const newMessage: IMessage = {
      _id: Math.random().toString(),
      text: inputText,
      createdAt: new Date(),
      user: { _id: 1, name: userName },
    };
    await onSend([newMessage]);
    setInputText("");
    Keyboard.dismiss();
  };

  // ============ RENDER FUNCTIONS ============

  const renderBubble = (props: any) => {
    const { currentMessage } = props as { currentMessage: CustomMessage };
    const isUser = currentMessage?.user?._id === 1;
    const isUrdu = language === "urdu" && !isUser;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={() => onLongPressMessage(currentMessage)}
        delayLongPress={300}
        style={[
          styles.bubbleWrapper,
          isUser ? styles.userBubbleWrapper : styles.aiBubbleWrapper
        ]}
      >
        <View>
          <View style={[styles.senderLabel, isUser ? styles.userLabel : styles.aiLabel]}>
            <Text style={[styles.senderLabelText, isUser ? styles.userLabelText : styles.aiLabelText]}>
              {isUser ? (language === 'urdu' ? '👤 آپ' : '👤 You') : (language === 'urdu' ? '🤖 ٹورا' : '🤖 Tora')}
            </Text>
          </View>

          <Bubble
            {...props}
            currentMessage={currentMessage}
            wrapperStyle={{
              right: {
                backgroundColor: colors.primary,
                borderBottomRightRadius: 6,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginBottom: 6,
                marginRight: 8,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 4,
                maxWidth: "80%",
              },
              left: {
                backgroundColor: "#F0F8FF",
                borderBottomLeftRadius: 6,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginBottom: 6,
                marginLeft: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                maxWidth: "80%",
                borderWidth: 1.5,
                borderColor: colors.primary + "25",
              },
            }}
            textStyle={{
              right: {
                color: colors.white,
                fontFamily: Fonts.regular,
                fontSize: 15,
                lineHeight: 22,
                fontWeight: '500',
              },
              left: {
                color: colors.text,
                fontFamily: Fonts.regular,
                fontSize: 15,
                lineHeight: 22,
                textAlign: isUrdu ? "right" : "left",
                fontWeight: '500',
              },
            }}
            timeTextStyle={{
              right: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: '600' },
              left: { color: colors.gray, fontSize: 11, fontWeight: '600' },
            }}
          />

          {currentMessage?.edited && (
            <Text style={[styles.editedBadge, isUser ? styles.editedRight : styles.editedLeft]}>
              ✏️ {language === "urdu" ? "ترمیم شدہ" : "edited"}
            </Text>
          )}

          {!isUser && (
            <TouchableOpacity onPress={() => translateMessage(currentMessage.text)} style={styles.translateInlineBtn}>
              <Ionicons name="language" size={14} color={colors.primary} />
              <Text style={styles.translateInlineBtnText}>Translate to Urdu</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAvatar = (props: any) => {
    const { currentMessage } = props;
    if (currentMessage?.user?._id === 1) return null;
    return (
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, styles.defaultAvatar]}>
          <Ionicons name="medkit-outline" size={20} color={colors.white} />
        </View>
      </View>
    );
  };

  const renderSend = (props: any) => {
    return (
      <View style={styles.sendRow}>
        {mode !== "real" && (
          <>
            <TouchableOpacity
              onPress={handleVoicePress}
              style={[
                styles.voiceButton,
                activeRecording && styles.recordingButton
              ]}
              disabled={uploading}
            >
              <Ionicons
                name={activeRecording ? "stop-circle" : "mic-circle-outline"}
                size={28}
                color={activeRecording ? "#FF4444" : colors.primary}
              />
            </TouchableOpacity>
            {activeRecording && (
              <View style={styles.recordingIndicator}>
                <Animatable.View
                  style={styles.recordingDot}
                  animation="pulse"
                  iterationCount="infinite"
                  duration={1000}
                />
                <Text style={styles.recordingText}>REC</Text>
              </View>
            )}
          </>
        )}
        <Send {...props} containerStyle={styles.sendContainer}>
          <LinearGradient
            colors={[colors.primary, "#00D68F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </LinearGradient>
        </Send>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
        renderActions={() => (
          <TouchableOpacity
            onPress={() => setShowUploadOptions(true)}
            style={styles.attachButton}
          >
            <Ionicons name="attach" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    );
  };

  const renderDay = (props: any) => (
    <Day {...props} textStyle={styles.dayText} wrapperStyle={styles.dayWrapper} />
  );

  const renderTime = (props: any) => (
    <Time {...props} timeTextStyle={{ left: { color: colors.gray, fontSize: 10 } }} />
  );

  // FIXED: Proper empty state without inversion
  const renderEmpty = () => (
    <View style={[styles.emptyContainer, { transform: [{ scaleY: -1 }] }]}>
      <Animatable.View animation="fadeIn" duration={800} delay={200} style={styles.emptyContent}>
        <LinearGradient
          colors={[colors.lightGreen, "#E8F8F5"]}
          style={styles.emptyIconContainer}
        >
          <Ionicons name="chatbubbles" size={56} color={colors.primary} />
        </LinearGradient>
        <Text style={styles.emptyTitle}>
          {language === "urdu" ? "👋 بات چیت شروع کریں" : "👋 Start a Conversation"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {language === "urdu"
            ? "اپنی صحت کے بارے میں سوالات پوچھیں یا لیب رپورٹ اپ لوڈ کریں"
            : "Ask about your health or upload a lab report"}
        </Text>
      </Animatable.View>
    </View>
  );

  const renderQuickSuggestions = () => {
    if (!showSuggestions || displayMessages.length > 0) return null;
    const suggestions = language === "urdu" ? QUICK_SUGGESTIONS.urdu : QUICK_SUGGESTIONS.english;
    return (
      <Animatable.View animation="fadeInUp" duration={500} style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>
          {language === "urdu" ? "💡 تجویز کردہ سوالات:" : "💡 Suggested Questions:"}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
          style={styles.suggestionsScrollView}
        >
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionPress(s.text)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionIcon}>{s.icon}</Text>
              <Text style={styles.suggestionText}>{s.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animatable.View>
    );
  };

  // ============ MESSAGE ACTIONS MODAL ============
  const renderMessageActions = () => {
    if (!showMessageActions || !selectedMessage) return null;

    const isUser = selectedMessage.user?._id === 1;

    return (
      <Modal
        visible={showMessageActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMessageActions(false)}
      >
        <TouchableOpacity
          style={styles.actionOverlay}
          activeOpacity={1}
          onPress={() => setShowMessageActions(false)}
        >
          <Animatable.View
            animation="slideInUp"
            duration={300}
            style={styles.actionBox}
          >
            {!isUser && (
              <>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => copyMessage(selectedMessage.text)}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: "#E8F5E9" }]}>
                    <Ionicons name="copy" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionBtnText}>
                      {language === "urdu" ? "📋 کاپی کریں" : "📋 Copy"}
                    </Text>
                    <Text style={styles.actionBtnSubtext}>
                      {language === "urdu" ? "کلپ بورڈ میں" : "to clipboard"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => translateMessage(selectedMessage.text)}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: "#FFE8CC" }]}>
                    <Ionicons name="language" size={20} color="#FF9500" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionBtnText}>
                      {language === "urdu" ? "🇵🇰 اردو میں" : "🇵🇰 To Urdu"}
                    </Text>
                    <Text style={styles.actionBtnSubtext}>
                      {language === "urdu" ? "ترجمہ کریں" : "translate"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => speakMessage(selectedMessage.text)}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: "#CCE5FF" }]}>
                    <Ionicons name="volume-high" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionBtnText}>
                      {language === "urdu" ? "🔊 سنیں" : "🔊 Listen"}
                    </Text>
                    <Text style={styles.actionBtnSubtext}>
                      {language === "urdu" ? "وائس میں" : "hear"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {isUser && (
              <>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => copyMessage(selectedMessage.text)}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: "#E8F5E9" }]}>
                    <Ionicons name="copy" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionBtnText}>
                      {language === "urdu" ? "📋 کاپی کریں" : "📋 Copy"}
                    </Text>
                    <Text style={styles.actionBtnSubtext}>
                      {language === "urdu" ? "کلپ بورڈ میں" : "to clipboard"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={editMessage}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: "#F3E5F5" }]}>
                    <Ionicons name="create" size={20} color="#9C27B0" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionBtnText}>
                      {language === "urdu" ? "✏️ ترمیم کریں" : "✏️ Edit"}
                    </Text>
                    <Text style={styles.actionBtnSubtext}>
                      {language === "urdu" ? "اپنا پیغام" : "your message"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.actionCloseBtn}
              onPress={() => setShowMessageActions(false)}
            >
              <Text style={styles.actionCloseBtnText}>
                {language === "urdu" ? "✕ بند کریں" : "✕ Close"}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ============ EDIT MESSAGE MODAL ============
  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.editModalOverlay}>
        <Animatable.View animation="slideInUp" duration={400} style={styles.editModalContent}>
          <View style={styles.editModalHeader}>
            <Text style={styles.editModalTitle}>
              {language === "urdu" ? "✏️ پیغام میں ترمیم" : "✏️ Edit Message"}
            </Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.editTextInput}
            value={editMessageText}
            onChangeText={setEditMessageText}
            multiline
            autoFocus
            placeholder={language === "urdu" ? "اپنا پیغام لکھیں..." : "Type your message..."}
            placeholderTextColor={colors.gray}
            maxLength={500}
          />

          <Text style={styles.charCount}>
            {editMessageText.length}/500
          </Text>

          <View style={styles.editModalButtons}>
            <TouchableOpacity
              style={styles.editCancelBtn}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.editCancelText}>
                {language === "urdu" ? "منسوخ" : "Cancel"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editSaveBtn, !editMessageText.trim() && { opacity: 0.6 }]}
              onPress={saveEditedMessage}
              disabled={!editMessageText.trim()}
            >
              <Text style={styles.editSaveText}>
                {language === "urdu" ? "محفوظ کریں" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <GiftedChat
          messages={displayMessages}
          onSend={onSend}
          user={mode === "real" && realUser ? realUser : { _id: 1, name: userName }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderInputToolbar={renderInputToolbar}
          renderAvatar={renderAvatar}
          renderDay={renderDay}
          renderTime={renderTime}
          renderChatEmpty={renderEmpty}
          renderChatFooter={renderQuickSuggestions}
          isTyping={mode === "real" ? false : isTyping}
          messagesContainerStyle={styles.messagesContainer}
          listProps={{
            contentContainerStyle: { flexGrow: 1 }
          }}
          minInputToolbarHeight={70}
          textInputProps={{
            style: styles.textInput,
            placeholderTextColor: colors.gray,
            placeholder: language === "urdu" ? "سوال پوچھیں..." : "Ask a question...",
            returnKeyType: "send",
            onSubmitEditing: handleTextSend,
          }}
        />
      </KeyboardAvoidingView>

      {renderMessageActions()}
      {renderEditModal()}

      {/* Upload Options Modal */}
      <Modal
        visible={showUploadOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUploadOptions(false)}
        >
          <Animatable.View animation="slideInUp" style={styles.modalContent}>
            <View style={styles.uploadHeader}>
              <Text style={styles.modalTitle}>
                {language === 'urdu' ? '📋 لیب رپورٹ اپ لوڈ کریں' : '📋 Upload Lab Report'}
              </Text>
              <TouchableOpacity onPress={() => setShowUploadOptions(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={() => handleFileUpload('camera')}
              disabled={uploading}
            >
              <LinearGradient
                colors={["#FFE5CC", "#FFCC99"]}
                style={styles.uploadOptionIcon}
              >
                <Text style={styles.uploadIconText}>📸</Text>
              </LinearGradient>
              <View style={styles.uploadOptionText}>
                <Text style={styles.uploadOptionTitle}>
                  {language === 'urdu' ? 'کیمرہ سے لیں' : 'Take Photo'}
                </Text>
                <Text style={styles.uploadOptionSubtitle}>
                  {language === 'urdu' ? 'اپنے کیمرے سے رپورٹ کی تصویر لیں' : 'Capture with camera'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={() => handleFileUpload('gallery')}
              disabled={uploading}
            >
              <LinearGradient
                colors={["#CCE5FF", "#99CCFF"]}
                style={styles.uploadOptionIcon}
              >
                <Text style={styles.uploadIconText}>🖼️</Text>
              </LinearGradient>
              <View style={styles.uploadOptionText}>
                <Text style={styles.uploadOptionTitle}>
                  {language === 'urdu' ? 'گیلری سے منتخب کریں' : 'Choose from Gallery'}
                </Text>
                <Text style={styles.uploadOptionSubtitle}>
                  {language === 'urdu' ? 'فوٹوز سے انتخاب کریں' : 'Select from photos'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOption}
              onPress={() => handleFileUpload('document')}
              disabled={uploading}
            >
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.uploadOptionIcon}
              >
                <Text style={styles.uploadIconText}>📄</Text>
              </LinearGradient>
              <View style={styles.uploadOptionText}>
                <Text style={styles.uploadOptionTitle}>
                  {language === 'urdu' ? 'PDF اپ لوڈ کریں' : 'Upload PDF/Image'}
                </Text>
                <Text style={styles.uploadOptionSubtitle}>
                  {language === 'urdu' ? 'موجودہ فائل منتخب کریں' : 'Choose file'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </TouchableOpacity>

            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.uploadingText}>
                  {language === 'urdu' ? '⏳ اپ لوڈ ہو رہا ہے...' : '⏳ Uploading...'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowUploadOptions(false)}
            >
              <Text style={styles.cancelText}>
                {language === 'urdu' ? '✕ منسوخ' : '✕ Cancel'}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA"
  },
  keyboardAvoidView: {
    flex: 1
  },
  messagesContainer: {
    backgroundColor: "#F5F7FA",
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  bubbleWrapper: {
    marginVertical: 4,
    marginHorizontal: 4,
  },
  userBubbleWrapper: {
    alignItems: "flex-end",
  },
  aiBubbleWrapper: {
    alignItems: "flex-start",
  },
  senderLabel: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  userLabel: {
    backgroundColor: colors.primary + "20",
    alignSelf: "flex-end",
    marginRight: 12,
  },
  aiLabel: {
    backgroundColor: colors.primary + "15",
    alignSelf: "flex-start",
    marginLeft: 12,
  },
  senderLabelText: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: Fonts.medium,
  },
  userLabelText: {
    color: colors.primary
  },
  aiLabelText: {
    color: colors.primary
  },
  inputToolbar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  inputPrimary: {
    backgroundColor: "#F5F7FA",
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.primary + "30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    marginLeft: 4,
  },
  sendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
    gap: 6,
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
  },
  recordingButton: {
    backgroundColor: "#FFE5E5",
    borderWidth: 2,
    borderColor: "#FF4444",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4444",
  },
  recordingText: {
    color: "#FF4444",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: Fonts.medium,
  },
  languageButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  languageText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
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
    justifyContent: "center",
    alignItems: "center",
  },
  dayWrapper: {
    marginVertical: 16
  },
  dayText: {
    color: colors.gray,
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  // FIXED: Empty container – no inversion, proper centering
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF0",
  },
  uploadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Fonts.bold,
  },
  uploadOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    marginBottom: 12,
    gap: 12,
  },
  uploadOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  uploadIconText: {
    fontSize: 24,
  },
  uploadOptionText: {
    flex: 1,
  },
  uploadOptionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 3,
    fontFamily: Fonts.medium,
  },
  uploadOptionSubtitle: {
    fontSize: 13,
    color: colors.gray,
    fontFamily: Fonts.regular,
  },
  uploadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  uploadingText: {
    marginTop: 12,
    color: colors.gray,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  cancelButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "bold",
    fontFamily: Fonts.medium,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8ECF0",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
  suggestionsTitle: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginBottom: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  suggestionsScrollView: {
    flexGrow: 0,
  },
  suggestionsScroll: {
    paddingRight: 16,
    alignItems: "center",
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
    fontWeight: "600",
  },
  editedBadge: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    marginHorizontal: 12,
    fontWeight: "bold",
  },
  editedRight: {
    textAlign: "right",
    marginRight: 12,
  },
  editedLeft: {
    textAlign: "left",
    marginLeft: 12,
  },
  translateInlineBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    marginTop: 4,
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4A90E230",
    gap: 4,
  },
  translateInlineBtnText: {
    fontSize: 11,
    color: "#4A90E2",
    fontFamily: Fonts.medium,
    fontWeight: "bold",
  },
  actionOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  actionBox: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    marginBottom: 12,
    gap: 14,
  },
  actionIconBg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Fonts.bold,
    marginBottom: 2,
  },
  actionBtnSubtext: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: Fonts.regular,
  },
  actionCloseBtn: {
    paddingVertical: 14,
    backgroundColor: "#FFE5E5",
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  actionCloseBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF4444",
    fontFamily: Fonts.bold,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    width: "88%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 9,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#E8ECF0",
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Fonts.bold,
  },
  editTextInput: {
    backgroundColor: "#F5F7FA",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    fontFamily: Fonts.regular,
    minHeight: 110,
    textAlignVertical: "top",
    color: colors.text,
    borderWidth: 1.5,
    borderColor: "#E8ECF0",
    maxHeight: 220,
  },
  charCount: {
    fontSize: 12,
    color: colors.gray,
    textAlign: "right",
    marginTop: 10,
    fontFamily: Fonts.regular,
    fontWeight: "500",
  },
  editModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  editCancelText: {
    fontSize: 16,
    color: colors.gray,
    fontWeight: "bold",
    fontFamily: Fonts.medium,
  },
  editSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  editSaveText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    fontFamily: Fonts.medium,
  },
});

export default ToraAIChat;