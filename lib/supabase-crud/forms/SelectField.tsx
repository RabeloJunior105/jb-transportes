"use client";

import * as React from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check, X } from "lucide-react";

type Option = { label: string; value: string };

type Props = {
    name: string;
    placeholder?: string;
    defaultValue?: string | string[];
    required?: boolean;
    disabled?: boolean;
    options: ReadonlyArray<Option>;
    className?: string;
    error?: string; // mostra erro e estilo
    mode?: "single" | "multiple"; // 👈 novo
};

export function SelectField({
    name,
    placeholder = "Selecione...",
    defaultValue,
    required,
    disabled,
    options,
    className,
    error,
    mode = "single",
}: Props) {
    const isMultiple = mode === "multiple";

    // ------- STATE -------
    const [open, setOpen] = React.useState(false);

    const [single, setSingle] = React.useState<string | undefined>(
        typeof defaultValue === "string" ? defaultValue : undefined
    );

    const [multi, setMulti] = React.useState<string[]>(
        Array.isArray(defaultValue)
            ? defaultValue.map(String)
            : typeof defaultValue === "string" && defaultValue.includes(",")
                ? defaultValue.split(",").map((s) => s.trim())
                : Array.isArray(defaultValue)
                    ? defaultValue
                    : []
    );

    // ------- STYLES -------
    const triggerClass =
        (error ? "ring-1 ring-destructive focus:ring-destructive " : "") +
        (disabled ? "pointer-events-none opacity-60 " : "");

    // ------- HELPERS -------
    const selectedLabels =
        options.filter((o) => multi.includes(o.value)).map((o) => o.label).join(", ") || undefined;

    if (!isMultiple) {
        // ---------- SINGLE ----------
        return (
            <div className={className}>
                {/* Radix Select não envia no submit; escondido garante FormData */}
                <input type="hidden" name={name} value={single ?? ""} required={required} />
                <Select value={single} onValueChange={setSingle} disabled={disabled}>
                    <SelectTrigger className={triggerClass} aria-invalid={!!error}>
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            </div>
        );
    }

    // ---------- MULTIPLE ----------
    return (
        <div className={className}>
            {/* hidden inputs para o FormData.getAll(name) */}
            {multi.map((v) => (
                <input key={v} type="hidden" name={name} value={v} />
            ))}
            {/* required "fake" para HTML5 validar */}
            {required && (
                <input
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                    value={multi.length ? "ok" : ""}
                    onChange={() => { }}
                    required
                />
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={`w-full justify-between ${triggerClass}`}
                    >
                        {selectedLabels ?? <span className="text-muted-foreground">{placeholder}</span>}
                        <div className="flex items-center gap-1">
                            {multi.length > 0 && (
                                <X
                                    className="h-4 w-4 opacity-70 hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMulti([]);
                                    }}
                                />
                            )}
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList className="max-h-64 overflow-auto">
                            <CommandEmpty>Nenhuma opção</CommandEmpty>

                            {options.map((opt) => {
                                const active = multi.includes(opt.value);
                                return (
                                    <CommandItem
                                        key={opt.value}
                                        onSelect={() => {
                                            setMulti((prev) =>
                                                prev.includes(opt.value)
                                                    ? prev.filter((v) => v !== opt.value)
                                                    : [...prev, opt.value]
                                            );
                                        }}
                                    >
                                        <Check className={`mr-2 h-4 w-4 ${active ? "opacity-100" : "opacity-0"}`} />
                                        {opt.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
    );
}
