import { findCombinations } from '../utils/denominationUtils'

self.onmessage = (e) => {
    const { amount, denominations } = e.data
    const result = findCombinations(amount, denominations)
    self.postMessage(result)
} 