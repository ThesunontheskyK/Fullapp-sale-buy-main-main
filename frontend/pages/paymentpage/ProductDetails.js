import { Text, View } from "react-native";

export default function ProductDetails({ quotationData }) {
  return (
    <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
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
          <Text className="text-blue-600 font-bold text-lg mt-2">
            ฿{quotationData.price}
          </Text>
        </View>
      </View>
    </View>
  );
}