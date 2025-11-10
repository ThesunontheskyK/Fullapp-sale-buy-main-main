import api from "../../../config/api";
import socketService from "../../../services/socket";

export const sendQuotation = async ( roomId, quotationData, setMessages, setQuotationData, setModalVisible) => {

  if (!quotationData.productName || !quotationData.price) {
    return;
  }

  const bodyData = {
    text: `ใบเสนอราคา: ${quotationData.productName}`,
    type: "quotation",
    quotation: {
      productName: quotationData.productName,
      details: quotationData.details || "",
      images: quotationData.images || "",
      price: quotationData.price,
      status: false,
    },
  };

  try {
    const response = await api.post(`/chat/rooms/${roomId}/messages`, bodyData);

    if (response.data.success) {
      const newMsg = response.data.data.message;
      setMessages((prev) => [...prev, newMsg]);
      socketService.sendMessage(roomId, newMsg);
      setQuotationData({
        productName: "",
        details: "",
        images: "",
        price: "",
      });
      setModalVisible(false);
    }
  } catch (error) {
    console.error("Error sending quotation:", error);
  }
};

export const handlePayQuotation = ( quotationId, roomId, setMessages, navigation ) => {
    
  setMessages((prev) =>
    prev.map((msg) =>
      msg.id === quotationId
        ? { ...msg, quotation: { ...msg.quotation, status: true } }
        : msg
    )
  );

  navigation.navigate("PaymentPage", { roomId: roomId });

  const paidMsg = {
    id: (Date.now() + 1).toString(),
    type: "system",
    text: "ชำระเงินเสร็จสิ้น สามารถส่งของได้เลยครับ",
    timestamp: Math.floor(Date.now() / 1000),
  };

  setMessages((prev) => [...prev, paidMsg]);
};
