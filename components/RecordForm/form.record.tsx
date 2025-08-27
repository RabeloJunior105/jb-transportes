"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

type FieldConfig = {
    name: string
    label: string
    type: "text" | "email" | "number" | "date" | "textarea" | "select"
    placeholder?: string
    required?: boolean
    options?: { label: string; value: string }[]
}

type GroupConfig = {
    title: string
    description?: string
    fields: FieldConfig[]
}

interface RecordFormProps {
    config: {
        title: string
        description?: string
        groups: GroupConfig[]
    }
    initialValues?: Record<string, any>
    onSubmit: (values: Record<string, any>) => Promise<void>
    backHref?: string
}

export default function RecordForm({ config, initialValues = {}, onSubmit, backHref }: RecordFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)

        const values: Record<string, any> = {}
        config.groups.forEach((group) => {
            group.fields.forEach((field) => {
                values[field.name] = formData.get(field.name)
            })
        })

        setIsLoading(true)
        try {
            await onSubmit(values)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 md:p-8 bg-white rounded-lg shadow-sm">
            <div>
                <h2 className="text-2xl font-bold">{config.title}</h2>
                {config.description && <p className="text-muted-foreground">{config.description}</p>}
            </div>
            {backHref && (
                <Button variant="outline" asChild>
                    <Link href={backHref}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
            )}

            {config.groups.map((group, idx) => (
                <Card key={idx}>
                    <CardHeader>
                        <CardTitle>{group.title}</CardTitle>
                        {group.description && <CardDescription>{group.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <Label htmlFor={field.name}>{field.label}</Label>

                                    {field.type === "textarea" ? (
                                        <Textarea
                                            id={field.name}
                                            name={field.name}
                                            defaultValue={initialValues[field.name]}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                        />
                                    ) : field.type === "select" ? (
                                        <Select
                                            name={field.name}
                                            defaultValue={initialValues[field.name]}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={field.placeholder || "Selecione..."} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            defaultValue={initialValues[field.name]}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Botões de ação */}
            <div className="flex justify-end space-x-2 mt-4">
                <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </form>
    )
}
