import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Components
import MessageList from "././components/MessageList";
import MessageInput from "././components/MessageInput";
import QuotationModal from "././components/QuotationModal";
import DeliveryActions from "././components/DeliveryActions";

// Custom Hooks
import { useRoomData } from "./hooks/useRoomData";
import { useSocket } from "./hooks/useSocket";

// Handlers
import {
  sendTextMessage,
  handleDeleteQuotation,
} from "./handlers/messageHandlers";
import {
  sendQuotation,
  handlePayQuotation,
} from "./handlers/quotationHandlers";
import { handleConfirmDelivery } from "./handlers/deliveryHandlers";
import { handleCancelDelivery } from "./handlers/deliveryHandlers";

// Helpers
import { getRoomStatus } from "./helpers/roomHelpers";

export default function RoomPage({ navigation, route }) {
  // 1. รับค่าจาก route.params
  const { userId, Idroom, room_number, role } = route.params || {};

  const insets = useSafeAreaInsets();

  const roomId = Idroom
    ? Idroom.toString()
    : room_number
      ? room_number.toString()
      : "";

  const height = useHeaderHeight();

  // 2. ใช้ Custom Hooks
  const {
    room,
    loading,
    currentUserId,
    currentUserRole,
    messages,
    setMessages,
  } = useRoomData(roomId, userId, role);

  useSocket(roomId, setMessages);

  // 3. Local State
  const [inputText, setInputText] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [quotationData, setQuotationData] = useState({
    productName: "",
    details: "",
    images: "",
    price: "",
  });

  // 4. Callbacks
  const handleTextChange = useCallback((text) => setInputText(text), []);

  const handleSendMessage = () => {
    sendTextMessage(roomId, inputText, setInputText);
  };

  const handleDeleteMsg = (messageId) => {
    handleDeleteQuotation(messageId, setMessages);
  };

  const handleSendQuotation = () => {
    sendQuotation(
      roomId,
      quotationData,
      setMessages,
      setQuotationData,
      setModalVisible
    );
  };

  const handlePay = (quotationId) => {
    handlePayQuotation(quotationId, roomId, setMessages, navigation);
  };

  const handleConfirm = () => {
    handleConfirmDelivery(setMessages);
  };

  const handleCancel = () => {
    handleCancelDelivery(setMessages);
  }

  const handleCopy = async () => {
    await Clipboard.setStringAsync(roomId);
  };

  const {
    pendingQuotations,
    hasSentQuotation,
    showDeliveryButton,
  } = getRoomStatus(messages, currentUserId, currentUserRole);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">กำลังโหลดข้อมูลห้อง...</Text>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">ไม่พบห้องแชทนี้</Text>
      </SafeAreaView>
    );
  }

  // 7. Return UI
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#125c91" />

      {Platform.OS === "ios" && (
        <View
          style={{
            height: insets.top,
            backgroundColor: "#125c91",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        />
      )}

      {/* Header */}
      <View className="bg-[#125c91] shadow-sm relative z-50">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center justify-between w-full">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text className="text-white font-semibold text-lg">
              หมายเลขห้อง : {room.RoomID}
            </Text>
            <Pressable onPress={handleCopy}>
              <Text className="font-semibold text-white border-b-2 border-white/50">
                คัดลอก
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={"padding"}
        keyboardVerticalOffset={height}
      >
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onDeleteMessage={handleDeleteMsg}
        />

        {pendingQuotations.map((msg) => (
          <View
            key={msg.id}
            className="flex-row px-9 mb-2 py-2 gap-2 bg-transparent justify-between items-center"
          >
            <Pressable
              className="w-full bg-[#125c91] py-3 rounded-lg items-center justify-center shadow"
              onPress={() => handlePay(msg.id)}
            >
              <Text className="text-white font-semibold text-center">
                ชำระเงิน
              </Text>
            </Pressable>
          </View>
        ))}

        {showDeliveryButton && (
          <DeliveryActions
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        )}

        <MessageInput
          inputText={inputText}
          onTextChange={handleTextChange}
          onSend={handleSendMessage}
          currentUserRole={currentUserRole}
          hasSentQuotation={hasSentQuotation}
          onOpenQuotationModal={() => setModalVisible(true)}
        />
      </KeyboardAvoidingView>

      <QuotationModal
        visible={modalVisible}
        quotationData={quotationData}
        onClose={() => {
          setModalVisible(false);
          setQuotationData({
            productName: "",
            details: "",
            images: "",
            price: "",
          });
        }}
        onSend={handleSendQuotation}
        onUpdateData={setQuotationData}
      />
    </SafeAreaView>
  );
}
