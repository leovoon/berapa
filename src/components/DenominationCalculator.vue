<script setup lang="ts">
import { ref, computed, watch, onMounted, customRef, shallowRef, onUnmounted } from 'vue'
import { findCombinations } from '../utils/denominationUtils'
import DenominationList from './DenominationList.vue'
import { ALL_DENOMINATIONS, formatCurrency } from '../config/denominations'
import type { DenominationBreakdown } from '../utils/denominationUtils'
import { useAutoAnimate } from '@formkit/auto-animate/vue'
import { useLocalStorage } from '../composables/useLocalStorage'

const ITEMS_PER_PAGE = 5
const amountInput = ref<HTMLInputElement | null>(null)

// Convert existing refs to use localStorage
const amount = useLocalStorage<number>('calculator-amount', 0)
const showAllCombinations = useLocalStorage<boolean>('calculator-show-all', false)
const showDenominationToggles = useLocalStorage<boolean>('calculator-show-settings', false)
const currentPage = useLocalStorage<number>('calculator-current-page', 1)

// For the Map of enabled denominations, we need to serialize it differently
const storedDenominations = localStorage.getItem('calculator-enabled-denominations')
const initialDenominations: Map<number, boolean> = storedDenominations
  ? new Map(JSON.parse(storedDenominations) as [number, boolean][])
  : new Map(ALL_DENOMINATIONS.map(d => [d, true]))

const enabledDenominations = ref<Map<number, boolean>>(initialDenominations)

// Watch the Map and store it when it changes
watch(
  enabledDenominations,
  (newValue) => {
    queueMicrotask(() => {
      localStorage.setItem(
        'calculator-enabled-denominations',
        JSON.stringify(Array.from(newValue.entries()))
      )
    })
  },
  { deep: true }
)

const currentCombinationIndex = useLocalStorage<number>('calculator-combination-index', 0)

// Rest of the computed properties and functions remain the same
const availableDenominations = computed(() => {
  return ALL_DENOMINATIONS.filter(d => enabledDenominations.value.get(d))
})

const debouncedAmount = useDebouncedRef(amount.value)

// Watch amount changes to update debounced value
watch(amount, (newVal) => {
  debouncedAmount.value = newVal
})

const worker = shallowRef<Worker | null>(null)

onMounted(() => {
  worker.value = new Worker(
    new URL('../workers/combinationsWorker.ts', import.meta.url),
    { type: 'module' }
  )

  worker.value.onmessage = (e) => {
    memoizedCombinations.value = e.data
  }
})

onUnmounted(() => {
  worker.value?.terminate()
})

const memoizedCombinations = shallowRef<DenominationBreakdown[]>([])

watch(
  [debouncedAmount, availableDenominations],
  ([newAmount, newDenominations]) => {
    if (newAmount <= 0) {
      memoizedCombinations.value = []
      return
    }

    // Use worker for calculations
    worker.value?.postMessage({
      amount: newAmount,
      denominations: newDenominations
    })
  },
  { deep: true }
)

const combinations = computed(() => memoizedCombinations.value)

const currentCombination = computed(() => {
  if (combinations.value.length === 0) return {}
  return combinations.value[currentCombinationIndex.value % combinations.value.length]
})

const paginatedCombinations = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return combinations.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(combinations.value.length / ITEMS_PER_PAGE)
)

function nextCombination() {
  if (combinations.value.length > 0) {
    currentCombinationIndex.value = (currentCombinationIndex.value + 1) % combinations.value.length
  }
}

function toggleDenomination(denomination: number) {
  const newMap = new Map(enabledDenominations.value)
  newMap.set(denomination, !newMap.get(denomination))
  enabledDenominations.value = newMap
}

const [resultsParent] = useAutoAnimate()

function changePage(page: number) {
  currentPage.value = page
}

// Reset page when amount changes
watch(amount, () => {
  currentPage.value = 1
})

watch(showAllCombinations, () => {
  currentPage.value = 1
})

function clearStoredData() {
  localStorage.removeItem('calculator-amount')
  localStorage.removeItem('calculator-show-all')
  localStorage.removeItem('calculator-show-settings')
  localStorage.removeItem('calculator-current-page')
  localStorage.removeItem('calculator-combination-index')
  localStorage.removeItem('calculator-enabled-denominations')

  // Reset to defaults
  amount.value = 0
  showAllCombinations.value = false
  showDenominationToggles.value = false
  currentPage.value = 1
  currentCombinationIndex.value = 0
  enabledDenominations.value = new Map(ALL_DENOMINATIONS.map(d => [d, true]))
}

