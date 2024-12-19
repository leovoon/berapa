import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
    // Try to get stored value, fallback to default if none exists
    const stored = localStorage.getItem(key)
    const initial = stored ? JSON.parse(stored) : defaultValue
    const value = ref<T>(initial)

    // Watch for changes and update localStorage
    watch(
        value,
        (newValue) => {
            localStorage.setItem(key, JSON.stringify(newValue))
        },
        { deep: true }
    )

    return value
} 