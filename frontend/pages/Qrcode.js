import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import PaymentData from '../Payment.json';

export default function PaymentPage({ navigation, route }) {
  
  const { roomId } = route.params || {};

  const [selectedPayment, setSelectedPayment] = useState("");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [qrcode, setQrcode] = useState(false);
  const [quotationData, setQuotationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันจำลอง API - ดึงข้อมูลจาก JSON
  const fetchPaymentData = async (roomId) => {

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 กำลังดึงข้อมูลห้อง: ${roomId}`);
      
      const room = PaymentData.rooms.find(r => r.RoomID === roomId);
      
      if (!room) {
        throw new Error(`ไม่พบข้อมูลห้อง ${roomId}`);
      }
      
      if (!room.Payment || !room.Payment.quotation) {
        throw new Error('ไม่พบข้อมูลใบเสนอราคาในห้องนี้');
      }
      
      console.log(`✅ ดึงข้อมูลสำเร็จ: ${room.Payment.quotation.productName}`);
      setQuotationData(room.Payment.quotation);
      
    } catch (error) {
      console.error(' Error fetching payment data:', error.message);
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
    if (!selectedPayment) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกวิธีการชำระเงิน");
      return;
    }

    if (!quotationData) {
      Alert.alert("แจ้งเตือน", "ไม่พบข้อมูลใบเสนอราคา");
      return;
    }

    if (selectedPayment === "credit") {
      if (
        !creditAmount ||
        parseFloat(creditAmount) < parseFloat(quotationData.price) + 50
      ) {
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
  

  // แสดง loading หรือ error
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="bg-blue-500 shadow-sm">
        <View className="flex-row items-center px-4 py-3 justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-blue-400 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back-outline" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-lg">ชำระเงิน</Text>
          <Text className="text-white font-semibold text-lg"></Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* ข้อมูลสินค้า */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            รายละเอียดสินค้า
          </Text>
          <View className="flex-row">
            <View className="w-20 h-20 bg-gray-200 rounded-lg mr-3">
              {/* TODO: แสดงรูปสินค้าจาก quotationData.images */}
              {/* <Image 
                source={{ uri: quotationData.images }} 
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              /> */}
              <Text className="text-gray-500 text-center leading-20">
                รูป
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">
                {quotationData.productName}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
                {quotationData.details}
              </Text>
              <Text className="text-blue-600 font-bold text-lg mt-2">
                ฿{quotationData.price}
              </Text>
            </View>
          </View>
        </View>

        {/* วิธีการชำระเงิน */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            เลือกวิธีการชำระเงิน
          </Text>

          {/* เครดิต - คอมเมนต์ไว้เพราะยังไม่ได้ทำระบบเครดิต */}
          <View
            // onPress={() => {handlePaymentSelect("credit"); setQrcode(false);}}
            className={`flex-row items-center p-4 mb-3 rounded-lg border-2  bg-gray-200 ${
              selectedPayment === "credit"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <View className="w-12 h-12 bg-yellow-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="wallet" size={24} color="#EAB308" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">ใช้เครดิต</Text>
              <Text className="text-gray-600 text-sm">
                เครดิตคงเหลือ: 50,000 บาท
              </Text>
            </View>
            <Ionicons
              name={
                selectedPayment === "credit"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={selectedPayment === "credit" ? "#3B82F6" : "#9CA3AF"}
            />
          </View>

          {/* ช่องกรอกจำนวนเครดิต */}
          {selectedPayment === "credit" && (
            <View className="bg-blue-50 p-4 mb-3 rounded-lg border border-blue-200">
              <Text className="text-gray-700 mb-2">
                กรอกจำนวนเครดิตที่ต้องการใช้
              </Text>
              <TextInput
                className="border border-gray-300 p-3 rounded-lg bg-white"
                placeholder={`ใส่จำนวน (ต้องการ ฿${parseInt(quotationData.price) + 50})`}
                keyboardType="numeric"
                value={creditAmount}
                onChangeText={setCreditAmount}
              />
            </View>
          )}

          {/* โอนเงิน - คอมเมนต์ไว้เพราะยังไม่ได้เชื่อมต่อธนาคาร */}
          <View
            // onPress={() => {handlePaymentSelect("transfer"); setQrcode(false);}}
            className={`flex-row items-center p-4 mb-3 rounded-lg border-2 bg-gray-200 ${
              selectedPayment === "transfer"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="card" size={24} color="#22C55E" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">โอนเงินผ่านธนาคาร</Text>
              <Text className="text-gray-600 text-sm">โอนเงินเข้าบัญชีบริษัท</Text>
            </View>
            <Ionicons 
              name={selectedPayment === "transfer" ? "radio-button-on" : "radio-button-off"} 
              size={20}
              color={selectedPayment === "transfer" ? "#3B82F6" : "#9CA3AF"}
            />
          </View>

          {/* พร้อมเพย์ - ใช้ได้ */}
          <TouchableOpacity
            onPress={() => {handlePaymentSelect("promptpay"); setQrcode(true);}}
            className={`flex-row items-center p-4 rounded-lg border-2 ${
              selectedPayment === "promptpay"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="qr-code" size={24} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">พร้อมเพย์</Text>
              <Text className="text-gray-600 text-sm">
                สแกน QR Code เพื่อชำระ
              </Text>
            </View>
            <Ionicons
              name={selectedPayment === "promptpay" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={selectedPayment === "promptpay" ? "#3B82F6" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>

        {/* สรุปการชำระเงิน */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            สรุปการชำระเงิน
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">ราคาสินค้า</Text>
            <Text className="text-gray-800">฿{quotationData.price}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">ค่าธรรมเนียม</Text>
            <Text className="text-gray-800">฿50</Text>
          </View>
          <View className="border-t border-gray-200 pt-2">
            <View className="flex-row justify-between">
              <Text className="font-bold text-gray-800">รวมทั้งสิ้น</Text>
              <Text className="font-bold text-blue-600 text-lg">
                ฿{parseInt(quotationData.price) + 50}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ปุ่มชำระเงิน */}
      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          onPress={handleFinalPayment}
          className={`py-4 rounded-lg ${selectedPayment ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <Text
            className={`text-center font-bold text-lg ${selectedPayment ? "text-white" : "text-gray-500"}`}
          >
            ยืนยันการชำระเงิน ฿{parseInt(quotationData.price) + 50}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal ยืนยันการชำระ */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        {qrcode ? (
          <>
             <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white w-11/12 p-4 rounded-lg">
                <Text className="text-lg font-semibold mb-4 text-center">
                  ยืนยันการชำระเงิน
                </Text>

                <View className="w-full h-[40vh] mb-4 flex justify-center items-center">
                  {/* TODO: สร้าง QR Code จริงจาก API */}
                  <Image
                    source={require("../assets/Qrcode.jpg")}
                    className="w-full h-full"
                  />
                  {/* <Text className="text-gray-500">QR Code จะแสดงที่นี่</Text> */}
                </View>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="bg-gray-300 px-6 py-3 rounded-lg flex-1"
                    onPress={() => setConfirmModalVisible(false)}
                  >
                    <Text className="text-gray-700 text-center font-semibold">
                      ยกเลิก
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white w-11/12 p-4 rounded-lg">
                <Text className="text-lg font-semibold mb-4 text-center">
                  ยืนยันการชำระเงิน
                </Text>
                <View className="items-center mb-4">
                  <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
                </View>
                <Text className="text-center text-gray-600 mb-2">
                  คุณกำลังจะชำระเงินจำนวน
                </Text>
                <Text className="text-center font-bold text-2xl text-blue-600 mb-4">
                  ฿{parseInt(quotationData.price) + 50}
                </Text>
                <Text className="text-center text-gray-600 mb-6">
                  ผ่าน
                  {selectedPayment === "credit"
                    ? "เครดิต"
                    : selectedPayment === "transfer"
                      ? "โอนเงิน"
                      : "พร้อมเพย์"}
                </Text>
                <View className="flex-row justify-between">
                  <TouchableOpacity 
                    className="bg-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                    onPress={() => setConfirmModalVisible(false)}
                  >
                    <Text className="text-gray-700 text-center font-semibold">ยกเลิก</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="bg-blue-500 px-6 py-3 rounded-lg flex-1 ml-2"
                    onPress={handleConfirmPayment}
                  >
                    <Text className="text-white text-center font-semibold">ยืนยัน</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </Modal>
    </SafeAreaView>
  );
}