export function calculatePriceWithDiscount(originalPrice, discountPercentage) {
  const discountDecimal = discountPercentage / 100

  const discountAmount = originalPrice * discountDecimal

  const priceWithDiscount = originalPrice - discountAmount

  return priceWithDiscount
}
