"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BudgetItemInput, BudgetItemsForm } from "../components/budgtes-items";
import RemoteSelectField from "@/components/RecordForm/RemoteSelectField";

export default function NewBudgetPage() {
  const sb = createBrowserClient();
  const router = useRouter();

  // cabeçalho
  const [isClient, setIsClient] = useState(true); // true = cliente, false = fornecedor
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState<
    "draft" | "sent" | "accepted" | "refused" | "expired"
  >("draft");
  const [notes, setNotes] = useState("");

  // itens
  const [items, setItems] = useState<BudgetItemInput[]>([]);
  const total = items.reduce(
    (acc, it) => acc + it.quantity * it.unit_price,
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const selectedId = formData.get("party_id") as string | null;

      if (!selectedId) {
        toast.error("Selecione um cliente ou fornecedor.");
        return;
      }

      const { data: budget, error } = await sb
        .from("budgets")
        .insert({
          client_id: isClient ? selectedId : null,
          supplier_id: !isClient ? selectedId : null,
          valid_until: validUntil || null,
          status,
          notes,
        })
        .select("id")
        .single();

      if (error) throw error;

      if (items.length > 0) {
        const payloadItems = items.map((it) => ({
          budget_id: budget.id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          billing_type: it.billing_type, // 👈 novo campo
        }));
        const { error: errItems } = await sb
          .from("budget_items")
          .insert(payloadItems);
        if (errItems) throw errItems;
      }

      toast.success("Orçamento criado com sucesso!");
      router.push("/dashboard/finance/budgets");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar o orçamento.");
    }
  }

  return (
    <form className="flex-1 p-6 space-y-8" onSubmit={handleSubmit}>
      {/* header */}
      <div>
        <h1 className="text-2xl font-bold">Novo Orçamento</h1>
        <p className="text-muted-foreground">
          Preencha os dados principais e adicione os itens.
        </p>
      </div>

      {/* toggle cliente/fornecedor */}
      <div className="flex items-center gap-4">
        <span className={!isClient ? "text-muted-foreground" : "font-medium"}>
          Cliente
        </span>
        <Switch
          checked={!isClient}
          onCheckedChange={(val) => {
            setIsClient(!val);
          }}
        />
        <span className={isClient ? "text-muted-foreground" : "font-medium"}>
          Fornecedor
        </span>
      </div>

      {/* remote select usando seu componente */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {isClient ? "Cliente" : "Fornecedor"}
        </label>
        <RemoteSelectField
          name="party_id" // 👈 hidden input que usamos no handleSubmit
          placeholder={`Selecione o ${isClient ? "cliente" : "fornecedor"}`}
          source={{
            table: isClient ? "clients" : "suppliers",
            valueKey: "id",
            labelKey: "name",
            searchKeys: ["name", "document"], // busca por nome ou documento
            pageSize: 15,
          }}
        />
      </div>

      {/* validade + status + notas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Validade</label>
          <Input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border rounded-md p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="draft">Rascunho</option>
            <option value="sent">Enviado</option>
            <option value="accepted">Aceito</option>
            <option value="refused">Recusado</option>
            <option value="expired">Expirado</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Observações</label>
          <Textarea
            placeholder="Condições, prazos, etc..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* itens */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Itens do Orçamento</h2>
        <BudgetItemsForm items={items} onChange={setItems} />
      </div>

      {/* resumo */}
      <div className="flex justify-between items-center border-t pt-4">
        <span className="text-lg font-medium">Total</span>
        <span className="text-xl font-bold">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* salvar */}
      <div className="flex justify-end">
        <Button type="submit" className="bg-primary">
          Salvar Orçamento
        </Button>
      </div>
    </form>
  );
}
