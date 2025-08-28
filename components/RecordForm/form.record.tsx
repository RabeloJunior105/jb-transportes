"use client";

import { useMemo, useState } from "react";
import { z, ZodSchema } from "zod"; // use se quiser; pode manter como peer opcional
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

export type Option = { label: string; value: string };

export type FieldConfig = {
    name: string;
    label: string;
    type:
    | "text"
    | "email"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "hidden";
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    options?: ReadonlyArray<Option>;
};

export type GroupConfig = {
    title: string;
    description?: string;
    hidden?: boolean; // ← oculta card inteiro
    fields: ReadonlyArray<FieldConfig>;
};

export interface RecordFormProps {
    config: {
        title: string;
        description?: string;
        groups: ReadonlyArray<GroupConfig>;
    };
    initialValues?: Record<string, any>;
    onSubmit: (values: Record<string, any>) => Promise<void>;
    backHref?: string;
    schema?: ZodSchema<any>; // ← agora Zod “oficial”
    typeHints?: Record<string, "number" | "date" | "string" | "boolean">;
}

// ---------- Helpers ----------
function parseTypes(
    raw: Record<string, FormDataEntryValue>,
    typeHints?: Record<string, "number" | "date" | "string" | "boolean">
) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
        const hint = typeHints?.[k];
        const str = typeof v === "string" ? v : String(v);

        if (hint === "number") {
            // número vazio → undefined (deixa o zod optional passar)
            out[k] = str.trim() === "" ? undefined : Number(str);
        } else if (hint === "date") {
            // data vazia → undefined; preenchida → ISO string
            out[k] = str.trim() === "" ? undefined : new Date(str).toISOString();
        } else if (hint === "boolean") {
            out[k] = str === "true" || str === "on" ? true : str === "false" ? false : Boolean(str);
        } else {
            // string normal mantém como veio
            out[k] = str;
        }
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

// ---------- Component ----------
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

    // lista de campos (para coleta rápida e para saber o que validar/exibir)
    const fieldList = useMemo(
        () => config.groups.flatMap((g) => g.fields),
        [config.groups]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({}); // reset

        const formEl = e.target as HTMLFormElement;
        const formData = new FormData(formEl);

        // Coleta valores
        const raw: Record<string, any> = {};
        fieldList.forEach((f) => {
            raw[f.name] = formData.get(f.name);
        });

        // Tipagem
        const parsed = parseTypes(raw, typeHints);

        // Validação (se tiver schema)
        if (schema) {
            const res = schema.safeParse(parsed);
            if (!res.success) {
                const map = zodErrorsToMap(res.error);
                setErrors(map);
                // feedback mais amigável
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

                                    // se hidden, apenas mantém o valor no submit
                                    if (field.hidden || field.type === "hidden") {
                                        return (
                                            <input
                                                key={field.name}
                                                type="hidden"
                                                name={field.name}
                                                defaultValue={
                                                    field.type === "date" && defaultValue
                                                        ? String(defaultValue).slice(0, 10)
                                                        : String(defaultValue ?? "")
                                                }
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
