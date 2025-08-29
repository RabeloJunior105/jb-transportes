"use client";

import * as React from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

type Option = { label: string; value: string };

type Props = {
    name: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
    disabled?: boolean;
    options: ReadonlyArray<Option>;
    className?: string;
    error?: string; // ← novo: mostra erro e estilo
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
}: Props) {
    const [value, setValue] = React.useState<string | undefined>(defaultValue);

    const triggerClass =
        (error ? "ring-1 ring-destructive focus:ring-destructive " : "") +
        (disabled ? "pointer-events-none opacity-60 " : "");

    return (
        <div className={className}>
            {/* Radix Select não envia valor no submit. Este hidden garante que FormData tenha o campo. */}
            <input type="hidden" name={name} value={value ?? ""} required={required} />
            <Select value={value} onValueChange={setValue} disabled={disabled}>
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
