import api from "../../../config/api";
import socketService from "../../../services/socket";

export const sendTextMessage = async (roomId, inputText, setInputText) => {

  if (inputText.trim() === "") return;

  try {
    const messageText = inputText;
    setInputText("");

    const response = await api.post(`/chat/rooms/${roomId}/messages`, {
      text: messageText,
      type: "text",
    });

    if (response.data.success) {
      const newMsg = response.data.data.message;
      socketService.sendMessage(roomId, newMsg);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export const handleDeleteQuotation = (messageId, setMessages) => {
  setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

  const DeleteMsg = {
    id: (Date.now() + 1).toString(),
    type: "system",
    text: "ยกเลิกใบเสนอสินค้าเรียบร้อยแล้ว",
    timestamp: Math.floor(Date.now() / 1000),
  };

  setMessages((prev) => [...prev, DeleteMsg]);
};