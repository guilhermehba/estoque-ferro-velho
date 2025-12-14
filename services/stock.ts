import { db } from "./supabase";
import {
  mockStockItems,
  isMockMode,
  mockDelay,
} from "./mock-data";

export interface StockItem {
  id?: string;
  name: string;
  total_weight: number;
  entry_count: number;
  average_price_per_kg: number;
  total_value: number;
  created_at?: string;
  updated_at?: string;
}

// Armazenamento mock em memória (será perdido ao recarregar)
let mockStockData = [...mockStockItems];

export const stockService = {
  async getAll() {
    if (isMockMode()) {
      await mockDelay();
      return [...mockStockData].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }
    return await db.select<StockItem>("stock", undefined, {
      column: "name",
      ascending: true,
    });
  },

  async getById(id: string) {
    if (isMockMode()) {
      await mockDelay();
      return mockStockData.find((item) => item.id === id) || null;
    }
    const items = await db.select<StockItem>("stock", [
      { column: "id", value: id },
    ]);
    return items[0];
  },

  async getByName(name: string) {
    if (isMockMode()) {
      await mockDelay();
      return mockStockData.find((item) => item.name === name) || null;
    }
    const items = await db.select<StockItem>("stock", [
      { column: "name", value: name },
    ]);
    return items[0];
  },

  async create(item: Omit<StockItem, "id" | "created_at" | "updated_at">) {
    if (isMockMode()) {
      await mockDelay();
      const newItem: StockItem = {
        ...item,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockStockData.push(newItem);
      return newItem;
    }
    const [created] = await db.insert<StockItem>("stock", item);
    return created;
  },

  async update(id: string, item: Partial<StockItem>) {
    if (isMockMode()) {
      await mockDelay();
      const index = mockStockData.findIndex((i) => i.id === id);
      if (index === -1) throw new Error("Item não encontrado");
      mockStockData[index] = {
        ...mockStockData[index],
        ...item,
        updated_at: new Date().toISOString(),
      };
      return mockStockData[index];
    }
    return await db.update<StockItem>("stock", id, {
      ...item,
      updated_at: new Date().toISOString(),
    });
  },

  async delete(id: string) {
    if (isMockMode()) {
      await mockDelay();
      mockStockData = mockStockData.filter((item) => item.id !== id);
      return;
    }
    await db.delete("stock", id);
  },

  async addToStock(name: string, weight: number, pricePerKg: number) {
    const existing = await this.getByName(name);

    if (existing) {
      // Atualizar item existente
      const newTotalWeight = existing.total_weight + weight;
      const newEntryCount = existing.entry_count + 1;
      const newTotalValue = existing.total_value + weight * pricePerKg;
      const newAveragePrice = newTotalValue / newTotalWeight;

      return await this.update(existing.id!, {
        total_weight: newTotalWeight,
        entry_count: newEntryCount,
        average_price_per_kg: newAveragePrice,
        total_value: newTotalValue,
      });
    } else {
      // Criar novo item
      return await this.create({
        name,
        total_weight: weight,
        entry_count: 1,
        average_price_per_kg: pricePerKg,
        total_value: weight * pricePerKg,
      });
    }
  },

  async removeFromStock(id: string, weight: number) {
    const item = await this.getById(id);
    if (!item) throw new Error("Item não encontrado");

    const newTotalWeight = item.total_weight - weight;
    if (newTotalWeight < 0) {
      throw new Error("Peso insuficiente no estoque");
    }

    const newTotalValue = item.total_value - (weight * item.average_price_per_kg);

    if (newTotalWeight === 0) {
      await this.delete(id);
      return null;
    }

    return await this.update(id, {
      total_weight: newTotalWeight,
      total_value: newTotalValue,
    });
  },
};

