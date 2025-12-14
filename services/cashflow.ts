import { purchasesService } from "./purchases";
import { salesService } from "./sales";

export interface CashflowEntry {
  id: string;
  date: string;
  type: "entrada" | "saida";
  description: string;
  value: number;
  payment_type: string;
}

export const cashflowService = {
  async getCashflow(filters?: { date?: string; payment_type?: string }) {
    const purchases = await purchasesService.getAll(filters);
    const sales = await salesService.getAll(filters);

    const entries: CashflowEntry[] = [];

    // Adicionar compras como saídas
    purchases.forEach((purchase) => {
      entries.push({
        id: `purchase-${purchase.id}`,
        date: purchase.date,
        type: "saida",
        description: `Compra - ${purchase.payment_type}`,
        value: purchase.total_value,
        payment_type: purchase.payment_type,
      });
    });

    // Adicionar vendas como entradas
    sales.forEach((sale) => {
      entries.push({
        id: `sale-${sale.id}`,
        date: sale.date,
        type: "entrada",
        description: `Venda - ${sale.item_name}`,
        value: sale.total_value,
        payment_type: sale.payment_type,
      });
    });

    // Ordenar por data
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return entries;
  },

  async calculateCashflow(filters?: { date?: string }) {
    const purchases = await purchasesService.getAll(filters);
    const sales = await salesService.getAll(filters);

    // Dinheiro que entrou no caixa
    const salesMoney = sales
      .filter((s) => s.payment_type === "dinheiro")
      .reduce((sum, s) => sum + s.total_value, 0);

    // Compras pagas no Pix
    const purchasesPix = purchases
      .filter((p) => p.payment_type === "pix")
      .reduce((sum, p) => sum + p.total_value, 0);

    // Total das compras
    const totalPurchases = purchases.reduce(
      (sum, p) => sum + p.total_value,
      0
    );

    // Cálculo: Dinheiro que entrou + Compras pagas no Pix - Total das compras
    const cashflow = salesMoney + purchasesPix - totalPurchases;

    return {
      salesMoney,
      purchasesPix,
      totalPurchases,
      cashflow,
    };
  },
};

