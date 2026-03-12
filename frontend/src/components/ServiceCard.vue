<template>
  <div
    class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/50 transition-all cursor-pointer group"
    @click="$emit('select', service)"
  >
    <div class="p-5">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
            <component :is="iconComponent" class="text-blue-400" :size="20" />
          </div>
          <div>
            <h3 class="font-bold text-sm text-slate-100">{{ service.name }}</h3>
            <p class="text-[10px] text-slate-500 font-medium">{{ service.description }}</p>
          </div>
        </div>

        <!-- Instance count badge -->
        <div
          v-if="instanceCount > 0"
          class="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-emerald-500/10 text-emerald-400"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400 pulse" />
          {{ instanceCount }} running
        </div>
        <div
          v-else
          class="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-slate-700/50 text-slate-500"
        >
          <span class="w-2 h-2 rounded-full bg-slate-500" />
          idle
        </div>
      </div>

      <!-- Info -->
      <div class="space-y-2 mb-5">
        <div class="flex justify-between text-[11px]">
          <span class="text-slate-500">Azure Region</span>
          <span class="font-semibold text-slate-300">{{ service.region }}</span>
        </div>
        <div class="flex justify-between text-[11px]">
          <span class="text-slate-500">Last Run</span>
          <span class="font-semibold text-slate-300">{{ service.lastDeployed }}</span>
        </div>
        <div class="flex justify-between text-[11px]">
          <span class="text-slate-500">Instance</span>
          <span class="font-mono text-slate-400 text-[10px]">{{ service.instance }}</span>
        </div>
      </div>

      <!-- Single Run button -->
      <div @click.stop>
        <button
          @click="$emit('run', service.id)"
          class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 hover:border-blue-500/40 transition-all text-[12px] font-bold"
        >
          <Play :size="12" /> Run New Instance
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Play, Database, ShoppingCart, Package, Mail, CreditCard, Box } from 'lucide-vue-next'
import type { MicroService } from '../types'

const props = defineProps<{
  service: MicroService
  instanceCount?: number
}>()

defineEmits<{
  select: [service: MicroService]
  run:    [id: string]
}>()

const iconComponent = computed(() => {
  const map: Record<string, any> = { Database, ShoppingCart, Package, Mail, CreditCard }
  return map[props.service.iconName] ?? Box
})
</script>
