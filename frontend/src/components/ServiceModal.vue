<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />

    <!-- Modal panel -->
    <div class="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      <div class="p-6 border-b border-slate-800 flex justify-between items-center">
        <h3 class="text-xl font-bold text-white">
          {{ service ? 'Edit Service' : 'Register New Service' }}
        </h3>
        <button @click="$emit('close')" class="text-slate-500 hover:text-white text-2xl leading-none font-light transition-colors">
          &times;
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Name -->
        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Service Name</label>
          <input
            v-model="form.name"
            required
            placeholder="e.g. auth-service"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
          />
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
          <input
            v-model="form.description"
            required
            placeholder="Short description"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
          />
        </div>

        <!-- Region + Icon -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Azure Region</label>
            <select
              v-model="form.region"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>East US 2</option>
              <option>West US</option>
              <option>North Europe</option>
              <option>Southeast Asia</option>
              <option>Brazil South</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Icon</label>
            <select
              v-model="form.iconName"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Database">Database</option>
              <option value="ShoppingCart">Shopping Cart</option>
              <option value="Package">Package</option>
              <option value="Mail">Mail</option>
              <option value="CreditCard">Credit Card</option>
            </select>
          </div>
        </div>

        <!-- Credentials -->
        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Credentials / Config (optional)</label>
          <textarea
            v-model="form.credentials"
            rows="3"
            placeholder="API keys, connection strings, env vars..."
            class="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600 font-mono resize-none"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-600/20 text-sm"
          >
            {{ service ? 'Save Changes' : 'Register Service' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { MicroService } from '../types'

const props = defineProps<{ service: MicroService | null }>()
const emit = defineEmits<{
  close: []
  save: [data: Partial<MicroService>]
}>()

const form = reactive({
  name: '',
  description: '',
  region: 'East US 2',
  iconName: 'Database',
  credentials: '',
})

watch(() => props.service, (s) => {
  if (s) {
    form.name        = s.name
    form.description = s.description
    form.region      = s.region
    form.iconName    = s.iconName
    form.credentials = s.credentials ?? ''
  } else {
    form.name        = ''
    form.description = ''
    form.region      = 'East US 2'
    form.iconName    = 'Database'
    form.credentials = ''
  }
}, { immediate: true })

const handleSubmit = () => emit('save', { ...form })
</script>
