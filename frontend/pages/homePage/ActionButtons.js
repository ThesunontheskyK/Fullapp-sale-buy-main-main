import React from "react";
import { Text, View, Pressable, Image } from "react-native";

export default function ActionButtons({ handleCreate }) {
  return (
    <View className="h-auto w-full flex flex-row flex-wrap gap-2 justify-between px-6">
      {/* Create Transaction */}
      <Pressable
        onPress={handleCreate}
        className="w-[25%] aspect-square mb-2 flex justify-center items-center gap-2"
      >
        <View className="w-[60%] h-[60%] flex justify-center items-center">
          <Image
            source={require("../../assets/icons8-transaction-1002.png")}
            className="w-[70%] h-[70%]"
          />
        </View>
        <Text className="font-semibold text-[#3e3e3e] text-sm">สร้างธุรกรรม</Text>
      </Pressable>

      {/* Package */}
      <Pressable className="w-[25%] aspect-square mb-2 flex justify-center items-center gap-2">
        <View className="w-[60%] h-[60%] flex justify-center items-center">
          <Image
            source={require("../../assets/icons8-package-96.png")}
            className="w-[80%] h-[80%]"
          />
        </View>
        <Text className="font-semibold text-[#3e3e3e] text-sm">แพ็คเกจสุดคุ้ม</Text>
      </Pressable>

      {/* Service Fee */}
      <Pressable className="w-[25%] aspect-square mb-2 flex justify-center items-center gap-2">
        <View className="w-[60%] h-[60%] flex justify-center items-center">
          <Image
            source={require("../../assets/icons8-money-96.png")}
            className="w-[70%] h-[70%]"
          />
        </View>
        <Text className="font-semibold text-[#3e3e3e] text-sm">อัตราค่าบริการ</Text>
      </Pressable>

      {/* Add Bank */}
      <Pressable className="w-[25%] aspect-square mb-2 flex justify-center items-center gap-2">
        <View className="w-[60%] h-[60%] flex justify-center items-center">
          <Image
            source={require("../../assets/icons8-bank-100.png")}
            className="w-[70%] h-[70%]"
          />
        </View>
        <Text className="font-semibold text-[#3e3e3e] text-sm">เพิ่มธนาคาร</Text>
      </Pressable>
    </View>
  );
}