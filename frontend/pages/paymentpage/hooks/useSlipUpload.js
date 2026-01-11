import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import axios from "axios";

export default function useSlipUpload(totalAmount, visible) {
  const [slipImage, setSlipImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [slipStatus, setSlipStatus] = useState("idle");

  useEffect(() => {
    if (visible) {
      setSlipStatus("idle");
      setSlipImage(null);
    }
  }, [visible]);

  const pickSlipImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("แจ้งเตือน", "ต้องอนุญาตให้เข้าถึงรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSlipImage(result.assets[0]);
      setSlipStatus("idle");
    }
  };

  const uploadSlip = async () => {
    if (!slipImage) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกรูปสลิปก่อน");
      return;
    }

    console.log("image : ", slipImage);

    try {
      setUploading(true);
      setSlipStatus("uploading");

      const base64Image = await FileSystem.readAsStringAsync(slipImage.uri, {
        encoding: "base64",
      });

      const response = await axios.post(
        "https://developer.easyslip.com/api/v1/verify",
        { image: base64Image },
        {
          headers: {
            Authorization: "Bearer cdf3c707-5eda-43ea-85c5-ec03ee45235b",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const slipData = response.data.data;

      const paidAmount = parseFloat(slipData.amount.amount);
      const requiredAmount = parseFloat(totalAmount);

      const receiver = slipData.receiver.account.th;

      if (receiver !== "รุจดนัย แสงทองดี" || paidAmount !== requiredAmount) {
        setSlipStatus("error");

        let errorMsg = "";
        if (receiver !== "รุจดนัย แสงทองดี") {
          errorMsg = "ชื่อผู้รับเงินไม่ถูกต้อง";
        } else if (paidAmount !== requiredAmount) {
          errorMsg = `ยอดเงินไม่ถูกต้อง (ต้องการ ${requiredAmount} แต่ในสลิปคือ ${paidAmount})`;
        }

        Alert.alert("ตรวจสอบไม่ผ่าน", errorMsg);
        return;
      }

      setSlipStatus("success");
      Alert.alert("สำเร็จ", "ตรวจสอบสลิปเรียบร้อย");

    } catch (err) {
      console.error(err);
      setSlipStatus("error");
      const msg = err.response?.data?.message;
      Alert.alert("ล้มเหลว", msg);
    } finally {
      setUploading(false);
    }
  };

  return { slipImage, uploading, slipStatus, pickSlipImage, uploadSlip };
}
