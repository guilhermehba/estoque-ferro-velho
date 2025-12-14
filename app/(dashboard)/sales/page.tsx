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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { salesService, Sale } from "@/services/sales";
import { stockService, StockItem } from "@/services/stock";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SalesPage() {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("");

  // Form state
  const [saleDate, setSaleDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedStockItem, setSelectedStockItem] = useState("");
  const [weight, setWeight] = useState(0);
  const [pricePerKg, setPricePerKg] = useState(0);
  const [paymentType, setPaymentType] = useState<
    "dinheiro" | "pix" | "credito" | "debito"
  >("dinheiro");

  useEffect(() => {
    loadData();
  }, [filterDate, filterPaymentType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterDate) filters.date = filterDate;
      if (filterPaymentType) filters.payment_type = filterPaymentType;

      const data = await salesService.getAll(filters);
      setSales(data);

      const stock = await stockService.getAll();
      setStockItems(stock);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockItemChange = (itemId: string) => {
    setSelectedStockItem(itemId);
    const item = stockItems.find((i) => i.id === itemId);
    if (item) {
      setPricePerKg(item.average_price_per_kg);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedStockItem || weight <= 0) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos corretamente",
          variant: "destructive",
        });
        return;
      }

      const selectedItem = stockItems.find((i) => i.id === selectedStockItem);
      if (!selectedItem) {
        toast({
          title: "Erro",
          description: "Item não encontrado",
          variant: "destructive",
        });
        return;
      }

      if (weight > selectedItem.total_weight) {
        toast({
          title: "Erro",
          description: "Peso insuficiente no estoque",
          variant: "destructive",
        });
        return;
      }

      await salesService.create({
        date: saleDate,
        payment_type: paymentType,
        stock_item_id: selectedStockItem,
        item_name: selectedItem.name,
        weight,
        price_per_kg: pricePerKg,
        total_value: weight * pricePerKg,
      });

      toast({
        title: "Sucesso",
        description: "Venda registrada com sucesso!",
      });

      // Reset form
      setSelectedStockItem("");
      setWeight(0);
      setPricePerKg(0);
      setSaleDate(format(new Date(), "yyyy-MM-dd"));
      setPaymentType("dinheiro");
      setOpenDialog(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a venda",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) return;

    try {
      await salesService.delete(id);
      toast({
        title: "Sucesso",
        description: "Venda excluída com sucesso!",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a venda",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-muted-foreground mt-2">
            Registre e gerencie as vendas
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Venda</DialogTitle>
              <DialogDescription>
                Selecione o item do estoque e informe a quantidade vendida
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-item">Item do Estoque</Label>
                <Select
                  value={selectedStockItem}
                  onValueChange={handleStockItemChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um item" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockItems
                      .filter((item) => item.total_weight > 0)
                      .map((item) => (
                        <SelectItem key={item.id} value={item.id!}>
                          {item.name} - {item.total_weight.toFixed(2)} kg
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso Vendido (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={weight || ""}
                  onChange={(e) =>
                    setWeight(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço por kg (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricePerKg || ""}
                  onChange={(e) =>
                    setPricePerKg(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment">Tipo de Pagamento</Label>
                <Select
                  value={paymentType}
                  onValueChange={(value: any) => setPaymentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor Total</Label>
                <Input
                  value={`R$ ${(weight * pricePerKg).toFixed(2)}`}
                  disabled
                  className="font-semibold"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>Confirmar Venda</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sales.map((sale) => (
          <Card key={sale.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(new Date(sale.date), "dd/MM/yyyy")}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => sale.id && handleDelete(sale.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Item</p>
                <p className="font-medium">{sale.item_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="font-medium">{sale.weight.toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Pagamento</p>
                <p className="font-medium capitalize">{sale.payment_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {sale.total_value.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sales.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma venda encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

