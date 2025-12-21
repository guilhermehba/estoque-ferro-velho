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

    const filtersArray = [];
    if (filters?.date) {
      filtersArray.push({ column: "date", value: filters.date });
    }
    if (filters?.payment_type) {
      filtersArray.push({
        column: "payment_type",
        value: filters.payment_type,
      });
    }

    return db.select<Purchase>(
      "purchases",
      filtersArray.length > 0 ? filtersArray : undefined,
      { column: "date", ascending: false }
    );
  },

  async getById(id: string) {
    if (isMockMode()) {
      await mockDelay();
      return mockPurchasesData.find((p) => p.id === id) || null;
    }

    const purchases = await db.select<Purchase>("purchases", [
      { column: "id", value: id },
    ]);
    return purchases[0];
  },

  async getItems(purchaseId: string) {
    if (isMockMode()) {
      await mockDelay();
      return mockPurchaseItemsData[purchaseId] || [];
    }

    return db.select<PurchaseItem>("purchase_items", [
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
        id: `mock-purchase-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      mockPurchasesData.push(newPurchase);

      const itemsWithPurchaseId: PurchaseItem[] = items.map((item, index) => ({
        id: `mock-item-${Date.now()}-${index}`,
        purchase_id: newPurchase.id,
        item_name: item.item_name,
        weight: item.weight,
        price_per_kg: item.price_per_kg,
        total_value: item.total_value,
      }));

      mockPurchaseItemsData[newPurchase.id!] = itemsWithPurchaseId;

      return newPurchase;
    }

    // =========================
    // PRODUÇÃO (SUPABASE)
    // =========================

    // 1️⃣ Criar a compra (ENVIANDO total_value)
    const [createdPurchase] = await db.insert<Purchase>("purchases", {
      date: purchase.date,
      payment_type: purchase.payment_type,
      total_weight: purchase.total_weight,
      total_value: purchase.total_value,
    });

    if (!createdPurchase?.id) {
      throw new Error("Falha ao criar a compra");
    }

    // 2️⃣ Criar os itens da compra
    const itemsPayload: PurchaseItem[] = items.map((item) => ({
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
      await mockDelay();
      mockPurchasesData = mockPurchasesData.filter((p) => p.id !== id);
      delete mockPurchaseItemsData[id];
      return;
    }

    const items = await this.getItems(id);
    for (const item of items) {
      if (item.id) {
        await db.delete("purchase_items", item.id);
      }
    }

    await db.delete("purchases", id);
  },
};
