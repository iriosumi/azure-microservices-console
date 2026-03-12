# ============================================================
# start.ps1 — Inicia el frontend Vue
# Uso: cd frontend && powershell -ExecutionPolicy Bypass -File start.ps1
# ============================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Blue
Write-Host "  Azure Microservices Console — Frontend Vue" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Blue

Set-Location $PSScriptRoot

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "  Instalando dependencias npm..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "  Iniciando Vue en http://localhost:5173" -ForegroundColor Cyan
Write-Host "  (Las peticiones /api se redirigen al backend :8080)" -ForegroundColor DarkGray
Write-Host ""

npm run dev
