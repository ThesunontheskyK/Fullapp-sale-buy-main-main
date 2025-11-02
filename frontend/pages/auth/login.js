import { useState } from "react";
import { Text, View, Image, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import api from "../../config/api";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email?.trim() || !password?.trim()) {
      setError("กรุณากรอก email และ password");
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      if (response.status === 200 && response.data.success) {
        const { token, user } = response.data.data;

        // บันทึก token และ user_id
        await SecureStore.setItemAsync("token", token);
        await SecureStore.setItemAsync("user_id", user.id);

        // ล้าง error
        setError("");

        // นำทางไปหน้า OTP
        navigation.navigate("OTP", { email });
      }
    } catch (error) {
      console.log("Login error:", error);

      let errorMessage = "เข้าสู่ระบบไม่สำเร็จ";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Email หรือ Password ไม่ถูกต้อง";
      } else if (error.message) {
        errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
      }

      setError(errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white px-4 py-4">
        <View className="w-full h-[30%] flex justify-center items-center">
          <View className="w-[70%] h-[80%]">
            <Image
              source={require("../../assets/logosafepro.webp")}
              className="w-full h-full"
            />
          </View>
        </View>

        <Text className="text-center text-[23px] py-4 font-medium text-[#125c91]">
          Sign in
        </Text>

        <View className="border border-black/20 rounded-md px-4 py-6 flex flex-col gap-6">
          <TextInput
            value={email}
            onChangeText={setEmail}
            className="border border-black/20 rounded-md px-4 py-4 text-lg"
            placeholder="Email"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            className="border border-black/20 rounded-md px-4 py-4 text-lg"
            placeholder="Password"
            secureTextEntry={true}
          />
          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}
          <Pressable
            onPress={handleLogin}
            className="bg-[#125c91] p-4 rounded-md flex justify-center items-center"
          >
            <Text className="text-white text-lg font-medium ">Sign in</Text>
          </Pressable>

          <View className="flex flex-row justify-center items-center gap-3">
            <Text className="font-medium text-center flex gap-2 text-black/50">
              Already have an account?
            </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text className="text-[#125c91]">Sign up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
