import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentMethods({
  selectedPayment,
  onPaymentSelect,
  creditAmount,
  onCreditAmountChange,
  quotationData,
  setQrcode,
}) {
  return (
    <View style={styles.boxShadow}className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
      <Text className="text-lg font-bold text-gray-800 mb-4">
        เลือกวิธีการชำระเงิน
      </Text>

      <View
        className={`flex-row items-center p-4 mb-3 rounded-lg border-1 bg-gray-200 ${
          selectedPayment === "credit" ? "border-[#125c91] bg-[#d5edff]" : "border-gray-200"
        }`}
      >
        <View className="w-12 h-12 bg-white border border-black/20 rounded-full items-center justify-center mr-3">
          <Ionicons name="wallet" size={24} color="#125c91" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">ใช้เครดิต</Text>
          <Text className="text-gray-600 text-sm">
            เครดิตคงเหลือ: 50,000 บาท
          </Text>
        </View>

        <Ionicons
          name={ selectedPayment === "credit" ? "radio-button-on" : "radio-button-off"}
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
            onChangeText={onCreditAmountChange}
          />
        </View>
      )}

      {/* โอนเงิน - ปิดใช้งาน */}
      <View
        className={`flex-row items-center  p-4 mb-3 rounded-lg border-1 bg-gray-200 ${
          selectedPayment === "transfer"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200"
        }`}
      >
        <View className="w-12 h-12 bg-white border border-black/20 rounded-full items-center justify-center mr-3">
          <Ionicons name="card" size={24} color="#125c91" />
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

      {/* พร้อมเพย์ - ใช้งานได้ */}
      <Pressable
        onPress={() => {
          onPaymentSelect("promptpay");
          setQrcode(true);
        }}
        className={`flex-row items-center p-4 rounded-lg border ${
          selectedPayment === "promptpay"? "border-[#125c91] bg-[#d5edff]" : "border-gray-200"}`}
        >
        <View className="w-12 h-12 bg-white border border-black/20 rounded-full items-center justify-center mr-3">
          <Ionicons name="qr-code" size={24} color="#125c91" />
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
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  boxShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
})