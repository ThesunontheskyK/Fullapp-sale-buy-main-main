import { Text, View, Modal, Image, Pressable } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect } from "react";

import useQrCode from "../paymentpage/hooks/useQrCode";
import useSlipUpload from "../paymentpage/hooks/useSlipUpload";

export default function ConfirmModal({
  visible,
  onClose,
  totalAmount,
  selectedPayment,
  qrcode,
  setPayCheck,
}) {
  const { qrCodeImage, loadingQr, saveQrCode } = useQrCode(
    visible,
    totalAmount,
    selectedPayment
  );

  const { slipImage, uploading, slipStatus, pickSlipImage, uploadSlip } =
    useSlipUpload(totalAmount, visible)
    

    useEffect(() => {

      console.log("status : " , slipStatus)

      if(slipStatus  === "error" ) {
         
        setPayCheck(true);

      }else {
        setPayCheck(false)
      }

    },[slipStatus])

  return (
    <Modal visible={visible} transparent animationType="fade">
      {qrcode && (
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 p-5 rounded-lg">
            <Text className="text-lg font-semibold text-center mb-2">
              บริษัท เซฟโปร จำกัด
            </Text>

            <Text className="text-center text-gray-600 mb-4">
              ยอดชำระ ฿{totalAmount?.toLocaleString()}
            </Text>

            {/* QR CODE */}
            <View className="w-full h-[40vh] mb-4 justify-center items-center">
              {loadingQr ? (
                <Text className="text-gray-500">กำลังโหลด QR Code...</Text>
              ) : (
                qrCodeImage && (
                  <Image
                    source={{ uri: qrCodeImage }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                )
              )}
            </View>

            <Pressable
              onPress={saveQrCode}
              className="flex-row justify-center items-center gap-2 mb-3"
            >
              <Text className="text-[#125c91] font-semibold">
                บันทึก / แชร์ QR Code
              </Text>
              <AntDesign name="download" size={20} color="#125c91" />
            </Pressable>

            <Pressable
              onPress={pickSlipImage}
              className="bg-[#0F4C75] py-3 rounded-lg mb-3 flex-row justify-center items-center gap-2"
            >
              <Text className="text-white font-semibold">เลือกรูปสลิป</Text>
              <AntDesign name="file-done" size={20} color="white" />
            </Pressable>

            {slipStatus === "uploading" && (
              <Text className="text-center text-yellow-600 font-semibold mb-2">
                ⏳ กำลังตรวจสอบสลิป...
              </Text>
            )}

            {slipStatus === "success" && (
                <Text className="text-center text-green-600 font-semibold mb-2">
                  ตรวจสอบสลิปเรียบร้อยแล้ว
                </Text>
            )}

            {slipStatus === "error" && (
              <Text className="text-center text-red-600 font-semibold mb-2">
                ตรวจสอบสลิปไม่ผ่าน
              </Text>
            )}

            <Pressable
              onPress={uploadSlip}
              disabled={uploading}
              className="bg-green-600 py-3 rounded-lg mb-3"
            >
              <Text className="text-white text-center font-semibold">
                {uploading ? "กำลังอัปโหลด..." : "ยืนยันส่งสลิป"}
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="bg-gray-300 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold">ปิด</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Modal>
  );
}
