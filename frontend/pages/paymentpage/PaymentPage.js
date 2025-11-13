import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import PaymentHeader from "./PaymentHeader";
import ProductDetails from "./ProductDetails";
import PaymentMethods from "./PaymentMethods";
import PaymentSummary from "./PaymentSummary";
import ConfirmModal from "./ConfirmModal";
import { Fee } from "./Fee";
import api from "../../config/api";
import socket from "../../services/socket";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PaymentPage({ navigation, route }) {
  const { roomId } = route.params || {};
  const { messages } = route.params || {};

  const [selectedPayment, setSelectedPayment] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [qrcode, setQrcode] = useState(false);
  const [quotationData, setQuotationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [PaymentData, setPaymentData] = useState([]);
  const [fee, setFee] = useState(0);

  const insets = useSafeAreaInsets();

  const fetchPaymentData = async (roomId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/payment/room/${roomId}`);

      if (response.data.success && response.data.payments.length > 0) {
        const payment = response.data.payments[0];

        setPaymentData(payment);
        setQuotationData(payment.productInfo);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchPaymentData(roomId);
    } else {
      setError("ไม่มี roomId");
      setLoading(false);
    }
  }, [roomId]);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const handleFinalPayment = async () => {
    if (!selectedPayment) return;

    if (!quotationData) return;

    setConfirmModalVisible(true);

    try {
      const response = await api.put(
        `/chat/rooms/${roomId}/quotation/${messages}`,
        { status: true }
      );

      if (response.status === 200) {
        console.log("updata status payment success");

        try {
          const messageText = "ชำระเงินเสร็จสิ้น สามารถส่งของได้เลย";

          const response = await api.post(`/chat/rooms/${roomId}/messages`, {
            text: messageText,
            type: "system",
          });

          if (response.data.success) {

            const PaymentMsg = {
              id: (Date.now() + 1).toString(),
              type: "system",
              text: "ชำระเงินเสร็จสิ้น สามารถส่งของได้เลยครับ",
              timestamp: Math.floor(Date.now() / 1000),
            };

            try {
              const response = await api.put(`/payment/status/${PaymentData._id}`, {
                status: "confirmed",
              });

              if (response.status === 200) {
                socket.sendMessage(roomId, PaymentMsg);
                socket.checkPayment(roomId);
              }
            } catch (err) {
              console.log("update Error : ", err);
            }
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    } catch (err) {
      console.log("updata payment error : ", err);
    }
  };

  const handleConfirmPayment = async () => {
    setConfirmModalVisible(false);
    navigation.goBack();
  };

  useEffect(() => {
    if (PaymentData?.price) {
      Fee(setFee, PaymentData.price);
    }
  }, [roomId, PaymentData?.price]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600 mb-2">กำลังโหลดข้อมูล...</Text>
        <Text className="text-gray-500 text-sm">Room ID: {roomId}</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-red-600 mb-2">เกิดข้อผิดพลาด</Text>
        <Text className="text-gray-500 text-sm mb-4">
          {error || "ไม่พบข้อมูล"}
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => roomId && fetchPaymentData(roomId)}
        >
          <Text className="text-white">ลองใหม่</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalAmount = parseInt(PaymentData.price) + fee;

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={["top", "bottom"]}>
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

      <PaymentHeader navigation={navigation} />

      <ScrollView className="flex-1">
        <ProductDetails
          quotationData={quotationData}
          PaymentData={PaymentData}
        />

        <PaymentMethods
          selectedPayment={selectedPayment}
          onPaymentSelect={handlePaymentSelect}
          creditAmount={creditAmount}
          onCreditAmountChange={setCreditAmount}
          quotationData={quotationData}
          setQrcode={setQrcode}
          PaymentData={PaymentData}
        />

        <PaymentSummary price={PaymentData.price} fee={fee} />
      </ScrollView>

      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          onPress={handleFinalPayment}
          className={`py-4 rounded-lg ${selectedPayment ? "bg-[#125c91]" : "bg-gray-300"}`}
        >
          <Text
            className={`text-center font-bold text-lg ${selectedPayment ? "text-white" : "text-gray-500"}`}
          >
            ยืนยันการชำระเงิน ฿{totalAmount}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirmPayment}
        totalAmount={totalAmount}
        selectedPayment={selectedPayment}
        qrcode={qrcode}
      />
    </SafeAreaView>
  );
}
