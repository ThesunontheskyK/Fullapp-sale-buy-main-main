// register/components/PasswordInput.jsx

import React, { useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
}) {
  const [secure, setSecure] = useState(true);

  return (
    <>
      <Text className="font-semibold text-black/70">{label}</Text>
      <View className="relative flex-row items-center border-b border-black/50 rounded-md px-2">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secure}
          autoCapitalize="of"
          className="flex-1 py-2 text-base"
        />
        <Pressable onPress={() => setSecure(!secure)}>
          <Ionicons
            name={secure ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="gray"
          />
        </Pressable>
      </View>
    </>
  );
}