<template>
  <div class="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
    <!-- Header -->
    <div class="flex justify-between items-start mb-1">
      <div>
        <p class="font-bold text-slate-100">{{ label }}</p>
        <p class="text-xs text-slate-500 mt-0.5">{{ description }}</p>
      </div>
      <div class="text-right">
        <p :class="['text-2xl font-black tabular-nums', colorClass]">
          {{ displayValue }}<span class="text-sm font-normal text-slate-500 ml-1">{{ unit }}</span>
        </p>
        <p class="text-[10px] text-slate-600 mt-0.5">{{ trend }}</p>
      </div>
    </div>

    <!-- Bar chart -->
    <div class="flex items-end gap-1 h-16 mt-4">
      <div
        v-for="(bar, i) in normalizedBars"
        :key="i"
        :class="[
          'flex-1 rounded-t-sm transition-all duration-500',
          i === normalizedBars.length - 1 ? activeBarClass : inactiveBarClass
        ]"
        :style="{ height: `${bar}%` }"
      />
    </div>

    <!-- Time labels -->
    <div class="flex justify-between text-[9px] text-slate-700 mt-1.5 font-mono">
      <span>{{ timestamps[0] ?? '' }}</span>
      <span class="text-slate-500">NOW</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  description: string
  value: number
  unit: string
  history: number[]
  colorClass: string
  activeBarClass?: string
  inactiveBarClass?: string
  timestamps?: string[]
}>()

const displayValue = computed(() => props.value.toFixed(1))

const trend = computed(() => {
  const h = props.history
  if (h.length < 2) return ''
  const delta = h[h.length - 1] - h[h.length - 2]
  return delta > 0 ? `▲ ${delta.toFixed(1)} ${props.unit}` : `▼ ${Math.abs(delta).toFixed(1)} ${props.unit}`
})

const normalizedBars = computed(() => {
  const h = props.history
  if (!h.length) return []
  const max = Math.max(...h)
  const min = Math.min(...h)
  const range = max - min || 1
  return h.map(v => Math.max(4, ((v - min) / range) * 88 + 6))
})

const activeBarClass = computed(() => props.activeBarClass ?? 'bg-blue-500')
const inactiveBarClass = computed(() => props.inactiveBarClass ?? 'bg-blue-500/20')
</script>
