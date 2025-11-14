// ฟังก์ชันตรวจสอบสถานะต่างๆ ในห้อง
export const getRoomStatus = (messages, currentUserId, currentUserRole) => {

  const pendingQuotations = messages.filter(
    (msg) =>
      msg.type === "quotation" &&
      msg.sender_id !== currentUserId &&
      currentUserRole === "buyer" &&
      msg.quotation.status === false
  );

  const hasSentQuotation = messages.some(
    (msg) => msg.type === "quotation" && msg.sender_id === currentUserId
  );

  const hasPaidQuotation = messages.some(
    (msg) =>
      msg.type === "quotation" &&
      msg.quotation.status === true
  );

  const hasConfirmedDelivery = messages.some(
    (msg) =>
      msg.type === "system" &&
      msg.text?.startsWith("ผู้ซื้อยืนยันการได้รับของแล้ว การซื้อขายเสร็จสมบูรณ์")
  );
  
  const hasCanceledDelivery = messages.some(
    (msg) =>
      msg.type === "system" &&
      msg.text?.startsWith("ผู้ซื้อยกเลิกสินค้า กรุณาติดต่อผู้ซื้อ")
  );

  const showDeliveryButton =
    pendingQuotations.length === 0 &&
    hasPaidQuotation && 
    currentUserRole === "buyer" &&
    !hasConfirmedDelivery &&
    !hasCanceledDelivery;

  return {
    pendingQuotations,
    hasSentQuotation,
    hasConfirmedDelivery,
    hasPaidQuotation, // ✅ return ออกมาด้วย
    showDeliveryButton,
  };
};