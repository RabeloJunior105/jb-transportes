"use client";

import * as React from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { ChevronsUpDown, Check, Loader2 } from "lucide-react";

import { Option, RemoteSource } from "./types";
import { clsx, useDebounced } from "./helpers";

type Props = {
    name: string;
    defaultValue?: string | null;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    source: RemoteSource;
};

export default function RemoteSelectField({
    name,
    defaultValue,
    placeholder = "Selecione...",
    required,
    disabled,
    error,
    source,
}: Props) {
    const sb = React.useMemo(() => createBrowserClient(), []);
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const debounced = useDebounced(query, 300);

    const [options, setOptions] = React.useState<Option[]>([]);
    const [selected, setSelected] = React.useState<Option | null>(null);
    const [page, setPage] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [booting, setBooting] = React.useState(true);

    const pageSize = source.pageSize ?? 10;

    // carrega label do defaultValue (edição)
    React.useEffect(() => {
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
                    const record = data as unknown as Record<string, unknown>;
                    const opt = { value: String(record[source.valueKey]), label: String(record[source.labelKey]) };
                    setSelected(opt);
                    setOptions([opt]);
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

            setHasMore((data?.length ?? 0) >= pageSize);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        if (!open) return;
        setPage(0);
        fetchPage(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced, open, source.table, source.labelKey]);

    return (
        <div>
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
