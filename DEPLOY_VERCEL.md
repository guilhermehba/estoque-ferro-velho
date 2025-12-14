# Deploy na Vercel - Guia Completo

## ✅ Pré-requisitos

1. Conta na Vercel (gratuita): https://vercel.com
2. Projeto no GitHub/GitLab/Bitbucket (opcional, mas recomendado)
3. Variáveis de ambiente do Supabase (se quiser usar banco de dados)

## 🚀 Método 1: Deploy via CLI (Recomendado)

### Passo 1: Instalar Vercel CLI
```bash
npm i -g vercel
```

### Passo 2: Login na Vercel
```bash
vercel login
```

### Passo 3: Deploy
```bash
vercel
```

Siga as instruções:
- **Set up and deploy?** → Y
- **Which scope?** → Seu usuário ou organização
- **Link to existing project?** → N (primeira vez)
- **What's your project's name?** → estoque-ferro-velho
- **In which directory is your code located?** → ./

### Passo 4: Deploy de Produção
```bash
vercel --prod
```

## 🌐 Método 2: Deploy via Dashboard Vercel

### Passo 1: Acesse Vercel
1. Acesse https://vercel.com
2. Faça login com GitHub/GitLab/Bitbucket

### Passo 2: Importar Projeto
1. Clique em **"Add New..."** → **"Project"**
2. Importe seu repositório Git ou faça upload do projeto
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next
   - **Install Command:** `npm install --legacy-peer-deps`

### Passo 3: Variáveis de Ambiente (Opcional)
Se quiser usar Supabase, adicione:
- `NEXT_PUBLIC_SUPABASE_URL` → Sua URL do Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Sua chave anônima

### Passo 4: Deploy
Clique em **"Deploy"**

## 📝 Notas Importantes

### ✅ O projeto funciona sem Supabase
- O sistema usa dados mock automaticamente
- Não é necessário configurar Supabase para testar

### 🔧 Configurações Automáticas
- O arquivo `vercel.json` já está configurado
- Build command: `npm run build`
- Install command: `npm install --legacy-peer-deps`

### 🌍 Região
- Configurado para região `gru1` (São Paulo, Brasil)
- Pode ser alterado no `vercel.json`

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:
1. ✅ Site está acessível
2. ✅ Login funciona (teste@gmail.com / 123)
3. ✅ Todas as páginas carregam
4. ✅ Dados mock estão funcionando

## 🐛 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Execute `npm run build` localmente primeiro

### Erro de Variáveis de Ambiente
- Se não usar Supabase, não precisa configurar nada
- O sistema detecta automaticamente e usa dados mock

### Erro de TypeScript
- Execute `npm run build` localmente para ver erros
- Corrija antes de fazer deploy

## 📚 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variáveis de Ambiente](https://vercel.com/docs/concepts/projects/environment-variables)

