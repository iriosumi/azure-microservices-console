export interface MicroService {
  id: string
  name: string
  description: string
  status: 'RUNNING' | 'STOPPED'
  region: string
  lastDeployed: string
  iconName: string
  instance?: string
  version?: string
  credentials?: string
}

export interface LogEntry {
  time: string
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR'
  thread: string
  className: string
  message: string
}

export interface MetricsResponse {
  // JVM-wide metrics
  cpuPercent: number
  heapUsedMb: number
  heapMaxMb: number
  activeThreads: number
  // Per-service execution state
  serviceRunning: boolean
  totalIterations: number
  iterationsPerSec: number
  uptimeSeconds: number
  // Chart history (last 20 samples, every 2s)
  cpuHistory: number[]
  ipsHistory: number[]
  heapHistory: number[]
  timestamps: string[]
  recentLogs: LogEntry[]
}

export interface InstanceSummary {
  instanceId: string
  serviceId: string
  serviceName: string
  iconName: string
  uptimeSeconds: number
  totalIterations: number
  iterationsPerSec: number
  cpuPercent: number
}

export type ActiveTab = 'Dashboard' | 'Microservices' | 'Clusters' | 'Infrastructure' | 'Logs' | 'Alerts'
