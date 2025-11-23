import React from "react";
import { Text, View , Image } from "react-native";

export default function HeaderSection() {
  return (
    <View className="w-full h-[220px] min-h-[180px] bg-[#125c91] flex justify-center items-center">
     
        <Image
          source={require("../../assets/banner.png")}
          className="w-full h-full object-cover"
        />
    </View>
  );
}
