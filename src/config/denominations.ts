interface DenominationConfig {
  denomination: number;
  color: string;
}

export const COINS: DenominationConfig[] = [
  { denomination: 0.05, color: '#C0C0C0' }, // silver
  { denomination: 0.10, color: '#C0C0C0' }, // silver
  { denomination: 0.20, color: '#C0C0C0' }, // silver
  { denomination: 0.50, color: '#C0C0C0' }  // silver
]

export const NOTES: DenominationConfig[] = [
  { denomination: 1, color: '#00bfff' },    // blue
  { denomination: 5, color: '#008000' },    // green
  { denomination: 10, color: '#FFA500' },   // orange
  { denomination: 20, color: '#ffba3a' },   // light orange
  { denomination: 50, color: '#FF0000' },   // red
  { denomination: 100, color: '#800080' }   // purple
]

export const ALL_DENOMINATIONS = [...COINS, ...NOTES].map(d => d.denomination)

export const getDenominationColor = (value: number): string => {
  const config = [...COINS, ...NOTES].find(d => d.denomination === value)
  return config?.color || '#ffffff'
}

export const formatCurrency = (value: number): string => {
  if (value >= 1) {
    return `RM${value}`
  }
  return `${value * 100}sen`
}