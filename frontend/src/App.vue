<template>
  <div class="flex min-h-screen bg-slate-950 text-slate-100 font-sans">

    <!-- Sidebar -->
    <Sidebar :active-tab="activeTab" @navigate="handleNavigate" />

    <!-- Main -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Header -->
      <header class="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div class="flex items-center gap-3 flex-1 max-w-sm">
          <div class="relative w-full">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" :size="15" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search services..."
              class="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 text-slate-100"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="loadServices"
            :class="['flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors', isLoading ? 'spin' : '']"
            title="Refresh"
          >
            <RefreshCw :size="17" />
          </button>
          <button class="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
            <Bell :size="17" />
          </button>
          <div class="w-px h-5 bg-slate-800 mx-1" />
          <button class="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
            <Settings :size="17" />
          </button>
        </div>
      </header>

      <!-- Dynamic content -->
      <div class="flex-1 overflow-y-auto">

        <!-- Service details view -->
        <ServiceDetails
          v-if="selectedService"
          :service="selectedService"
          @back="selectedService = null"
          @action="handleAction"
          @edit="openEditModal"
        />

        <!-- Dashboard -->
        <div v-else-if="activeTab === 'Dashboard'" class="p-8 max-w-7xl mx-auto w-full">

          <!-- Page heading -->
          <div class="flex items-end justify-between mb-6">
            <div>
              <h2 class="text-2xl font-black tracking-tight text-white">Services Overview</h2>
              <p class="text-slate-400 text-sm mt-1">
                Manage and stress-test Java Spring Boot microservices on Azure App Service.
              </p>
            </div>
            <button
              @click="loadServices"
              class="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all"
            >
              <RefreshCw :size="13" /> Refresh
            </button>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Services</p>
              <p class="text-3xl font-black mt-2 tabular-nums text-blue-400">{{ services.length }}</p>
              <p class="text-[10px] text-slate-600 font-semibold mt-1">Registered in Azure</p>
            </div>
            <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Running Instances</p>
              <p class="text-3xl font-black mt-2 tabular-nums text-emerald-400">{{ instances.length }}</p>
              <p class="text-[10px] text-slate-600 font-semibold mt-1">Active CPU loops</p>
            </div>
            <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Ops / seg</p>
              <p class="text-3xl font-black mt-2 tabular-nums text-amber-400">{{ totalIps }}</p>
              <p class="text-[10px] text-slate-600 font-semibold mt-1">Across all instances</p>
            </div>
          </div>

          <!-- Error state -->
          <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle :size="16" />
            {{ error }}
            <button @click="loadServices" class="ml-auto underline hover:no-underline">Retry</button>
          </div>

          <!-- Skeleton loading -->
          <div v-if="isLoading && services.length === 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="i in 5" :key="i" class="bg-slate-900 border border-slate-800 rounded-xl p-5 h-52 animate-pulse">
              <div class="flex gap-3 mb-4">
                <div class="w-10 h-10 bg-slate-800 rounded-lg" />
                <div class="flex-1 space-y-2 pt-1">
                  <div class="h-3 bg-slate-800 rounded w-32" />
                  <div class="h-2 bg-slate-800 rounded w-48" />
                </div>
              </div>
              <div class="space-y-2 mb-5">
                <div class="h-2.5 bg-slate-800 rounded" />
                <div class="h-2.5 bg-slate-800 rounded w-4/5" />
              </div>
              <div class="h-9 bg-slate-800 rounded-lg" />
            </div>
          </div>

          <!-- ── Service catalog ── -->
          <div v-else>
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Service Catalog</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              <ServiceCard
                v-for="service in filteredServices"
                :key="service.id"
                :service="service"
                :instance-count="instanceCountFor(service.id)"
                @run="handleRun"
                @select="selectedService = service"
              />

              <!-- Register new service -->
              <button
                @click="openCreateModal"
                class="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-slate-500 hover:text-blue-400 hover:border-blue-500 hover:bg-blue-500/5 transition-all group min-h-[200px]"
              >
                <PlusCircle class="mb-2 transition-transform group-hover:scale-110" :size="30" />
                <span class="font-bold text-sm">Register New Service</span>
                <span class="text-xs text-slate-600 mt-1">Add Spring Boot microservice</span>
              </button>
            </div>

            <!-- ── Running Instances ── -->
            <div v-if="instances.length > 0">
              <div class="flex items-center gap-3 mb-3">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest">Running Instances</h3>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  {{ instances.length }} active
                </span>
                <div class="flex-1 h-px bg-slate-800" />
                <button
                  @click="stopAll"
                  class="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest transition-colors"
                >
                  Stop All
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <InstanceCard
                  v-for="inst in instances"
                  :key="inst.instanceId"
                  :instance="inst"
                  @stop="handleStopInstance"
                  @restart="handleRestartInstance"
                />
              </div>
            </div>

            <!-- Empty state for instances -->
            <div v-else class="mt-2 rounded-xl border border-dashed border-slate-800 py-8 text-center">
              <p class="text-sm text-slate-600 font-semibold">No instances running</p>
              <p class="text-xs text-slate-700 mt-1">Click <span class="text-blue-500">Run New Instance</span> on any service to start a CPU loop</p>
            </div>
          </div>
        </div>

        <!-- Microservices API view -->
        <MicroservicesView v-else-if="activeTab === 'Microservices'" />

        <!-- Placeholder tabs -->
        <div v-else class="flex items-center justify-center h-full min-h-96 text-slate-500">
          <div class="text-center">
            <Boxes :size="48" class="mx-auto mb-4 opacity-20" />
            <p class="text-xl font-bold text-slate-400">{{ activeTab }}</p>
            <p class="text-sm mt-1">This module is under development.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <ServiceModal
      v-if="isModalOpen"
      :service="editingService"
      @close="isModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, RefreshCw, Bell, Settings, PlusCircle, Boxes, AlertCircle } from 'lucide-vue-next'
