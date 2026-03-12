<template>
  <div class="p-8 max-w-7xl mx-auto w-full">

    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-black text-white tracking-tight">Microservices API</h2>
      <p class="text-slate-400 text-sm mt-1">
        Microservicios activos en el backend — endpoints, request &amp; response schemas
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-16 text-slate-500">
      <div class="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spin mb-3"></div>
      <p class="text-sm">Cargando microservicios...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Service cards -->
    <div v-else class="space-y-4">
      <div
        v-for="service in services"
        :key="service.id"
        class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
      >
        <!-- Card header (clickable to expand) -->
        <button
          @click="toggleService(service.id)"
          class="w-full flex items-center gap-4 p-5 hover:bg-slate-800/40 transition-colors text-left"
        >
          <!-- Icon -->
          <div class="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center shrink-0">
            <component :is="iconFor(service.iconName)" class="text-blue-400" :size="20" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-bold text-slate-100">{{ service.name }}</span>
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                  service.status === 'RUNNING'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-slate-700/50 text-slate-500'
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', service.status === 'RUNNING' ? 'bg-emerald-400' : 'bg-slate-500']" />
                {{ service.status }}
              </span>
              <span class="text-[10px] text-slate-600 font-mono">{{ service.instance }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">{{ service.description }} — {{ service.version }}</p>
          </div>

          <!-- Endpoint count -->
          <div class="text-right shrink-0 mr-2">
            <p class="text-xs text-slate-500">{{ endpointsFor(service).length }} endpoints</p>
          </div>

          <!-- Chevron -->
          <ChevronDown
            :size="18"
            :class="['text-slate-500 transition-transform shrink-0', expanded.has(service.id) ? 'rotate-180' : '']"
          />
        </button>

        <!-- Endpoints panel -->
        <div v-if="expanded.has(service.id)" class="border-t border-slate-800">
          <div
            v-for="(ep, idx) in endpointsFor(service)"
            :key="idx"
            :class="['border-b border-slate-800/60 last:border-b-0']"
          >
            <!-- Endpoint header -->
            <button
              @click="toggleEndpoint(`${service.id}-${idx}`)"
              class="w-full flex items-start gap-3 px-5 py-4 hover:bg-slate-800/30 transition-colors text-left"
            >
              <!-- Method badge -->
              <span
                :class="[
                  'inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 mt-0.5 w-14 text-center',
                  methodColor(ep.method)
                ]"
              >{{ ep.method }}</span>

              <!-- Path + description -->
              <div class="flex-1 min-w-0">
                <span class="font-mono text-sm text-slate-200">{{ ep.basePath }}{{ ep.path }}</span>
                <p class="text-xs text-slate-500 mt-0.5">{{ ep.description }}</p>
              </div>

              <!-- Status code -->
              <span class="text-[10px] font-bold text-slate-600 shrink-0 mt-0.5">{{ ep.statusCode }}</span>

              <ChevronRight
                :size="14"
                :class="['text-slate-600 shrink-0 mt-0.5 transition-transform', expandedEndpoints.has(`${service.id}-${idx}`) ? 'rotate-90' : '']"
              />
            </button>

            <!-- Request / Response detail -->
            <div v-if="expandedEndpoints.has(`${service.id}-${idx}`)" class="bg-[#0d1117] border-t border-slate-800/60">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">

                <!-- Request -->
                <div class="p-5">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                    <ArrowRight :size="10" class="text-blue-500" /> Request
                    <span v-if="ep.method === 'GET'" class="text-slate-700">— No body required</span>
                  </p>

                  <!-- Path params -->
                  <div v-if="ep.pathParams && ep.pathParams.length" class="mb-3">
                    <p class="text-[10px] text-slate-600 uppercase mb-1">Path Parameters</p>
                    <div v-for="p in ep.pathParams" :key="p.name" class="flex items-center gap-2 text-xs mb-1">
                      <span class="font-mono text-amber-400">:{{ p.name }}</span>
                      <span class="text-slate-600">{{ p.type }}</span>
                      <span class="text-slate-500">— {{ p.desc }}</span>
                    </div>
                  </div>

                  <!-- Body -->
                  <div v-if="ep.request">
                    <p class="text-[10px] text-slate-600 uppercase mb-1">Body <span class="text-slate-700">(application/json)</span></p>
                    <pre class="text-[11px] text-emerald-300 font-mono leading-relaxed overflow-x-auto">{{ formatJson(ep.request) }}</pre>
                  </div>

                  <!-- No body for GET -->
                  <div v-else-if="ep.method === 'GET' && !ep.pathParams?.length">
                    <pre class="text-[11px] text-slate-600 font-mono">— sin parámetros —</pre>
                  </div>
                </div>

                <!-- Response -->
                <div class="p-5">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                    <ArrowLeft :size="10" class="text-emerald-500" /> Response
                    <span class="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold">{{ ep.statusCode }}</span>
                  </p>
                  <pre class="text-[11px] text-blue-300 font-mono leading-relaxed overflow-x-auto">{{ formatJson(ep.response) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ChevronDown, ChevronRight, ArrowRight, ArrowLeft,
  Database, ShoppingCart, Package, Mail, CreditCard, Box
} from 'lucide-vue-next'
import type { MicroService } from '../types'
import { api } from '../api/services'

// ── State ──────────────────────────────────────────────────────
const services   = ref<MicroService[]>([])
const isLoading  = ref(true)
const error      = ref('')
const expanded         = ref(new Set<string>())
const expandedEndpoints = ref(new Set<string>())

onMounted(async () => {
  try {
    services.value = await api.getServices()
    // Expandir el primer servicio por defecto
    if (services.value.length) expanded.value.add(services.value[0].id)
  } catch (e) {
    error.value = 'No se puede conectar al backend. Asegúrate de que Spring Boot esté corriendo en :8080'
  } finally {
    isLoading.value = false
  }
})

const toggleService = (id: string) => {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
  expanded.value = new Set(expanded.value)
}

const toggleEndpoint = (key: string) => {
  if (expandedEndpoints.value.has(key)) expandedEndpoints.value.delete(key)
  else expandedEndpoints.value.add(key)
  expandedEndpoints.value = new Set(expandedEndpoints.value)
}

// ── Helpers ────────────────────────────────────────────────────
const iconFor = (iconName: string) => {
  const map: Record<string, any> = { Database, ShoppingCart, Package, Mail, CreditCard }
  return map[iconName] ?? Box
}

const methodColor = (m: string) => ({
  GET:    'bg-emerald-500/15 text-emerald-400',
  POST:   'bg-blue-500/15 text-blue-400',
  PUT:    'bg-amber-500/15 text-amber-400',
  DELETE: 'bg-red-500/15 text-red-400',
}[m] ?? 'bg-slate-700 text-slate-300')

const formatJson = (obj: any) => JSON.stringify(obj, null, 2)

// ── Endpoint catalog ───────────────────────────────────────────
// Cada servicio expone endpoints según su iconName/tipo
interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  basePath: string
  path: string
  description: string
  statusCode: number
  pathParams?: { name: string; type: string; desc: string }[]
  request?: any
  response: any
}

