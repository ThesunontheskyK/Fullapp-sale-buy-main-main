import { Text, View, TextInput, TouchableOpacity, Modal } from "react-native";

export default function TrackingModal({
  visible,
  trackingNumber,
  onClose,
  onSend,
  onUpdateNumber,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white w-11/12 p-4 rounded-lg">
          <Text className="text-lg font-semibold pb-3 text-center text-[#125c91]">
            กรอกเลขขนส่ง
          </Text>
          <TextInput
            className="border p-2 mb-2 rounded border-black/50"
            placeholder="เลขขนส่ง"
            value={trackingNumber}
            onChangeText={onUpdateNumber}
          />
          <View className="flex-row justify-center mt-2 gap-2">
            <TouchableOpacity 
              className="w-1/2 bg-gray-300 px-4 py-2 rounded" 
              onPress={onClose}
            >
              <Text className="text-center">ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-1/2 bg-[#125c91] px-4 py-2 rounded" 
              onPress={onSend}
            >
              <Text className="text-white text-center">บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}