onMounted(() => {
  amountInput.value?.focus()
})

// Add this debounce function
function useDebouncedRef<T>(value: T, delay = 200) {
  let timeout: number
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue: T) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}

function handleSubtractDenomination(value: number) {
  const newAmount = Math.max(0, Number((amount.value - value).toFixed(2)))
  amount.value = newAmount
}
</script>

<template>
  <div class="calculator">
    <h1>Malaysian Ringgit Calculator</h1>
    <p class="subtitle">Notes & Coins Combinations</p>

    <div class="input-section">
      <label for="amount">Enter amount (RM):</label>
      <input ref="amountInput" type="number" inputmode="decimal" id="amount" v-model="amount" min="0" step="0.05"
        pattern="[0-9]*">
    </div>

    <div class="controls-wrapper">
      <button @click="showDenominationToggles = !showDenominationToggles" class="control-btn settings-btn">
        {{ showDenominationToggles ? 'Hide Settings' : 'Show Settings' }}
      </button>

      <div v-if="amount > 0" class="combination-controls">
        <button @click="showAllCombinations = !showAllCombinations" class="control-btn">
          {{ showAllCombinations ? 'Show Single' : 'Show All' }}
        </button>

        <button v-if="!showAllCombinations" @click="nextCombination" class="control-btn"
          :disabled="combinations.length <= 1">
          Next ({{ currentCombinationIndex + 1 }}/{{ combinations.length }})
        </button>
      </div>

      <button @click="clearStoredData" class="control-btn delete-btn">
        Reset All
      </button>
    </div>

    <div v-show="showDenominationToggles" class="denomination-toggles">
      <label v-for="denomination in ALL_DENOMINATIONS" :key="denomination" class="denomination-toggle">
        <input type="checkbox" :checked="enabledDenominations.get(denomination)"
          @change="toggleDenomination(denomination)">
        <span>{{ formatCurrency(denomination) }}</span>
      </label>
    </div>

    <div v-if="amount > 0" class="results" ref="resultsParent">
      <template v-if="showAllCombinations">
        <div v-for="(combination, index) in paginatedCombinations" :key="index">
          <p class="combination-title">Combination {{ (currentPage - 1) * ITEMS_PER_PAGE + index + 1 }}</p>
          <DenominationList :breakdown="combination" :denominations="availableDenominations"
            @subtract-denomination="handleSubtractDenomination" />
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            Previous
          </button>
          <span class="page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
            Next
          </button>
        </div>
      </template>
      <template v-else>
        <DenominationList :breakdown="currentCombination" :denominations="availableDenominations"
          @subtract-denomination="handleSubtractDenomination" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.calculator {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
  color: #333;
  background-color: rgba(255, 255, 255, 0.66);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.input-section {
  margin: 1.2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

input {
  padding: 0.5rem;
  font-size: 1.2rem;
  width: 150px;
  border: 2px solid #ccc;
  border-radius: 4px;
}

.controls-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

.combination-controls {
  display: flex;
  gap: 0.75rem;
}

.control-btn {
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  border: none;
  border-radius: 6px;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.control-btn:hover:not(:disabled) {
  background-color: #d1d5db;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-btn {
  background-color: #f3f4f6;
}

h1 {
  font-size: 1.5rem;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  margin-top: -0.5rem;
  font-size: 0.9rem;
}

h2 {
  font-size: 1.2rem;
  color: #2563eb;
  margin-bottom: 0.5rem;
}

label {
  color: #4b5563;
  font-weight: 500;
}

.denomination-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.denomination-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  color: #4b5563;
  padding: 0.5rem;
  border-radius: 4px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.denomination-toggle:hover {
  background: #f1f5f9;
}

.denomination-toggle input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.combination-title {
  text-align: left;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  border: none;
  border-radius: 6px;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #d1d5db;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 0.9rem;
}

.delete-btn {
  background-color: #fee2e2;
  color: #991b1b;
}

.delete-btn:hover:not(:disabled) {
  background-color: #fecaca;
}

@media (max-width: 480px) {
  .calculator {
    padding: 0.75rem;
    border-radius: 8px;
  }

  h1 {
    font-size: 1.3rem;
  }

  h2 {
    font-size: 1.1rem;
  }

  .control-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .denomination-toggles {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .denomination-toggle {
    padding: 0.4rem;
    font-size: 0.9rem;
  }

  .pagination {
    gap: 0.5rem;
  }

  .page-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .page-info {
    font-size: 0.85rem;
  }
}
</style>