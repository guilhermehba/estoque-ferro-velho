"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/cards/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { stockService, StockItem } from "@/services/stock";
import { salesService, Sale } from "@/services/sales";
import { cashflowService } from "@/services/cashflow";
import { purchasesService, Purchase } from "@/services/purchases";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totalStock, setTotalStock] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [cashflow, setCashflow] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Total em estoque
      const stockItems = await stockService.getAll();
      const totalStockValue = stockItems.reduce(
        (sum, item) => sum + item.total_value,
        0
      );
      setTotalStock(totalStockValue);

      // Vendas do mês
      const currentMonth = format(new Date(), "yyyy-MM");
      const sales = await salesService.getAll({ date: currentMonth });
      const monthlySalesValue = sales.reduce(
        (sum, sale) => sum + sale.total_value,
        0
      );
      setMonthlySales(monthlySalesValue);

      // Fluxo de caixa
      const cashflowData = await cashflowService.calculateCashflow();
      setCashflow(cashflowData.cashflow);

      // Compras recentes
      const purchases = await purchasesService.getAll();
      setRecentPurchases(purchases.slice(0, 5));

      // Dados do gráfico (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return format(date, "yyyy-MM-dd");
      }).reverse();

      const salesByDay = await Promise.all(
        last7Days.map(async (date) => {
          const daySales = await salesService.getAll({ date });
          return daySales.reduce((sum, s) => sum + s.total_value, 0);
        })
      );

      setChartData({
        labels: last7Days.map((d) => format(new Date(d), "dd/MM")),
        datasets: [
          {
            label: "Vendas (R$)",
            data: salesByDay,
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema de estoque
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total em Estoque"
          value={`R$ ${totalStock.toFixed(2)}`}
          icon={Package}
          description="Valor total dos itens em estoque"
        />
        <KPICard
          title="Vendas do Mês"
          value={`R$ ${monthlySales.toFixed(2)}`}
          icon={TrendingUp}
          description="Total vendido este mês"
        />
        <KPICard
          title="Fluxo de Caixa"
          value={`R$ ${cashflow.toFixed(2)}`}
          icon={DollarSign}
          description="Saldo atual em caixa"
        />
        <KPICard
          title="Compras Recentes"
          value={recentPurchases.length.toString()}
          icon={ShoppingCart}
          description="Últimas 5 compras"
        />
      </div>

      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compras Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPurchases.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma compra recente</p>
          ) : (
            <div className="space-y-2">
              {recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(purchase.date), "dd/MM/yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {purchase.payment_type}
                    </p>
                  </div>
                  <p className="font-semibold">
                    R$ {purchase.total_value.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

