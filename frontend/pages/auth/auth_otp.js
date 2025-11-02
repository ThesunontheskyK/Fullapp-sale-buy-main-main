import { useRef, useState } from "react";
import { Text, View, TextInput, Keyboard ,Pressable  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function OtpVerification({ route, navigation }) {

  const { email } = route.params || {};
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    if (cleanText && index < 5) {
      inputs.current[index + 1]?.focus();
    } else if (cleanText && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
      } else if (index > 0) {
        newOtp[index - 1] = "";
        inputs.current[index - 1]?.focus();
      }
      setOtp(newOtp);
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join("");
    if (otpValue === "123456") {
      navigation.navigate("Home");
    } else {
      setError("Invalid OTP code");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white px-4 py-4 ">
        <Pressable onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={30} color="gray" />
        </Pressable>

        <View className="flex flex-col gap-2 justify-center items-center py-4">
          <Text className=" text-center text-[30px] font-medium text-black/60">
            Verification
          </Text>
          <Text className="text-black/40 text-lg">
            Enter OTP code sent to
          </Text>
          <Text className="text-black/40 text-lg"> {email} </Text>
        </View>

        <View className="flex-col items-center w-full h-1/2 px-2 mt-20 relative">
          <View className="w-full flex py-4 flex-row justify-between">
            
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                value={value}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                className="border border-gray-300 rounded-md w-14 h-14 text-center text-2xl font-bold text-black/60"
              />
            ))}
          </View>

          {error && (
            <Text className="text-red-500 text-center py-2">{error}</Text>
          )}

          <Text className="text-center p-2 text-lg text-black/70">
            Didn't receive code?{" "}
            <Text className="text-[#07439B] underline">Resend again</Text>
          </Text>

          <Pressable
            onPress={handleVerify}
            className="w-full bg-[#07439B] h-16 flex justify-center items-center rounded-md absolute bottom-0"
          >
            <Text className="text-white text-lg font-medium">Verify</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
