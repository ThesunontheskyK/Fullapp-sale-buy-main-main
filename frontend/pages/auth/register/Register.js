// register/Register.jsx

import { useState, useEffect } from "react";
import * as React from "react";
import { Text, View, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FormInput from "./components/FormInput";
import PasswordInput from "./components/PasswordInput";
import PasswordRequirements from "./components/PasswordRequirements";
import CheckboxAgreement from "./components/CheckboxAgreement";
import AntDesign from "@expo/vector-icons/AntDesign";
import api from "../../../config/api";
import * as SecureStore from "expo-secure-store";

import {
  validateFullname,
  validatePhone,
  validateEmail,
  validatePassword,
} from "./utils/validation";

import { MESSAGES, PLACEHOLDERS, LABELS } from "./contants";

export default function Register({ navigation }) {

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [check_fullname, setCheck_fullname] = useState(false);
  const [check_phone, setCheck_phone] = useState(false);
  const [check_email, setCheck_email] = useState(false);
  const [check_password, setCheck_password] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkfulldata , setCheckfulldata] = useState(false);
  const [ConfirmEmail , setConfirmEmail] = useState(true);

  const handleCreate = async () => {

    if (!fullname.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setCheckfulldata(false);
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    } else {
       setCheckfulldata(true);
    }

    // ตรวจสอบแต่ละข้อมูลและแจ้งเตือนเฉพาะเจาะจง
    if (!check_fullname) {
      Alert.alert("ข้อผิดพลาด", "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร");
      return;
    }

    if (!check_email) {
      Alert.alert("ข้อผิดพลาด", "รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    if (!check_password) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร, ประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข (สามารถใส่อักขระพิเศษ เช่น @#$% ได้)");
      return;
    }

    if (!check_phone) {
      Alert.alert("ข้อผิดพลาด", "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก");
      return;
    }

    if (!checked) {
      Alert.alert("ข้อผิดพลาด", "กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว");
      return;
    }

    try {
      // เรียก API register
      const response = await api.post('/auth/register', {
        username: email.split('@')[0], // ใช้ส่วนแรกของ email เป็น username
        email: email.trim(),
        password: password,
        fullName: fullname.trim(),
        phoneNumber: phone.trim()
      });

      if (response.status === 201 && response.data.success) {
        const { token, user } = response.data.data;

        // บันทึก token และ user_id
        await SecureStore.setItemAsync("token", token);
        await SecureStore.setItemAsync("user_id", user.id);

        // นำทางไปหน้า ConfirmEmail หรือ OTP
        navigation.navigate("ConfirmEmail", { email });
      }
    } catch (error) {
      console.log("Register error:", error);

      let errorMessage = "เกิดข้อผิดพลาดในการสร้างบัญชี";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("ไม่สามารถสร้างบัญชีได้", errorMessage);
    }
  };

  useEffect(() => {
    setCheck_fullname(validateFullname(fullname));
  }, [fullname]);

  useEffect(() => {
    setCheck_phone(validatePhone(phone));
  }, [phone]);

  useEffect(() => {
    setCheck_email(validateEmail(email));

    // ตรวจสอบ email ว่ามีในระบบแล้วหรือไม่
    const checkemail = async () => {
      // ตรวจสอบเฉพาะเมื่อ email valid
      if (!validateEmail(email)) {
        setConfirmEmail(true);
        return;
      }

      try {
        // เรียก API เพื่อตรวจสอบว่า email ซ้ำหรือไม่
        // สำหรับตอนนี้เราข้ามการเช็ค email ซ้ำไว้ก่อน
        // เพราะ backend จะเช็คให้อยู่แล้วตอนลงทะเบียน
        setConfirmEmail(true);

      } catch (err) {
        console.log("Check email error:", err);
        setConfirmEmail(true);
      }
    };

    checkemail();
  }, [email]);

  useEffect(() => {
    setCheck_password(validatePassword(password));
  }, [password]);

  useEffect(() => {
    if (!fullname.trim() || !phone.trim() || !email.trim() || !password.trim() ||phone.length !== 10) {
        setCheckfulldata(false);
        return;
    }else{
        setCheckfulldata(true); 
    }
  },[fullname , phone , email , password]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-[#f5f5f5] p-4">
        {/* Header */}
        <View className="border-b border-black/10 w-full h-[7%] flex flex-row justify-between items-center ">
            <Pressable onPress={() => navigation.goBack()}>
                <AntDesign name="left" size={30} color="gray" />
            </Pressable>
            <Text className="text-xl font-bold text-[#125c91] pr-3 ">สร้างบัญชีผู้ใช้</Text>
            <Text></Text>
        </View>

        <View className="w-full mt-6 h-auto px-2 gap-5">
          {/* Title */}
          <View className="w-full h-auto flex gap-1">
            <Text className="text-sm text-black/70 font-bold">ขั้นตอนที่ 1 จาก 2</Text>
            <Text className="font-bold text-[18px] text-black/70">
              สร้างบัญชีเพื่อเริ่มต้นการเป็นสมาชิคของคุณ
            </Text>
            <Text className="font-bold text-sm text-black/70">
              เหลืออีกเพียงไม่กี่ขั้นตอนของคุณก็เสร็จสิ้นแล้ว
            </Text>
          </View>

          <View className="py-4 px-4 gap-3 mt-8 border border-black/10 rounded-xl">
            {/* Fullname */}
            <FormInput
              label={LABELS.fullname}
              value={fullname}
              onChangeText={setFullname}
              placeholder={PLACEHOLDERS.fullname}
              validated={check_fullname}
            />

            {/* Email */}
            <FormInput
              label={LABELS.email}
              value={email}
              onChangeText={setEmail}
              placeholder={PLACEHOLDERS.email}
              validated={check_email}
              keyboardType="email-address"
              autoCapitalize="none"
              ConfirmEmail={ConfirmEmail}
            />
            {ConfirmEmail 
            ?(<View><Text className="hidden"></Text></View>) 
            
            :(<View><Text className="text-red-500 text-sm">บัญชีนี้เคยถูกใช้ไปแล้ว</Text></View>)}

            {/* Password */}
            <PasswordInput
              label={LABELS.password}
              value={password}
              onChangeText={setPassword}
              placeholder={PLACEHOLDERS.password}
            />

            {/* Password Requirements */}
            <PasswordRequirements password={password} />

            {/* Phone */}
            <FormInput
              label={LABELS.phone}
              value={phone}
              onChangeText={setPhone}
              placeholder={PLACEHOLDERS.phone}
              validated={check_phone}
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* Checkbox */}
            <CheckboxAgreement
              checked={checked}
              onPress={() => setChecked(!checked)}
            />

            {/* Submit */}
            <Pressable
              onPress={handleCreate}
              className={`mt-10 rounded-md ${
                !checkfulldata ? "bg-gray-400" : "bg-[#125c91]"
              } w-full h-16 flex justify-center items-center`}
            >
              <Text className="text-xl text-white font-semibold">ถัดไป</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}