-- Script SQL para atualizar o banco de dados Supabase
-- Execute este script no SQL Editor do Supabase se necessário

-- Verificar se as tabelas existem e criar se não existirem
-- (Este script é idempotente - pode ser executado múltiplas vezes)

-- Tabela de compras
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('dinheiro', 'pix', 'credito', 'debito')),
  total_weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens da compra
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_per_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Tabela de estoque
CREATE TABLE IF NOT EXISTS stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  total_weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
  entry_count INTEGER NOT NULL DEFAULT 0,
  average_price_per_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('dinheiro', 'pix', 'credito', 'debito')),
  stock_item_id UUID REFERENCES stock(id),
  item_name TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_per_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem (para recriar)
DROP POLICY IF EXISTS "Users can view purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert purchases" ON purchases;
DROP POLICY IF EXISTS "Users can update purchases" ON purchases;
DROP POLICY IF EXISTS "Users can delete purchases" ON purchases;

DROP POLICY IF EXISTS "Users can view purchase_items" ON purchase_items;
DROP POLICY IF EXISTS "Users can insert purchase_items" ON purchase_items;
DROP POLICY IF EXISTS "Users can update purchase_items" ON purchase_items;
DROP POLICY IF EXISTS "Users can delete purchase_items" ON purchase_items;

DROP POLICY IF EXISTS "Users can view stock" ON stock;
DROP POLICY IF EXISTS "Users can insert stock" ON stock;
DROP POLICY IF EXISTS "Users can update stock" ON stock;
DROP POLICY IF EXISTS "Users can delete stock" ON stock;

DROP POLICY IF EXISTS "Users can view sales" ON sales;
DROP POLICY IF EXISTS "Users can insert sales" ON sales;
DROP POLICY IF EXISTS "Users can update sales" ON sales;
DROP POLICY IF EXISTS "Users can delete sales" ON sales;

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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_type ON purchases(payment_type);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_payment_type ON sales(payment_type);
CREATE INDEX IF NOT EXISTS idx_stock_name ON stock(name);

