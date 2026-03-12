# ============================================================
# install-maven.ps1
# Descarga e instala Maven 3.9.9 en tu carpeta de usuario.
# NO requiere permisos de administrador.
# ============================================================

$MAVEN_VERSION = "3.9.9"
$INSTALL_DIR   = "$env:USERPROFILE\.maven"
$MAVEN_HOME    = "$INSTALL_DIR\apache-maven-$MAVEN_VERSION"
$MAVEN_BIN     = "$MAVEN_HOME\bin"
$DOWNLOAD_URL  = "https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip"
$ZIP_PATH      = "$env:TEMP\apache-maven-$MAVEN_VERSION-bin.zip"

Write-Host ""
Write-Host "================================================" -ForegroundColor Blue
Write-Host "  Instalando Apache Maven $MAVEN_VERSION" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Blue
Write-Host ""

# ── ¿Ya está instalado? ──────────────────────────────────────
if (Test-Path "$MAVEN_BIN\mvn.cmd") {
    Write-Host "  Maven ya está instalado en: $MAVEN_HOME" -ForegroundColor Green
    Write-Host "  Versión: " -NoNewline
    & "$MAVEN_BIN\mvn.cmd" --version 2>&1 | Select-Object -First 1
    Write-Host ""
    Write-Host "  Agregando al PATH de esta sesión..."
    $env:PATH = "$MAVEN_BIN;$env:PATH"
    $env:MAVEN_HOME = $MAVEN_HOME
    Write-Host "  Listo. Ya puedes usar 'mvn' en esta sesión." -ForegroundColor Green
    return
}

# ── Descargar ────────────────────────────────────────────────
Write-Host "  Descargando Maven desde Apache..." -ForegroundColor Yellow
Write-Host "  URL: $DOWNLOAD_URL" -ForegroundColor DarkGray
Write-Host ""

$ProgressPreference = 'SilentlyContinue'
try {
    Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $ZIP_PATH -UseBasicParsing
} catch {
    Write-Host "  ERROR al descargar: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Intenta manualmente:" -ForegroundColor Yellow
    Write-Host "  1. Descarga: $DOWNLOAD_URL"
    Write-Host "  2. Extrae en: $INSTALL_DIR"
    exit 1
}
$ProgressPreference = 'Continue'

Write-Host "  Descarga completa. Extrayendo..." -ForegroundColor Yellow

# ── Extraer ──────────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
Expand-Archive -Path $ZIP_PATH -DestinationPath $INSTALL_DIR -Force
Remove-Item $ZIP_PATH -Force -ErrorAction SilentlyContinue

Write-Host "  Extraído en: $MAVEN_HOME" -ForegroundColor Green
Write-Host ""

# ── Agregar al PATH del usuario (permanente) ─────────────────
Write-Host "  Configurando PATH permanente (usuario)..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$MAVEN_BIN*") {
    [Environment]::SetEnvironmentVariable("PATH", "$MAVEN_BIN;$currentPath", "User")
    [Environment]::SetEnvironmentVariable("MAVEN_HOME", $MAVEN_HOME, "User")
    Write-Host "  PATH actualizado permanentemente." -ForegroundColor Green
} else {
    Write-Host "  Ya estaba en PATH." -ForegroundColor Green
}

# ── Activar en la sesión actual ──────────────────────────────
$env:PATH       = "$MAVEN_BIN;$env:PATH"
$env:MAVEN_HOME = $MAVEN_HOME

# ── Verificar ────────────────────────────────────────────────
Write-Host ""
Write-Host "  Verificando instalación..." -ForegroundColor Yellow
$mvnVersion = & "$MAVEN_BIN\mvn.cmd" --version 2>&1 | Select-Object -First 1
Write-Host "  $mvnVersion" -ForegroundColor Cyan

Write-Host ""
Write-Host "================================================" -ForegroundColor Blue
Write-Host "  ✅ Maven instalado correctamente" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "  IMPORTANTE: Abre una nueva ventana de PowerShell" -ForegroundColor Yellow
Write-Host "  para que el PATH tenga efecto de forma permanente." -ForegroundColor Yellow
Write-Host ""
Write-Host "  O ejecuta este comando para usar Maven AHORA MISMO:" -ForegroundColor Cyan
Write-Host "  `$env:PATH = '$MAVEN_BIN;' + `$env:PATH" -ForegroundColor White
Write-Host ""
