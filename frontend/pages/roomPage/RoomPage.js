import { useState, useRef, useCallback } from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useHeaderHeight } from "@react-navigation/elements";

// Components
import MessageList from "././components/MessageList";
import MessageInput from "././components/MessageInput";
import QuotationModal from "././components/QuotationModal";
import TrackingModal from "././components/TrackingModal";
import DeliveryActions from "././components/DeliveryActions";

// Custom Hooks
import { useRoomData } from "./hooks/useRoomData";
import { useSocket } from "./hooks/useSocket";

// Handlers
import { sendTextMessage, handleDeleteQuotation, } from "./handlers/messageHandlers";
import {sendQuotation,handlePayQuotation,} from "./handlers/quotationHandlers";
import {handleSendTrackingNumber,handleConfirmDelivery,} from "./handlers/deliveryHandlers";

// Helpers
import { getRoomStatus } from "./helpers/roomHelpers";

export default function RoomPage({ navigation, route }) {
  // 1. รับค่าจาก route.params
  const { userId, Idroom, room_number, role } = route.params || {};

  const roomId = Idroom ? Idroom.toString() : room_number ? room_number.toString() : "";

  const height = useHeaderHeight();

  // 2. ใช้ Custom Hooks
  const { room, loading, currentUserId, currentUserRole, messages,setMessages,} = useRoomData(roomId, userId, role);

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

  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  // 4. Callbacks
  const handleTextChange = useCallback((text) => setInputText(text), []);

  const handleSendMessage = () => {
    sendTextMessage(roomId, inputText, setInputText);
  };

  const handleDeleteMsg = (messageId) => {
    handleDeleteQuotation(messageId, setMessages);
  };

  const handleSendQuotation = () => {
    sendQuotation( roomId, quotationData, setMessages, setQuotationData, setModalVisible);
  };

  const handlePay = (quotationId) => {
    handlePayQuotation(quotationId, roomId, setMessages, navigation);
  };

  const handleSendTracking = () => {
    handleSendTrackingNumber(trackingNumber, setMessages, setTrackingNumber,setTrackingModalVisible);
  };

  const handleConfirm = () => {
    handleConfirmDelivery(setMessages);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(roomId);
  };

  // 5. คำนวณสถานะห้อง
  const {
    pendingQuotations,
    hasSentQuotation,
    showTrackingButton,
    showDeliveryButton,
  } = getRoomStatus(messages, currentUserId, currentUserRole);

  // 6. Loading & Error States
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
              <Text className="text-white font-semibold text-center"> ชำระเงิน</Text>
            </Pressable>
          </View>
        ))}

        {showDeliveryButton && (
          <DeliveryActions
            onCancel={() => alert("ยกเลิกสินค้าเรียบร้อย")}
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

      {showTrackingButton && (
        <View className="absolute bottom-20 px-4 w-full">
          <Pressable
            className="bg-[#125c91] border border-black/50 py-3 px-4 rounded-lg shadow-lg items-center justify-center"
            onPress={() => setTrackingModalVisible(true)}
          >
            <Text className="text-white font-semibold">กรอกเลขขนส่ง</Text>
          </Pressable>
        </View>
      )}

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

      <TrackingModal
        visible={trackingModalVisible}
        trackingNumber={trackingNumber}
        onClose={() => setTrackingModalVisible(false)}
        onSend={handleSendTracking}
        onUpdateNumber={setTrackingNumber}
      />
    </SafeAreaView>
  );
}
