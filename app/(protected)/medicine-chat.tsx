import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { GiftedChat, IMessage, InputToolbar, Send } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";

const MedicineChat = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { personId, personName, personAvatar } = params;

  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "Hello! How can I help you with your medicine delivery?",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: personName as string,
        avatar: personAvatar as string,
      },
    },
  ]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    // Simulate delivery person response
    setTimeout(() => {
      const response: IMessage = {
        _id: Math.random().toString(),
        text: "I'll help you with that right away!",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: personName as string,
          avatar: personAvatar as string,
        },
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [response])
      );
    }, 1000);
  }, [personName, personAvatar]);

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
          name: "You",
        },
        image: result.assets[0].uri,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [imageMessage])
      );
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
          name: "You",
        },
        image: result.assets[0].uri,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [imageMessage])
      );
    }
  };

  const showImageOptions = () => {
    Alert.alert("Send Image", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
      textInputProps={{
        ...props.textInputProps,
        style: {
          ...props.textInputProps?.style,
          color: colors.black,
        },
        placeholderTextColor: colors.gray,
      }}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={styles.sendContainer}>
      <View style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Send</Text>
      </View>
    </Send>
  );

  const renderActions = () => (
    <TouchableOpacity
      onPress={showImageOptions}
      style={styles.actionButton}
    >
      <Text style={styles.actionButtonText}>📎</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          {/* <Text style={styles.backText}>←</Text> */}
        </TouchableOpacity>
        <Image
          source={{ uri: personAvatar as string }}
          style={styles.headerAvatar}
        />
        <View style={styles.headerInfo}>
          <Text style={appStyles.cardTitle}>{personName}</Text>
          <Text style={[appStyles.caption, { color: colors.success }]}>Online</Text>
        </View>
      </View>

      {/* GiftedChat */}
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
          name: "You",
        }}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderActions={renderActions}
        renderAvatar={(props) => {
          const avatarUri = props.currentMessage?.user.avatar;
          return avatarUri && typeof avatarUri === "string" ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : null;
        }}
        renderBubble={(props) => {
          const isCurrentUser = props.currentMessage?.user._id === 1;
          const messageTime = props.currentMessage?.createdAt;
          const timeString = messageTime
            ? new Date(messageTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";
          
          return (
            <View style={styles.bubbleWrapper}>
              <View
                style={[
                  styles.bubble,
                  isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
                ]}
              >
                <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
                  {props.currentMessage?.text}
                </Text>
              </View>
              <Text style={[styles.timestamp, isCurrentUser && styles.currentUserTimestamp]}>
                {timeString}
              </Text>
            </View>
          );
        }}
        messagesContainerStyle={styles.messagesContainer}
      />
    </SafeAreaView>
  );
};

export default MedicineChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: Fonts.medium,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  messagesContainer: {
    backgroundColor: colors.white,
  },
  inputToolbar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 56,
  },
  inputPrimary: {
    alignItems: "center",
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 5,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    marginBottom: 5,
    borderRadius: 22,
    backgroundColor: colors.lightGray,
  },
  actionButtonText: {
    fontSize: 22,
  },
  bubbleWrapper: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  otherUserBubble: {
    backgroundColor: colors.lightGray,
    alignSelf: "flex-start",
  },
  currentUserText: {
    color: colors.white,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  otherUserText: {
    color: colors.black,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: colors.gray,
    fontFamily: Fonts.regular,
    marginTop: 2,
    marginLeft: 8,
  },
  currentUserTimestamp: {
    textAlign: "right",
    marginRight: 8,
    marginLeft: 0,
  },
});
