"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import FormHeader from "./FormHeader";
import FormGroupCard from "./FormGroupCard";

import { parseTypes, zodErrorsToMap } from "./helpers";
import { RecordFormProps, FormErrors } from "./types";

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

        // coleta valores (remote-select injeta hidden)
        const raw: Record<string, any> = {};
        fieldList.forEach((f) => {
            raw[f.name] = formData.get(f.name);
        });

        const parsed = parseTypes(raw, typeHints);

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
            <FormHeader title={config.title} description={config.description} backHref={backHref} />

            {config.groups.map((group, idx) => (
                <FormGroupCard
                    key={idx}
                    group={group}
                    errors={errors}
                    initialValues={initialValues}
                />
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
