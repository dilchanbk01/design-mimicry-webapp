
export function calculatePriceDetails(basePrice: number, additionalCosts: number = 0) {
  const totalBasePrice = basePrice + additionalCosts;
  const gstRate = 0.18; // 18% GST
  const gstAmount = totalBasePrice * gstRate;
  const totalAmount = totalBasePrice + gstAmount;
  
  return {
    basePrice: totalBasePrice,
    gstAmount,
    totalAmount
  };
}
