<template>
  <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">

    <!-- Top accent bar — color by CPU load -->
    <div :class="['h-0.5 w-full', cpuBarColor]" />

    <div class="p-5">
      <!-- Header: icon + service name + instance badge -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-600/20 shrink-0">
            <component :is="iconComponent" class="text-blue-400" :size="17" />
          </div>
          <div class="min-w-0">
            <p class="font-bold text-[13px] text-slate-100 truncate">{{ instance.serviceName }}</p>
            <p class="text-[10px] text-slate-500 font-mono">inst · {{ instance.instanceId }}</p>
          </div>
        </div>
        <!-- Running pulse -->
        <div class="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-widest shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse inline-block" />
          Live
        </div>
      </div>

      <!-- Tiempo de procesamiento (prominente) -->
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 mb-4 text-center">
        <p class="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Tiempo de procesamiento</p>
        <p class="text-2xl font-black text-white tabular-nums leading-none">{{ formatUptime(instance.uptimeSeconds) }}</p>
      </div>

      <!-- Metrics row -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <!-- Ops/sec -->
        <div class="bg-slate-800/40 rounded-lg px-3 py-2.5">
          <p class="text-[9px] text-blue-400 uppercase font-bold tracking-widest mb-1">Ops / seg</p>
          <p class="text-lg font-black text-blue-300 tabular-nums leading-none">{{ formatNum(instance.iterationsPerSec) }}</p>
          <p class="text-[9px] text-slate-600 mt-0.5">Total: {{ instance.totalIterations.toLocaleString() }}</p>
        </div>
        <!-- CPU -->
        <div class="bg-slate-800/40 rounded-lg px-3 py-2.5">
          <p class="text-[9px] uppercase font-bold tracking-widest mb-1" :class="cpuTextColor">CPU</p>
          <p class="text-lg font-black tabular-nums leading-none" :class="cpuTextColor">{{ instance.cpuPercent.toFixed(1) }}<span class="text-sm">%</span></p>
          <!-- mini bar -->
          <div class="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :class="cpuBarColor" :style="{ width: Math.min(instance.cpuPercent, 100) + '%' }" />
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-2" @click.stop>
        <button
          @click="$emit('stop', instance.instanceId)"
          class="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-bold transition-colors"
        >
          <Square :size="11" /> Stop
        </button>
        <button
          @click="$emit('restart', instance.instanceId, instance.serviceId)"
          class="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[11px] font-bold transition-colors"
        >
          <RefreshCw :size="11" /> Restart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Square, RefreshCw, Database, ShoppingCart, Package, Mail, CreditCard, Box } from 'lucide-vue-next'
import type { InstanceSummary } from '../types'

const props = defineProps<{ instance: InstanceSummary }>()
defineEmits<{
  stop:    [instanceId: string]
  restart: [instanceId: string, serviceId: string]
}>()

const iconComponent = computed(() => {
  const map: Record<string, any> = { Database, ShoppingCart, Package, Mail, CreditCard }
  return map[props.instance.iconName] ?? Box
})

const cpuTextColor = computed(() => {
  const c = props.instance.cpuPercent
  if (c > 70) return 'text-red-400'
  if (c > 40) return 'text-amber-400'
  return 'text-emerald-400'
})

const cpuBarColor = computed(() => {
  const c = props.instance.cpuPercent
  if (c > 70) return 'bg-red-500'
  if (c > 40) return 'bg-amber-500'
  return 'bg-emerald-500'
})

const formatNum = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(0)
}

const formatUptime = (s: number) => {
  if (s < 60)   return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}
</script>
