// register/components/FormInput.jsx

import React from "react";
import { Text, View, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  validated,
  keyboardType = "default",
  autoCapitalize = "none",
  maxLength,
  ConfirmEmail
}) {

  const handleClik = () => {
    Keyboard.dismiss();
  }
  return (
    <TouchableWithoutFeedback onPress={handleClik}>
      <View>
        <Text className="font-semibold text-sm text-black/70">{label}</Text>
        <View className="relative flex">
          <View
            className={`w-5 h-5 rounded-md absolute right-2 top-1 ${
              validated && ConfirmEmail ? "bg-[#125c91]" : ""
            }`}
          ></View>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            className="border-b border-black/50 rounded-md py-1 px-2 focus:border-blue-800"
          />
          <AntDesign
            className="absolute right-[9px] top-2"
            name="check"
            size={12}
            color="#fff"
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}