import { useState, useEffect, useCallback } from "react";
import api from "../../../config/api";

export default function usePaymentData(roomId) {

  const [paymentData, setPaymentData] = useState(null);
  const [quotationData, setQuotationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentData = useCallback(async () => {
    
    if (!roomId) {
      setError("ไม่มี roomId");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/payment/room/${roomId}`);

      if (response.data.success && response.data.payments.length > 0) {
        const payment = response.data.payments[0];
        setPaymentData(payment);
        setQuotationData(payment.productInfo);
      } else {
        setError("ไม่พบข้อมูลการชำระเงิน");
      }
    } catch (err) {
      console.error("Error fetching payment data:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  return { paymentData, quotationData, loading, error, refetch: fetchPaymentData };
}