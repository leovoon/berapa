export type DenominationBreakdown = { [key: number]: number }

const MAX_COMBINATIONS = 100
const MAX_DEPTH = 100
const MAX_COUNT_PER_DENOMINATION = 20

export function findCombinations(amount: number, denominations: number[]): DenominationBreakdown[] {
  if (amount > 1000) {
    return [{
      [denominations[0]]: Math.floor(amount / denominations[0])
    }]
  }

  const amountInCents = Math.round(amount * 100)
  const denominationsInCents = denominations
    .map(d => Math.round(d * 100))
    .sort((a, b) => b - a)
  const results: DenominationBreakdown[] = []

  function backtrack(remaining: number, start: number, current: DenominationBreakdown, depth: number) {
    if (depth > MAX_DEPTH || results.length >= MAX_COMBINATIONS) return
    if (remaining < 0 || start >= denominationsInCents.length) return

    if (remaining === 0) {
      const normalizedResult: DenominationBreakdown = {}
      Object.entries(current).forEach(([cents, count]) => {
        normalizedResult[Number(cents) / 100] = count
      })
      results.push(normalizedResult)
      return
    }

    for (let i = start; i < denominationsInCents.length; i++) {
      const denomination = denominationsInCents[i]
      if (denomination > remaining) continue

      const maxCount = Math.min(
        Math.floor(remaining / denomination),
        MAX_COUNT_PER_DENOMINATION
      )
      if (maxCount === 0) continue

      current[denomination] = (current[denomination] || 0) + 1
      backtrack(remaining - denomination, i, current, depth + 1)
      current[denomination] = current[denomination] - 1
      if (current[denomination] === 0) delete current[denomination]
    }
  }

  backtrack(amountInCents, 0, {}, 0)
  return results
}

export function calculateTotal(breakdown: DenominationBreakdown): number {
  return Object.entries(breakdown).reduce((sum, [denom, count]) => {
    return sum + (Number(denom) * count)
  }, 0)
}