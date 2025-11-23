import { Text, View, TouchableOpacity , StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentHeader({ navigation }) {
  return (
    <View className="bg-[#125c91] shadow-sm">
      <View className="flex-row items-center px-4 py-3 justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-[#125c91] rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-semibold text-lg">ชำระเงิน</Text>
        <View className="w-10" />
      </View>
    </View>
  );
}