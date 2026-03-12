<template>
  <aside class="w-64 border-r border-slate-800 flex flex-col bg-slate-950 shrink-0">
    <!-- Logo -->
    <div class="p-6 flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
        <Cloud :size="22" />
      </div>
      <div>
        <h1 class="text-sm font-bold tracking-tight text-slate-100">Azure Console</h1>
        <p class="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">POC Demo v1.0</p>
      </div>
    </div>

    <div class="flex-1 px-4 space-y-6 overflow-y-auto py-2">
      <!-- Management -->
      <div>
        <p class="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Management</p>
        <nav class="space-y-1">
          <button
            v-for="item in managementItems"
            :key="item.tab"
            @click="$emit('navigate', item.tab)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
              activeTab === item.tab
                ? 'bg-blue-600/15 text-blue-400 font-semibold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            ]"
          >
            <component :is="item.icon" :size="17" />
            {{ item.label }}
          </button>
        </nav>
      </div>

      <!-- Monitoring -->
      <div>
        <p class="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Monitoring</p>
        <nav class="space-y-1">
          <button
            v-for="item in monitoringItems"
            :key="item.tab"
            @click="$emit('navigate', item.tab)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
              activeTab === item.tab
                ? 'bg-blue-600/15 text-blue-400 font-semibold'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            ]"
          >
            <component :is="item.icon" :size="17" />
            {{ item.label }}
          </button>
        </nav>
      </div>
    </div>

    <!-- User -->
    <div class="p-4 border-t border-slate-800">
      <div class="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            A
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-bold text-slate-200 truncate">Admin User</p>
            <p class="text-[10px] text-slate-500 truncate">Azure POC Admin</p>
          </div>
        </div>
        <button class="text-slate-500 hover:text-slate-300 transition-colors">
          <LogOut :size="16" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  Cloud, LayoutDashboard, Boxes, Network, Server,
  Terminal, AlertCircle, LogOut
} from 'lucide-vue-next'
import type { ActiveTab } from '../types'

defineProps<{ activeTab: ActiveTab }>()
defineEmits<{ navigate: [tab: ActiveTab] }>()

const managementItems = [
  { icon: LayoutDashboard, label: 'Dashboard',      tab: 'Dashboard'      as ActiveTab },
  { icon: Boxes,           label: 'Microservices',  tab: 'Microservices'  as ActiveTab },
  { icon: Network,         label: 'Clusters',       tab: 'Clusters'       as ActiveTab },
  { icon: Server,          label: 'Infrastructure', tab: 'Infrastructure' as ActiveTab },
]

const monitoringItems = [
  { icon: Terminal,      label: 'Global Logs', tab: 'Logs'   as ActiveTab },
  { icon: AlertCircle,   label: 'Alerts',      tab: 'Alerts' as ActiveTab },
]
</script>
