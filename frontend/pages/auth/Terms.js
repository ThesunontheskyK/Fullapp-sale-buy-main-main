import { useRef, useState } from "react";
import { Text, View, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import TermsData from "../../Terms.json";

export default function Terms({navigation}) {
  const [checked, setChecked] = useState();

  const handleConfirmTerms = () => {
    navigation.navigate("Login");
  }
  return (
    <>
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 bg-white p-4">
          <View className="border-b border-black/10 w-full h-[7%] flex flex-row justify-between items-center">
            <Pressable onPress={() => navigation.goBack()}>
              <AntDesign name="left" size={30} color="gray" />
            </Pressable>
            <Text className="text-xl font-bold text-[#125c91] pr-3">
              กฎระเบียบการใช้งาน
            </Text>
            <Text></Text>
          </View>
          <ScrollView className="mt-8">
            <View className=" ">
              {TermsData.sections.map((items, index) => (
                <View key={index} className="flex gap-3">
                  <Text className="text-sm">{items.header}</Text>
                  <Text className="text-sm">{items.content}</Text>
                </View>
              ))}
            </View>
            <View className="w-full h-20">
              <View className="w-full h-10 mt-8 px-4  flex flex-row justify-start items-center gap-4">
                <Pressable
                  onPress={() => setChecked(!checked)}
                  className={`w-5 h-5 border-2 rounded ${
                    checked ? "bg-[#125c91] border" : "border-gray-400"
                  } flex items-center justify-center`}
                >
                  <AntDesign name="check" size={12} color="#ffffff" />
                </Pressable>
                <Text className="text-sm">
                  ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว{" "}
                </Text>
              </View>
            </View>
            <Pressable onPress={handleConfirmTerms} className={`mt-10 rounded-md ${!checked ? "bg-gray-400" : "bg-[#125c91]"} w-full h-16 flex justify-center items-center`}>
              <Text className="text-xl text-white font-semibold">ยืนยัน</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
