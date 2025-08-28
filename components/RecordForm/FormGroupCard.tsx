"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import FieldRenderer from "./FieldRenderer";
import { GroupConfig, FormErrors } from "./types";

type Props = {
    group: GroupConfig;
    errors: FormErrors;
    initialValues: Record<string, any>;
};

export default function FormGroupCard({ group, errors, initialValues }: Props) {
    if (group.hidden || !group.fields.some((f) => !f.hidden)) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{group.title}</CardTitle>
                {group.description && <CardDescription>{group.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.fields.map((field) => (
                        <FieldRenderer
                            key={field.name}
                            field={field}
                            error={errors[field.name]}
                            defaultValue={initialValues[field.name] ?? ""}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
