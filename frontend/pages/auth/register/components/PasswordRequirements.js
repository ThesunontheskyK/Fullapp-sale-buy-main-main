// register/components/PasswordRequirements.jsx

import React from "react";
import { Text, View } from "react-native";
import {
  checkPasswordLength,
  checkPasswordUpperCase,
  checkPasswordLowerCase,
  checkPasswordNumber,
} from "../utils/validation";

export default function PasswordRequirements({ password }) {
  if (password.length === 0) return null;

  return (
    <View className="mt-2">
      <Text
        className={`text-xs ${
          checkPasswordLength(password) ? "text-green-600" : "text-red-500"
        }`}
      >
        {checkPasswordLength(password)
          ? "✓ ความยาวมากกว่า 8 ตัวอักษร"
          : "✗ ต้องมีความยาวอย่างน้อย 8 ตัว"}
      </Text>
      <Text
        className={`text-xs ${
          checkPasswordUpperCase(password) ? "text-green-600" : "text-red-500"
        }`}
      >
        {checkPasswordUpperCase(password)
          ? "✓ มีตัวพิมพ์ใหญ่"
          : "✗ ต้องมีตัวพิมพ์ใหญ่ อย่างน้อย 1 ตัว"}
      </Text>
      <Text
        className={`text-xs ${
          checkPasswordLowerCase(password) ? "text-green-600" : "text-red-500"
        }`}
      >
        {checkPasswordLowerCase(password)
          ? "✓ มีตัวพิมพ์เล็ก"
          : "✗ ต้องมีตัวพิมพ์เล็ก อย่างน้อย 1 ตัว"}
      </Text>
      <Text
        className={`text-xs ${
          checkPasswordNumber(password) ? "text-green-600" : "text-red-500"
        }`}
      >
        {checkPasswordNumber(password)
          ? "✓ มีตัวเลข"
          : "✗ ต้องมีตัวเลข อย่างน้อย 1 ตัว"}
      </Text>
    </View>
  );
}