import api from "../../../config/api";
import socket from "../../../services/socket";

export const handleConfirmDelivery = async (roomId) => {
  try {
    const messageText = "ผู้ซื้อยืนยันการได้รับของแล้ว การซื้อขายเสร็จสมบูรณ์";

    const response = await api.post(`/chat/rooms/${roomId}/messages`, {
      text: messageText,
      type: "system",
    });

    const confirmMsg = {
      id: Date.now().toString(),
      type: "system",
      text: "ผู้ซื้อยืนยันการได้รับของแล้ว การซื้อขายเสร็จสมบูรณ์",
      timestamp: Math.floor(Date.now() / 1000),
    };

    if (response.data.success) {
      socket.sendMessage(roomId, confirmMsg);
    }
  } catch (err) {
    console.log("set delivery error :", err);
  }
};

export const handleCancelDelivery = async (setMessages) => {

  const messageText = "ผู้ซื้อยกเลิกสินค้า กรุณาติดต่อผู้ซื้อ";
  
  try {
    const response = await api.post(`/chat/rooms/${roomId}/messages`, {
      text: messageText,
      type: "system",
    });

    const RejectMsg = {
      id: Date.now().toString(),
      type: "system",
      text: "ผู้ซื้อยกเลิกสินค้า กรุณาติดต่อผู้ซื้อ",
      timestamp: Math.floor(Date.now() / 1000),
    };

    if (response.data.success) {
      socket.sendMessage(roomId, RejectMsg);
    }
  } catch (err) {
    console.log("reject delivery error : ", err);
  }
};
