import { Text, View , Pressable} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function Nav() {

  const navigation = useNavigation();
  const route = useRoute();

  const handlePress = (tab) => {
    navigation.navigate(tab);
  };

  return (
    <View className="h-[6vh] w-screen flex flex-row justify-around items-center bg-white">

      <Pressable onPress={() => handlePress("Home")} className="w-14 h-20 flex items-center justify-center">
        <AntDesign name="home" size={22} color={route.name === "Home" ? "#125c91" : "#6B6B6B"}/>

        <Text className={`text-center text-sm font-semibold ${ route.name === "Home" ? "text-sky-600" : "text-black/60"}`}>
          หน้าแรก
        </Text>
      </Pressable>

      <Pressable onPress={() => handlePress("Messager")} className="w-14 h-20 flex items-center justify-center">
        <AntDesign name="message" size={22} color={route.name === "Messager" ? "#125c91" : "#6B6B6B"}/>

        <Text className={`text-center text-sm font-semibold ${ route.name === "Messager" ? "text-sky-600" : "text-black/60" }`}>
          ข้อความ
        </Text>
      </Pressable>

      <Pressable onPress={() => handlePress("Notification")} className="w-auto h-20 flex items-center justify-center">
        <AntDesign name="notification" size={22} color={route.name === "Notification" ? "#125c91" : "#6B6B6B"} />
        <Text className={`text-center text-sm font-semibold ${ route.name === "Notification" ? "text-sky-600" : "text-black/60" }`}>
          แจ้งเตือน
        </Text>
      </Pressable>

      {/* ตั้งค่า */}
      <Pressable onPress={() => handlePress("ProfilePage")} className="w-14 h-20 flex items-center justify-center">
        <AntDesign name="setting" size={22} color={route.name === "ProfilePage" ? "#125c91" : "#6B6B6B"}/>
        <Text className={`text-center text-sm font-semibold ${ route.name === "ProfilePage" ? "text-sky-600" : "text-black/60" }`} >
          ตั้งค่า
        </Text>
      </Pressable>
    </View>
  );
}
