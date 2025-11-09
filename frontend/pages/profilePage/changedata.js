import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Pressable,
  Image,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import api from "../../config/api";

export default function ChangeData({ route, navigation }) {
  const { userId } = route.params || {};

  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [Savefull, setSavefull] = useState(false);

  useEffect(() => {
    if (
      fullname.trim() !== "" &&
      phone.trim() !== "" &&
      phone.trim().length === 10
    ) {
      setSavefull(true);
    } else {
      setSavefull(false);
    }
  }, [fullname, phone]);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me", {
          params: { id: userId },
        });

        const userData = response.data.data.user;
        setUser(userData);
        setFullname(userData.fullName || "");
        setPhone(userData.phoneNumber || "");
        setEmail(userData.email || "");
        setProfileImage(userData.profileImage || null);
      } catch (error) {
        console.log("Server Error:", error.response?.data || error.message);
      }
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!Savefull) return;

    try {
      const response = await api.put(
        "/auth/update-profile",
        {
          fullName: fullname,
          phoneNumber: phone,
          profileImage: profileImage,
        },
        { params: { id: userId } }
      );

      if (response.status === 200 && response.data.success) {
        navigation.navigate("ProfilePage", { userId });
      }
    } catch (error) {
      console.log("Update Error:", error.response?.data || error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header คงที่ */}
      <View className=" w-full h-16 flex-row justify-between items-center px-4">
        <Pressable onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={28} color="gray" />
        </Pressable>
        <Text className="text-lg font-bold text-black/90">แก้ไขข้อมูลส่วนตัว</Text>
        <Pressable onPress={handleSave}>
          <Text className={`${Savefull ? "text-pink-600" : "text-pink-300"} text-lg font-semibold`}>
            บันทึก
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Image */}
          <View className="w-full h-[25vh] flex justify-center items-center">
            <Pressable onPress={pickImage}>
              <View className="w-32 h-32 border rounded-full overflow-hidden">
                <Image
                  className="w-full h-full rounded-full"
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require("../../assets/defaultProfileImage.png")
                  }
                />
                <View className="absolute w-full h-full bg-black/30 justify-center items-center">
                  <AntDesign name="camera" size={30} color="white" />
                </View>
              </View>
            </Pressable>
            <Text className="mt-5 text-sm text-black/60 font-semibold">{email}</Text>
          </View>

          {/* Input Fields */}
          <View 
            style={styles.boxShadow}
            className="w-full p-3 rounded-xl py-3 mt-10 bg-white border border-black/10">
            <Text className="text-black/80 py-2">ชื่อ-นามสกุล</Text>
            <TextInput
              value={fullname}
              onChangeText={setFullname}
              keyboardType="default"
              placeholder="ชื่อ-นามสกุล"
              className="w-full h-16 bg-white font-semibold rounded-xl px-4 mb-4 text-black/70 border border-black/20"
            />
            <Text className="text-black/80 py-2">เบอร์ มือถือ</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="decimal-pad"
              placeholder="เบอร์ มือถือ"
              className="w-full h-16 font-semibold bg-white rounded-xl px-4 mb-4 text-black/70 border border-black/20"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  boxShadow : {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }
})