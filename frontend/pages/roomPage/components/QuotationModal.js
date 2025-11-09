import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function QuotationModal({
  visible,
  quotationData,
  onClose,
  onSend,
  onUpdateData,
}) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return alert("ต้องอนุญาตเข้าถึงรูปภาพ");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      const existingUris = quotationData.images ? quotationData.images.split(",") : [];
      const combined = [...existingUris, ...selectedUris].slice(0, 3);
      onUpdateData({ ...quotationData, images: combined.join(",") });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white w-11/12 h-[65vh] rounded-lg overflow-hidden">
          <ScrollView className="px-4 pt-4 pb-24">
            <Text className="text-lg font-semibold mb-2 text-center p-2 border-b text-[#125c91] border-gray-300">
              สร้างใบเสนอราคา
            </Text>

            <Text className="font-semibold text-black/70 py-2">ชื่อสินค้า</Text>
            <TextInput
              className="border border-black/50 p-2 mb-2 rounded"
              placeholder="ชื่อสินค้า"
              value={quotationData.productName}
              onChangeText={(text) => onUpdateData({ ...quotationData, productName: text })}
            />

            <Text className="font-semibold text-black/70 py-2">รายละเอียดสินค้า</Text>
            <TextInput
              className="border border-black/50 p-2 mb-2 rounded"
              placeholder="รายละเอียด"
              value={quotationData.details}
              onChangeText={(text) => onUpdateData({ ...quotationData, details: text })}
            />

            <View className="mb-2">
              <Text className="mb-1 font-semibold text-black/70 py-2">
                รูปภาพสินค้า (สูงสุด 3 รูป)
              </Text>
              <View className="flex-row space-x-2 gap-3">
                {quotationData.images &&
                  quotationData.images.split(",").map((uri, idx) => (
                    <View key={idx} className="relative">
                      <Image 
                        source={{ uri: uri.trim() }} 
                        className="w-20 h-20 rounded-lg border border-black/70" 
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const newImages = quotationData.images
                            .split(",")
                            .filter((_, i) => i !== idx)
                            .join(",");
                          onUpdateData({ ...quotationData, images: newImages });
                        }}
                        className="absolute -top-2 -right-2 bg-red-400 w-5 h-5 rounded-full items-center justify-center"
                      >
                        <Text className="text-white text-xs">x</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                {(!quotationData.images || quotationData.images.split(",").length < 3) && (
                  <TouchableOpacity
                    className="w-20 h-20 ml-3 bg-gray-200 rounded-lg items-center justify-center"
                    onPress={pickImage}
                  >
                    <Text className="text-gray-600 text-3xl">+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text className="font-semibold text-black/70 py-2">ราคา</Text>
            <TextInput
              className="border border-black/50 p-2 mb-2 rounded"
              placeholder="ราคา"
              keyboardType="numeric"
              value={quotationData.price}
              onChangeText={(text) => onUpdateData({ ...quotationData, price: text })}
            />
          </ScrollView>

          <View className="flex-row justify-center items-center gap-2 p-4 border-t border-gray-200 bg-white">
            <TouchableOpacity
              className="flex-1 bg-gray-300 px-4 py-3 rounded"
              onPress={onClose}
            >
              <Text className="text-center font-semibold">ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-[#2251a2] px-4 py-3 rounded" 
              onPress={onSend}
            >
              <Text className="text-white text-center font-semibold">ส่งใบเสนอราคา</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}