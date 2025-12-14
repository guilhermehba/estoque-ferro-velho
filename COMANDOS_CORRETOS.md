# Comandos Corretos para Executar o Projeto

## ⚠️ Erro Comum

**ERRADO:**
```bash
npx run next dev
```

**CORRETO:**
```bash
npm run dev
```

## 📋 Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor de desenvolvimento em http://localhost:3000

### Build para Produção
```bash
npm run build
```
Compila o projeto para produção

### Executar Build de Produção
```bash
npm start
```
Executa a versão compilada (após `npm run build`)

### Lint
```bash
npm run lint
```
Verifica erros de código

## 🔧 Se o Next.js Não Estiver Instalado

Se receber erro "Cannot find module 'next'", execute:

```bash
npm install --legacy-peer-deps
```

## ✅ Verificação

Após executar `npm run dev`, você deve ver:

```
✓ Ready in X seconds
- Local: http://localhost:3000
```

## 🎯 Dados Estáticos

O sistema funciona **sem banco de dados** usando dados mock. Veja `DADOS_ESTATICOS.md` para mais informações.

