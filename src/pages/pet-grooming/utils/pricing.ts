
export function calculatePriceDetails(basePrice: number) {
  const gstRate = 0.18; // 18% GST
  const gstAmount = basePrice * gstRate;
  const totalAmount = basePrice + gstAmount;
  
  return {
    basePrice,
    gstAmount,
    totalAmount
  };
}
