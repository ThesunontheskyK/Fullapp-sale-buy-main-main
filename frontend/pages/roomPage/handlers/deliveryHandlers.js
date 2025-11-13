export const handleConfirmDelivery = (setMessages) => {

  const confirmMsg = {
    id: Date.now().toString(),
    type: "system",
    text: "ผู้ซื้อยืนยันการได้รับของแล้ว การซื้อขายเสร็จสมบูรณ์",
    timestamp: Math.floor(Date.now() / 1000),
  };

  
  setMessages((prev) => [...prev, confirmMsg]);
};

export const handleCancelDelivery = (setMessages) => {

  const CanceltMsg = {
    id: Date.now().toString(),
    type: "system",
    text: "ผู้ซื้อยกเลิกสินค้า กรุณาตรวจสอบสินค้า",
    timestamp: Math.floor(Date.now() / 1000),
  };

  
  setMessages((prev) => [...prev, CanceltMsg]);
};
