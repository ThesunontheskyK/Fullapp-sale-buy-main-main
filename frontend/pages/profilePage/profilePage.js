import { Text, View, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Nav from "../nav";
import api from "../../config/api";
import LogoutPopup from "../profilePage/Logoutpopup";

export default function ProfilePage({ route, navigation }) {
  const { userId } = route.params || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasProfileImage = user && user.profileImage && user.profileImage.trim() !== "";
  
  const defaultProfileImage = require("../../assets/defaultProfileImage.png");
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if(userId == null) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me", {
          params: { id: userId },
        });
        setUser(response.data.data.user);
      } catch (error) {
        console.log("Server Error:", error.response?.data || error.message);
        console.log(userId);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleLogout = async() => {
    try {
      await AsyncStorage.removeItem('user_id');
      setPopupVisible(false);
      navigation.navigate("Login");
    } catch(error) {
      console.log("AsyncStorage Error:", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-[#ffffff]">
        
        {/* Header - ไม่ scroll */}
        <View className="w-full h-[8vh] flex flex-row justify-between items-center px-4">
          <View></View>
          <Text className="text-xl font-bold ml-12 text-black/80 pr-3 ">
            ตั้งค่าบัญชี
          </Text>
          <Pressable className="mr-3" onPress={() => setPopupVisible(true)}>
            <MaterialIcons name="logout" size={28} color="#125c91" />
          </Pressable>
        </View>

        {/* Profile Card - ไม่ scroll */}
        <View className="px-4 mt-4">
          {loading ? (
            <Text className="text-center">กำลังโหลด...</Text>
          ) : user ? (
            <View className="bg-white h-auto py-8 border border-black/20 rounded-2xl flex justify-center items-center gap-5 relative z-99">
              <View>
                <View className="w-[100px] h-[100px] rounded-full border border-black/20">
                  <Image
                    className="w-full h-full object-cover rounded-full border-2 border-[#125c91]"
                    source={ hasProfileImage ? { uri: user.profileImage } : defaultProfileImage }
                  />
                </View>
              </View>
              <View className="w-auto">
                <Text className="text-center text-lg font-semibold text-gray-800">
                  {user.fullName}
                </Text>
                <View className="flex-row justify-center items-center gap-2 mt-2"> 
                  <AntDesign name="mail" size={12} color="gray" />
                  <Text className="text-gray-600 text-sm">{user.email}</Text>
                </View>
              </View>

              <View className="w-full flex-row justify-between items-center gap-10 mt-4 px-5">
                <Text className="font-semibold text-gray-600 text-sm">Credit</Text>
                <Text className="font-semibold text-sm text-[#125c91]">100 Point</Text>
              </View>
            </View>
          ) : (
            <Text className="text-center text-red-500">ไม่พบข้อมูลผู้ใช้</Text>
          )}
        </View>

        {/* Menu List - Scroll ได้ */}
      <ScrollView className="flex-1 px-4 py-5 relative" showsVerticalScrollIndicator={false}>
        <View className="">
          
          <Pressable onPress={() => navigation.navigate('ChangeData', { userId })} className="w-full h-auto border py-3 flex flex-row border-black/20 rounded-2xl bg-white mb-3">
            <View className="w-[25%] h-auto flex justify-center items-center">
              <MaterialIcons name="manage-accounts" size={36} color="#125c91" />
            </View>
            <View className="w-[70%] h-auto py-1 flex justify-center items-start gap-1">
              <Text className="font-semibold text-gray-700">แก้ไขข้อมูลส่วนตัว</Text>
              <Text className="text-sm text-gray-500">ลบ แก้ไข หรือข้อมูลส่วนตัว</Text>
            </View>
          </Pressable>

          <Pressable className="w-full h-auto border py-3 flex flex-row border-black/20 rounded-2xl bg-white mb-3">
            <View className="w-[25%] h-auto flex justify-center items-center">
              <MaterialIcons name="account-balance" size={36} color="#125c91" />
            </View>
            <View className="w-[70%] h-auto py-1 flex justify-center items-start gap-1">
              <Text className="font-semibold text-gray-700">บัญชีธนาคาร</Text>
              <Text className="text-sm text-gray-500">จัดการบัญชีสำหรับรับเงิน</Text>
            </View>
          </Pressable>

          <Pressable className="w-full h-auto border py-3 flex flex-row border-black/20 rounded-2xl bg-white mb-3">
            <View className="w-[25%] h-auto flex justify-center items-center">
              <MaterialIcons name="verified-user" size={36} color="#125c91" />
            </View>
            <View className="w-[70%] h-auto py-1 flex justify-center items-start gap-1">
              <Text className="font-semibold text-gray-700">ยืนยันตัวตน</Text>
              <Text className="text-sm text-gray-500">เพิ่มความน่าเชื่อถือบัญชี</Text>
            </View>
          </Pressable>

          <Pressable className="w-full h-auto border py-3 flex flex-row border-black/20 rounded-2xl bg-white mb-3">
            <View className="w-[25%] h-auto flex justify-center items-center">
              <MaterialIcons name="help-outline" size={36} color="#125c91" />
            </View>
            <View className="w-[70%] h-auto py-1 flex justify-center items-start gap-1">
              <Text className="font-semibold text-gray-700">ช่วยเหลือ & กฎระเบียบ</Text>
              <Text className="text-sm text-gray-500">ศูนย์ช่วยเหลือ / FAQ , นโยบายความเป็นส่วนตัว</Text>
            </View>
          </Pressable>

        </View>
      </ScrollView>

      </View>

      <Nav navigation={navigation} />

      <LogoutPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}