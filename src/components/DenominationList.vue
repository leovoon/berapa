<script setup lang="ts">
import type { DenominationBreakdown } from '../utils/denominationUtils'
import { calculateTotal } from '../utils/denominationUtils'
import { formatCurrency, getDenominationColor } from '../config/denominations'

const props = defineProps<{
  breakdown: DenominationBreakdown
  denominations: number[]
}>()

const emit = defineEmits<{
  (e: 'subtractDenomination', value: number): void
}>()
</script>

<template>
  <div class="denomination-list">
    <div class="total">
      Total: RM{{ calculateTotal(breakdown).toFixed(2) }}
    </div>
    <div v-for="denomination in denominations" :key="denomination" v-show="breakdown[denomination] > 0"
      class="denomination-item" :style="{
        backgroundColor: getDenominationColor(denomination) + '1A',
        borderLeft: `4px solid ${getDenominationColor(denomination)}`
      }" @click="emit('subtractDenomination', denomination)" role="button" tabindex="0">
      <div class="denomination-info">
        <span class="denomination" :style="{ color: getDenominationColor(denomination) }">
          {{ formatCurrency(denomination) }}
        </span>
        <span class="count">× {{ breakdown[denomination] || 0 }}</span>
      </div>
      <span class="subtotal">
        = RM{{ (denomination * (breakdown[denomination] || 0)).toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.denomination-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.denomination-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.denomination-item:hover {
  transform: scale(1.01);
}

.denomination-item:active {
  transform: scale(0.99);
}

.denomination-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.denomination {
  font-weight: bold;
  min-width: 60px;
}

.count {
  color: #4b5563;
  font-size: 1rem;
}

.subtotal {
  color: #1e40af;
  font-weight: 500;
}

.total {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
  font-weight: bold;
  font-size: 1.1rem;
  color: #1e3a8a;
}

@media (max-width: 480px) {
  .denomination-list {
    padding: 0.75rem;
  }

  .denomination-item {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .denomination {
    min-width: 50px;
  }

  .total {
    font-size: 1rem;
  }
}
</style>