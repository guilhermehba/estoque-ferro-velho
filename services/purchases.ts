import { db } from "./supabase";
import {
  mockPurchases,
  mockPurchaseItems,
  isMockMode,
  mockDelay,
} from "./mock-data";

export interface PurchaseItem {
  id?: string;
  purchase_id?: string;
  item_name: string;
  weight: number;
  price_per_kg: number;
  total_value: number;
}

export interface Purchase {
  id?: string;
  date: string;
  payment_type: "dinheiro" | "pix" | "credito" | "debito";
  total_weight: number;
  total_value: number;
  created_at?: string;
  user_id?: string;
}

// =========================
// MOCK EM MEMÓRIA
// =========================
let mockPurchasesData = [...mockPurchases];
let mockPurchaseItemsData: Record<string, PurchaseItem[]> = {
  ...mockPurchaseItems,
};

export const purchasesService = {
  async getAll(filters?: { date?: string; payment_type?: string }) {
    if (isMockMode()) {
      await mockDelay();
      let filtered = [...mockPurchasesData];

      if (filters?.date) {
        filtered = filtered.filter((p) => p.date === filters.date);
      }
      if (filters?.payment_type) {
        filtered = filtered.filter(
          (p) => p.payment_type === filters.payment_type
        );
      }

      return filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return await db.select<Purchase>("purchases");
  },

  async getItems(purchaseId: string) {
    if (isMockMode()) {
      await mockDelay();
      return mockPurchaseItemsData[purchaseId] || [];
    }

    return await db.select<PurchaseItem>("purchase_items", [
      { column: "purchase_id", value: purchaseId },
    ]);
  },

  async create(
    purchase: Omit<Purchase, "id" | "created_at">,
    items: Omit<PurchaseItem, "id" | "purchase_id">[]
  ) {
    // =========================
    // MOCK MODE
    // =========================
    if (isMockMode()) {
      await mockDelay();

      const newPurchase: Purchase = {
        ...purchase,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      mockPurchasesData.push(newPurchase);

      mockPurchaseItemsData[newPurchase.id!] = items.map((item, i) => ({
        ...item,
        id: `mock-item-${i}`,
        purchase_id: newPurchase.id,
      }));

      return newPurchase;
    }

    // =========================
    // PRODUÇÃO
    // =========================

    const [createdPurchase] = await db.insert<Purchase>("purchases", {
      date: purchase.date,
      payment_type: purchase.payment_type,
      total_weight: purchase.total_weight,
      total_value: purchase.total_value,
    });

    const itemsPayload = items.map((item) => ({
      purchase_id: createdPurchase.id,
      item_name: item.item_name,
      weight: item.weight,
      price_per_kg: item.price_per_kg,
      total_value: item.total_value,
    }));

    await db.insert("purchase_items", itemsPayload);

    return createdPurchase;
  },

  async delete(id: string) {
    if (isMockMode()) {
      mockPurchasesData = mockPurchasesData.filter((p) => p.id !== id);
      delete mockPurchaseItemsData[id];
      return;
    }

    await db.delete("purchase_items", { purchase_id: id });
    await db.delete("purchases", id);
  },
};
