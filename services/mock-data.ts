// Dados estáticos para desenvolvimento e testes
// Estes dados serão usados quando o Supabase não estiver configurado

import { Purchase, PurchaseItem } from "./purchases";
import { StockItem } from "./stock";
import { Sale } from "./sales";

// Dados de estoque mock
export const mockStockItems: StockItem[] = [
  {
    id: "1",
    name: "Ferro",
    total_weight: 150.5,
    entry_count: 3,
    average_price_per_kg: 2.5,
    total_value: 376.25,
    created_at: new Date("2024-01-15").toISOString(),
    updated_at: new Date("2024-01-20").toISOString(),
  },
  {
    id: "2",
    name: "Cobre",
    total_weight: 85.3,
    entry_count: 2,
    average_price_per_kg: 35.0,
    total_value: 2985.5,
    created_at: new Date("2024-01-10").toISOString(),
    updated_at: new Date("2024-01-18").toISOString(),
  },
  {
    id: "3",
    name: "Alumínio",
    total_weight: 200.0,
    entry_count: 4,
    average_price_per_kg: 8.5,
    total_value: 1700.0,
    created_at: new Date("2024-01-05").toISOString(),
    updated_at: new Date("2024-01-22").toISOString(),
  },
  {
    id: "4",
    name: "Bronze",
    total_weight: 45.2,
    entry_count: 1,
    average_price_per_kg: 28.0,
    total_value: 1265.6,
    created_at: new Date("2024-01-12").toISOString(),
    updated_at: new Date("2024-01-12").toISOString(),
  },
];

// Dados de compras mock
export const mockPurchases: Purchase[] = [
  {
    id: "1",
    date: new Date().toISOString().split("T")[0],
    payment_type: "dinheiro",
    total_weight: 50.0,
    total_value: 125.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // ontem
    payment_type: "pix",
    total_weight: 75.5,
    total_value: 2642.5,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0], // 2 dias atrás
    payment_type: "credito",
    total_weight: 30.0,
    total_value: 255.0,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Dados de itens de compra mock
export const mockPurchaseItems: Record<string, PurchaseItem[]> = {
  "1": [
    {
      id: "1",
      purchase_id: "1",
      item_name: "Ferro",
      weight: 50.0,
      price_per_kg: 2.5,
      total_value: 125.0,
    },
  ],
  "2": [
    {
      id: "2",
      purchase_id: "2",
      item_name: "Cobre",
      weight: 75.5,
      price_per_kg: 35.0,
      total_value: 2642.5,
    },
  ],
  "3": [
    {
      id: "3",
      purchase_id: "3",
      item_name: "Alumínio",
      weight: 30.0,
      price_per_kg: 8.5,
      total_value: 255.0,
    },
  ],
};

// Dados de vendas mock
export const mockSales: Sale[] = [
  {
    id: "1",
    date: new Date().toISOString().split("T")[0],
    payment_type: "dinheiro",
    stock_item_id: "1",
    item_name: "Ferro",
    weight: 25.0,
    price_per_kg: 3.0,
    total_value: 75.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    payment_type: "pix",
    stock_item_id: "2",
    item_name: "Cobre",
    weight: 10.0,
    price_per_kg: 40.0,
    total_value: 400.0,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Função para verificar se está em modo mock
export const isMockMode = (): boolean => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    !supabaseUrl ||
    supabaseUrl === "YOUR_SUPABASE_URL" ||
    supabaseUrl === ""
  );
};

// Função para simular delay (como se fosse uma requisição real)
export const mockDelay = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

