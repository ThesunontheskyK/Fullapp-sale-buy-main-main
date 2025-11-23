import { Text, View , StyleSheet } from "react-native";

export default function PaymentSummary({ price , fee }) {
    
  const total = parseInt(price) + fee;

  return (
    <View style={styles.boxShadow} className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
      <Text className="text-lg font-bold text-gray-800 mb-3"> สรุปการชำระเงิน </Text>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">ราคาสินค้า</Text>
        <Text className="text-gray-800">฿{price}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">ค่าธรรมเนียม</Text>
        <Text className="text-gray-800">฿{fee}</Text>
      </View>
      <View className="border-t border-gray-200 pt-2">
        <View className="flex-row justify-between">
          <Text className="font-bold text-gray-800">รวมทั้งสิ้น</Text>
          <Text className="font-bold text-[#125c91] text-lg"> ฿{total} </Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  boxShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
})