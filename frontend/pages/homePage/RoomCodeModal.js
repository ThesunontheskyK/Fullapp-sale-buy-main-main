import React, { useState } from "react"; // ต้องเพิ่มการ Import useState
import { Text, View, Pressable, Modal, Share ,StyleSheet, Alert } from "react-native";
import * as Clipboard from 'expo-clipboard';

export default function RoomCodeModal({ visible, roomCode, onClose }) {

  const [copyStatus, setCopyStatus] = useState("คัดลอกรหัส");

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(roomCode);
    
    setCopyStatus("คัดลอกแล้ว");

    setTimeout(() => {
      setCopyStatus("คัดลอกรหัส");
    }, 2000);
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `เข้าร่วมห้องแชท SavePro ด้วยรหัส: ${roomCode}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            สร้างห้องสำเร็จ!
          </Text>

          <Text style={styles.subtitle}>
            แชร์รหัสนี้ให้กับผู้ที่ต้องการเข้าร่วมห้องแชท
          </Text>

          {/* Room Code Display */}
          <View style={styles.codeInputBox}>
            <Text style={styles.codeInputLabel}>
              รหัสห้อง
            </Text>
            <Text style={styles.codeInputText}>
              {roomCode}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.copyButton, styles.boxShadow]}
              onPress={handleCopyCode}
            >
              {/* ใช้ State เพื่อแสดงข้อความ */}
              <Text style={styles.copyButtonText}>
                {copyStatus}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.shareButton, styles.boxShadow]}
              onPress={handleShareCode}
            >
              <Text style={styles.shareButtonText}>
                แชร์รหัส
              </Text>
            </Pressable>

            <Pressable
              style={[styles.joinButton, styles.boxShadow]}
              onPress={onClose}
            >
              <Text style={styles.joinButtonText}>
                เข้าสู่ห้องแชท
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Global Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // bg-black/50
  },
  modalContent: {
    width: '85%',
    backgroundColor: "white",
    padding: 24, // p-6
    borderRadius: 16, // rounded-2xl
  },

  // Title and Subtitle
  title: {
    fontSize: 24, // text-2xl
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8, // mb-2
    color: "#125c91",
  },
  subtitle: {
    textAlign: "center",
    color: "gray", // text-gray-600
    marginBottom: 24, // mb-6
  },

  // Room Code Display
  codeInputBox: {
    backgroundColor: "#f3f4f6", // bg-gray-100
    padding: 16, // p-4
    borderRadius: 12, // rounded-xl
    marginBottom: 24, // mb-6
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)', // border border-black/20
  },
  codeInputLabel: {
    textAlign: "center",
    color: "gray", // text-gray-500
    fontSize: 14, // text-sm
    marginBottom: 8, // mb-2
  },
  codeInputText: {
    textAlign: "center",
    fontSize: 36, // text-4xl
    fontWeight: "bold",
    color: "#125c91",
    letterSpacing: 4, // tracking-widest (ค่าประมาณ)
  },

  // Action Buttons
  buttonContainer: {
    gap: 12, // gap-3 & space-y-3
  },

  // Button: คัดลอกรหัส (Copy)
  copyButton: {
    backgroundColor: "#e5e7eb", // bg-gray-200
    padding: 16, // p-4
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // border border-black/10
  },
  copyButtonText: {
    textAlign: "center",
    fontWeight: "600", // font-semibold
    color: "#4b5563", // text-gray-700
  },

  // Button: แชร์รหัส (Share)
  shareButton: {
    backgroundColor: "#088F8F",
    padding: 16,
    borderRadius: 8, 
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  shareButtonText: {
    // ไม่มี backgroundColor ที่นี่แล้ว (แก้จากโค้ดเดิม)
    textAlign: "center",
    fontWeight: "600",
    color: "white", 
  },


  joinButton: {
    backgroundColor: "#125c91", 
    padding: 16, 
    borderRadius: 8, 
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', 
  },
  joinButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
  },

  // Box Shadow (สำหรับปุ่มทั้ง 3 ปุ่ม)
  boxShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
});