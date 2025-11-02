import { useState, useEffect } from "react";
import * as React from "react";
import { Text, View, Image, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Register({ navigation }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");

  const [check_email, setCheck_email] = useState(false);
  const [check_password, setCheck_password] = useState(false);
  const [check_confirmPassword, setCheck_confirmPassword] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const [checked, setChecked] = useState(false);

  const handleCreate = () => {
    if (!email?.trim() || !password?.trim()) return;

    if (!check_email || !check_password || !check_confirmPassword || !checked) return;

    
  };

  useEffect(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setCheck_email(emailPattern.test(email.trim()));
  }, [email]);

  // ตรวจสอบ password
  useEffect(() => {
    if (!password.trim()) {
      setCheck_password(false);
      return;
    }
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    setCheck_password(passwordPattern.test(password));
  }, [password]);

  // ตรวจสอบ confirm password
  useEffect(() => {
    if (!confirmTouched) {
      setConfirmError("");
      setCheck_confirmPassword(false);
      return;
    }

    if (ConfirmPassword !== password) {
      setConfirmError("รหัสผ่านไม่ตรงกัน");
      setCheck_confirmPassword(false);
    } else {
      setConfirmError("");
      setCheck_confirmPassword(true);
    }
  }, [ConfirmPassword, password, confirmTouched]);

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white p-4">
        {/* Logo */}
        <View className="w-full h-[15%] flex justify-center items-center">
          <View className="w-[40%] h-full">
            <Image
              source={require("../../assets/logosafepro.webp")}
              className="w-full h-full"
            />
          </View>
        </View>

        <View className="w-full mt-6 h-auto px-2 gap-5">
          <View className="w-full h-auto flex gap-1">
            <Text className="text-sm text-black/70 font-bold"> ขั้นตอนที่ 1 จาก 2 </Text>
            <Text className="font-bold text-[18px] text-black/70"> สร้างรหัสผ่านเพื่อเริ่มต้นการเป็นสมาชิคของคุณ</Text>
            <Text className="font-bold text-sm text-black/70">เหลืออีกเพียงไม่กี่ขั้นตอนของคุณก็เสร็จสิ้นแล้ว</Text>
          </View>

          <View className="py-2 px-2 gap-3 mt-10">
            {/* Email */}
            <Text className="font-semibold text-sm text-black/70">Email *</Text>
            <View className="relative flex">
              <View
                className={`w-5 h-5 rounded-md absolute right-2 top-1 ${
                  check_email ? "bg-[#125c91]" : ""
                }`}
              ></View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border-b border-black/50 rounded-md py-1 px-2 focus:border-blue-800"
              />
              <AntDesign
                className="absolute right-[9px] top-2"
                name="check"
                size={12}
                color="#fff"
              />
            </View>

            {/* Password */}
            <Text className="font-semibold text-black/70">Password *</Text>
            <View className="relative flex">
              <View
                className={`w-5 h-5 rounded-md absolute right-2 top-1 ${
                  check_password ? "bg-[#125c91]" : ""
                }`}
              ></View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                className="border-b border-black/50 rounded-md py-1 px-2 focus:border-blue-800"
              />
              <AntDesign
                className="absolute right-[9px] top-2"
                name="check"
                size={12}
                color="#fff"
              />
            </View>

            {/* Confirm Password */}
            <Text className="font-semibold text-black/70">Confirm Password *</Text>
            <View>
              <TextInput
                value={ConfirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => setConfirmTouched(true)}
                className="border-b border-black/50 rounded-md py-1 px-2 focus:border-blue-800"
              />
              {confirmError ? (
                <Text className="text-red-600 text-sm mt-1">{confirmError}</Text>
              ) : null}
            </View>

            {/* Checkbox */}
            <View className="w-full h-10 mt-16 flex flex-row justify-start items-center gap-4">
              <Pressable
                onPress={() => setChecked(!checked)}
                className={`w-5 h-5 border-2 rounded ${
                  checked ? "bg-[#125c91] border" : "border-gray-400"
                } flex items-center justify-center`}
              >
                <AntDesign name="check" size={12} color="#ffffff" />
              </Pressable>
              <Text className="text-sm">ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว </Text>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleCreate}
              className="mt-10 rounded-md bg-[#125c91] w-full h-16 flex justify-center items-center"
            >
              <Text className="text-xl text-white font-semibold">ถัดไป</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
