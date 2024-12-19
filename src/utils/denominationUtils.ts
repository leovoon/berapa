export type DenominationBreakdown = { [key: number]: number }

export function findCombinations(amount: number, denominations: number[]): DenominationBreakdown[] {
  const results: DenominationBreakdown[] = []

  function backtrack(remaining: number, start: number, current: DenominationBreakdown) {
    if (remaining === 0) {
      results.push({...current})
      return
    }
    
    for (let i = start; i < denominations.length; i++) {
      const denomination = denominations[i]
      if (remaining >= denomination) {
        current[denomination] = (current[denomination] || 0) + 1
        backtrack(remaining - denomination, i, current)
        current[denomination] = current[denomination] - 1
        if (current[denomination] === 0) delete current[denomination]
      }
    }
  }

  backtrack(amount, 0, {})
  return results
}

export function calculateTotal(breakdown: DenominationBreakdown): number {
  return Object.entries(breakdown).reduce((sum, [denom, count]) => {
    return sum + (Number(denom) * count)
  }, 0)
}