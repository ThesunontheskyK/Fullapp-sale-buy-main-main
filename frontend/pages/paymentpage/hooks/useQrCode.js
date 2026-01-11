import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import api from "../../../config/api";

export default function useQrCode(visible, totalAmount, selectedPayment) {
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  /* ================= FETCH QR CODE ================= */
  useEffect(() => {
    if (!visible) return;

    // ถ้าไม่ใช่พร้อมเพย์ ไม่ต้องดึง QR
    if (selectedPayment !== "promptpay") return;
    if (!totalAmount || totalAmount <= 0) return;

    const fetchQrCode = async () => {
      try {
        setLoadingQr(true);
        const res = await api.post("/payment/payment/qr-code", {
          amount: Number(totalAmount),
        });

        if (res.data?.qrCode) {
          setQrCodeImage(res.data.qrCode); // base64
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingQr(false);
      }
    };

    fetchQrCode();
  }, [visible, totalAmount, selectedPayment]);

  /* ================= SAVE / SHARE QR CODE ================= */
  const saveQrCode = async () => {
    try {
      if (!qrCodeImage) {
        Alert.alert("แจ้งเตือน", "ไม่พบ QR Code");
        return;
      }

      const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");

      const fileUri = FileSystem.cacheDirectory + `qrcode_${Date.now()}.png`;

      // เขียนไฟล์จาก base64
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("ไม่รองรับ", "อุปกรณ์ไม่รองรับการแชร์");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึก QR Code ได้");
    }
  };

  return {
    qrCodeImage,
    loadingQr,
    saveQrCode,
  };
}