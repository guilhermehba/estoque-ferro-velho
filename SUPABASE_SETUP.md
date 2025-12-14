# Configuração do Supabase

## Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name:** sistema-estoque
   - **Database Password:** (anote esta senha)
   - **Region:** escolha a mais próxima
5. Aguarde a criação do projeto (2-3 minutos)

### 2. Obter Credenciais

1. No projeto criado, vá em **Settings** > **API**
2. Copie:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Criar Tabelas

1. No menu lateral, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o SQL abaixo e execute:

```sql
-- Tabela de compras
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('dinheiro', 'pix', 'credito', 'debito')),
  total_weight DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens da compra
CREATE TABLE purchase_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL
);

-- Tabela de estoque
CREATE TABLE stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  total_weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
  entry_count INTEGER NOT NULL DEFAULT 0,
  average_price_per_kg DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('dinheiro', 'pix', 'credito', 'debito')),
  stock_item_id UUID REFERENCES stock(id),
  item_name TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para purchases
CREATE POLICY "Users can view purchases" ON purchases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert purchases" ON purchases FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update purchases" ON purchases FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete purchases" ON purchases FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para purchase_items
CREATE POLICY "Users can view purchase_items" ON purchase_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert purchase_items" ON purchase_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update purchase_items" ON purchase_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete purchase_items" ON purchase_items FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para stock
CREATE POLICY "Users can view stock" ON stock FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert stock" ON stock FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update stock" ON stock FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete stock" ON stock FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para sales
CREATE POLICY "Users can view sales" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert sales" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update sales" ON sales FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete sales" ON sales FOR DELETE USING (auth.role() = 'authenticated');
```

4. Clique em **Run** ou pressione `Ctrl+Enter`

### 4. Criar Usuário de Teste

1. No menu lateral, vá em **Authentication** > **Users**
2. Clique em **Add user** > **Create new user**
3. Preencha:
   - **Email:** teste@gmail.com
   - **Password:** 123
   - **Auto Confirm User:** ✅ (marque esta opção)
4. Clique em **Create user**

### 5. Configurar Variáveis de Ambiente

1. No projeto Next.js, crie o arquivo `.env.local` na raiz
2. Adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

3. Substitua pelos valores copiados no passo 2

### 6. Testar

1. Execute `npm run dev`
2. Acesse http://localhost:3000
3. Faça login com:
   - Email: teste@gmail.com
   - Senha: 123

## ✅ Pronto!

Seu sistema está configurado e pronto para uso!

