# Configurar Variáveis de Ambiente na Vercel

## 🔧 Passo a Passo

### 1. Acessar Configurações do Projeto

1. Acesse https://vercel.com
2. Faça login na sua conta
3. Selecione o projeto `estoque-ferro-velho`
4. Vá em **Settings** → **Environment Variables**

### 2. Adicionar Variáveis de Ambiente

Adicione as seguintes variáveis:

#### Variável 1:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://znecdaeletrjsuxnpelta.supabase.co`
- **Environment:** Selecione todas (Production, Preview, Development)

#### Variável 2:
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZWNkYWVsZXRqc3V4bnBlbHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTA3NDcsImV4cCI6MjA3OTMyNjc0N30.dx1joPjFI0uYnvbhTFlQzrSlEsCDuPz91TTYjiZ0Z98`
- **Environment:** Selecione todas (Production, Preview, Development)

### 3. Fazer Redeploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**
4. Aguarde o deploy concluir

## ✅ Verificação

Após o redeploy, o sistema deve:
- ✅ Conectar ao Supabase automaticamente
- ✅ Buscar dados do banco de dados
- ✅ Não usar mais dados mock

## 📝 Nota

Se as variáveis não estiverem configuradas, o sistema continuará usando dados mock automaticamente.

