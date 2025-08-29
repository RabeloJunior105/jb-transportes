"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
    title: string;
    description?: string;
    backHref?: string;
};

export default function FormHeader({ title, description, backHref }: Props) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {backHref && (
                <Button variant="outline" asChild>
                    <Link href={backHref}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
            )}
        </div>
    );
}
