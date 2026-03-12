import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  LayoutDashboard, 
  Network, 
  Terminal, 
  Settings, 
  Search, 
  Bell, 
  Rocket, 
  RefreshCw, 
  LayoutGrid, 
  CheckCircle2, 
  Activity,
  Database,
  ShoppingCart,
  Package,
  Mail,
  CreditCard,
  Play,
  Square,
  PlusCircle,
  TrendingUp,
  Boxes,
  Server,
  AlertCircle,
  ChevronRight,
  Download,
  Trash2,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type ServiceStatus = 'RUNNING' | 'STOPPED';
type ActiveTab = 'Dashboard' | 'Microservices' | 'Clusters' | 'Infrastructure' | 'Logs' | 'Alerts';

interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  region: string;
  lastDeployed: string;
  icon: React.ElementType;
  instance?: string;
  version?: string;
}

interface Stat {
  label: string;
  value: string;
  subValue: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}

// --- Mock Data ---

const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    name: 'auth-service',
    description: 'Centralized Identity Provider',
    status: 'RUNNING',
    region: 'East US 2',
    lastDeployed: '2h ago',
    icon: Database,
    instance: 'prod-us-east-001',
    version: 'Spring Boot v3.2.1'
  },
  {
    id: '2',
    name: 'order-api',
    description: 'Transaction Management',
    status: 'STOPPED',
    region: 'East US 2',
    lastDeployed: '1d ago',
    icon: ShoppingCart,
    instance: 'prod-us-east-002',
    version: 'Spring Boot v3.2.1'
  },
  {
    id: '3',
    name: 'inventory-service',
    description: 'Real-time Stock Tracking',
    status: 'RUNNING',
    region: 'East US 2',
    lastDeployed: '3d ago',
    icon: Package,
    instance: 'prod-us-east-003',
    version: 'Spring Boot v3.2.1'
  },
  {
    id: '4',
    name: 'notification-worker',
    description: 'Async Email & SMS',
    status: 'RUNNING',
    region: 'East US 2',
    lastDeployed: '5h ago',
    icon: Mail,
    instance: 'prod-us-east-004',
    version: 'Spring Boot v3.2.1'
  },
  {
    id: '5',
    name: 'payment-gateway',
    description: 'Stripe Integration Service',
    status: 'RUNNING',
    region: 'East US 2',
    lastDeployed: '12m ago',
    icon: CreditCard,
    instance: 'prod-us-east-005',
    version: 'Spring Boot v3.2.1'
  },
];

const STATS: Stat[] = [
  {
    label: 'Total Services',
    value: '12',
    subValue: '+2 this month',
    icon: LayoutGrid,
    trend: 'up',
    trendValue: '+2 this month',
    color: 'text-primary',
  },
  {
    label: 'Active Instances',
    value: '10',
    subValue: '2 Stopped (Maintained)',
    icon: CheckCircle2,
    color: 'text-emerald-500',
  },
  {
    label: 'System Health',
    value: '98.4%',
    subValue: 'SLA Compliant',
    icon: Activity,
    color: 'text-primary',
  },
];

