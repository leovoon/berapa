export const NOTES = [100, 50, 20, 10, 5, 1]
export const COINS = [0.50, 0.20, 0.10, 0.05]
export const ALL_DENOMINATIONS = [...NOTES, ...COINS]

export const formatCurrency = (value: number): string => {
  if (value >= 1) {
    return `RM${value}`
  }
  return `${value * 100}sen`
}