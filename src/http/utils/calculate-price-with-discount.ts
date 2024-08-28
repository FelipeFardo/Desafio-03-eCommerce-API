export function calculatePriceWithDiscount(
  originalPrice: number,
  discountPercentage: number,
): number {
  if (!discountPercentage) return originalPrice

  const discountDecimal = discountPercentage / 100
  const discountAmount = originalPrice * discountDecimal
  const priceWithDiscount = originalPrice - discountAmount

  return priceWithDiscount
}
