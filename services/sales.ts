import { db } from "./supabase";
import { stockService } from "./stock";
import { mockSales, isMockMode, mockDelay } from "./mock-data";

export interface Sale {
  id?: string;
  date: string;
  payment_type: "dinheiro" | "pix" | "credito" | "debito";
  stock_item_id: string;
  item_name: string;
  weight: number;
  price_per_kg: number;
  total_value: number;
  created_at?: string;
  user_id?: string;
}

// Armazenamento mock em memória
let mockSalesData = [...mockSales];

export const salesService = {
  async getAll(filters?: { date?: string; payment_type?: string }) {
    if (isMockMode()) {
      await mockDelay();
      let filtered = [...mockSalesData];

      if (filters?.date) {
        filtered = filtered.filter((s) => s.date === filters.date);
      }
      if (filters?.payment_type) {
        filtered = filtered.filter((s) => s.payment_type === filters.payment_type);
      }

      return filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    const filtersArray = [];
    if (filters?.date) {
      filtersArray.push({ column: "date", value: filters.date });
    }
    if (filters?.payment_type) {
      filtersArray.push({ column: "payment_type", value: filters.payment_type });
    }

    return await db.select<Sale>(
      "sales",
      filtersArray.length > 0 ? filtersArray : undefined,
      { column: "date", ascending: false }
    );
  },

  async getById(id: string) {
    if (isMockMode()) {
      await mockDelay();
      return mockSalesData.find((s) => s.id === id) || null;
    }
    const sales = await db.select<Sale>("sales", [
      { column: "id", value: id },
    ]);
    return sales[0];
  },

  async create(sale: Omit<Sale, "id" | "created_at">) {
    if (isMockMode()) {
      await mockDelay();
      // Remover do estoque mock
      await stockService.removeFromStock(sale.stock_item_id, sale.weight);

      const newSale: Sale = {
        ...sale,
        id: `mock-sale-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      mockSalesData.push(newSale);
      return newSale;
    }

    // Remover do estoque
    await stockService.removeFromStock(sale.stock_item_id, sale.weight);

    // Criar venda
    const [created] = await db.insert<Sale>("sales", sale);
    return created;
  },

  async delete(id: string) {
    if (isMockMode()) {
      await mockDelay();
      const sale = await this.getById(id);
      if (!sale) throw new Error("Venda não encontrada");

      // Reverter no estoque (adicionar de volta)
      await stockService.addToStock(
        sale.item_name,
        sale.weight,
        sale.price_per_kg
      );

      mockSalesData = mockSalesData.filter((s) => s.id !== id);
      return;
    }

    const sale = await this.getById(id);
    if (!sale) throw new Error("Venda não encontrada");

    // Reverter no estoque (adicionar de volta)
    await stockService.addToStock(
      sale.item_name,
      sale.weight,
      sale.price_per_kg
    );

    // Deletar venda
    await db.delete("sales", id);
  },
};

