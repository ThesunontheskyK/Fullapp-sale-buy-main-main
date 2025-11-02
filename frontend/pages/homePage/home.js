import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../nav";

import HeaderSection from "./headerSection";

import SearchRoomSection from "./SearchRoomSection";
import ActionButtons from "./ActionButtons";
import PromotionSection from "./PromotionSection";
import RoleSelectionModal from "./RoleSelectionModel";

export default function HomePage({ navigation, route }) {
  const { userId } = route.params || {};

  // --------------------------
  // State
  // --------------------------
  const [Idroom, setIdroom] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [errorRole, setErrorRole] = useState(true);
  const [businessName , setBusinessName] = useState("");
  const [errorRoom, setErrorRoom] = useState("");
  const [errorRoomName , setErrorRoomName] = useState(true);

  // --------------------------
  // Handlers
  // --------------------------
  const handleInput = () => {
    Keyboard.dismiss();

    if (Idroom === "42565412") {
      setNotFound(false);
      console.log("Navigating to Room with role:", selectedRole);
      navigation.navigate("Room", { Idroom: "42565412" });
      setErrorRoom("");
    } else {
      setNotFound(true);
      setErrorRoom("ไม่พบห้องนี้ กรุณาตรวจสอบรหัสอีกครั้ง");
    }
  };

  const handleCreate = () => setModalVisible(true);

  const handleCreatesubmit = () => {
    
    if (selectedRole) {

      if(!businessName?.trim()) {
         setErrorRoomName(false);
      }else {
        navigation.navigate("Room", { Idroom: "42565412", role: selectedRole });
        setSelectedRole("");
        setModalVisible(false);
        setErrorRoomName(true);
        setBusinessName("");
      }

    } else {
      setErrorRole(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRole("");
    setErrorRole(true);
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1 overflow-hidden">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <HeaderSection />

              <SearchRoomSection
                Idroom={Idroom}
                setIdroom={setIdroom}
                setNotFound={setNotFound}
                handleInput={handleInput}
                notFound={notFound}
                errorRoom={errorRoom}
              />

              <ActionButtons handleCreate={handleCreate} />

              <PromotionSection />
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0">
              <Nav navigation={navigation} />
            </View>

            <RoleSelectionModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              errorRole={errorRole}
              setErrorRole={setErrorRole}
              handleCreatesubmit={handleCreatesubmit}
              handleCloseModal={handleCloseModal}
              setBusinessName={setBusinessName}
              businessName={businessName}
              setErrorRoomName={setErrorRoomName}
              errorRoomName={errorRoomName}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}