import React from "react";
import { Text, View, Image, FlatList, TouchableWithoutFeedback, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export default function PromotionSection() {
  
  const promotions = [
    { id: "1", image: require("../../assets/promotion-5.png") },
    { id: "2", image: require("../../assets/promotion-3.png") },
    { id: "3", image: require("../../assets/promotion-2.jpg") },
    { id: "4", image: require("../../assets/promotion.png") },
  ];

  return (
    <View className="w-full">
      <Text className="font-semibold text-[#3e3e3e] text-base mb-3 px-5">โปรโมชั่น</Text>
      
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.8 + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
        pagingEnabled={false}
        nestedScrollEnabled={true}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback>
            <View 
              className="bg-gray-200  rounded-lg overflow-hidden mr-4 "
              style={{ width: width * 0.8, height: 160 }}
            >
              <Image
                source={item.image}
                className="w-full h-full border border-black/20 rounded-lg"
                resizeMode="cover"
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      />
    </View>
  );
}