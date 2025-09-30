"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BudgetItemInput, BudgetItemsForm } from "../../components/budgtes-items";
import RemoteSelectField from "@/components/RecordForm/RemoteSelectField";

type Budget = {
    id: string;
    client_id: string | null;
    supplier_id: string | null;
    valid_until: string | null;
    status: "draft" | "sent" | "accepted" | "refused" | "expired";
    notes: string | null;
};

export default function EditBudgetPage() {
    const sb = useMemo(() => createBrowserClient(), []);
    const params = useParams();
    const router = useRouter();

    const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

    // cabeçalho
    const [isClient, setIsClient] = useState(true);
    const [defaultPartyId, setDefaultPartyId] = useState<string | null>(null);
    const [validUntil, setValidUntil] = useState("");
    const [status, setStatus] = useState<Budget["status"]>("draft");
    const [notes, setNotes] = useState("");

    // itens
    const [items, setItems] = useState<BudgetItemInput[]>([]);
    const total = items.reduce((acc, it) => acc + it.quantity * it.unit_price, 0);

    // controle de carregamento
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                // carrega orçamento
                const { data: budget, error } = await sb
                    .from("budgets")
                    .select("id, client_id, supplier_id, valid_until, status, notes")
                    .eq("id", id)
                    .maybeSingle();

                if (error) throw error;
                if (!budget) {
                    toast.error("Orçamento não encontrado.");
                    router.push("/dashboard/finance/budgets");
                    return;
                }

                // detecta se é cliente ou fornecedor
                if (budget.client_id) {
                    setIsClient(true);
                    setDefaultPartyId(budget.client_id);
                } else if (budget.supplier_id) {
                    setIsClient(false);
                    setDefaultPartyId(budget.supplier_id);
                }

                setValidUntil(budget.valid_until ?? "");
                setStatus(budget.status as Budget["status"]);
                setNotes(budget.notes ?? "");

                // carrega itens
                const { data: itemsData, error: errItems } = await sb
                    .from("budget_items")
                    .select("id, description, quantity, unit_price")
                    .eq("budget_id", id);

                if (errItems) throw errItems;

                setItems(
                    (itemsData ?? []).map((it) => ({
                        id: it.id,
                        description: it.description,
                        quantity: it.quantity,
                        unit_price: it.unit_price,
                    }))
                );
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar orçamento.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, sb, router]);

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

            // atualiza orçamento
            const { error } = await sb
                .from("budgets")
                .update({
                    client_id: isClient ? selectedId : null,
                    supplier_id: !isClient ? selectedId : null,
                    valid_until: validUntil || null,
                    status,
                    notes,
                })
                .eq("id", id);

            if (error) throw error;

            // apaga itens antigos e recria (simples)
            await sb.from("budget_items").delete().eq("budget_id", id);

            if (items.length > 0) {
                const payloadItems = items.map((it) => ({
                    budget_id: id,
                    description: it.description,
                    quantity: it.quantity,
                    unit_price: it.unit_price,
                }));
                const { error: errItems } = await sb
                    .from("budget_items")
                    .insert(payloadItems);
                if (errItems) throw errItems;
            }

            toast.success("Orçamento atualizado com sucesso!");
            router.push("/dashboard/finance/budgets");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar alterações.");
        }
    }

    if (loading) {
        return <p className="p-6">Carregando orçamento...</p>;
    }

    return (
        <form className="flex-1 p-6 space-y-8" onSubmit={handleSubmit}>
            {/* header */}
            <div>
                <h1 className="text-2xl font-bold">Editar Orçamento</h1>
                <p className="text-muted-foreground">
                    Atualize os dados principais e os itens do orçamento.
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
                        setDefaultPartyId(null); // limpa ao trocar
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
                    name="party_id"
                    defaultValue={defaultPartyId ?? undefined} // ✅ agora pega valor inicial
                    placeholder={`Selecione o ${isClient ? "cliente" : "fornecedor"}`}
                    source={{
                        table: isClient ? "clients" : "suppliers",
                        valueKey: "id",
                        labelKey: "name",
                        searchKeys: ["name", "document"],
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
                    Salvar Alterações
                </Button>
            </div>
        </form>
    );
}
