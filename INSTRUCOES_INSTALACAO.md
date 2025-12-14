# Instruções de Instalação e Execução

## ✅ Problemas Resolvidos

### 1. Erro de Dependências (npm install)
**Problema:** `lucide-react` versão antiga não compatível com React 19

**Solução:** Atualizado para `lucide-react@^0.468.0` e instalado com `--legacy-peer-deps`

### 2. Erro ao Executar (npm run dev)
**Problema:** Tentando executar arquivo "dev" ao invés do script

**Solução:** Verificar se está usando o comando correto

## 📦 Instalação

```bash
npm install --legacy-peer-deps
```

**Importante:** Use `--legacy-peer-deps` para evitar conflitos de dependências.

## 🚀 Executar o Projeto

**COMANDO CORRETO:**
```bash
npm run dev
```

**NÃO USE:**
- ❌ `npm dev` (incorreto)
- ❌ `node dev` (incorreto)
- ✅ `npm run dev` (correto)

## 🔧 Se Ainda Tiver Problemas

### Limpar cache e reinstalar:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### No Windows PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install --legacy-peer-deps
```

## 📝 Próximos Passos

1. Configure o Supabase (veja SUPABASE_SETUP.md)
2. Crie o arquivo `.env.local` com suas credenciais
3. Execute `npm run dev`
4. Acesse http://localhost:3000

