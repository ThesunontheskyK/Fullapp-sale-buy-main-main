import React from "react";
import { Text, View, Pressable, Image, Modal , TextInput } from "react-native";

export default function RoleSelectionModal({
  modalVisible,
  setModalVisible,
  selectedRole,
  setSelectedRole,
  errorRole,
  setErrorRole,
  handleCreatesubmit,
  handleCloseModal,
  setBusinessName,
  businessName,
  errorRoomName
}) {
  return (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        activeOpacity={1}
        onPress={() => setModalVisible(false)}
      >
        <Pressable
          activeOpacity={1}
          className="w-[80%] bg-white p-4 rounded-2xl"
        >
          <Text className="text-lg font-bold text-center mb-4">
            เลือกบทบาทของคุณ
          </Text>

          {/* Role Buttons */}
          <View className="w-full h-[20vh] p-2 py-4 flex justify-center items-center flex-row gap-3">
            <Pressable
              onPress={() => {
                setSelectedRole("seller");
                setErrorRole(true);
              }}
              className={`w-1/2 h-full border flex justify-center items-center gap-2 rounded-lg border-black/40 ${
                selectedRole === "seller" ? "bg-sky-200" : "bg-white"
              }`}
            >
              <Image
                source={require("../../assets/icons8-agent-100.png")}
                className="w-[70%] h-[70%]"
              />
              <Text className="font-bold text-[#125c91]">ผู้ขาย</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectedRole("buyer");
                setErrorRole(true);
              }}
              className={`w-1/2 h-full border flex justify-center items-center gap-2 rounded-lg border-black/40 ${
                selectedRole === "buyer" ? "bg-sky-200" : "bg-white"
              }`}
            >
              <Image
                source={require("../../assets/icons8-businessman-100.png")}
                className="w-[70%] h-[70%]"
              />
              <Text className="font-bold text-[#125c91]">ผู้ซื้อ</Text>
            </Pressable>
          </View>
          <View className="w-full h-20 flex justify-center items-center">
            <TextInput value={businessName} onChangeText={setBusinessName} className="w-full h-14 p-3 border border-black/20 rounded-md " placeholder="ระบุชื่อธุรกรรม"></TextInput>
          </View>


          {/* Error Message */}
          {!errorRole && (
            <Text className="text-center py-3  text-sm  text-red-500 font-semibold">
              กรุณาเลือกบทบาทผู้สร้างธุรกรรม
            </Text>
          )}

          {!errorRoomName && (
            <Text className="text-center py-3 text-sm  text-red-500 font-semibold">
              กรุณากรอกชื่อธุรกรรม
            </Text>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleCreatesubmit}
            className="bg-[#125c91] p-3 py-4 rounded-md"
          >
            <Text className="text-white text-center font-bold">
              สร้างธุรกรรม
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}