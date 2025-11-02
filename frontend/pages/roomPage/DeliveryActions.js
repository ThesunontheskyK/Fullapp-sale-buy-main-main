import { Text, View, TouchableOpacity } from "react-native";

export default function DeliveryActions({ onCancel, onConfirm }) {
  return (
    <View className="px-6 py-2 flex-row justify-center gap-3">
      <TouchableOpacity
        className="w-1/2 bg-red-400 py-3 border border-black/50 px-4 rounded-lg items-center justify-center"
        onPress={onCancel}
      >
        <Text className="text-white font-semibold">ยกเลิกสินค้า</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-1/2 bg-green-400 py-3 px-4 border border-black/50 rounded-lg items-center justify-center"
        onPress={onConfirm}
      >
        <Text className="text-white font-semibold">ยืนยันได้รับสินค้า</Text>
      </TouchableOpacity>
    </View>
  );
}