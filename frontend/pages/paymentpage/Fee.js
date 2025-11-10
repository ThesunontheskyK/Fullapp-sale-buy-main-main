export const Fee = (setFee, PaymentPrice) => {
  const money = PaymentPrice;

  let fee = 0;

  if (money < 500) {
    fee = 49;
  } else if (money >= 500 && money < 1000) {
    fee = 69;
  } else if (money >= 1000 && money < 5000) {
    fee = 99;
  } else if (money >= 5000 && money < 10000) {
    fee = 199;
  } else if (money >= 10000 && money < 20000) {
    fee = 299;
  } else if (money >= 20000 && money <= 30000) {
    fee = 399;
  } else if (money > 30000) {
    fee = 499;
  }

  setFee(fee);
};