const MOCK_LOGS = [
  { time: '2024-05-20 14:02:10.451', level: 'INFO', thread: 'main', class: 'o.s.b.w.embedded.tomcat.TomcatWebServer', message: 'Tomcat initialized with port(s): 8080 (http)' },
  { time: '2024-05-20 14:02:10.462', level: 'INFO', thread: 'main', class: 'o.apache.catalina.core.StandardService', message: 'Starting service [Tomcat]' },
  { time: '2024-05-20 14:02:10.463', level: 'INFO', thread: 'main', class: 'org.apache.catalina.core.StandardEngine', message: 'Starting Servlet engine: [Apache Tomcat/10.1.17]' },
  { time: '2024-05-20 14:02:10.518', level: 'INFO', thread: 'main', class: 'o.a.c.c.C.[Tomcat].[localhost].[/]', message: 'Initializing Spring embedded WebApplicationContext' },
  { time: '2024-05-20 14:02:10.519', level: 'INFO', thread: 'main', class: 'w.s.c.ServletWebServerApplicationContext', message: 'Root WebApplicationContext: initialization completed in 1248 ms' },
  { time: '2024-05-20 14:02:11.102', level: 'INFO', thread: 'main', class: 'c.azure.poc.AuthServiceApplication', message: 'Started AuthServiceApplication in 2.345 seconds (process running for 2.89)', highlight: true },
  { time: '2024-05-20 14:05:22.115', level: 'DEBUG', thread: 'nio-8080-exec-1', class: 'c.a.p.auth.controller.LoginController', message: 'POST /api/v1/login - Processing credentials' },
  { time: '2024-05-20 14:05:22.342', level: 'DEBUG', thread: 'nio-8080-exec-1', class: 'c.a.p.auth.service.JwtProvider', message: 'Generating new JWT for user: system-admin' },
  { time: '2024-05-20 14:10:05.120', level: 'WARN', thread: 'nio-8080-exec-4', class: 'c.a.p.auth.security.AuthFilter', message: 'Rate limit approaching for IP 192.168.1.45' },
  { time: '2024-05-20 14:12:44.981', level: 'DEBUG', thread: 'nio-8080-exec-7', class: 'c.a.p.auth.controller.LoginController', message: 'GET /api/v1/validate - Token verified successfully' },
  { time: '2024-05-20 14:15:33.004', level: 'ERROR', thread: 'scheduling-11', class: 'c.a.p.auth.scheduler.TokenCleanup', message: 'Failed to connect to Redis' },
];

// --- Components ---