const endpointsFor = (service: MicroService): Endpoint[] => {
  const base = `/services/${service.id}/api/v1`
  const catalog: Record<string, Endpoint[]> = {

    Database: [
      {
        method: 'POST', basePath: base, path: '/auth/login',
        description: 'Autentica usuario y retorna JWT + refresh token',
        statusCode: 200,
        request: { username: 'admin@profuturo.mx', password: 'S3cur3P@ss' },
        response: {
          accessToken: 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9...',
          refreshToken: 'rt_8f2a3b4c5d6e7f8g',
          expiresIn: 3600,
          tokenType: 'Bearer'
        }
      },
      {
        method: 'GET', basePath: base, path: '/auth/validate',
        description: 'Valida el JWT del header Authorization',
        statusCode: 200,
        response: { valid: true, userId: 'usr_001', roles: ['ADMIN', 'READ'], expiresAt: '2026-03-03T23:00:00Z' }
      },
      {
        method: 'POST', basePath: base, path: '/auth/refresh',
        description: 'Renueva el access token usando el refresh token',
        statusCode: 200,
        request: { refreshToken: 'rt_8f2a3b4c5d6e7f8g' },
        response: { accessToken: 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9...new', expiresIn: 3600 }
      },
      {
        method: 'POST', basePath: base, path: '/auth/logout',
        description: 'Invalida el token y cierra sesión',
        statusCode: 204,
        request: { refreshToken: 'rt_8f2a3b4c5d6e7f8g' },
        response: { message: 'Session closed successfully' }
      },
    ],

    ShoppingCart: [
      {
        method: 'GET', basePath: base, path: '/orders',
        description: 'Lista todas las órdenes con paginación',
        statusCode: 200,
        response: {
          content: [
            { orderId: 'ORD-2026-001', status: 'CONFIRMED', total: 1250.00, currency: 'MXN', createdAt: '2026-03-03T10:00:00Z' }
          ],
          page: 0, size: 20, totalElements: 1, totalPages: 1
        }
      },
      {
        method: 'POST', basePath: base, path: '/orders',
        description: 'Crea una nueva orden de compra',
        statusCode: 201,
        request: {
          customerId: 'cust_abc123',
          items: [{ productId: 'SKU-001', quantity: 2, unitPrice: 625.00 }],
          shippingAddress: { street: 'Av. Reforma 222', city: 'CDMX', zip: '06600' }
        },
        response: { orderId: 'ORD-2026-002', status: 'PENDING', total: 1250.00, estimatedDelivery: '2026-03-07' }
      },
      {
        method: 'GET', basePath: base, path: '/orders/:orderId',
        description: 'Consulta el detalle de una orden específica',
        statusCode: 200,
        pathParams: [{ name: 'orderId', type: 'string', desc: 'ID de la orden (ej: ORD-2026-001)' }],
        response: {
          orderId: 'ORD-2026-001', status: 'CONFIRMED', customerId: 'cust_abc123',
          items: [{ productId: 'SKU-001', name: 'Producto A', quantity: 2, unitPrice: 625.00 }],
          total: 1250.00, currency: 'MXN'
        }
      },
      {
        method: 'PUT', basePath: base, path: '/orders/:orderId/status',
        description: 'Actualiza el estado de una orden',
        statusCode: 200,
        pathParams: [{ name: 'orderId', type: 'string', desc: 'ID de la orden' }],
        request: { status: 'SHIPPED', trackingCode: 'MX-TRK-9876543', carrier: 'FedEx' },
        response: { orderId: 'ORD-2026-001', status: 'SHIPPED', updatedAt: '2026-03-03T18:00:00Z' }
      },
      {
        method: 'DELETE', basePath: base, path: '/orders/:orderId',
        description: 'Cancela y elimina una orden (solo PENDING)',
        statusCode: 204,
        pathParams: [{ name: 'orderId', type: 'string', desc: 'ID de la orden' }],
        response: { message: 'Order cancelled successfully' }
      },
    ],

    Package: [
      {
        method: 'GET', basePath: base, path: '/inventory',
        description: 'Consulta el inventario completo con stock en tiempo real',
        statusCode: 200,
        response: {
          items: [
            { sku: 'SKU-001', name: 'Producto A', stock: 142, reserved: 12, available: 130, warehouse: 'WH-CDMX-01' }
          ],
          totalItems: 1, lastUpdated: '2026-03-03T17:28:00Z'
        }
      },
      {
        method: 'GET', basePath: base, path: '/inventory/:sku',
        description: 'Stock actual de un producto por SKU',
        statusCode: 200,
        pathParams: [{ name: 'sku', type: 'string', desc: 'Código de producto (ej: SKU-001)' }],
        response: { sku: 'SKU-001', name: 'Producto A', stock: 142, reserved: 12, available: 130, unit: 'PZA' }
      },
      {
        method: 'PUT', basePath: base, path: '/inventory/:sku/adjust',
        description: 'Ajuste manual de inventario (entrada/salida)',
        statusCode: 200,
        pathParams: [{ name: 'sku', type: 'string', desc: 'Código de producto' }],
        request: { delta: -5, reason: 'DAMAGED', notes: 'Productos dañados en almacén', operatorId: 'usr_002' },
        response: { sku: 'SKU-001', previousStock: 142, newStock: 137, adjustedAt: '2026-03-03T18:00:00Z' }
      },
      {
        method: 'POST', basePath: base, path: '/inventory/reserve',
        description: 'Reserva unidades para una orden pendiente',
        statusCode: 200,
        request: { orderId: 'ORD-2026-002', items: [{ sku: 'SKU-001', quantity: 2 }] },
        response: { reservationId: 'RES-001', status: 'RESERVED', expiresAt: '2026-03-03T19:00:00Z' }
      },
    ],

    Mail: [
      {
        method: 'POST', basePath: base, path: '/notifications/email',
        description: 'Envía email transaccional de forma asíncrona',
        statusCode: 202,
        request: {
          to: ['usuario@profuturo.mx'],
          templateId: 'ORDER_CONFIRMED',
          variables: { orderId: 'ORD-2026-001', customerName: 'Juan Pérez', total: '$1,250.00 MXN' },
          priority: 'HIGH'
        },
        response: { jobId: 'job_abc123', status: 'QUEUED', estimatedDelivery: '< 30s' }
      },
      {
        method: 'POST', basePath: base, path: '/notifications/sms',
        description: 'Envía SMS vía Twilio de forma asíncrona',
        statusCode: 202,
        request: { to: '+525512345678', message: 'Tu orden ORD-2026-001 fue confirmada. Monto: $1,250 MXN', sender: 'PROFUTURO' },
        response: { jobId: 'job_def456', status: 'QUEUED', provider: 'Twilio' }
      },
      {
        method: 'GET', basePath: base, path: '/notifications/:jobId/status',
        description: 'Consulta el estado de envío de una notificación',
        statusCode: 200,
        pathParams: [{ name: 'jobId', type: 'string', desc: 'ID del job de notificación (ej: job_abc123)' }],
        response: { jobId: 'job_abc123', status: 'DELIVERED', deliveredAt: '2026-03-03T18:01:05Z', opens: 1 }
      },
      {
        method: 'GET', basePath: base, path: '/notifications/templates',
        description: 'Lista todos los templates de notificaciones disponibles',
        statusCode: 200,
        response: {
          templates: [
            { id: 'ORDER_CONFIRMED', type: 'EMAIL', subject: 'Orden confirmada #{{orderId}}' },
            { id: 'PASSWORD_RESET',  type: 'EMAIL', subject: 'Restablece tu contraseña' },
            { id: 'WELCOME_SMS',     type: 'SMS',   message: 'Bienvenido a Profuturo, {{name}}' }
          ]
        }
      },
    ],

    CreditCard: [
      {
        method: 'POST', basePath: base, path: '/payments/charge',
        description: 'Procesa un cargo a tarjeta vía Stripe',
        statusCode: 200,
        request: {
          orderId: 'ORD-2026-001',
          amount: 125000,
          currency: 'MXN',
          paymentMethod: { type: 'card', token: 'tok_visa_4242' },
          customerId: 'cust_abc123'
        },
        response: {
          paymentId: 'pay_xyz789',
          status: 'SUCCEEDED',
          amount: 125000, currency: 'MXN',
          last4: '4242', brand: 'Visa',
          receiptUrl: 'https://pay.stripe.com/receipts/...'
        }
      },
      {
        method: 'POST', basePath: base, path: '/payments/refund',
        description: 'Procesa reembolso total o parcial',
        statusCode: 200,
        request: { paymentId: 'pay_xyz789', amount: 125000, reason: 'CUSTOMER_REQUEST' },
        response: { refundId: 'ref_abc001', status: 'SUCCEEDED', amount: 125000, processedAt: '2026-03-03T18:05:00Z' }
      },
      {
        method: 'GET', basePath: base, path: '/payments/:paymentId',
        description: 'Consulta el estado de un pago',
        statusCode: 200,
        pathParams: [{ name: 'paymentId', type: 'string', desc: 'ID del pago (ej: pay_xyz789)' }],
        response: { paymentId: 'pay_xyz789', status: 'SUCCEEDED', amount: 125000, currency: 'MXN', createdAt: '2026-03-03T17:00:00Z' }
      },
      {
        method: 'GET', basePath: base, path: '/payments/methods/:customerId',
        description: 'Lista los métodos de pago guardados del cliente',
        statusCode: 200,
        pathParams: [{ name: 'customerId', type: 'string', desc: 'ID del cliente' }],
        response: {
          methods: [
            { id: 'pm_001', type: 'card', brand: 'Visa', last4: '4242', expMonth: 12, expYear: 2027, isDefault: true }
          ]
        }
      },
    ],
  }

  return catalog[service.iconName] ?? [
    {
      method: 'GET', basePath: `/services/${service.id}`, path: '/health',
      description: 'Health check del microservicio',
      statusCode: 200,
      response: { status: 'UP', service: service.name, timestamp: new Date().toISOString() }
    }
  ]
}
</script>
