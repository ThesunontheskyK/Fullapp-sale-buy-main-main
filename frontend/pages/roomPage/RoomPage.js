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

<<<<<<< HEAD
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

      // รับ event ลบข้อความ
      socketService.onMessageDeleted((data) => {
        const { messageId } = data;
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
      });
    }

    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
      socketService.offReceiveMessage();
      socketService.offMessageDeleted();
    };
  }, [roomId]);
  // ----------------------------------------------------
  // โค้ดที่เหลือยังคงเป็น Logic เดิม
  // ----------------------------------------------------

=======
  // 4. Callbacks
>>>>>>> 0acb81e43ca3231b9b062eeed66e85b80abddc2d
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

<<<<<<< HEAD
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await api.delete(`/chat/rooms/${roomId}/messages/${messageId}`);

      if (response.data.success) {
        // ลบข้อความออกจาก state
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );

        // ส่ง socket event เพื่อแจ้งผู้ใช้คนอื่น
        socketService.deleteMessage(roomId, messageId);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("ไม่สามารถลบข้อความได้");
      }
    }
  };

  // ----------------------------------------------------
  // Render Logic
  // ----------------------------------------------------
=======
  // 5. คำนวณสถานะห้อง
  const {
    pendingQuotations,
    hasSentQuotation,
    showTrackingButton,
    showDeliveryButton,
  } = getRoomStatus(messages, currentUserId, currentUserRole);
>>>>>>> 0acb81e43ca3231b9b062eeed66e85b80abddc2d

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
<<<<<<< HEAD
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            flatListRef={flatListRef}
            onDeleteMessage={handleDeleteMessage}
          />
=======
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onDeleteMessage={handleDeleteMsg}
        />
>>>>>>> 0acb81e43ca3231b9b062eeed66e85b80abddc2d

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
