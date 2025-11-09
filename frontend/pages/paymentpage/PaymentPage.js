import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import PaymentData from '../../Payment.json';
import PaymentHeader from './PaymentHeader';
import ProductDetails from './ProductDetails';
import PaymentMethods from './PaymentMethods';
import PaymentSummary from './PaymentSummary';
import ConfirmModal from './ConfirmModal';

export default function PaymentPage({ navigation, route }) {
  const { roomId } = route.params || {};

  const [selectedPayment, setSelectedPayment] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [qrcode, setQrcode] = useState(false);
  const [quotationData, setQuotationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentData = async (roomId) => {
    
    try {
      setLoading(true);
      setError(null);
      
      const room = PaymentData.rooms.find(r => r.RoomID === roomId);
      
      if (!room) {
        throw new Error(`ไม่พบข้อมูลห้อง ${roomId}`);
      }
      
      if (!room.Payment || !room.Payment.quotation) {
        throw new Error('ไม่พบข้อมูลใบเสนอราคาในห้องนี้');
      }
      
      setQuotationData(room.Payment.quotation);
      
    } catch (error) {
      console.error('Error fetching payment data:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchPaymentData(roomId);
    } else {
      setError('ไม่มี roomId');
      setLoading(false);
    }
  }, [roomId]);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const handleFinalPayment = () => {

    if (!selectedPayment) return ;

    if (!quotationData) return ;

    if (selectedPayment === "credit") {

      if ( !creditAmount || parseFloat(creditAmount) < parseFloat(quotationData.price) + 50) {

        Alert.alert("แจ้งเตือน", "จำนวนเครดิตไม่เพียงพอ");

        return;
      }
    }

    setConfirmModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    setConfirmModalVisible(false);
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600 mb-2">กำลังโหลดข้อมูล...</Text>
        <Text className="text-gray-500 text-sm">Room ID: {roomId}</Text>
      </SafeAreaView>
    );
  }

  if (error || !quotationData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-red-600 mb-2">เกิดข้อผิดพลาด</Text>
        <Text className="text-gray-500 text-sm mb-4">{error || 'ไม่พบข้อมูล'}</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => roomId && fetchPaymentData(roomId)}
        >
          <Text className="text-white">ลองใหม่</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalAmount = parseInt(quotationData.price) + 50;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <PaymentHeader navigation={navigation} />

      <ScrollView className="flex-1">
        <ProductDetails quotationData={quotationData} />
        
        <PaymentMethods
          selectedPayment={selectedPayment}
          onPaymentSelect={handlePaymentSelect}
          creditAmount={creditAmount}
          onCreditAmountChange={setCreditAmount}
          quotationData={quotationData}
          setQrcode={setQrcode}
        />

        <PaymentSummary price={quotationData.price} />
      </ScrollView>

      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity onPress={handleFinalPayment}
          className={`py-4 rounded-lg ${selectedPayment ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <Text className={`text-center font-bold text-lg ${selectedPayment ? "text-white" : "text-gray-500"}`}>
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