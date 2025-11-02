import { Text, View, TouchableOpacity, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  totalAmount,
  selectedPayment,
  qrcode,
}) {
  const getPaymentMethodName = () => {

    switch (selectedPayment) {
      case "credit":
        return "เครดิต";
      case "transfer":
        return "โอนเงิน";
      case "promptpay":
        return "พร้อมเพย์";
      default:
        return "";
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">

      {qrcode ? (
        // QR Code Modal
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 p-4 rounded-lg">
            <Text className="text-lg font-semibold mb-4 text-center">
              ยืนยันการชำระเงิน
            </Text>

            <View className="w-full h-[40vh] mb-4 flex justify-center items-center">
              {/* TODO: สร้าง QR Code จริงจาก API */}
              <Image
                source={require("../../assets/Qrcode.jpg")}
                className="w-full h-full"
              />
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-300 px-6 py-3 rounded-lg flex-1"
                onPress={onClose}
              >
                <Text className="text-gray-700 text-center font-semibold">
                  ยกเลิก
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Confirmation Modal
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 p-4 rounded-lg">
            <Text className="text-lg font-semibold mb-4 text-center"> ยืนยันการชำระเงิน </Text>
            <View className="items-center mb-4">
              <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
            </View>
            <Text className="text-center text-gray-600 mb-2"> คุณกำลังจะชำระเงินจำนวน </Text>
            <Text className="text-center font-bold text-2xl text-blue-600 mb-4"> ฿{totalAmount}</Text>
            <Text className="text-center text-gray-600 mb-6">
              ผ่าน{getPaymentMethodName()}
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-300 px-6 py-3 rounded-lg flex-1 mr-2"
                onPress={onClose}
              >
                <Text className="text-gray-700 text-center font-semibold"> ยกเลิก </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-blue-500 px-6 py-3 rounded-lg flex-1 ml-2"
                onPress={onConfirm}
              >
                <Text className="text-white text-center font-semibold"> ยืนยัน </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}