export const getQuantityStep = (packagingMethod) => packagingMethod === "kg" ? 0.5 : 1;

export const isValidQuantity = (quantity, packagingMethod) => {
  const step = getQuantityStep(packagingMethod);
  return Number.isFinite(quantity) && quantity >= step && Number.isInteger(quantity / step);
};
