"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface SummaryCardConfig {
    title: string;
    icon: React.ReactNode;
    valueKey: string; // campo do objeto retornado
    colorClass?: string;
}

interface SummaryCardsProps<T> {
    fetchData: () => Promise<T>;
    cards: SummaryCardConfig[];
}

export function SummaryCards<T>({ fetchData, cards }: SummaryCardsProps<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const result = await fetchData();
            setData(result);
        } catch (err) {
            console.error("Erro ao carregar summary:", err);
            setData(null); // Garantir que seja null em caso de erro
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <div className={`h-4 w-4 ${card.colorClass}`}>{card.icon}</div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${card.colorClass}`}>
                            {/* Se data for null ou o campo estiver undefined, mostra 0 */}
                            {data && data[card.valueKey as keyof T] != null
                                ? String(data[card.valueKey as keyof T])
                                : "0"}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
