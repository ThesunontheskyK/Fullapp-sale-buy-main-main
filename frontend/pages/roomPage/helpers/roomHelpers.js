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


  const hasConfirmedDelivery = messages.some(
    (msg) =>
      msg.type === "system" &&
      msg.text?.startsWith("ผู้ซื้อยืนยันการได้รับของแล้ว")
  );

  const paidQuotations = messages.filter(
    (msg) => msg.type === "quotation" && msg.quotation.status === true
  );

  const showDeliveryButton =
    pendingQuotations.length === 0 &&
    currentUserRole === "buyer" &&
    !hasConfirmedDelivery;

  return {
    pendingQuotations,
    hasSentQuotation,
    hasConfirmedDelivery,
    paidQuotations,
    showDeliveryButton,
  };
};