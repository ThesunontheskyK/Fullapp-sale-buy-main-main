import api from "../../../config/api";
import socketService from "../../../services/socket";

export const sendQuotation = async (
  roomId,
  quotationData,
  setMessages,
  setQuotationData,
  setModalVisible
) => {
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

export const handlePayQuotation = async (
  quotationId,
  roomId,
  navigation
) => {

  console.log(quotationId + "--" + roomId  )
  try {
    const response = await api.post("/payment/create-from-quotation", {
      chatRoomId: roomId,
      quotationMessageId: quotationId,
    });

    if (response.status === 201 || response.status === 200) {

      navigation.navigate("PaymentPage", {
        roomId: roomId,
        messages: quotationId,
        paymentId: response.data.payment?._id,
      });
    }

  } catch (error) {
    console.log("Payment error:", error);
  }
};