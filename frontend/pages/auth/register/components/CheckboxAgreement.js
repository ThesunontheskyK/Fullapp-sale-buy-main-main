// register/components/CheckboxAgreement.jsx

import React from "react";
import { Text, View, Pressable } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function CheckboxAgreement({ checked, onPress }) {
  return (
    <View className="w-full h-10 mt-8 flex flex-row justify-start items-center gap-4">
      <Pressable
        onPress={onPress}
        className={`w-5 h-5 border-2 rounded ${
          checked ? "bg-[#125c91] border" : "border-gray-400"
        } flex items-center justify-center`}
      >
        <AntDesign name="check" size={12} color="#ffffff" />
      </Pressable>
      <Text className="text-sm">
        ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
      </Text>
    </View>
  );
}