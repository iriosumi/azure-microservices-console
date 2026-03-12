<template>
  <div class="p-8 max-w-7xl mx-auto w-full">

    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs text-slate-500 mb-8">
      <button @click="$emit('back')" class="hover:text-slate-200 transition-colors">← Services</button>
      <span class="text-slate-700">/</span>
      <span class="text-slate-200 font-semibold">{{ service.name }}</span>
      <span
        :class="[
          'ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border',
          isRunning
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-slate-700/40 text-slate-500 border-slate-700/40'
        ]"
      >
        <span :class="['w-1.5 h-1.5 rounded-full', isRunning ? 'bg-emerald-400 pulse' : 'bg-slate-500']" />
        {{ isRunning ? 'RUNNING' : 'STOPPED' }}
      </span>
    </div>

    <!-- Service Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-600/20">
          <component :is="iconComponent" class="text-blue-400" :size="28" />
        </div>
        <div>
          <h2 class="text-3xl font-black tracking-tight text-white">{{ service.name }}</h2>
          <p class="text-slate-500 text-sm mt-0.5">
            Instance: <span class="text-slate-400 font-mono text-xs">{{ service.instance }}</span>
            <span class="mx-2 text-slate-700">•</span>
            {{ service.version }}
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          @click="$emit('action', service.id, 'START')"
          :disabled="isRunning"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border transition-all',
            isRunning
              ? 'bg-slate-800/40 text-slate-600 border-transparent cursor-not-allowed'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
          ]"
        >
          <Play :size="14" /> Start Loop
        </button>
        <button
          @click="$emit('action', service.id, 'RESTART')"
          :disabled="!isRunning"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border transition-all',
            !isRunning
              ? 'bg-slate-800/40 text-slate-600 border-transparent cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
          ]"
        >
          <RefreshCw :size="14" /> Restart
        </button>
        <button
          @click="$emit('action', service.id, 'STOP')"
          :disabled="!isRunning"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border transition-all',
            !isRunning
              ? 'bg-slate-800/40 text-slate-600 border-transparent cursor-not-allowed'
              : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
          ]"
        >
          <Square :size="14" /> Stop Loop
        </button>
      </div>
    </div>

    <!-- Stopped state -->
    <div v-if="!isRunning && !metrics" class="text-center py-20 text-slate-500">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
        <Play :size="24" class="text-slate-600 ml-1" />
      </div>
      <p class="text-sm font-semibold text-slate-400">Service is stopped</p>
      <p class="text-xs text-slate-600 mt-1">Press <span class="text-emerald-500">Start Loop</span> to begin the execution loop</p>
    </div>

    <!-- Loading -->
    <div v-else-if="!metrics" class="text-center py-16 text-slate-500">
      <div class="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spin mb-4"></div>
      <p class="text-sm">Loading metrics...</p>
    </div>

    <template v-else>
      <!-- Primary KPI row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <!-- Iterations / sec — most important -->
        <div class="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-600/20 rounded-xl p-5">
          <p class="text-[10px] text-blue-400 uppercase font-bold mb-1 tracking-widest">Iterations / sec</p>
          <p class="text-4xl font-black text-blue-300 tabular-nums leading-none">
            {{ formatNum(metrics.iterationsPerSec) }}
          </p>
          <p class="text-[10px] text-slate-500 mt-2">
            Total: <span class="text-slate-300 font-mono">{{ metrics.totalIterations.toLocaleString() }}</span>
          </p>
        </div>

        <!-- CPU % -->
        <div class="bg-slate-800/50 border border-slate-800 rounded-xl p-5">
          <p class="text-[10px] text-amber-400 uppercase font-bold mb-1 tracking-widest">CPU Load</p>
          <p class="text-3xl font-black tabular-nums leading-none"
            :class="metrics.cpuPercent > 70 ? 'text-red-400' : metrics.cpuPercent > 40 ? 'text-amber-400' : 'text-emerald-400'">
            {{ metrics.cpuPercent.toFixed(1) }}<span class="text-lg">%</span>
          </p>
          <p class="text-[10px] text-slate-500 mt-2">Process CPU load</p>
        </div>

        <!-- Heap -->
        <div class="bg-slate-800/50 border border-slate-800 rounded-xl p-5">
          <p class="text-[10px] text-purple-400 uppercase font-bold mb-1 tracking-widest">Heap Used</p>
          <p class="text-3xl font-black text-purple-300 tabular-nums leading-none">
            {{ metrics.heapUsedMb.toFixed(0) }}<span class="text-lg"> MB</span>
          </p>
          <p class="text-[10px] text-slate-500 mt-2">of {{ metrics.heapMaxMb.toFixed(0) }} MB max</p>
        </div>

        <!-- Uptime -->
        <div class="bg-slate-800/50 border border-slate-800 rounded-xl p-5">
          <p class="text-[10px] text-emerald-400 uppercase font-bold mb-1 tracking-widest">Uptime</p>
          <p class="text-3xl font-black text-emerald-300 tabular-nums leading-none">{{ formatUptime(metrics.uptimeSeconds) }}</p>
          <p class="text-[10px] text-slate-500 mt-2">
            {{ metrics.activeThreads }} JVM threads
          </p>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <MetricChart
          label="CPU Load"
          description="JVM process CPU %"
          :value="metrics.cpuPercent"
          unit="%"
          :history="metrics.cpuHistory"
          :timestamps="metrics.timestamps"
          color-class="text-amber-400"
          active-bar-class="bg-amber-500"
          inactive-bar-class="bg-amber-500/20"
        />
        <MetricChart
          label="Iterations / sec"
          description="Work units completed per second"
          :value="metrics.iterationsPerSec"
          unit=" ops/s"
          :history="metrics.ipsHistory"
          :timestamps="metrics.timestamps"
          color-class="text-blue-400"
          active-bar-class="bg-blue-500"
          inactive-bar-class="bg-blue-500/20"
        />
        <MetricChart
          label="Heap Memory"
          description="JVM heap used (MB)"
          :value="metrics.heapUsedMb"
          unit=" MB"
          :history="metrics.heapHistory"
          :timestamps="metrics.timestamps"
          color-class="text-purple-400"
          active-bar-class="bg-purple-500"
          inactive-bar-class="bg-purple-500/20"
        />
      </div>

      <!-- Polling indicator -->
      <div class="flex items-center gap-2 text-xs text-slate-600 mb-6">
        <span class="w-2 h-2 rounded-full bg-emerald-400 pulse inline-block"></span>
        Live — polling every 2 seconds
      </div>

      <!-- Log Terminal -->
      <div class="bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div class="bg-slate-900/80 px-4 py-2.5 flex items-center gap-4 border-b border-slate-800">
          <div class="flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
          </div>
          <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Terminal :size="11" />
            Execution Log — {{ service.name }}
          </div>
          <div v-if="isRunning" class="ml-auto flex items-center gap-1.5 text-[9px] text-emerald-500 font-bold uppercase">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse inline-block"></span>
            Loop running
          </div>
        </div>

        <div ref="logContainer" class="p-5 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto">
          <div v-if="!metrics.recentLogs.length" class="text-slate-600 italic">
            No logs yet — start the loop to see activity.
          </div>
          <div v-for="(log, i) in metrics.recentLogs" :key="i" class="mb-1.5">
            <span class="text-slate-600">{{ log.time }}</span>
            <span :class="['mx-2 font-bold', levelColor(log.level)]">{{ log.level }}</span>
            <span class="text-slate-600">--- [{{ log.thread }}]</span>
            <span class="mx-2 text-slate-500 text-[10px]">{{ log.className }}</span>
            <span class="text-slate-200">: {{ log.message }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Play, Square, RefreshCw, Terminal,
  Database, ShoppingCart, Package, Mail, CreditCard, Box
} from 'lucide-vue-next'
import MetricChart from './MetricChart.vue'
import type { MicroService, MetricsResponse } from '../types'
import { api } from '../api/services'

