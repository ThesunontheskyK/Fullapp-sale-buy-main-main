import {
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Nav from "../nav";
import api from "../../config/api";
import LogoutPopup from "../profilePage/Logoutpopup";

export default function ProfilePage({ route, navigation }) {
  const { userId } = route.params || {};

  console.log("ProfilePage userId: ", userId);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);

  const hasProfileImage =
    user && user.profileImage && user.profileImage.trim() !== "";
  const defaultProfileImage = require("../../assets/defaultProfileImage.png");

  useEffect(() => {
    if (userId == null) return;

    const fetchUser = async () => {
      try {
        setLoading(true);

        const response = await api.get("/auth/me");

        console.log("User Data:", response.data);
        setUser(response.data.data.user);
      } catch (error) {
        console.log("Server Error : ", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user_id");
      setPopupVisible(false);
      navigation.navigate("Login");
    } catch (error) {
      console.log("AsyncStorage Error:", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View />
          <Text style={styles.headerText}>ตั้งค่าบัญชี</Text>
          <Pressable onPress={() => setPopupVisible(true)}>
            <MaterialIcons name="logout" size={28} color="#125c91" />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.profileContainer}>
          {loading ? (
            <Text style={styles.loadingText}>กำลังโหลด...</Text>
          ) : user ? (
            <View style={[styles.profileCard, styles.boxShadow]}>
              <View style={styles.profileImageWrapper}>
                <Image
                  style={styles.profileImage}
                  source={
                    hasProfileImage
                      ? { uri: user.profileImage }
                      : defaultProfileImage
                  }
                />
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <View style={styles.emailRow}>
                  <AntDesign name="mail" size={12} color="gray" />
                  <Text style={styles.emailText}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.creditRow}>
                <Text style={styles.creditLabel}>Credit</Text>
                <Text style={styles.creditValue}>100 Point</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>ไม่พบข้อมูลผู้ใช้</Text>
          )}
        </View>

        {/* Scroll Menu */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={[styles.menuItem, styles.boxShadow]}
            onPress={() => navigation.navigate("ChangeData", { userId })}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="manage-accounts" size={36} color="#125c91" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>แก้ไขข้อมูลส่วนตัว</Text>
              <Text style={styles.menuSubtitle}>
                ลบ แก้ไข หรือข้อมูลส่วนตัว
              </Text>
            </View>
          </Pressable>

          <Pressable style={[styles.menuItem, styles.boxShadow]}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="account-balance" size={36} color="#125c91" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>บัญชีธนาคาร</Text>
              <Text style={styles.menuSubtitle}>จัดการบัญชีสำหรับรับเงิน</Text>
            </View>
          </Pressable>

          <Pressable style={[styles.menuItem, styles.boxShadow]}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="verified-user" size={36} color="#125c91" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>ยืนยันตัวตน</Text>
              <Text style={styles.menuSubtitle}>เพิ่มความน่าเชื่อถือบัญชี</Text>
            </View>
          </Pressable>

          <Pressable style={[styles.menuItem, styles.boxShadow]}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="help-outline" size={36} color="#125c91" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>ช่วยเหลือ & กฎระเบียบ</Text>
              <Text style={styles.menuSubtitle}>
                ศูนย์ช่วยเหลือ / FAQ , นโยบายความเป็นส่วนตัว
              </Text>
            </View>
          </Pressable>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  innerContainer: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: "8%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginRight: 12,
  },

  profileContainer: { paddingHorizontal: 16, marginTop: 16 },
  loadingText: { textAlign: "center" },
  errorText: { textAlign: "center", color: "red" },

  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    paddingVertical: 24,
    alignItems: "center",
    gap: 12,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#125c91",
  },
  userInfo: { alignItems: "center" },
  userName: { fontSize: 18, fontWeight: "600", color: "#333" },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  emailText: { fontSize: 14, color: "gray" },

  creditRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 12,
  },
  creditLabel: { fontWeight: "600", color: "#666" },
  creditValue: { fontWeight: "600", color: "#125c91" },

  scrollArea: { flex: 1, paddingHorizontal: 16, paddingVertical: 20 },
  menuItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  iconContainer: { width: "25%", alignItems: "center" },
  menuTextContainer: { width: "70%", gap: 4 },
  menuTitle: { fontWeight: "600", color: "#333" },
  menuSubtitle: { fontSize: 13, color: "gray" },

  boxShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
