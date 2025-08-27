"use client";

import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Option = { label: string; value: string };

type Props = {
    name: string;
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
    options: ReadonlyArray<Option>; // ← readonly
    className?: string;
};

export function SelectField({
    name,
    placeholder = "Selecione...",
    defaultValue,
    required,
    options,
    className,
}: Props) {
    const [value, setValue] = React.useState<string | undefined>(defaultValue);

    return (
        <div className={className}>
            {/* Radix Select não envia valor no submit. Este hidden garante que FormData tenha o campo. */}
            <input type="hidden" name={name} value={value ?? ""} required={required} />
            <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
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
        </div>
    );
}
