export const calculateFee = (price) => {
  const money = price;

  if (money < 500) return 49;
  if (money >= 500 && money < 1000) return 69;
  if (money >= 1000 && money < 5000) return 99;
  if (money >= 5000 && money < 10000) return 199;
  if (money >= 10000 && money < 20000) return 299;
  if (money >= 20000 && money <= 30000) return 399;
  if (money > 30000) return 499;

  return 0;
};

export const Fee = (setFee, PaymentPrice) => {
  const fee = calculateFee(PaymentPrice);
  setFee(fee);
  return PaymentPrice + fee;
};