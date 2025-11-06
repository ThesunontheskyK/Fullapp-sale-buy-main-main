import React from "react";
import { Text, View, Pressable, Modal, Image } from "react-native";

export default function JoinRoomModal({
  visible,
  onClose,
  onSelectRole,
  roomCode
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <Pressable
          activeOpacity={1}
          className="w-[80%] bg-white p-4 rounded-2xl"
        >
          <Text className="text-lg font-bold text-center mb-2">
            เข้าร่วมห้องแชท
          </Text>

          <Text className="text-center text-gray-600 mb-4">
            รหัสห้อง: {roomCode}
          </Text>

          <Text className="text-center text-gray-700 mb-4">
            เลือกบทบาทของคุณ
          </Text>

          {/* Role Buttons */}
          <View className="w-full h-[20vh] p-2 py-4 flex justify-center items-center flex-row gap-3">
            <Pressable
              onPress={() => onSelectRole("seller")}
              className="w-1/2 h-full border flex justify-center items-center gap-2 rounded-lg border-black/40 bg-white active:bg-sky-200"
            >
              <Image
                source={require("../../assets/icons8-agent-100.png")}
                className="w-[70%] h-[70%]"
              />
              <Text className="font-bold text-[#125c91]">ผู้ขาย</Text>
            </Pressable>

            <Pressable
              onPress={() => onSelectRole("buyer")}
              className="w-1/2 h-full border flex justify-center items-center gap-2 rounded-lg border-black/40 bg-white active:bg-sky-200"
            >
              <Image
                source={require("../../assets/icons8-businessman-100.png")}
                className="w-[70%] h-[70%]"
              />
              <Text className="font-bold text-[#125c91]">ผู้ซื้อ</Text>
            </Pressable>
          </View>

          {/* Cancel Button */}
          <Pressable
            onPress={onClose}
            className="bg-gray-300 p-3 py-4 rounded-md mt-2"
          >
            <Text className="text-gray-700 text-center font-bold">
              ยกเลิก
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
