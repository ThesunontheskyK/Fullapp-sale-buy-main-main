import { Text, View, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
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

      await AsyncStorage.removeItem('token');
      setPopupVisible(false);
      navigation.navigate("Login");

    } catch(error) {
      console.log("AsyncStorage Error:", error.message);
    }

  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-[#fcfeff] p-4">
        <View className="border-b border-black/10 w-full h-[7%] flex flex-row justify-between items-center">
          <View></View>
          <Text className="text-xl font-bold ml-12 text-black/90 pr-3">
            ตั้งค่าบัญชี
          </Text>
          <Pressable className="mr-3" onPress={() => setPopupVisible(true)}>
            <AntDesign  name="logout" size={28} color="#649AB3" />
          </Pressable>
        </View>

        <ScrollView className="mt-4">
          {loading ? (
            <Text className="text-center">กำลังโหลด...</Text>
          ) : user ? (
            <View className="bg-white h-auto py-8 border border-black/20 rounded-2xl flex justify-center items-center gap-5">
              <View>
                <View className="w-[100px] h-[100px] rounded-full border border-black/20">
                  <Image
                    className="w-full h-full object-cover rounded-full border-2 border-green-500"
                    source={ hasProfileImage ? { uri: user.profileImage } : defaultProfileImage }
                  />
                </View>
              </View>
              <View className="w-auto">
                <Text className="text-center text-lg font-semibold text-[#125c91]">
                  {user.fullName}
                </Text>
                <Text className="text-center text-sm text-black/50 font-semibold">
                  {user.email}
                </Text>
              </View>

            </View>

          ) : (
            <Text className="text-center text-red-500">ไม่พบข้อมูลผู้ใช้</Text>
          )}

          <View className="w-full h-[50vh] py-5">
            <Pressable onPress={() => navigation.navigate('ChangeData', { userId })} className="w-full h-auto border py-3 flex flex-row border-black/20  rounded-2xl bg-white">
              <View className="w-[25%] h-auto flex justify-center items-center">
                <Image className="w-12 h-12" source={require('../../assets/icons8-life-cycle-80.png')}/>
              </View>
              <View className="w-[70%] h-auto  py-3 flex justify-center items-start gap-1">
                <Text className="font-semibold text-gray-700">แก้ไขข้อมูลส่วนตัว</Text>
                <Text className="text-sm text-gray-500">ลบ แก้ไข หรือข้อมูลส่วนตัว </Text>
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
