"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { stockService, StockItem } from "@/services/stock";
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StockPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [totalWeight, setTotalWeight] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getAll();
      setItems(data);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o estoque",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: StockItem) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setTotalWeight(item.total_weight);
      setAveragePrice(item.average_price_per_kg);
    } else {
      setEditingItem(null);
      setName("");
      setTotalWeight(0);
      setAveragePrice(0);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setName("");
    setTotalWeight(0);
    setAveragePrice(0);
  };

  const handleSubmit = async () => {
    try {
      if (!name || totalWeight <= 0 || averagePrice <= 0) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos corretamente",
          variant: "destructive",
        });
        return;
      }

      if (editingItem && editingItem.id) {
        await stockService.update(editingItem.id, {
          name,
          total_weight: totalWeight,
          average_price_per_kg: averagePrice,
          total_value: totalWeight * averagePrice,
        });
        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso!",
        });
      } else {
        await stockService.create({
          name,
          total_weight: totalWeight,
          entry_count: 1,
          average_price_per_kg: averagePrice,
          total_value: totalWeight * averagePrice,
        });
        toast({
          title: "Sucesso",
          description: "Item adicionado ao estoque!",
        });
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      await stockService.delete(id);
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso!",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os itens em estoque
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Item" : "Novo Item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Atualize as informações do item"
                  : "Adicione um novo item ao estoque"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Item</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ferro, Cobre, Alumínio..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso Total (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalWeight || ""}
                  onChange={(e) =>
                    setTotalWeight(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço Médio por kg (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={averagePrice || ""}
                  onChange={(e) =>
                    setAveragePrice(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Total</Label>
                <Input
                  value={`R$ ${(totalWeight * averagePrice).toFixed(2)}`}
                  disabled
                  className="font-semibold"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingItem ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => item.id && handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Peso Total</p>
                <p className="font-medium">{item.total_weight.toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Quantidade de Entradas
                </p>
                <p className="font-medium">{item.entry_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Preço Médio por kg
                </p>
                <p className="font-medium">
                  R$ {item.average_price_per_kg.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {item.total_value.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum item em estoque</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

