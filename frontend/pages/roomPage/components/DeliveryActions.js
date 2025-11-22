import { Text, View , Pressable } from "react-native";

export default function DeliveryActions({ onCancel, onConfirm }) {
  return (
    <View className="px-6 py-2 flex-row justify-center gap-3">
      <Pressable
        className="w-1/2 bg-transparent  py-3 border border-black/40 px-4 rounded-lg items-center justify-center"
        onPress={onCancel}
      >
        <Text className="text-black/80 font-semibold">ยกเลิกสินค้า</Text>
      </Pressable>

      <Pressable
        className="w-1/2 bg-[#125c91] py-3 px-4  rounded-lg items-center justify-center"
        onPress={onConfirm}
      >
      <Text className="text-white font-semibold">ยืนยันได้รับสินค้า</Text>
      </Pressable>
    </View>
  );
}