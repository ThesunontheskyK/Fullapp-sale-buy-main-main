import React from "react";
import { Text, View } from "react-native";

export default function HeaderSection() {
  return (
    <View className="w-full min-h-[180px] bg-[#197dc5] flex justify-center items-center">
      <View className="w-[95%] min-h-[140px] p-4 flex flex-row bg-white rounded-2xl">
        <View className="w-4/6 flex justify-center gap-2 p-4">
          <Text className="text-[28px] text-sky-800 font-bold">
            ยินดีต้อนรับสู่
          </Text>
          <Text className="text-2xl text-sky-800 font-medium">Safe PRO</Text>
          <Text className="font-medium text-[14px] text-sky-800">
            Point ของคุณ = 50 Point
          </Text>
        </View>
        <View className="w-2/6 bg-white border"></View>
      </View>
    </View>
  );
}