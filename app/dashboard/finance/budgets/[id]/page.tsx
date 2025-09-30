"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Budget, generateBudgetPdf } from "../components/BudgetPdfBuilder";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

export default function BudgetDetailsPage() {
    const params = useParams();
    const sb = createBrowserClient();

    const [budget, setBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const id = params.id as string;
                const { data, error } = await sb
                    .from("budgets")
                    .select(
                        `
              *,
              client:clients(id, name, document, email, phone, address, city, state, zip_code),
              supplier:suppliers(id, name, document, email, phone, address, city, state, zip_code),
              items:budget_items(id, description, quantity, unit_price, billing_type)
            `
                    )
                    .eq("id", id)
                    .single();

                if (error) throw error;
                setBudget(data as unknown as Budget);
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar orçamento.");
            } finally {
                setLoading(false);
            }
        })();
    }, [params.id, sb]);

    if (loading) return <p className="p-6">Carregando...</p>;
    if (!budget) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">Nada por aqui</h2>
                <p className="text-muted-foreground">
                    Este orçamento não existe ou você não tem permissão para vê-lo.
                </p>
            </div>
        );
    }

    const total = budget.items.reduce(
        (sum: any, it: any) => sum + it.quantity * it.unit_price,
        0
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center gap-3">
                <h1 className="text-2xl font-bold">Detalhes do Orçamento</h1>
                <div className="flex gap-2">
                    <Button onClick={() => generateBudgetPdf(budget, true)}>Gerar PDF</Button>
                    <Button variant="secondary" onClick={() => generateBudgetPdf(budget, false)}>
                        Exportar PDF
                    </Button>
                </div>
            </div>

            <Card className="p-4 space-y-4">
                <h2 className="text-lg font-semibold">Dados Gerais</h2>
                <p>
                    <strong>Status:</strong> {budget.status}
                </p>
                <p>
                    <strong>Validade:</strong>{" "}
                    {budget.valid_until
                        ? new Date(budget.valid_until).toLocaleDateString("pt-BR")
                        : "-"}
                </p>
                <p>
                    <strong>Notas:</strong> {budget.notes || "-"}
                </p>
            </Card>

            <Card className="p-4 space-y-4">
                <h2 className="text-lg font-semibold">
                    {budget.client ? "Cliente" : "Fornecedor"}
                </h2>
                <p>
                    <strong>Nome:</strong> {budget.client?.name || budget.supplier?.name}
                </p>
                <p>
                    <strong>Documento:</strong>{" "}
                    {budget.client?.document || budget.supplier?.document || "-"}
                </p>
                <p>
                    <strong>Email:</strong>{" "}
                    {budget.client?.email || budget.supplier?.email || "-"}
                </p>
                <p>
                    <strong>Telefone:</strong>{" "}
                    {budget.client?.phone || budget.supplier?.phone || "-"}
                </p>
                <p>
                    <strong>Endereço:</strong>{" "}
                    {budget.client?.address || budget.supplier?.address || "-"}
                </p>
            </Card>

            <Card className="p-4 space-y-4">
                <h2 className="text-lg font-semibold">Itens</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="text-left p-2">Descrição</th>
                            <th className="text-left p-2">Tipo</th>
                            <th className="text-left p-2">Qtd</th>
                            <th className="text-right p-2">Preço Unit.</th>
                            <th className="text-right p-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budget.items.map((item: any) => (
                            <tr key={item.id} className="border-b">
                                <td className="p-2">{item.description}</td>
                                <td className="p-2">
                                    {item.billing_type === "daily"
                                        ? "Diária"
                                        : item.billing_type === "hourly"
                                            ? "Hora"
                                            : "Fixo"}
                                </td>
                                <td className="p-2">{item.quantity}</td>
                                <td className="p-2 text-right">
                                    {formatCurrency(item.unit_price)}
                                </td>
                                <td className="p-2 text-right">
                                    {formatCurrency(item.quantity * item.unit_price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-end pt-4">
                    <span className="text-lg font-bold">Total: {formatCurrency(total)}</span>
                </div>
            </Card>
        </div>
    );
}
