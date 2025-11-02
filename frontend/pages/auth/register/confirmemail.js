// register/ConfirmEmail.jsx

import { useState, useEffect, useRef } from "react";
import * as React from "react";
import { Text, View, Pressable, Alert, TextInput ,Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function ConfirmEmail({ navigation, route }) {
  const { email } = route.params || {};
  
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(focusTimeout);
  }, []);

  useEffect(() => {

    if (code.length === 6) {
      Keyboard.dismiss();
    }
  }, [code]);

  const handleVerify = () => {

    if (code === "123456") {
        navigation.navigate("Terms");
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    
    setTimer(60);
    setCanResend(false);
    setCode("");
  };

  const handleCodeChange = (text) => {
    // รับเฉพาะตัวเลข 6 หลักเท่านั้น
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 6) {
      setCode(numericText);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white p-4">
        {/* Header */}
        <View className="border-b border-black/10 w-full h-[7%] flex flex-row justify-between items-center">
          <Pressable onPress={() => navigation.goBack()}>
            <AntDesign name="left" size={30} color="gray" />
          </Pressable>
          <Text className="text-xl font-bold text-[#125c91] pr-3">สร้างบัญชีผู้ใช้</Text>
          <Text></Text>
        </View>

        <View className="w-full mt-6 h-[80vh] px-2 gap-5 relative">
          {/* Title */}
          <View className="w-full h-auto flex gap-2">
            <Text className="text-sm text-black/70 font-bold">ขั้นตอนที่ 2 จาก 2</Text>
            <Text className="font-bold text-[18px] text-black/70">
              ยืนยันอีเมล
            </Text>
            <Text className="text-sm text-black/60 leading-5">
              กรุณายืนยันรหัส 6 หลัก เพื่อสร้างบัญชีผู้ใช้ Safe Pro ได้ส่งให้ทางอีเมล{" "}
              <Text className="font-semibold text-[#125c91]">{email}</Text> ถ้าไม่พบกรุณาตรวจสอบในกล่องข้อความ Spam
            </Text>
          </View>

          {/* OTP Input Section */}
          <View className="w-full mt-10 py-8 px-4 bg-white rounded-2xl shadow-sm">
            <View className="flex items-center gap-6">
              {/* Input Field */}
              <View className="w-full">
                <TextInput
                  ref={inputRef}
                  value={code}
                  onChangeText={handleCodeChange}
                  placeholder="กรอกรหัส 6 หลัก"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="off"
                  textContentType="none"
                  className="border-2 w-full border-black/20 px-4 py-4 rounded-[10px] text-center text-xl font-bold tracking-widest "
                />
                {/* Progress indicator */}
                <View className="flex flex-row justify-center gap-2 mt-4">
                  {[...Array(6)].map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index < code.length ? "bg-[#125c91]" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </View>
              </View>

              {/* Timer and Resend */}
              <View className="flex items-center gap-2 mt-4">
                {!canResend ? (
                  <View className="flex flex-row items-center gap-2">
                    <Text className="text-black/60">ยังไม่ได้รับ Code? ส่งอีกครั้งใน</Text>
                    <View className="text-[#125c91] px-3 py-1 rounded-full">
                      <Text className="text-[#125c91] font-bold">{timer}s</Text>
                    </View>
                  </View>
                ) : (
                  <Text className="text-black/60">ยังไม่ได้รับ Code?</Text>
                )}

                <Pressable
                  onPress={handleResend}
                  disabled={!canResend}
                  className={`mt-2 ${!canResend ? "opacity-50" : ""}`}
                >
                  <Text className="text-[#125c91] font-semibold text-base underline">
                    ส่งรหัสอีกครั้ง
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Manual Verify Button (Optional) */}
          <Pressable
            onPress={handleVerify}
            disabled={code.length !== 6}
            className={`mt-6 rounded-xl ${
              code.length === 6 ? "bg-[#125c91]" : "bg-gray-400"
            } w-full h-16 flex justify-center items-center absolute bottom-0 left-2`}
          >
            <Text className="text-lg text-white font-semibold">ยืนยัน</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}