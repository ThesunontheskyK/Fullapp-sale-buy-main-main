import { useState, useRef, useCallback } from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Clipboard } from "react-native";
import ChatData from "../../chat.json";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import QuotationModal from "./QuotationModal";
import TrackingModal from "./TrackingModal";
import DeliveryActions from "./DeliveryActions";

export default function RoomPage({ navigation, route }) {
    
  const { userId, Idroom, room_number } = route.params || {};

  const currentUserId = userId;
  const roomId = Idroom ? Idroom.toString() : room_number ? room_number.toString() : "";

  const room = ChatData.rooms.find((r) => r.RoomID === roomId);
  
  if (!room) return <Text>Room not found</Text>;

  const RoomIdname = room.RoomID;
  const currentUser = room.users[currentUserId];
  const currentUserRole = currentUser?.role || "buyer";

  const initialMessages = Object.entries(room.messages).map(([id, msg]) => ({
    id,
    ...msg,
  }));

  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [quotationData, setQuotationData] = useState({
    productName: "",
    details: "",
    images: "",
    price: "",
  });

  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTextChange = useCallback((text) => setInputText(text), []);

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const newMsg = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      text: inputText,
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages([...messages, newMsg]);
    setInputText("");
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleCopy = () => {
    Clipboard.setString(RoomIdname);
  };

  const pendingQuotations = messages.filter(
    (msg) =>
      msg.type === "quotation" &&
      msg.sender_id !== currentUserId &&
      currentUserRole === "buyer" &&
      msg.quotation.status === false
  );

  const hasSentQuotation = messages.some(
    (msg) => msg.type === "quotation" && msg.sender_id === currentUserId
  );

  const hasTracking = messages.some(
    (msg) =>
      msg.type === "system" &&
      msg.text?.startsWith("ผู้ขายได้กรอกเลขขนส่ง")
  );

  const hasConfirmedDelivery = messages.some(
    (msg) =>
      msg.type === "system" &&
      msg.text?.startsWith("ผู้ซื้อยืนยันการได้รับของแล้ว")
  );

  const paidQuotations = messages.filter(
    (msg) =>
      msg.type === "quotation" &&
      msg.quotation.status === true
  );

  const showTrackingButton = currentUserRole === "seller" && paidQuotations.length > 0 && !hasTracking;


  // ใบเสอนสินค้า
  const sendQuotation = () => {
    if (!quotationData.productName || !quotationData.price) {
      return alert("กรุณากรอกชื่อสินค้าและราคา");
    }

    const newQuotation = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      type: "quotation",
      quotation: { ...quotationData, status: false },
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages([...messages, newQuotation]);
    setQuotationData({ productName: "", details: "", images: "", price: "" });
    setModalVisible(false);
  };

  // ชำระงิน
  const handlePayQuotation = (quotationId) => {

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === quotationId
          ? { ...msg, quotation: { ...msg.quotation, status: true } }
          : msg
      )
    );

    navigation.navigate("PaymentPage", { roomId: roomId });

    const paidMsg = {
      id: (Date.now() + 1).toString(),
      type: "system",
      text: "ชำระเงินเสร็จสิ้น สามารถส่งของได้เลยครับ",
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, paidMsg]);

  };

  const handleSendTrackingNumber = () => {
    if (!trackingNumber) return alert("กรุณากรอกเลขขนส่ง");

    const systemMsg = {
      id: Date.now().toString(),
      type: "system",
      text: `ผู้ขายได้กรอกเลขขนส่ง: ${trackingNumber}`,
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, systemMsg]);
    setTrackingNumber("");
    setTrackingModalVisible(false);
  };

  const handleConfirmDelivery = () => {
    const confirmMsg = {
      id: Date.now().toString(),
      type: "system",
      text: "ผู้ซื้อยืนยันการได้รับของแล้ว การซื้อขายเสร็จสมบูรณ์",
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, confirmMsg]);
  };

  const showDeliveryButton =
    pendingQuotations.length === 0 && hasTracking && currentUserRole === "buyer" && !hasConfirmedDelivery;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#125c91" />

      {/* Header */}
      <View className="bg-[#125c91] shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center justify-between w-full">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10  rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-semibold text-lg">
              หมายเลขห้อง : {RoomIdname}
            </Text>
            <TouchableOpacity onPress={handleCopy}>
              <Text className="font-semibold text-white border-b-2 border-white/50">คัดลอก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <View className="flex-1">
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            flatListRef={flatListRef}
          />

          {pendingQuotations.map((msg) => (
            <View key={msg.id} className="flex-row px-9 mb-2 gap-2 justify-between items-center">
              <TouchableOpacity
                className="w-full bg-[#125c91] py-3 rounded-lg items-center justify-center shadow"
                onPress={() => handlePayQuotation(msg.id)}
              >
                <Text className="text-white font-semibold text-center">ชำระเงิน</Text>
              </TouchableOpacity>
            </View>
          ))}

          {showDeliveryButton && (
            <DeliveryActions
              onCancel={() => alert("ยกเลิกสินค้าเรียบร้อย")}
              onConfirm={handleConfirmDelivery}
            />
          )}
        </View>

        <MessageInput
          inputText={inputText}
          onTextChange={handleTextChange}
          onSend={sendMessage}
          onFocus={handleInputFocus}
          currentUserRole={currentUserRole}
          hasSentQuotation={hasSentQuotation}
          onOpenQuotationModal={() => setModalVisible(true)}
        />
      </KeyboardAvoidingView>

      {showTrackingButton && (
        <View className="absolute bottom-20 px-4 w-full">
          <TouchableOpacity
            className="bg-[#125c91] border border-black/50 py-3 px-4 rounded-lg shadow-lg items-center justify-center"
            onPress={() => setTrackingModalVisible(true)}
          >
            <Text className="text-white font-semibold">กรอกเลขขนส่ง</Text>
          </TouchableOpacity>
        </View>
      )}

      <QuotationModal
        visible={modalVisible}
        quotationData={quotationData}
        onClose={() => {
          setModalVisible(false);
          setQuotationData({ productName: "", details: "", images: "", price: "" });
        }}
        onSend={sendQuotation}
        onUpdateData={setQuotationData}
      />

      <TrackingModal
        visible={trackingModalVisible}
        trackingNumber={trackingNumber}
        onClose={() => setTrackingModalVisible(false)}
        onSend={handleSendTrackingNumber}
        onUpdateNumber={setTrackingNumber}
      />
    </SafeAreaView>
  );
}