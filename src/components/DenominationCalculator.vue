<script setup lang="ts">
import { ref, computed } from 'vue'
import { findCombinations } from '../utils/denominationUtils'
import DenominationList from './DenominationList.vue'
import { ALL_DENOMINATIONS } from '../config/denominations'
import type { DenominationBreakdown } from '../utils/denominationUtils'

const amount = ref<number>(0)
const currentCombinationIndex = ref<number>(0)
const showAllCombinations = ref<boolean>(false)

const combinations = computed<DenominationBreakdown[]>(() => {
  if (amount.value <= 0) return []
  return findCombinations(amount.value, ALL_DENOMINATIONS)
})

const currentCombination = computed(() => {
  if (combinations.value.length === 0) return {}
  return combinations.value[currentCombinationIndex.value % combinations.value.length]
})

function nextCombination() {
  if (combinations.value.length > 0) {
    currentCombinationIndex.value = (currentCombinationIndex.value + 1) % combinations.value.length
  }
}
</script>

<template>
  <div class="calculator">
    <h1>Malaysian Ringgit Calculator</h1>
    <p class="subtitle">Notes & Coins Combinations</p>
    
    <div class="input-section">
      <label for="amount">Enter amount (RM):</label>
      <input 
        type="number" 
        id="amount"
        v-model="amount"
        min="0"
        step="0.05"
      >
    </div>

    <div v-if="amount > 0" class="controls">
      <button 
        @click="showAllCombinations = !showAllCombinations"
        class="toggle-btn"
      >
        {{ showAllCombinations ? 'Show Single' : 'Show All' }}
      </button>
      
      <button 
        v-if="!showAllCombinations"
        @click="nextCombination"
        class="next-btn"
        :disabled="combinations.length <= 1"
      >
        Next ({{ currentCombinationIndex + 1 }}/{{ combinations.length }})
      </button>
    </div>

    <div v-if="amount > 0" class="results">
      <template v-if="showAllCombinations">
        <div v-for="(combination, index) in combinations" :key="index">
          <h2>Combination {{ index + 1 }}</h2>
          <DenominationList 
            :breakdown="combination"
            :denominations="ALL_DENOMINATIONS"
          />
        </div>
      </template>
      <template v-else>
        <h2>Denomination Breakdown</h2>
        <DenominationList 
          :breakdown="currentCombination"
          :denominations="ALL_DENOMINATIONS"
        />
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
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.input-section {
  margin: 1.5rem 0;
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

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.toggle-btn, .next-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #2563eb;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.toggle-btn:hover, .next-btn:hover {
  background-color: #1d4ed8;
}

.next-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
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

  .toggle-btn, .next-btn {
    width: 100%;
  }

  input {
    width: 120px;
    font-size: 1rem;
  }
}
</style>