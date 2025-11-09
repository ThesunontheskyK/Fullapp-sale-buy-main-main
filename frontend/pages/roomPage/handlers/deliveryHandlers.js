export const handleSendTrackingNumber = ( trackingNumber, setMessages, setTrackingNumber, setTrackingModalVisible) => {
    
  if (!trackingNumber) return;

  const systemMsg = {
    id: Date.now().toString(),
    type: "system",
    text: `ผู้ขายได้กรอกเลขขนส่ง: ${trackingNumber}`,
    timestamp: Math.floor(Date.now() / 1000),
  };

  setMessages((prev) => [...prev, systemMsg]);
  setTrackingNumber("");
  setTrackingModalVisible(false);
};

export const handleConfirmDelivery = (setMessages) => {
  const confirmMsg = {
    id: Date.now().toString(),
    type: "system",
    text: "ผู้ซื้อยืนยันการได้รับของแล้ว การซื้อขายเสร็จสมบูรณ์",
    timestamp: Math.floor(Date.now() / 1000),
  };

  setMessages((prev) => [...prev, confirmMsg]);
};