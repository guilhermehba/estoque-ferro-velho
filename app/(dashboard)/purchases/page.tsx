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
import { purchasesService, Purchase, PurchaseItem } from "@/services/purchases";
import { stockService, StockItem } from "@/services/stock";
import { format } from "date-fns";
import { Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PurchasesPage() {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("");

  // Form state
  const [purchaseDate, setPurchaseDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [paymentType, setPaymentType] = useState<
    "dinheiro" | "pix" | "credito" | "debito"
  >("dinheiro");
  const [items, setItems] = useState<
    Array<{
      item_name: string;
      weight: number;
      price_per_kg: number;
      total_value: number;
    }>
  >([{ item_name: "", weight: 0, price_per_kg: 0, total_value: 0 }]);

  useEffect(() => {
    loadData();
  }, [filterDate, filterPaymentType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterDate) filters.date = filterDate;
      if (filterPaymentType) filters.payment_type = filterPaymentType;

      const data = await purchasesService.getAll(filters);
      setPurchases(data);

      const stock = await stockService.getAll();
      setStockItems(stock);
    } catch (error) {
      console.error("Erro ao carregar compras:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as compras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { item_name: "", weight: 0, price_per_kg: 0, total_value: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === "weight" || field === "price_per_kg") {
      newItems[index].total_value =
        newItems[index].weight * newItems[index].price_per_kg;
    }

    setItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      // Validar itens
      const validItems = items.filter(
        (item) => item.item_name && item.weight > 0 && item.price_per_kg > 0
      );

      if (validItems.length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um item válido",
          variant: "destructive",
        });
        return;
      }

      const totalWeight = validItems.reduce(
        (sum, item) => sum + item.weight,
        0
      );
      const totalValue = validItems.reduce(
        (sum, item) => sum + item.total_value,
        0
      );

      // Criar compra
      const purchase = await purchasesService.create(
        {
          date: purchaseDate,
          payment_type: paymentType,
          total_weight: totalWeight,
          total_value: totalValue,
        },
        validItems
      );

      // Adicionar itens ao estoque
      for (const item of validItems) {
        await stockService.addToStock(
          item.item_name,
          item.weight,
          item.price_per_kg
        );
      }

      toast({
        title: "Sucesso",
        description: "Compra registrada com sucesso!",
      });

      // Reset form
      setItems([{ item_name: "", weight: 0, price_per_kg: 0, total_value: 0 }]);
      setPurchaseDate(format(new Date(), "yyyy-MM-dd"));
      setPaymentType("dinheiro");
      setOpenDialog(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a compra",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta compra?")) return;

    try {
      await purchasesService.delete(id);
      toast({
        title: "Sucesso",
        description: "Compra excluída com sucesso!",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a compra",
        variant: "destructive",
      });
    }
  };

  const getTotalDay = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return purchases
      .filter((p) => p.date === today)
      .reduce((sum, p) => sum + p.total_value, 0);
  };

  const getItemSuggestions = (input: string) => {
    if (!input) return [];
    return stockItems
      .filter((item) =>
        item.name.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as compras de materiais
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Compra</DialogTitle>
              <DialogDescription>
                Adicione os itens da compra e confirme para atualizar o estoque
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
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
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Itens da Compra</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                              <Label>Nome do Item</Label>
                              <Input
                                placeholder="Ex: Ferro, Cobre, Alumínio..."
                                value={item.item_name}
                                onChange={(e) => {
                                  updateItem(index, "item_name", e.target.value);
                                }}
                                list={`suggestions-${index}`}
                              />
                              <datalist id={`suggestions-${index}`}>
                                {getItemSuggestions(item.item_name).map(
                                  (suggestion) => (
                                    <option
                                      key={suggestion.id}
                                      value={suggestion.name}
                                    />
                                  )
                                )}
                              </datalist>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Peso (kg)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.weight || ""}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "weight",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Preço por kg (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.price_per_kg || ""}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "price_per_kg",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Valor Total</Label>
                              <Input
                                value={`R$ ${(item.total_value || 0).toFixed(2)}`}
                                disabled
                                className="font-semibold"
                              />
                            </div>
                          </div>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="ml-4"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>Confirmar Compra</Button>
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

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="font-semibold text-blue-900">
          Total das Compras de Hoje: R$ {(getTotalDay() || 0).toFixed(2)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(new Date(purchase.date), "dd/MM/yyyy")}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => purchase.id && handleDelete(purchase.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Pagamento</p>
                <p className="font-medium capitalize">{purchase.payment_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Total</p>
                <p className="font-medium">{(purchase.total_weight || 0).toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {(purchase.total_value || 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {purchases.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma compra encontrada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

