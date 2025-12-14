# Script para limpar processos e cache do Next.js
# Execute: .\limpar-nextjs.ps1

Write-Host "🔄 Limpando processos Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "🗑️  Removendo diretório .next..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Diretório .next removido" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Diretório .next não encontrado" -ForegroundColor Cyan
}

Write-Host "🗑️  Removendo node_modules/.cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ Cache removido" -ForegroundColor Green
}

Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host "🚀 Agora você pode executar: npm run dev" -ForegroundColor Cyan

