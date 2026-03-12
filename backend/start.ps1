# ============================================================
# start.ps1 — Inicia el backend Spring Boot
# Descarga Maven automáticamente si no está instalado
# Uso: cd backend && powershell -ExecutionPolicy Bypass -File start.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$MAVEN_VERSION = "3.9.9"
$MAVEN_DIR = "$PSScriptRoot\.tools\maven"
$MAVEN_BIN = "$MAVEN_DIR\apache-maven-$MAVEN_VERSION\bin\mvn.cmd"

# ── Función: descargar Maven ─────────────────────────────────
function Download-Maven {
    $url    = "https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip"
    $zip    = "$PSScriptRoot\.tools\apache-maven-$MAVEN_VERSION-bin.zip"

    Write-Host ""
    Write-Host "  Maven no encontrado. Descargando Maven $MAVEN_VERSION..." -ForegroundColor Yellow
    Write-Host "  URL: $url" -ForegroundColor DarkGray

    New-Item -ItemType Directory -Force -Path "$PSScriptRoot\.tools" | Out-Null

    # Descargar con barra de progreso
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
    $ProgressPreference = 'Continue'

    Write-Host "  Extrayendo..." -ForegroundColor Yellow
    Expand-Archive -Path $zip -DestinationPath $MAVEN_DIR -Force
    Remove-Item $zip -Force

    Write-Host "  Maven $MAVEN_VERSION listo." -ForegroundColor Green
}

# ── Verificar Java ───────────────────────────────────────────
Write-Host ""
Write-Host "================================================" -ForegroundColor Blue
Write-Host "  Azure Microservices Console — Backend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Blue

try {
    $javaVersion = & java -version 2>&1
    Write-Host "  Java: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Java no está instalado." -ForegroundColor Red
    Write-Host "  Instala JDK 21+ desde: https://adoptium.net" -ForegroundColor Yellow
    exit 1
}

# ── Verificar / descargar Maven ──────────────────────────────
$mvnCmd = $null

# Buscar Maven en PATH primero
try {
    $mvnInPath = Get-Command mvn -ErrorAction SilentlyContinue
    if ($mvnInPath) {
        $mvnCmd = "mvn"
        Write-Host "  Maven: $($mvnInPath.Source)" -ForegroundColor Green
    }
} catch {}

# Si no está en PATH, usar/descargar Maven local
if (-not $mvnCmd) {
    if (-not (Test-Path $MAVEN_BIN)) {
        Download-Maven
    } else {
        Write-Host "  Maven local: $MAVEN_BIN" -ForegroundColor Green
    }
    $mvnCmd = $MAVEN_BIN
}

# ── Iniciar Spring Boot ──────────────────────────────────────
Write-Host ""
Write-Host "  Iniciando Spring Boot en http://localhost:8080" -ForegroundColor Cyan
Write-Host "  (Primera vez puede tardar 1-2 min descargando dependencias)" -ForegroundColor DarkGray
Write-Host ""

Set-Location $PSScriptRoot
& $mvnCmd spring-boot:run "-Dspring-boot.run.jvmArguments=-Xms256m -Xmx512m"
