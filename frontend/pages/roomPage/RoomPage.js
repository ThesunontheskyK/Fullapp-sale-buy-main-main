import { useState, useRef, useCallback, useEffect } from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import api from "../../config/api";
import socketService from "../../services/socket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import QuotationModal from "./QuotationModal";
import TrackingModal from "./TrackingModal";
import DeliveryActions from "./DeliveryActions";

export default function RoomPage({ navigation, route }) {
  // 1. รับค่าจาก route.params
  const { userId, Idroom, room_number, role } = route.params || {};

  const roomId = Idroom
    ? Idroom.toString()
    : room_number
      ? room_number.toString()
      : "";

  // 2. ประกาศ State
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(role || "buyer"); // กำหนด Role ตั้งต้นจาก params
  const [messages, setMessages] = useState([]);
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

  // โหลดข้อมูลห้องจาก API และกำหนด Role
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/chat/rooms/${roomId}`);

        if (response.data.success) {
          const roomData = response.data.data.chatRoom;
          setRoom(roomData);

          const messagesArray = Object.entries(roomData.messages || {}).map(
            ([id, msg]) => ({
              id,
              ...msg,
            })
          );

          setMessages(messagesArray);
          setCurrentUserId(userId);

          const fetchedRole = roomData.users?.[userId]?.role;
          setCurrentUserRole(fetchedRole);
          console.log("Fetched Role:", roomData.users?.[userId], fetchedRole);
          console.log(userId);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        alert("ไม่สามารถโหลดข้อมูลห้องได้");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId, userId]); // เพิ่ม userId และ role ใน dependency

  // เชื่อมต่อ Socket.io (โค้ดเดิม)
  useEffect(() => {
    socketService.connect();

    if (roomId) {
      socketService.joinRoom(roomId);

      // รับข้อความใหม่
      socketService.onReceiveMessage((message) => {
        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg.id === message.id);
          if (exists) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
    }

    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
      socketService.offReceiveMessage();
    };
  }, [roomId]);
  // ----------------------------------------------------
  // โค้ดที่เหลือยังคงเป็น Logic เดิม
  // ----------------------------------------------------

  const handleTextChange = useCallback((text) => setInputText(text), []);

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    try {
      const messageText = inputText;
      setInputText("");

      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        text: messageText,
        type: "text",
      });

      if (response.data.success) {
        const newMsg = response.data.data.message;
        socketService.sendMessage(roomId, newMsg);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("ไม่สามารถส่งข้อความได้");
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(roomId);
  };

  // ----------------------------------------------------
  // Render Logic
  // ----------------------------------------------------

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

  // const currentUser = room.users?.[currentUserId]; // ไม่จำเป็นต้องใช้แล้ว
  const RoomIdname = room.RoomID;

  // Logic การแสดงผล (ใช้ currentUserRole ที่เป็น State ใหม่)
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
      msg.type === "system" && msg.text?.startsWith("ผู้ขายได้กรอกเลขขนส่ง")
  );

  const hasConfirmedDelivery = messages.some(
    (msg) =>
      msg.type === "system" &&
      msg.text?.startsWith("ผู้ซื้อยืนยันการได้รับของแล้ว")
  );

  const paidQuotations = messages.filter(
    (msg) => msg.type === "quotation" && msg.quotation.status === true
  );

  const showTrackingButton =
    currentUserRole === "seller" && paidQuotations.length > 0 && !hasTracking;

  // ... (sendQuotation, handlePayQuotation, handleSendTrackingNumber, handleConfirmDelivery)
  // (ฟังก์ชันเหล่านี้ไม่ถูกเปลี่ยนแปลง)
  // ... (โค้ดเดิม)

  const sendQuotation = async () => {
    if (!quotationData.productName || !quotationData.price) {
      return alert("กรุณากรอกชื่อสินค้าและราคา");
    } // 1. เตรียมข้อมูลสำหรับส่งไป Backend

    const bodyData = {
      text: `ใบเสนอราคา: ${quotationData.productName}`,
      type: "quotation",
      quotation: {
        productName: quotationData.productName, // 🛑 แก้ไขตรงนี้: ส่ง details เป็น String ตรงๆ
        details: quotationData.details || "",
        images: quotationData.images || "",
        price: quotationData.price,
        status: false,
      },
    };

    try {
      // 2. ส่งข้อมูลไปที่ Backend
      const response = await api.post(
        `/chat/rooms/${roomId}/messages`,
        bodyData
      );

      if (response.data.success) {
        const newMsg = response.data.data.message; // 3. อัปเดต UI และส่งผ่าน Socket
        setMessages((prev) => [...prev, newMsg]);
        socketService.sendMessage(roomId, newMsg);
        setQuotationData({
          productName: "",
          details: "",
          images: "",
          price: "",
        });
        setModalVisible(false);
      } else {
      }
    } catch (error) {
      console.error("Error sending quotation:", error);
    }
  };

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
    pendingQuotations.length === 0 &&
    hasTracking &&
    currentUserRole === "buyer" &&
    !hasConfirmedDelivery;
  // ----------------------------------------------------
  // Return UI
  // ----------------------------------------------------

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#125c91" />

      {/* Header */}
      <View className="bg-[#125c91] shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center justify-between w-full">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10  rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-semibold text-lg">
              หมายเลขห้อง : {RoomIdname}
            </Text>
            <TouchableOpacity onPress={handleCopy}>
              <Text className="font-semibold text-white border-b-2 border-white/50">
                คัดลอก
              </Text>
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
            <View
              key={msg.id}
              className="flex-row px-9 mb-2 py-2 gap-2 bg-transparent  justify-between items-center"
            >
              <TouchableOpacity
                className="w-full bg-[#125c91] py-3 rounded-lg items-center justify-center shadow"
                onPress={() => handlePayQuotation(msg.id)}
              >
                <Text className="text-white font-semibold text-center">
                  ชำระเงิน
                </Text>
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
          setQuotationData({
            productName: "",
            details: "",
            images: "",
            price: "",
          });
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