import Sidebar from './components/Sidebar.vue'
import ServiceCard from './components/ServiceCard.vue'
import InstanceCard from './components/InstanceCard.vue'
import ServiceDetails from './components/ServiceDetails.vue'
import ServiceModal from './components/ServiceModal.vue'
import MicroservicesView from './components/MicroservicesView.vue'
import type { MicroService, InstanceSummary, ActiveTab } from './types'
import { api } from './api/services'

// ── State ──────────────────────────────────────────────────────────────────
const services        = ref<MicroService[]>([])
const instances       = ref<InstanceSummary[]>([])
const searchQuery     = ref('')
const activeTab       = ref<ActiveTab>('Dashboard')
const selectedService = ref<MicroService | null>(null)
const isModalOpen     = ref(false)
const editingService  = ref<MicroService | null>(null)
const isLoading       = ref(false)
const error           = ref('')
let   instancesTimer: ReturnType<typeof setInterval> | null = null

// ── Computed ───────────────────────────────────────────────────────────────
const filteredServices = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return services.value
  return services.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  )
})

const totalIps = computed(() => {
  const sum = instances.value.reduce((acc, i) => acc + i.iterationsPerSec, 0)
  if (sum >= 1_000_000) return (sum / 1_000_000).toFixed(1) + 'M'
  if (sum >= 1_000)     return (sum / 1_000).toFixed(1) + 'K'
  return sum.toFixed(0)
})

const instanceCountFor = (serviceId: string) =>
  instances.value.filter(i => i.serviceId === serviceId).length

// ── Actions ────────────────────────────────────────────────────────────────
const loadServices = async () => {
  error.value = ''
  isLoading.value = true
  try {
    services.value = await api.getServices()
  } catch {
    error.value = 'Cannot connect to backend. Make sure Spring Boot is running on port 8080.'
  } finally {
    isLoading.value = false
  }
}

const loadInstances = async () => {
  try {
    instances.value = await api.getInstances()
  } catch {
    // silent — polling may fail if backend restarts
  }
}

const handleRun = async (serviceId: string) => {
  try {
    await api.runService(serviceId)
    await loadInstances()
    // Update lastDeployed in catalog
    services.value = services.value.map(s =>
      s.id === serviceId ? { ...s, lastDeployed: 'Just now', status: 'RUNNING' } : s
    )
  } catch (e) {
    console.error('Run failed', e)
  }
}

const handleStopInstance = async (instanceId: string) => {
  try {
    await api.stopInstance(instanceId)
    instances.value = instances.value.filter(i => i.instanceId !== instanceId)
  } catch (e) {
    console.error('Stop failed', e)
  }
}

const handleRestartInstance = async (instanceId: string, serviceId: string) => {
  try {
    await api.stopInstance(instanceId)
    await api.runService(serviceId)
    await loadInstances()
  } catch (e) {
    console.error('Restart failed', e)
  }
}

const stopAll = async () => {
  for (const inst of instances.value) {
    await api.stopInstance(inst.instanceId)
  }
  instances.value = []
}

const handleAction = async (id: string, action: string) => {
  try {
    const updated = await api.serviceAction(id, action)
    services.value = services.value.map(s => s.id === id ? updated : s)
    if (selectedService.value?.id === id) selectedService.value = updated
    await loadInstances()
  } catch (e) {
    console.error('Action failed', e)
  }
}

const openCreateModal = () => {
  editingService.value = null
  isModalOpen.value = true
}

const openEditModal = (service: MicroService) => {
  editingService.value = service
  isModalOpen.value = true
}

const handleSave = async (data: Partial<MicroService>) => {
  try {
    if (editingService.value) {
      const updated = await api.updateService(editingService.value.id, data)
      services.value = services.value.map(s => s.id === updated.id ? updated : s)
    } else {
      const created = await api.createService(data)
      services.value = [...services.value, created]
    }
    isModalOpen.value = false
  } catch (e) {
    console.error('Save failed', e)
  }
}

const handleNavigate = (tab: ActiveTab) => {
  activeTab.value = tab
  selectedService.value = null
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadServices()
  await loadInstances()
  instancesTimer = setInterval(loadInstances, 2000)
})

onUnmounted(() => {
  if (instancesTimer) clearInterval(instancesTimer)
})
</script>
