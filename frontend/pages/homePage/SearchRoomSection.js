import React from "react";
import { Text, View, Pressable, TextInput } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";

export default function SearchRoomSection({
  Idroom,
  setIdroom,
  setNotFound,
  handleInput,
  notFound,
  errorRoom,
}) {
  return (
    <View className="w-full flex justify-center items-center px-4 py-8 pb-10">
      <View className="w-full h-[50px] border border-black/50 rounded-full flex flex-row items-center px-1">
        <View className="w-1/5 h-full flex justify-center items-center">
          <EvilIcons name="search" size={40} color="#125c91" />
        </View>
        <View className="w-3/5 h-full flex justify-center">
          <TextInput
            value={Idroom}
            onChangeText={(text) => {
              setIdroom(text);
              setNotFound(false);
            }}
            placeholder="ใส่รหัสห้องธุรกรรม"
            returnKeyType="search"
            onSubmitEditing={handleInput}
          />
        </View>
        <Pressable
          onPress={handleInput}
          className="w-1/5 h-[90%] bg-[#125c91] flex justify-center items-center rounded-full"
        >
          <Text className="text-lg font-medium text-white">ค้นหา</Text>
        </Pressable>
      </View>

      {notFound && (
        <Text className="text-red-500 text-sm mt-2 absolute bottom-2 text-center">
          {errorRoom}
        </Text>
      )}
    </View>
  );
}