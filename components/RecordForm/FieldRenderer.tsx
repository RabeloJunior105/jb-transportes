"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/lib/supabase-crud/forms/SelectField";

import RemoteSelectField from "./RemoteSelectField";
import { FieldConfig, FormErrors } from "./types";

type Props = {
    field: FieldConfig;
    error?: string;
    defaultValue?: any;
};

export default function FieldRenderer({ field, error, defaultValue }: Props) {
    // hidden -> apenas <input type="hidden" /> quando houver valor
    if (field.hidden || field.type === "hidden") {
        const val =
            field.type === "date" && defaultValue
                ? String(defaultValue).slice(0, 10)
                : String(defaultValue ?? "");
        if (val.trim() === "") return null;
        return <input type="hidden" name={field.name} defaultValue={val} />;
    }

    return (
        <div className="space-y-2">
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
                        aria-invalid={!!error}
                        className={error ? "border-destructive" : undefined}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </>
            ) : field.type === "select" ? (
                <SelectField
                    name={field.name}
                    defaultValue={String(defaultValue || "")}
                    required={field.required}
                    disabled={field.disabled}
                    options={field.options ?? []}
                    placeholder={field.placeholder}
                    error={error}
                />
            ) : field.type === "remote-select" && field.remote ? (
                <RemoteSelectField
                    name={field.name}
                    defaultValue={defaultValue ? String(defaultValue) : undefined}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled}
                    error={error}
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
                        aria-invalid={!!error}
                        className={error ? "border-destructive" : undefined}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </>
            )}
        </div>
    );
}
