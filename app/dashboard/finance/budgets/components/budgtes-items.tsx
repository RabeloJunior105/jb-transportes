"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type BillingType = "daily" | "hourly" | "fixed";

export type BudgetItemInput = {
    description: string;
    quantity: number;
    unit_price: number;
    billing_type: BillingType;
};

type Props = {
    items: BudgetItemInput[];
    onChange: (items: BudgetItemInput[]) => void;
};

export function BudgetItemsForm({ items, onChange }: Props) {
    const [draft, setDraft] = useState<BudgetItemInput>({
        description: "",
        quantity: 1,
        unit_price: 0,
        billing_type: "fixed",
    });

    function handleAdd() {
        if (!draft.description.trim()) return;
        onChange([...items, draft]);
        setDraft({ description: "", quantity: 1, unit_price: 0, billing_type: "fixed" });
    }

    function handleRemove(index: number) {
        onChange(items.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-4">
            {/* linha de input */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Input
                        value={draft.description}
                        onChange={(e) =>
                            setDraft({ ...draft, description: e.target.value })
                        }
                        placeholder="Ex: Transporte de carga"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Quantidade</label>
                    <Input
                        type="number"
                        min={1}
                        value={draft.quantity}
                        onChange={(e) =>
                            setDraft({ ...draft, quantity: Number(e.target.value) })
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Preço Unitário</label>
                    <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={draft.unit_price}
                        onChange={(e) =>
                            setDraft({ ...draft, unit_price: Number(e.target.value) })
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select
                        className="w-full border rounded-md p-2"
                        value={draft.billing_type}
                        onChange={(e) =>
                            setDraft({ ...draft, billing_type: e.target.value as BillingType })
                        }
                    >
                        <option value="fixed">Valor Fixo</option>
                        <option value="daily">Diária</option>
                        <option value="hourly">Hora</option>
                    </select>
                </div>
                <div>
                    <Button
                        type="button"
                        onClick={handleAdd}
                        className="w-full"
                    >
                        + Adicionar
                    </Button>
                </div>
            </div>

            {/* lista de itens */}
            <div className="space-y-2">
                {items.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Nenhum item adicionado.
                    </p>
                )}
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex justify-between items-center border rounded p-3"
                    >
                        <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {item.quantity} × R${" "}
                                {item.unit_price.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                })}{" "}
                                ({item.billing_type === "daily"
                                    ? "Diária"
                                    : item.billing_type === "hourly"
                                        ? "Hora"
                                        : "Valor Fixo"})
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold">
                                R${" "}
                                {(item.quantity * item.unit_price).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemove(idx)}
                            >
                                Remover
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
