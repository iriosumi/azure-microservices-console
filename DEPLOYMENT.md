# Guía de Despliegue en Azure App Service

## Arquitectura del POC

```
┌─────────────────────────────────────────────────┐
│              Azure App Service                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Spring Boot JAR (Puerto 8080)           │  │
│  │                                          │  │
│  │  ┌────────────────┐  ┌───────────────┐  │  │
│  │  │  Vue 3 (SPA)   │  │  REST API     │  │  │
│  │  │  /static/*     │  │  /api/*       │  │  │
│  │  └────────────────┘  └───────────────┘  │  │
│  │                                          │  │
│  │  H2 In-Memory DB  │  Metrics Simulator  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         ↕ Azure App Service (HTTPS :443)
              Usuario Final (Browser)
```

El frontend Vue se compila como archivos estáticos y Spring Boot los sirve directamente.
Un solo JAR = un solo App Service.

---

## Prerequisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Java JDK    | 21            |
| Maven       | 3.8+          |
| Node.js     | 18+           |
| Azure CLI   | 2.50+         |

---

## Paso 1 — Ejecutar en local (desarrollo)

### Terminal 1: Backend Spring Boot
```bash
cd backend
mvn spring-boot:run
# → http://localhost:8080
# → H2 Console: http://localhost:8080/h2-console
# → Health: http://localhost:8080/actuator/health
```

### Terminal 2: Frontend Vue
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
# El proxy de Vite redirige /api → localhost:8080
```

Abre **http://localhost:5173** en tu navegador.

---

## Paso 2 — Build para producción

```bash
# Desde la raíz del proyecto
bash build.sh
```

O manualmente:
```bash
# 2a. Compilar Vue (output → backend/src/main/resources/static/)
cd frontend
npm install && npm run build

# 2b. Empaquetar Spring Boot (fat JAR)
cd ../backend
mvn clean package -DskipTests

# Resultado: backend/target/microservices-console-1.0.0.jar
```

---

## Paso 3 — Crear el Azure App Service

### Opción A: Azure Portal (recomendado para POC)

1. Ir a **portal.azure.com**
2. **Crear un recurso** → **App Service**
3. Configurar:
   - **Nombre**: `poc-microservices-console` (debe ser único)
   - **Runtime stack**: `Java 21`
   - **Java web server stack**: `Java SE (Embedded Web Server)`
   - **Operating System**: `Linux`
   - **Region**: `East US 2`
   - **Plan**: `B1` (básico — suficiente para POC)
4. **Revisar y crear**

### Opción B: Azure CLI

```bash
# Login
az login

# Variables
RG="rg-poc-microservices"
APP="poc-microservices-console"
PLAN="plan-poc-microservices"
LOCATION="eastus2"

# Resource group
az group create --name $RG --location $LOCATION

# App Service Plan (Linux)
az appservice plan create \
  --name $PLAN \
  --resource-group $RG \
  --location $LOCATION \
  --is-linux \
  --sku B1

# App Service con Java 21
az webapp create \
  --name $APP \
  --resource-group $RG \
  --plan $PLAN \
  --runtime "JAVA:21:Java SE"
```

---

## Paso 4 — Configurar el App Service

### Variables de entorno (App Settings)

En el portal: App Service → **Configuration** → **Application settings**

| Nombre | Valor |
|--------|-------|
| `PORT` | `8080` |
| `SPRING_PROFILES_ACTIVE` | `production` |

O con Azure CLI:
```bash
az webapp config appsettings set \
  --resource-group $RG \
  --name $APP \
  --settings PORT=8080 SPRING_PROFILES_ACTIVE=production
```

### Startup command

En el portal: App Service → **Configuration** → **General settings** → **Startup Command**:
```
java -jar /home/site/wwwroot/microservices-console-1.0.0.jar
```

O con CLI:
```bash
az webapp config set \
  --resource-group $RG \
  --name $APP \
  --startup-file "java -jar /home/site/wwwroot/microservices-console-1.0.0.jar"
```

---

## Paso 5 — Desplegar el JAR

### Opción A: Azure CLI (recomendado)
```bash
az webapp deploy \
  --resource-group rg-poc-microservices \
  --name poc-microservices-console \
  --src-path backend/target/microservices-console-1.0.0.jar \
  --type jar
```

### Opción B: FTP / ZIP deploy desde el portal

1. App Service → **Deployment Center** → **FTPS credentials**
2. Subir el JAR a `/home/site/wwwroot/`
3. Reiniciar la app

### Opción C: VS Code Azure Extension

1. Instalar extensión **Azure App Service** en VS Code
2. Click derecho en tu App Service → **Deploy to Web App...**
3. Seleccionar `backend/target/microservices-console-1.0.0.jar`

---

## Paso 6 — Verificar el despliegue

```bash
# URL de tu app
APP_URL="https://poc-microservices-console.azurewebsites.net"

# Health check
curl $APP_URL/api/ping

# Lista de servicios
curl $APP_URL/api/services

# Métricas del primer servicio
curl $APP_URL/api/services/1/metrics
```

Abre en el navegador: `https://poc-microservices-console.azurewebsites.net`

---

## Paso 7 — Ver logs en Azure

```bash
# Streaming de logs en tiempo real
az webapp log tail \
  --resource-group rg-poc-microservices \
  --name poc-microservices-console
```

O en el portal: App Service → **Log stream**

---

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/api/services` | Lista todos los microservicios |
| POST   | `/api/services` | Registra un nuevo microservicio |
| PUT    | `/api/services/{id}` | Actualiza configuración |
| DELETE | `/api/services/{id}` | Elimina un microservicio |
| POST   | `/api/services/{id}/action` | Ejecuta START / STOP / RESTART |
| GET    | `/api/services/{id}/metrics` | Métricas en tiempo real (CPU, RAM, latencia) |
| GET    | `/api/ping` | Health check |
| GET    | `/actuator/health` | Spring Actuator health |

---

## Notas para producción (más allá del POC)

| Aspecto | POC (actual) | Producción |
|---------|-------------|------------|
| Base de datos | H2 in-memory | Azure SQL Database / PostgreSQL |
| Autenticación | Ninguna | Azure AD / OAuth2 |
| Escalado | Manual | Auto-scale rules en App Service |
| Secretos | application.properties | Azure Key Vault |
| CI/CD | Manual | GitHub Actions / Azure DevOps |
| Monitoreo | Actuator + logs | Azure Application Insights |

---

## Troubleshooting

**La app tarda en arrancar (cold start)**
→ Normal en plan B1. Usar "Always On" en el App Service Plan (requiere B2+).

**Error 503 al entrar**
→ Esperar 2-3 min después del deploy. Ver logs con `az webapp log tail`.

**Los datos se pierden al reiniciar**
→ Esperado: H2 es in-memory. Para persistencia, migrar a Azure SQL.

**CORS error en desarrollo**
→ Verificar que el frontend corre en `localhost:5173` y el backend en `localhost:8080`.
