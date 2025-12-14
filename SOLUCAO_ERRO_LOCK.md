# Solução para Erro de Lock do Next.js

## ⚠️ Erro
```
Unable to acquire lock at .next\dev\lock, is another instance of next dev running?
```

## ✅ Solução Rápida

### Opção 1: Script Automático (Recomendado)
Execute o script PowerShell que criamos:
```powershell
.\limpar-nextjs.ps1
```

Depois execute:
```powershell
npm run dev
```

### Opção 2: Manual

#### Passo 1: Encerrar processos Node.js
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

#### Passo 2: Remover diretório .next
```powershell
Remove-Item -Recurse -Force .next
```

#### Passo 3: Reiniciar o servidor
```powershell
npm run dev
```

### Opção 3: Se a porta estiver ocupada

#### Verificar qual processo está usando a porta 3000:
```powershell
netstat -ano | findstr :3000
```

#### Encerrar processo específico (substitua PID pelo número do processo):
```powershell
taskkill /PID <PID> /F
```

## 🔍 Causa do Problema

Este erro acontece quando:
- Uma instância anterior do Next.js não foi encerrada corretamente
- O processo foi interrompido abruptamente (Ctrl+C múltiplas vezes)
- Há um arquivo de lock travado no diretório `.next`

## 💡 Prevenção

Sempre use `Ctrl+C` uma vez e aguarde o servidor encerrar antes de executar novamente.

## ✅ Verificação

Após executar a solução, você deve ver:
```
✓ Starting...
✓ Ready in X seconds
- Local: http://localhost:3000
```

Se ainda tiver problemas, execute o script de limpeza novamente.

