import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

export default function LogoutPopup({ visible, onClose, onConfirm }) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1  bg-black/30 justify-center items-center px-4">
        <View className="bg-white w-[90%] rounded-2xl p-6 shadow-lg">
          <Text className="text-lg font-bold text-center mb-2 text-gray-800">
            ยืนยันการออกจากระบบ
          </Text>
          <Text className="text-center text-gray-600 text-sm mb-6">
            คุณต้องการออกจากระบบใช่หรือไม่?
          </Text>

          <View className="flex flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-gray-500">
                ยกเลิก
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              className="flex-1 bg-[#125c91] py-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-white">
                ตกลง
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}