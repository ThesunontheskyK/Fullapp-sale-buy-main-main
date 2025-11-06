import {
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import api from "../config/api";
import Nav from "./nav";

export default function MessagesPage({ navigation, route }) {
  const { userId } = route.params;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/rooms');

      if (response.data.success) {
        const roomsList = response.data.data.chatRooms;
        // เรียงตาม updatedAt ใหม่สุดก่อน
        const sortedRooms = roomsList.sort((a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setRooms(sortedRooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Auto-refresh เมื่อกลับมาหน้านี้
  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const handleRoomPress = (room) => {
    navigation.navigate("Room", {
      Idroom: room.RoomID,
      userId: userId
    });
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
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">กำลังโหลดห้องแชท...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {rooms.length > 0 ? (
            rooms.map((room, index) => {
              // นับจำนวนข้อความในห้อง
              const messageCount = Object.keys(room.messages || {}).length;
              // นับจำนวนสมาชิกในห้อง
              const userCount = Object.keys(room.users || {}).length;

              return (
                <Pressable
                  key={room.RoomID || index}
                  onPress={() => handleRoomPress(room)}
                  className="px-4 py-3 flex flex-row items-center gap-6 rounded-lg border-b border-black/10 active:bg-gray-50"
                >
                  <View className="w-[60px] h-[60px] bg-blue-400 rounded-full flex justify-center items-center">
                    <Text className="text-white font-bold text-xl">
                      {(room.roomName || 'ห้อง')[0]}
                    </Text>
                  </View>
                  <View className="flex gap-1 flex-1">
                    <Text className="text-gray-700 font-semibold">
                      {room.roomName || 'ห้องแชท'}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      รหัสห้อง: {room.RoomID}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {messageCount} ข้อความ • {userCount} คน
                    </Text>
                  </View>
                  <View className="absolute top-2 right-2">
                    <Text className="text-xs text-black/50">
                      {new Date(room.updatedAt).toLocaleDateString('th-TH', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-center text-gray-400 text-lg">
                ยังไม่มีห้องแชท
              </Text>
              <Text className="text-center text-gray-400 text-sm mt-2">
                สร้างห้องแชทใหม่ได้ที่หน้าหลัก
              </Text>
            </View>
          )}
        </ScrollView>
      )}


      <Nav navigation={navigation} />
    </SafeAreaView>
  );
}
