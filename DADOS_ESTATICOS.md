# Sistema de Dados Estáticos para Desenvolvimento

## ✅ Implementado

O sistema agora funciona **completamente sem banco de dados** usando dados estáticos/mock para desenvolvimento e testes.

## 🎯 Como Funciona

### Modo Automático
O sistema detecta automaticamente se o Supabase está configurado:
- **Sem configuração** → Usa dados mock (modo desenvolvimento)
- **Com configuração** → Usa Supabase (modo produção)

### Dados Mock Incluídos

#### 📦 Estoque (4 itens)
- Ferro: 150.5 kg - R$ 2.50/kg
- Cobre: 85.3 kg - R$ 35.00/kg
- Alumínio: 200.0 kg - R$ 8.50/kg
- Bronze: 45.2 kg - R$ 28.00/kg

#### 🛒 Compras (3 compras)
- Compra de hoje (Dinheiro)
- Compra de ontem (Pix)
- Compra de 2 dias atrás (Crédito)

#### 💰 Vendas (2 vendas)
- Venda de hoje (Ferro - Dinheiro)
- Venda de ontem (Cobre - Pix)

## 🚀 Como Usar

### 1. Desenvolvimento Sem Banco de Dados

**Não precisa configurar nada!** Apenas execute:

```bash
npm run dev
```

O sistema usará automaticamente os dados mock.

### 2. Login de Teste

Use as credenciais:
- **Email:** teste@gmail.com
- **Senha:** 123

### 3. Funcionalidades Disponíveis

✅ Todas as funcionalidades funcionam com dados mock:
- ✅ Dashboard com KPIs
- ✅ Compras (criar, editar, excluir)
- ✅ Estoque (criar, editar, excluir)
- ✅ Vendas (criar, excluir)
- ✅ Fluxo de Caixa
- ✅ Configurações

### 4. Dados Persistem Durante a Sessão

Os dados mock são armazenados em memória durante a execução do servidor. Ao recarregar a página, os dados mock iniciais são restaurados.

## 🔄 Migrar para Supabase

Quando quiser conectar ao banco de dados real:

1. Configure o Supabase (veja `SUPABASE_SETUP.md`)
2. Crie o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

3. O sistema automaticamente detectará a configuração e usará o Supabase!

## 📝 Notas Importantes

- Os dados mock são **temporários** (perdidos ao reiniciar o servidor)
- Para dados persistentes, configure o Supabase
- O sistema funciona **100%** com dados mock para desenvolvimento
- Não há necessidade de banco de dados para começar a desenvolver

## 🎨 Personalizar Dados Mock

Edite o arquivo `services/mock-data.ts` para adicionar mais dados de teste.

