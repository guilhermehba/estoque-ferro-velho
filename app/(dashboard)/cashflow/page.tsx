"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cashflowService, CashflowEntry } from "@/services/cashflow";
import { format } from "date-fns";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

export default function CashflowPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<CashflowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("");
  const [cashflowData, setCashflowData] = useState({
    salesMoney: 0,
    purchasesPix: 0,
    totalPurchases: 0,
    cashflow: 0,
  });

  useEffect(() => {
    loadData();
  }, [filterDate, filterPaymentType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterDate) filters.date = filterDate;
      if (filterPaymentType) filters.payment_type = filterPaymentType;

      const data = await cashflowService.getCashflow(filters);
      setEntries(data);

      const calc = await cashflowService.calculateCashflow(
        filterDate ? { date: filterDate } : undefined
      );
      setCashflowData(calc);
    } catch (error) {
      console.error("Erro ao carregar fluxo de caixa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o fluxo de caixa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Título
      doc.setFontSize(18);
      doc.text("Fluxo de Caixa", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Data do relatório
      doc.setFontSize(10);
      doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 15;

      // Resumo
      doc.setFontSize(12);
      doc.text("Resumo", 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.text(
        `Dinheiro que entrou no caixa: R$ ${cashflowData.salesMoney.toFixed(2)}`,
        14,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Compras pagas no Pix: R$ ${cashflowData.purchasesPix.toFixed(2)}`,
        14,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Total das compras: R$ ${cashflowData.totalPurchases.toFixed(2)}`,
        14,
        yPosition
      );
      yPosition += 6;
      doc.setFontSize(12);
      doc.text(
        `Saldo em Caixa: R$ ${cashflowData.cashflow.toFixed(2)}`,
        14,
        yPosition
      );
      yPosition += 15;

      // Tabela
      doc.setFontSize(12);
      doc.text("Movimentações", 14, yPosition);
      yPosition += 7;

      // Cabeçalho da tabela
      doc.setFontSize(9);
      doc.text("Data", 14, yPosition);
      doc.text("Tipo", 50, yPosition);
      doc.text("Descrição", 70, yPosition);
      doc.text("Valor", 160, yPosition);
      yPosition += 5;

      // Linha divisória
      doc.line(14, yPosition, pageWidth - 14, yPosition);
      yPosition += 5;

      // Entradas
      entries.forEach((entry) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(8);
        doc.text(
          format(new Date(entry.date), "dd/MM/yyyy"),
          14,
          yPosition
        );
        doc.text(entry.type === "entrada" ? "Entrada" : "Saída", 50, yPosition);
        doc.text(entry.description.substring(0, 30), 70, yPosition);
        doc.text(
          `R$ ${entry.value.toFixed(2)}`,
          160,
          yPosition,
          { align: "right" }
        );
        yPosition += 6;
      });

      // Salvar PDF
      doc.save(
        `fluxo-caixa-${format(new Date(), "yyyy-MM-dd")}.pdf`
      );

      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando fluxo de caixa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe entradas e saídas do caixa
          </p>
        </div>
        <Button onClick={exportToPDF}>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Dinheiro que Entrou
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {cashflowData.salesMoney.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Compras Pagas no Pix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {cashflowData.purchasesPix.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total das Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {cashflowData.totalPurchases.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {cashflowData.cashflow.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cálculo: Dinheiro que entrou + Compras pagas no Pix - Total das
              compras
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="filter-date">Filtrar por Data</Label>
          <Input
            id="filter-date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="filter-payment">Filtrar por Pagamento</Label>
          <Select
            value={filterPaymentType || undefined}
            onValueChange={(value) => setFilterPaymentType(value || "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="pix">Pix</SelectItem>
              <SelectItem value="credito">Crédito</SelectItem>
              <SelectItem value="debito">Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center gap-4">
                  {entry.type === "entrada" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{entry.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.date), "dd/MM/yyyy")}{" "}
                      • {entry.payment_type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      entry.type === "entrada"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {entry.type === "entrada" ? "+" : "-"}R${" "}
                    {entry.value.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {entries.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma movimentação encontrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

