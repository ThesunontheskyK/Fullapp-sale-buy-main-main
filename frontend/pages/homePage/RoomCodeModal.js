import React from "react";
import { Text, View, Pressable, Modal, Share } from "react-native";
import * as Clipboard from 'expo-clipboard';
import { Alert } from "react-native";

export default function RoomCodeModal({ visible, roomCode, onClose }) {
  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(roomCode);
    Alert.alert("คัดลอกแล้ว", "คัดลอกรหัสห้องไปยังคลิปบอร์ดแล้ว");
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `เข้าร่วมห้องแชท SavePro ด้วยรหัส: ${roomCode}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-[85%] bg-white p-6 rounded-2xl">
          <Text className="text-2xl font-bold text-center mb-2 text-[#125c91]">
            สร้างห้องสำเร็จ!
          </Text>

          <Text className="text-center text-gray-600 mb-6">
            แชร์รหัสนี้ให้กับผู้ที่ต้องการเข้าร่วมห้องแชท
          </Text>

          {/* Room Code Display */}
          <View className="bg-gray-100 p-4 rounded-xl mb-6">
            <Text className="text-center text-gray-500 text-sm mb-2">
              รหัสห้อง
            </Text>
            <Text className="text-center text-4xl font-bold text-[#125c91] tracking-widest">
              {roomCode}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <Pressable
              onPress={handleCopyCode}
              className="bg-gray-200 p-4 rounded-lg"
            >
              <Text className="text-center font-semibold text-gray-700">
                คัดลอกรหัส
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShareCode}
              className="bg-[#125c91] p-4 rounded-lg"
            >
              <Text className="text-center font-semibold text-white">
                แชร์รหัส
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="bg-green-600 p-4 rounded-lg"
            >
              <Text className="text-center font-bold text-white">
                เข้าสู่ห้องแชท
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
