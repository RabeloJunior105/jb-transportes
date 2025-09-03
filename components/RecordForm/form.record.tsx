"use client";

import { useEffect, useMemo, useState } from "react";
import { z, ZodSchema } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowLeft, ChevronsUpDown, Check, Loader2 } from "lucide-react";

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
import { SelectField } from "@/lib/supabase-crud/forms/SelectField";

// ✨ imports p/ combobox remoto
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";

// ---------------- Utils ----------------
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clsx(...parts: Array<string | false | undefined>) {
    return parts.filter(Boolean).join(" ");
}

function useDebounced<T>(value: T, delay = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

// ---------------- Types ----------------
export type Option = { label: string; value: string };

type BaseFieldType =
    | "text"
    | "email"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "multiselect"   // 👈 novo
    | "hidden";

// 👇 tipo p/ relacionamentos remotos
type RemoteSelectType = "remote-select";

export type FieldType = BaseFieldType | RemoteSelectType;

export type RemoteSource = {
    table: string;
    valueKey: string;   // ex: "id"
    labelKey: string;   // ex: "plate" | "name"
    searchKeys?: string[]; // ex: ["plate","brand","model"] ou ["name","document"]
    userScoped?: boolean;  // se true, aplica eq("user_id", auth.uid())
    extraFilter?: Record<string, string | number | boolean | null>;
    pageSize?: number;     // default 10
};

export type FieldConfig = {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    options?: ReadonlyArray<Option>; // para "select"/"multiselect" estático
    // 👇 só para "remote-select"
    remote?: RemoteSource;
};

export type GroupConfig = {
    title: string;
    description?: string;
    hidden?: boolean;
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

function parseTypes(
    raw: Record<string, any>,
    typeHints?: Record<string, TypeHint>
) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
        const hint = typeHints?.[k];

        // 👇 suporte a arrays (multiselect)
        if (Array.isArray(v)) {
            out[k] = v.map((x) => String(x));
            continue;
        }

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

// ---------------- RemoteSelect embutido ----------------
type RSProps = {
    name: string;
    defaultValue?: string | null;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    source: RemoteSource;
};

function RemoteSelectField({
    name,
    defaultValue,
    placeholder = "Selecione...",
    required,
    disabled,
    error,
    source,
}: RSProps) {
    const sb = useMemo(() => createBrowserClient(), []);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const debounced = useDebounced(query, 300);

    const [options, setOptions] = useState<Option[]>([]);
    const [selected, setSelected] = useState<Option | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [booting, setBooting] = useState(true);

    const pageSize = source.pageSize ?? 10;

    // carrega o label do defaultValue (edição)
    useEffect(() => {
        let ignore = false;
        (async () => {
            if (!defaultValue) {
                setBooting(false);
                return;
            }
            try {
                const sel = `${source.valueKey}, ${source.labelKey}`;
                let q = sb.from(source.table).select(sel).eq(source.valueKey, defaultValue).limit(1);

                if (source.userScoped) {
                    const { data: { user } } = await sb.auth.getUser();
                    if (user) q = q.eq("user_id", user.id);
                }
                if (source.extraFilter) {
                    Object.entries(source.extraFilter).forEach(([k, v]) => {
                        q = q.eq(k, v as any);
                    });
                }

                const { data, error } = await q.single();
                if (!ignore && !error && data) {
                    const typedData = data as Record<string, any>;
                    const opt = { value: String(typedData[source.valueKey]), label: String(typedData[source.labelKey]) };
                    setSelected(opt);
                    setOptions([opt]); // garante exibição
                }
            } catch (e) {
                console.warn("RemoteSelect default label fetch error:", e);
            } finally {
                if (!ignore) setBooting(false);
            }
        })();
        return () => { ignore = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValue, source.table, source.valueKey, source.labelKey]);

    // busca pagina de opções
    async function fetchPage(reset = false) {
        setLoading(true);
        try {
            const from = reset ? 0 : page * pageSize;
            const to = from + pageSize - 1;

            const sel = `${source.valueKey}, ${source.labelKey}`;
            let q = sb.from(source.table).select(sel).order(source.labelKey, { ascending: true }).range(from, to);

            if (source.userScoped) {
                const { data: { user } } = await sb.auth.getUser();
                if (user) q = q.eq("user_id", user.id);
            }
            if (source.extraFilter) {
                Object.entries(source.extraFilter).forEach(([k, v]) => {
                    q = q.eq(k, v as any);
                });
            }
            const term = debounced.trim();
            if (term && source.searchKeys?.length) {
                const ors = source.searchKeys.map((k) => `${k}.ilike.%${term}%`).join(",");
                q = q.or(ors);
            }

            const { data, error } = await q;
            if (error) throw error;

            const newOpts: Option[] = (data ?? []).map((r: any) => ({
                value: String(r[source.valueKey]),
                label: String(r[source.labelKey]),
            }));

            if (reset) {
                setOptions(newOpts);
                setPage(1);
            } else {
                setOptions((prev) => [...prev, ...newOpts.filter(o => !prev.some(p => p.value === o.value))]);
                setPage((p) => p + 1);
            }

            // se veio menos que o pageSize, não tem mais
            setHasMore((data?.length ?? 0) >= pageSize);
        } finally {
            setLoading(false);
        }
    }

    // sempre que mudar termo, reseta e busca
    useEffect(() => {
        if (!open) return;
        setPage(0);
        fetchPage(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced, open, source.table, source.labelKey]);

    return (
        <div>
            {/* input escondido para o <form> capturar */}
            <input type="hidden" name={name} value={selected?.value ?? ""} />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={clsx("w-full justify-between", error && "border-destructive")}
                        disabled={disabled}
                    >
                        {booting ? (
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Carregando...
                            </span>
                        ) : selected ? (
                            selected.label
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Buscar..."
                            value={query}
                            onValueChange={setQuery}
                            disabled={disabled}
                        />
                        <CommandList className="max-h-64 overflow-auto">
                            <CommandEmpty>
                                {loading ? "Carregando..." : "Nada encontrado"}
                            </CommandEmpty>

                            {/* opções */}
                            {options.map((opt) => {
                                const isSel = selected?.value === opt.value;
                                return (
                                    <CommandItem
                                        key={opt.value}
                                        onSelect={() => {
                                            setSelected(opt);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check className={clsx("mr-2 h-4 w-4", isSel ? "opacity-100" : "opacity-0")} />
                                        {opt.label}
                                    </CommandItem>
                                );
                            })}

                            {/* carregar mais */}
                            {hasMore && (
                                <div className="p-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => fetchPage(false)}
                                        disabled={loading}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Carregar mais
                                    </Button>
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
    );
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

        // coleta valores (atenção: multiselect e remote-select)
        const raw: Record<string, any> = {};
        fieldList.forEach((f) => {
            if (f.type === "multiselect") {
                raw[f.name] = formData.getAll(f.name);
            } else {
                raw[f.name] = formData.get(f.name);
            }
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
            console.log(err);
            toast.error("Ocorreu um erro ao salvar o registro.");
        } finally {
            setIsLoading(false);
        }
    };

    // helper para normalizar defaultValue de multiselect
    const toArray = (dv: any): string[] => {
        if (Array.isArray(dv)) return dv.map(String);
        if (typeof dv === "string") {
            if (dv.includes(",")) return dv.split(",").map((s) => s.trim()).filter(Boolean);
            return dv ? [dv] : [];
        }
        return [];
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

                                    // hidden
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
                                                    {err && <p className="text-sm text-destructive">{err}</p>}
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
                                                    mode="single"
                                                />
                                            ) : field.type === "multiselect" ? (
                                                <SelectField
                                                    name={field.name}
                                                    defaultValue={toArray(defaultValue)}
                                                    required={field.required}
                                                    disabled={field.disabled}
                                                    options={field.options ?? []}
                                                    placeholder={field.placeholder}
                                                    error={err}
                                                    mode="multiple"
                                                />
                                            ) : field.type === "remote-select" && field.remote ? (
                                                <RemoteSelectField
                                                    name={field.name}
                                                    defaultValue={
                                                        defaultValue ? String(defaultValue) : undefined
                                                    }
                                                    placeholder={field.placeholder}
                                                    required={field.required}
                                                    disabled={field.disabled}
                                                    error={err}
                                                    source={field.remote}
                                                />
                                            ) : (
                                                <>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type={field.type}
                                                        defaultValue={
                                                            field.type === "date" && defaultValue
                                                                ? String(defaultValue).slice(0, 10)
                                                                : defaultValue
                                                        }
                                                        placeholder={field.placeholder}
                                                        required={field.required}
                                                        disabled={field.disabled}
                                                        aria-invalid={!!err}
                                                        className={err ? "border-destructive" : undefined}
                                                    />
                                                    {err && <p className="text-sm text-destructive">{err}</p>}
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
