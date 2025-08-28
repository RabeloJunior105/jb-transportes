"use client";

import { useMemo, useState } from "react";
import { z, ZodSchema } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SelectField } from "@/lib/supabase-crud/forms/SelectField";

// ---------------- Types ----------------
export type Option = { label: string; value: string };

export type FieldConfig = {
    name: string;
    label: string;
    type: "text" | "email" | "number" | "date" | "textarea" | "select" | "hidden";
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    options?: ReadonlyArray<Option>;
};

export type GroupConfig = {
    title: string;
    description?: string;
    hidden?: boolean; // oculta card inteiro
    fields: ReadonlyArray<FieldConfig>;
};

type TypeHint = "number" | "date" | "string" | "boolean" | "uuid";

export interface RecordFormProps {
    config: {
        title: string;
        description?: string;
        groups: ReadonlyArray<GroupConfig>;
    };
    initialValues?: Record<string, any>;
    onSubmit: (values: Record<string, any>) => Promise<void>;
    backHref?: string;
    schema?: ZodSchema<any>;
    typeHints?: Record<string, TypeHint>;
}

// ---------------- Helpers ----------------
function safeToIso(input: string): string | undefined {
    const s = input.trim();
    if (!s) return undefined;

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const d = new Date(`${s}T00:00:00Z`);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
    }

    // normaliza " " -> "T"
    let normalized = s.replace(" ", "T");
    // adiciona Z se não houver timezone explícito
    if (!/[zZ]|[+\-]\d{2}:?\d{2}$/.test(normalized)) normalized += "Z";

    const d = new Date(normalized);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
}

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseTypes(
    raw: Record<string, FormDataEntryValue>,
    typeHints?: Record<string, TypeHint>
) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
        const hint = typeHints?.[k];
        const str = typeof v === "string" ? v : String(v);
        const trimmed = str.trim();

        if (hint === "number") {
            out[k] = trimmed === "" ? undefined : Number(trimmed);
            continue;
        }

        if (hint === "date") {
            out[k] = trimmed === "" ? undefined : safeToIso(trimmed) ?? undefined;
            continue;
        }

        if (hint === "boolean") {
            out[k] =
                trimmed === "true" || trimmed === "on"
                    ? true
                    : trimmed === "false"
                        ? false
                        : Boolean(trimmed);
            continue;
        }

        if (hint === "uuid") {
            out[k] = trimmed === "" ? undefined : UUID_RE.test(trimmed) ? trimmed : undefined;
            continue;
        }

        // default string
        out[k] = str;
    }
    return out;
}

type FormErrors = Record<string, string | undefined>;

function zodErrorsToMap(err: any): FormErrors {
    const map: FormErrors = {};
    if (err?.issues) {
        for (const issue of err.issues) {
            const key = issue.path?.[0];
            const msg = issue.message;
            if (typeof key === "string") map[key] = msg;
        }
    }
    return map;
}

// ---------------- Component ----------------
export default function RecordForm({
    config,
    initialValues = {},
    onSubmit,
    backHref,
    schema,
    typeHints,
}: RecordFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const router = useRouter();

    const fieldList = useMemo(
        () => config.groups.flatMap((g) => g.fields),
        [config.groups]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const formEl = e.target as HTMLFormElement;
        const formData = new FormData(formEl);

        // coleta valores
        const raw: Record<string, any> = {};
        fieldList.forEach((f) => {
            raw[f.name] = formData.get(f.name);
        });

        // tipagem
        const parsed = parseTypes(raw, typeHints);

        // validação
        if (schema) {
            const res = schema.safeParse(parsed);
            if (!res.success) {
                const map = zodErrorsToMap(res.error);
                setErrors(map);
                const firstMsg =
                    res.error.issues?.[0]?.message || "Dados inválidos. Verifique os campos.";
                toast.error(firstMsg);
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
        <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 md:p-8 bg-white rounded-lg shadow-sm"
            noValidate
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{config.title}</h2>
                    {config.description && (
                        <p className="text-muted-foreground">{config.description}</p>
                    )}
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

            {config.groups
                .filter((group) => !group.hidden && group.fields.some((f) => !f.hidden))
                .map((group, idx) => (
                    <Card key={idx}>
                        <CardHeader>
                            <CardTitle>{group.title}</CardTitle>
                            {group.description && (
                                <CardDescription>{group.description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.fields.map((field) => {
                                    const defaultValue = initialValues[field.name] ?? "";

                                    // hidden field: só envia quando tem valor (evita "" em uuid etc.)
                                    if (field.hidden || field.type === "hidden") {
                                        const val =
                                            field.type === "date" && defaultValue
                                                ? String(defaultValue).slice(0, 10)
                                                : String(defaultValue ?? "");
                                        if (val.trim() === "") return null;
                                        return (
                                            <input
                                                key={field.name}
                                                type="hidden"
                                                name={field.name}
                                                defaultValue={val}
                                            />
                                        );
                                    }

                                    const err = errors[field.name];

                                    return (
                                        <div key={field.name} className="space-y-2">
                                            <Label htmlFor={field.name}>{field.label}</Label>

                                            {field.type === "textarea" ? (
                                                <>
                                                    <Textarea
                                                        id={field.name}
                                                        name={field.name}
                                                        defaultValue={defaultValue}
                                                        placeholder={field.placeholder}
                                                        required={field.required}
                                                        disabled={field.disabled}
                                                        aria-invalid={!!err}
                                                        className={err ? "border-destructive" : undefined}
                                                    />
                                                    {err && (
                                                        <p className="text-sm text-destructive">{err}</p>
                                                    )}
                                                </>
                                            ) : field.type === "select" ? (
                                                <SelectField
                                                    name={field.name}
                                                    defaultValue={String(defaultValue || "")}
                                                    required={field.required}
                                                    disabled={field.disabled}
                                                    options={field.options ?? []}
                                                    placeholder={field.placeholder}
                                                    error={err}
                                                />
                                            ) : (
                                                <>
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
                                                        disabled={field.disabled}
                                                        aria-invalid={!!err}
                                                        className={err ? "border-destructive" : undefined}
                                                    />
                                                    {err && (
                                                        <p className="text-sm text-destructive">{err}</p>
                                                    )}
                                                </>
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
