import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../nav";
import api from "../../config/api";

import HeaderSection from "./headerSection";

import SearchRoomSection from "./SearchRoomSection";
import ActionButtons from "./ActionButtons";
import PromotionSection from "./PromotionSection";
import RoleSelectionModal from "./RoleSelectionModel";
import RoomCodeModal from "./RoomCodeModal";

export default function HomePage({ navigation, route }) {

  const { userId } = route.params || {};

  // --------------------------
  // State
  // --------------------------
  const [Idroom, setIdroom] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [roomCodeModalVisible, setRoomCodeModalVisible] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState("");
  const [createdRoomRole, setCreatedRoomRole] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [errorRole, setErrorRole] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [errorRoom, setErrorRoom] = useState("");
  const [errorRoomName, setErrorRoomName] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------
  // Handlers
  // --------------------------
  const handleInput = async () => {
    Keyboard.dismiss();

    if (!Idroom.trim()) {
      setNotFound(true);
      setErrorRoom("กรุณาใส่รหัสห้อง");
      return;
    }

    await joinRoomWithCode(Idroom);
  };

  const joinRoomWithCode = async (roomCode) => {

    try {
      setIsLoading(true);
      const response = await api.post(`/chat/rooms/${roomCode}/join`);

      if (response.data.success === true) {
        
        setNotFound(false);
        setErrorRoom("");
        setIdroom("");

        return navigation.navigate("Room", {
          Idroom: roomCode,
          role: response.data.data.role,
          userId: userId
        });

      }
    } catch (error) {
      console.error("Error joining room:", error);
      setNotFound(true);
      setErrorRoom(error.response?.data?.message || "ไม่พบห้องนี้ กรุณาตรวจสอบรหัสอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => setModalVisible(true);

  const handleCreatesubmit = async () => {
    if (!selectedRole) {
      setErrorRole(false);
      return;
    }

    if (!businessName?.trim()) {
      setErrorRoomName(false);
      return;
    }

    try {
      setIsLoading(true);
      const currentRole = selectedRole;
      // เรียก API สร้างห้องแชท
      const response = await api.post('/chat/rooms', {
        role: currentRole,
        roomName: businessName
      });

      if (response.data.success) {
        const roomCode = response.data.data.chatRoom.RoomID;
        setCreatedRoomCode(roomCode);
        setCreatedRoomRole(currentRole);
        setModalVisible(false);
        setRoomCodeModalVisible(true);
        setSelectedRole("");
        setBusinessName("");
        setErrorRoomName(true);
        setErrorRole(true);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      Alert.alert("ข้อผิดพลาด", error.response?.data?.message || "ไม่สามารถสร้างห้องได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRole("");
    setErrorRole(true);
  };

  const handleRoomCodeModalClose = () => {
    setRoomCodeModalVisible(false);
    navigation.navigate("Room", {
      Idroom: createdRoomCode,
      role: createdRoomRole
    });
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <SafeAreaView className="flex-1 bg-white " edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#125c91" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1  overflow-hidden">
            <View
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
            </View>

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
              isLoading={isLoading}
            />

            <RoomCodeModal
              visible={roomCodeModalVisible}
              roomCode={createdRoomCode}
              onClose={handleRoomCodeModalClose}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}