const SidebarItem: React.FC<{ icon: any; label: string; active?: boolean; onClick: () => void }> = ({ icon: Icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </button>
);

const StatCard: React.FC<{ stat: Stat }> = ({ stat }) => (
  <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
      <stat.icon className={stat.color} size={20} />
    </div>
    <p className="text-3xl font-black mt-2">{stat.value}</p>
    <div className="mt-1">
      {stat.trend === 'up' ? (
        <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
          <TrendingUp size={12} />
          {stat.trendValue}
        </p>
      ) : (
        <p className="text-[10px] text-slate-500 font-bold">{stat.subValue}</p>
      )}
    </div>
  </div>
);

const ServiceCard: React.FC<{ 
  service: Service; 
  onAction: (id: string, action: 'START' | 'STOP' | 'RESTART') => void;
  onClick: () => void;
}> = ({ 
  service, 
  onAction,
  onClick
}) => {
  const isRunning = service.status === 'RUNNING';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <service.icon className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">{service.name}</h3>
              <p className="text-[10px] text-slate-500 font-medium">{service.description}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
            isRunning ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
          }`}>
            <span className={`size-2 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{service.status}</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Azure Region</span>
            <span className="font-semibold">{service.region}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Last Deployed</span>
            <span className="font-semibold">{service.lastDeployed}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onAction(service.id, 'START')}
            disabled={isRunning}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-colors ${
              isRunning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
            }`}
          >
            <Play size={12} /> Start
          </button>
          <button 
            onClick={() => onAction(service.id, 'STOP')}
            disabled={!isRunning}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-colors ${
              !isRunning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
            }`}
          >
            <Square size={12} /> Stop
          </button>
          <button 
            onClick={() => onAction(service.id, 'RESTART')}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-[11px] font-bold"
          >
            <RefreshCw size={12} /> Restart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const MetricChart = ({ label, value, unit, description, icon: Icon, colorClass }: { label: string, value: string, unit: string, description: string, icon: any, colorClass: string }) => {
  const bars = [30, 45, 25, 60, 40, 75, 50, 85, 65, 95, 70, 40];
  
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-100 mb-1">
            <Icon size={18} className="text-primary" />
            <h4 className="font-bold text-lg">{label}</h4>
          </div>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black ${colorClass}`}>{value}<span className="text-sm ml-1">{unit}</span></p>
        </div>
      </div>
      
      <div className="flex items-end gap-1.5 h-24 mt-6">
        {bars.map((height, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-t-sm transition-all duration-500 ${i === 9 ? 'bg-primary' : 'bg-primary/20'}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
};

const ServiceDetails: React.FC<{ service: Service; onBack: () => void; onEdit: (service: Service) => void; onAction: (id: string, action: 'START' | 'STOP' | 'RESTART') => void }> = ({ service, onBack, onEdit, onAction }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 max-w-7xl mx-auto w-full"
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
        <button onClick={onBack} className="hover:text-slate-300 transition-colors">Services</button>
        <ChevronRight size={12} />
        <span className="text-slate-100 font-semibold">{service.name}</span>
        <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[9px] font-bold uppercase tracking-tight">{service.status}</span>
        </div>
      </div>

      {/* Service Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/5">
            <service.icon className="text-primary" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">{service.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Instance: <span className="text-slate-400 font-mono">{service.instance}</span> 
              <span className="mx-2 text-slate-700">•</span> 
              {service.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(service)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-sm font-bold transition-all border border-slate-700"
          >
            <Settings size={14} /> Edit Config
          </button>
          <button 
            onClick={() => onAction(service.id, 'START')}
            disabled={service.status === 'RUNNING'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
              service.status === 'RUNNING' 
                ? 'bg-slate-800/50 text-slate-500 border-transparent cursor-not-allowed' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
            }`}
          >
            <Play size={14} /> Start
          </button>
          <button 
            onClick={() => onAction(service.id, 'RESTART')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-sm font-bold transition-all border border-slate-700"
          >
            <RefreshCw size={14} /> Restart
          </button>
          <button 
            onClick={() => onAction(service.id, 'STOP')}
            disabled={service.status === 'STOPPED'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
              service.status === 'STOPPED' 
                ? 'bg-slate-800/50 text-slate-500 border-transparent cursor-not-allowed' 
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20'
            }`}
          >
            <Square size={14} /> Stop
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <MetricChart 
          label="CPU Usage" 
          description="Real-time percentage load" 
          value="24.5" 
          unit="%" 
          icon={Activity}
          colorClass="text-primary"
        />
        <MetricChart 
          label="Memory" 
          description="Allocated heap vs used" 
          value="512" 
          unit="MB" 
          icon={Boxes}
          colorClass="text-purple-500"
        />
      </div>

      {/* Logs Terminal */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/80 px-4 py-2 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-red-500/50"></div>
              <div className="size-2.5 rounded-full bg-yellow-500/50"></div>
              <div className="size-2.5 rounded-full bg-emerald-500/50"></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Terminal size={12} />
              Application_Logs
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase">
              <Download size={12} /> Export
            </button>
            <button className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase">
              <Trash2 size={12} /> Clear
            </button>
          </div>
        </div>
        <div className="p-6 font-mono text-[11px] leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
          {MOCK_LOGS.map((log, i) => (
            <div key={i} className={`mb-1.5 ${log.highlight ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
              <span className="text-slate-600">{log.time}</span>
              <span className={`mx-2 font-bold ${
                log.level === 'INFO' ? 'text-emerald-500' : 
                log.level === 'WARN' ? 'text-yellow-500' : 
                log.level === 'ERROR' ? 'text-red-500' : 'text-blue-400'
              }`}>{log.level}</span>
              <span className="text-slate-500">1 --- [ {log.thread} ]</span>
              <span className="mx-2 text-slate-300">{log.class}</span>
              <span className="text-slate-200">: {log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('Dashboard');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      // Map icon names back to components
      const iconMap: Record<string, any> = { Database, ShoppingCart, Package, Mail, CreditCard };
      const mapped = data.map((s: any) => ({
        ...s,
        icon: iconMap[s.iconName] || Boxes
      }));
      setServices(mapped);
    } catch (err) {
      console.error("Failed to fetch services", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleServiceAction = async (id: string, action: 'START' | 'STOP' | 'RESTART') => {
    try {
      const res = await fetch(`/api/services/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const updated = await res.json();
      const iconMap: Record<string, any> = { Database, ShoppingCart, Package, Mail, CreditCard };
      setServices(prev => prev.map(s => s.id === id ? { ...updated, icon: iconMap[updated.iconName] || Boxes } : s));
      if (selectedService?.id === id) {
        setSelectedService({ ...updated, icon: iconMap[updated.iconName] || Boxes });
      }
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  const handleSaveService = async (formData: any) => {
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchServices();
        setIsModalOpen(false);
        setEditingService(null);
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background-dark text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col bg-background-dark shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Cloud size={24} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Azure Console</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">POC Demo v1.0</p>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-6 overflow-y-auto py-4">
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Management</p>
            <nav className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => { setActiveTab('Dashboard'); setSelectedService(null); }} />
              <SidebarItem icon={Boxes} label="Microservices" active={activeTab === 'Microservices'} onClick={() => setActiveTab('Microservices')} />
              <SidebarItem icon={Network} label="Clusters" active={activeTab === 'Clusters'} onClick={() => setActiveTab('Clusters')} />
              <SidebarItem icon={Server} label="Infrastructure" active={activeTab === 'Infrastructure'} onClick={() => setActiveTab('Infrastructure')} />
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Monitoring</p>
            <nav className="space-y-1">
              <SidebarItem icon={Terminal} label="Global Logs" active={activeTab === 'Logs'} onClick={() => setActiveTab('Logs')} />
              <SidebarItem icon={AlertCircle} label="Alerts" active={activeTab === 'Alerts'} onClick={() => setActiveTab('Alerts')} />
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div 
                className="size-8 rounded-full bg-slate-700 bg-cover bg-center shrink-0" 
                style={{ backgroundImage: "url('https://picsum.photos/seed/jane/100/100')" }}
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">Jane Doe</p>
                <p className="text-[10px] text-slate-500 truncate">Admin Profile</p>
              </div>
            </div>
            <button className="text-slate-500 hover:text-slate-300 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text"
                placeholder="Search logs or metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-500 text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center size-10 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-6 w-px bg-slate-800 mx-1"></div>
            <button className="text-slate-400 hover:text-slate-100 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedService ? (
              <ServiceDetails 
                key="details"
                service={selectedService} 
                onBack={() => setSelectedService(null)} 
                onEdit={(service) => { setEditingService(service); setIsModalOpen(true); }}
                onAction={handleServiceAction}
              />
            ) : activeTab === 'Dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 max-w-7xl mx-auto w-full"
              >
                <div className="mb-8">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-white">Services Overview</h2>
                      <p className="text-slate-400 mt-1">Manage and monitor Java Spring Boot microservices on Azure App Service.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all">
                      <RefreshCw size={14} />
                      Refresh Status
                    </button>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {STATS.map((stat, idx) => (
                      <StatCard key={idx} stat={stat} />
                    ))}
                  </div>
                </div>

                {/* Service Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredServices.map(service => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        onAction={handleServiceAction}
                        onClick={() => setSelectedService(service)}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Register New Service Card */}
                  <button 
                    onClick={() => { setEditingService(null); setIsModalOpen(true); }}
                    className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <PlusCircle className="mb-2 group-hover:scale-110 transition-transform" size={32} />
                    <span className="font-bold text-sm">Register New Service</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full text-slate-500"
              >
                <div className="text-center">
                  <Boxes size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-xl font-bold">{activeTab} View</p>
                  <p className="text-sm">This module is currently under development.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modal for Register/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  {editingService ? 'Edit Service' : 'Register New Service'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                  <Square size={20} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveService(Object.fromEntries(formData));
              }} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Service Name</label>
                  <input name="name" defaultValue={editingService?.name} required className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm text-white focus:ring-primary" placeholder="e.g. auth-service" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <input name="description" defaultValue={editingService?.description} required className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm text-white focus:ring-primary" placeholder="Short description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Region</label>
                    <select name="region" defaultValue={editingService?.region || 'East US 2'} className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm text-white focus:ring-primary">
                      <option>East US 2</option>
                      <option>West US</option>
                      <option>North Europe</option>
                      <option>Southeast Asia</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Icon</label>
                    <select name="iconName" defaultValue={editingService?.iconName || 'Boxes'} className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm text-white focus:ring-primary">
                      <option value="Database">Database</option>
                      <option value="ShoppingCart">Shopping Cart</option>
                      <option value="Package">Package</option>
                      <option value="Mail">Mail</option>
                      <option value="CreditCard">Credit Card</option>
                      <option value="Boxes">Default</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Credentials / Config</label>
                  <textarea name="credentials" defaultValue={editingService?.credentials} rows={3} className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm text-white focus:ring-primary font-mono" placeholder="API keys, connection strings..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-all">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-lg shadow-primary/20">
                    {editingService ? 'Save Changes' : 'Register Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
