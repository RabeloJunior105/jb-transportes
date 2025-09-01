"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface SummaryCardConfig<T = any> {
    title: string;
    icon: React.ReactNode;
    valueKey: string;            // chave no objeto retornado por fetchData
    colorClass?: string;         // ex.: "text-chart-1"
    format?: (value: any, data?: T) => React.ReactNode; // formatação opcional
}

interface SummaryCardsProps<T> {
    fetchData: () => Promise<T>;
    cards: SummaryCardConfig<T>[];
}

export function SummaryCards<T>({ fetchData, cards }: SummaryCardsProps<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const result = await fetchData();
            setData(result);
        } catch (err) {
            console.log("Erro ao carregar summary:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {cards.map((card) => {
                const raw = data ? (data as any)?.[card.valueKey] : undefined;
                const content =
                    card.format ? card.format(raw, data ?? undefined) : (raw ?? 0).toString();

                return (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <div className={card.colorClass ?? "text-muted-foreground"}>
                                {/* o ícone herda a cor via currentColor */}
                                {card.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.colorClass ?? ""}`}>
                                {loading ? "—" : content}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
