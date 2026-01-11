import { useState, useEffect, useMemo } from "react";

import { Text, View, TouchableOpacity, StatusBar, Platform , ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Hooks & Functions
import usePaymentData from "./hooks/usePaymentData";
import { updatePaymentSuccess } from "./hooks/usePaymentStatusUpdate";
import { calculateFee } from "./Fee";

// Components
import PaymentHeader from "./PaymentHeader";
import ProductDetails from "./ProductDetails";
import PaymentMethods from "./PaymentMethods";
import ConfirmModal from "./ConfirmModal";
import PaymentSummary from "./PaymentSummary";

export default function PaymentPage({ navigation, route }) {
  const { roomId, messages } = route.params || {};
  const insets = useSafeAreaInsets();

  // States
  const [selectedPayment, setSelectedPayment] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [paycheck, setPayCheck] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [qrcode, setQrcode] = useState(false);


  const { paymentData, quotationData, loading, error, refetch } = usePaymentData(roomId);

  useEffect(() => {

    if (paycheck && paymentData?._id) {

      const finalize = async () => {
        try {
          const isSuccess = await updatePaymentSuccess(roomId, messages, paymentData._id , navigation);
          if (isSuccess) {
            setConfirmModalVisible(false);
            navigation.goBack();
          }
        } catch (err) {
          console.error("Finalize Error:", err);
        }
      };
      finalize();
    }
  }, [paycheck, paymentData?._id]);

  const fee = useMemo(() => {
    return paymentData?.price ? calculateFee(paymentData.price) : 0;
  }, [paymentData?.price]);

  const totalAmount = useMemo(() => {
    const price = parseInt(paymentData?.price || 0);
    return price + fee;
  }, [paymentData?.price, fee]);


  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600 mb-2">กำลังโหลดข้อมูล...</Text>
        <Text className="text-gray-500 text-sm">Room ID: {roomId}</Text>
      </SafeAreaView>
    );
  }

  // --- ส่วนแสดงผล Error ---
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-red-600 mb-2 font-bold">เกิดข้อผิดพลาด</Text>
        <Text className="text-gray-500 text-sm mb-4 text-center">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-2 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">ลองใหม่อีกครั้ง</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#125c91" />
      
      <PaymentHeader navigation={navigation} />
      
      <ScrollView className="flex-1">
        <ProductDetails quotationData={quotationData} PaymentData={paymentData} />
        
        <PaymentMethods 
           selectedPayment={selectedPayment} 
           onPaymentSelect={setSelectedPayment} 
           creditAmount={creditAmount}
           onCreditAmountChange={setCreditAmount}
           quotationData={quotationData}
           setQrcode={setQrcode}
           PaymentData={paymentData}
        />
        
        <PaymentSummary price={paymentData?.price} fee={fee} />
      </ScrollView>

      {/* ปุ่มยืนยันด้านล่าง (Footer) */}
      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          onPress={() => setConfirmModalVisible(true)}
          disabled={!selectedPayment}
          className={`py-4 rounded-lg ${selectedPayment ? "bg-[#125c91]" : "bg-gray-300"}`}
        >
          <Text className={`text-center font-bold text-lg ${selectedPayment ? "text-white" : "text-gray-500"}`}>
            ยืนยันการชำระเงิน ฿{totalAmount.toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal 
         visible={confirmModalVisible} 
         onClose={() => setConfirmModalVisible(false)} 
         totalAmount={totalAmount} 
         selectedPayment={selectedPayment}
         qrcode={qrcode}
         setPayCheck={setPayCheck} 
      />
    </SafeAreaView>
  );
}