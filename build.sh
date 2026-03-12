#!/bin/bash
# ============================================================
# build.sh — Construye el POC completo para Azure App Service
# Uso: bash build.sh
# ============================================================
set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Azure Microservices Console — Build Script         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# 1. Build frontend Vue
echo "▶  [1/3] Instalando dependencias del frontend Vue..."
cd frontend
npm install

echo "▶  [2/3] Compilando Vue → backend/src/main/resources/static/"
npm run build

# 2. Build backend Spring Boot
echo "▶  [3/3] Compilando Spring Boot (fat JAR)..."
cd ../backend
mvn clean package -DskipTests

echo ""
echo "✅ Build completado."
echo ""
echo "📦 Artefacto listo para Azure:"
echo "   backend/target/microservices-console-1.0.0.jar"
echo ""
echo "🚀 Para desplegar en Azure App Service:"
echo "   az webapp deploy \\"
echo "     --resource-group <MI-RESOURCE-GROUP> \\"
echo "     --name <MI-APP-SERVICE-NAME> \\"
echo "     --src-path backend/target/microservices-console-1.0.0.jar \\"
echo "     --type jar"
echo ""
