import api from "../../../config/api";
import socket from "../../../services/socket";


export const updatePaymentSuccess = async (roomId, messages, paymentId ,navigation) => {

  try {

    const resQuotation = await api.put(
      `/chat/rooms/${roomId}/quotation/${messages}`,
      { status: true }
    );

    if (resQuotation.status === 200) {

      const resMsg = await api.post(`/chat/rooms/${roomId}/messages`, {
        text: "ชำระเงินเสร็จสิ้น สามารถส่งของได้เลย",
        type: "system",
      });

      if (resMsg.data.success) {

        const resStatus = await api.put(`/payment/status/${paymentId}`, {
          status: "confirmed",
        });

        if (resStatus.status === 200) {

          const paymentMsg = {
            id: (Date.now() + 1).toString(),
            type: "system",
            text: "ชำระเงินเสร็จสิ้น สามารถส่งของได้เลยครับ",
            timestamp: Math.floor(Date.now() / 1000),
          };
          socket.sendMessage(roomId, paymentMsg);
          socket.checkPayment(roomId);
          
          return true;
        }
      }
    }
  } catch (error) {
    console.error("Update Payment Error:", error);
    throw error;
  }
  return false;
};