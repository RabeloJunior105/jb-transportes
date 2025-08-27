"use client";

import { useState } from "react";
import { z, ZodSchema } from "zod"; // opcional, pode remover se não usar
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SelectField } from "@/lib/supabase-crud/forms/SelectField";

export type FieldConfig = {
    name: string;
    label: string;
    type: "text" | "email" | "number" | "date" | "textarea" | "select";
    placeholder?: string;
    required?: boolean;
    options?: ReadonlyArray<{ label: string; value: string }>; // ← readonly
};

export type GroupConfig = {
    title: string;
    description?: string;
    fields: ReadonlyArray<FieldConfig>; // ← readonly
};

export interface RecordFormProps {
    config: {
        title: string;
        description?: string;
        groups: ReadonlyArray<GroupConfig>; // ← readonly
    };
    initialValues?: Record<string, any>;
    onSubmit: (values: Record<string, any>) => Promise<void>;
    backHref?: string;
    schema?: ZodSchema<any>; // opcional
    typeHints?: Record<string, "number" | "date" | "string" | "boolean">;
}

function parseTypes(
    raw: Record<string, FormDataEntryValue>,
    typeHints?: Record<string, "number" | "date" | "string" | "boolean">
) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
        const hint = typeHints?.[k];
        const str = typeof v === "string" ? v : String(v);
        if (hint === "number") {
            out[k] = str === "" ? null : Number(str);
        } else if (hint === "date") {
            out[k] = str ? new Date(str).toISOString() : null;
        } else if (hint === "boolean") {
            out[k] = str === "true" || str === "on" ? true : str === "false" ? false : Boolean(str);
        } else {
            out[k] = str;
        }
    }
    return out;
}

export default function RecordForm({
    config,
    initialValues = {},
    onSubmit,
    backHref,
    schema,
    typeHints,
}: RecordFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formEl = e.target as HTMLFormElement;
        const formData = new FormData(formEl);

        // Coleta valores
        const raw: Record<string, any> = {};
        config.groups.forEach((g) => {
            g.fields.forEach((f) => {
                raw[f.name] = formData.get(f.name);
            });
        });

        // Tipagem
        const parsed = parseTypes(raw, typeHints);

        // Validação (opcional)
        if (schema) {
            const res = schema.safeParse(parsed);
            if (!res.success) {
                const msg = res.error.errors?.[0]?.message || "Dados inválidos. Verifique os campos.";
                toast.error(msg);
                return;
            }
        }

        setIsLoading(true);
        try {
            await onSubmit(parsed);
            toast.success("Registro salvo com sucesso!");
            if (backHref) router.push(backHref);
        } catch (err) {
            console.error(err);
            toast.error("Ocorreu um erro ao salvar o registro.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 md:p-8 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{config.title}</h2>
                    {config.description && <p className="text-muted-foreground">{config.description}</p>}
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

            {config.groups.map((group, idx) => (
                <Card key={idx}>
                    <CardHeader>
                        <CardTitle>{group.title}</CardTitle>
                        {group.description && <CardDescription>{group.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.fields.map((field) => {
                                const defaultValue = initialValues[field.name] ?? "";

                                return (
                                    <div key={field.name} className="space-y-2">
                                        <Label htmlFor={field.name}>{field.label}</Label>

                                        {field.type === "textarea" ? (
                                            <Textarea
                                                id={field.name}
                                                name={field.name}
                                                defaultValue={defaultValue}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                            />
                                        ) : field.type === "select" ? (
                                            <SelectField
                                                name={field.name}
                                                defaultValue={String(defaultValue || "")}
                                                required={field.required}
                                                options={field.options ?? []}
                                                placeholder={field.placeholder}
                                            />
                                        ) : (
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type={field.type}
                                                defaultValue={
                                                    field.type === "date" && defaultValue
                                                        ? String(defaultValue).slice(0, 10) // yyyy-mm-dd
                                                        : defaultValue
                                                }
                                                placeholder={field.placeholder}
                                                required={field.required}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end space-x-2 mt-4">
                <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </form>
    );
}