const props = defineProps<{ service: MicroService }>()
defineEmits<{
  back: []
  action: [id: string, action: string]
  edit: [service: MicroService]
}>()

const metrics = ref<MetricsResponse | null>(null)
const logContainer = ref<HTMLElement | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

const isRunning = computed(() => props.service.status === 'RUNNING')

const iconComponent = computed(() => {
  const map: Record<string, any> = { Database, ShoppingCart, Package, Mail, CreditCard }
  return map[props.service.iconName] ?? Box
})

const levelColor = (level: string) => ({
  INFO:  'text-emerald-400',
  DEBUG: 'text-blue-400',
  WARN:  'text-yellow-400',
  ERROR: 'text-red-400',
}[level] ?? 'text-slate-400')

const formatNum = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(0)
}

const formatUptime = (seconds: number) => {
  if (seconds < 60)   return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

const fetchMetrics = async () => {
  try {
    const data = await api.getMetrics(props.service.id)
    metrics.value = data
    // Auto-scroll log terminal to bottom
    await nextTick()
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  } catch (e) {
    console.error('Metrics fetch failed', e)
  }
}

onMounted(() => {
  fetchMetrics()
  pollTimer = setInterval(fetchMetrics, 2000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

// Reset when switching service
watch(() => props.service.id, () => {
  metrics.value = null
  fetchMetrics()
})
</script>
