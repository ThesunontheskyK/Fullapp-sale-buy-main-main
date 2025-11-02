import {
  Text,
  View,
  ScrollView,
  Pressable
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import RoomData from "../room_number.json"; 
import Nav from "./nav";

export default function MessagesPage({ navigation, route }) {
  const { userId } = route.params;
  const [rooms, setRooms] = useState([]);

  useEffect(() => {

    if (userId === RoomData.user_id) {
      setRooms(RoomData.rooms);
    } else {
      setRooms([]);
    }
  }, [userId]);

  const handleRoomPress = (room_number) => {

    navigation.navigate("Room", { room_number, userId });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      
      {/* Header */}
      <View className="shadow-sm">
        <View className="flex-row items-center px-4 py-6 justify-between">
          <Text className="text-gray-600 font-semibold text-4xl">Messenge</Text>
          <Text className="text-white font-semibold text-lg"></Text>
        </View>
      </View>

      <View className="h-5 w-full"></View>

      {/* Room List */}
      <ScrollView className="flex-1 p-4">
        {rooms.length > 0 ? (
          rooms.map((room, index) => (
            <Pressable key={index}
              onPress={() => handleRoomPress(room.room_number)}
              className="px-4 py-3 flex flex-row items-center gap-6 rounded-lg border-b border-black/10"
            >
              <View className="w-[60px] h-[60px] bg-fuchsia-300 rounded-full">
                
              </View>
              <View className="flex gap-1">
                <Text className="text-gray-700 font-semibold">{room.room_name}</Text>
                <Text className="text-gray-500 text-sm "> ห้อง {room.room_number}</Text>
              </View>
              <View className="absolute top-2 right-2">
                <Text className="text-sm text-black/50">09:38 AM</Text>
              </View>

            </Pressable>
          ))
        ) : (
          <Text className="text-center mt-8 text-gray-400"> ไม่มีห้องสำหรับ user นี้ </Text>
        )}
      </ScrollView>


      <Nav navigation={navigation} />
    </SafeAreaView>
  );
}
