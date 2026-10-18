# ACPR Local LLM Docker Launcher
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   ACPR Local LLM & Docker Environment Setup   " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Check if Docker is running
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop and rerun this script." -ForegroundColor Red
    Exit 1
}

Write-Host "[1/3] Starting Ollama & ACPR via Docker Compose..." -ForegroundColor Green
docker compose up -d

Write-Host "[2/3] Pulling recommended LLM model: qwen2.5:7b-instruct..." -ForegroundColor Yellow
Write-Host "(This might take a few minutes depending on your internet connection)..." -ForegroundColor DarkGray
docker exec -it acpr-ollama ollama pull qwen2.5:7b-instruct

Write-Host "[3/3] Checking LLM API health..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/v1/models" -Method Get
    Write-Host "[SUCCESS] Local LLM is ONLINE!" -ForegroundColor Green
    Write-Host "Available models: $($response.data.id -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "[WARNING] Could not connect to http://localhost:11434 yet. Container might still be warming up." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ACPR is ready at: http://localhost:3333" -ForegroundColor Green
Write-Host "  Local LLM API is at: http://localhost:11434/v1" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
