import { Text, View , StyleSheet } from "react-native";

export default function ProductDetails({ quotationData , PaymentData }) {

  console.log("Paymentdata : " , PaymentData.price)
  return (
    <View style={styles.boxShadow} className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
      <Text className="text-lg font-bold text-gray-800 mb-3">
        รายละเอียดสินค้า
      </Text>
      <View className="flex-row">
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">
            {quotationData.productName}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            {quotationData.details}
          </Text>
          <Text className="text-[#125c91] font-bold text-lg mt-2">
             ฿{PaymentData.price}
          </Text>
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