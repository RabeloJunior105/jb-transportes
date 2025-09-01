"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "email" | "phone" | "date" | "badge";
    options?: { label: string; value: string }[];
    render?: (value: any, row: any) => React.ReactNode;
}

export type RowAction<T> = {
    label: string;
    icon?: React.ReactNode;
    /** href pode ser string fixa ou função baseada na linha */
    href?: string | ((row: T) => string);
    onClick?: (row: T) => void;
    color?: "default" | "destructive";
    /** se definido, controla se a ação aparece para essa linha */
    visible?: (row: T) => boolean;
    /** se definido, deixa o item desabilitado para essa linha */
    disabled?: (row: T) => boolean;
};

interface RecordListProps<T> {
    title: string;
    description?: string;
    fields: FieldConfig[];
    actions?: RowAction<T>[];
    fetchData: (params: {
        page: number;
        itemsPerPage: number;
        search?: string;
        filters?: any;
    }) => Promise<{ data: T[]; total: number }>;
    itemsPerPage?: number;
    filters?: { name: string; label: string; options: { label: string; value: string }[] }[];
}

export function RecordList<T extends { id: string }>({
    title,
    description,
    fields,
    actions,
    fetchData,
    itemsPerPage = 10,
    filters = [],
}: RecordListProps<T>) {
    const [rows, setRows] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterValues, setFilterValues] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, filterValues]);

    const load = async () => {
        setLoading(true);
        try {
            const { data, total } = await fetchData({
                page: currentPage,
                itemsPerPage,
                search: searchTerm,
                filters: filterValues,
            });
            setRows(data);
            setTotal(total);
        } catch (err) {
            console.log(err);
            toast.error("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(total / itemsPerPage);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {/* Filtros e busca */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-4"
                        />
                    </div>
                    {filters.map((f) => (
                        <div key={f.name} className="w-full sm:w-48">
                            <Select
                                value={filterValues[f.name] || "all"}
                                onValueChange={(v) => setFilterValues((prev) => ({ ...prev, [f.name]: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={f.label} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {f.options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>

                {/* Tabela */}
                {loading ? (
                    <div className="flex-1 space-y-6 p-6">
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Carregando dados...</span>
                        </div>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Nenhum registro encontrado</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {fields.map((f) => (
                                    <TableHead key={f.name}>{f.label}</TableHead>
                                ))}
                                {actions?.length ? <TableHead>Ações</TableHead> : null}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row: T) => {
                                const actionsToShow = (actions ?? []).filter(
                                    (a) => !a.visible || a.visible(row)
                                );

                                return (
                                    <TableRow key={row.id}>
                                        {fields.map((f) => (
                                            <TableCell key={f.name}>
                                                {f.render ? f.render((row as any)[f.name], row) : (row as any)[f.name]}
                                            </TableCell>
                                        ))}

                                        {actions?.length ? (
                                            <TableCell className="w-0">
                                                {actionsToShow.length > 0 ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Abrir menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {actionsToShow.map((action, i) => {
                                                                const disabled = action.disabled ? action.disabled(row) : false;
                                                                const href =
                                                                    typeof action.href === "function"
                                                                        ? action.href(row)
                                                                        : action.href;

                                                                const className = [
                                                                    action.color === "destructive" ? "text-destructive" : "",
                                                                    disabled ? "opacity-50 pointer-events-none" : "",
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(" ");

                                                                // Link como item do menu quando tiver href e não estiver desabilitado
                                                                if (href && !disabled) {
                                                                    return (
                                                                        <DropdownMenuItem key={i} asChild className={className}>
                                                                            <Link href={href} className="flex items-center">
                                                                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                                                                {action.label}
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    );
                                                                }

                                                                // Item clicável (ou desabilitado) quando não tiver href
                                                                return (
                                                                    <DropdownMenuItem
                                                                        key={i}
                                                                        disabled={disabled}
                                                                        onClick={
                                                                            disabled || !action.onClick
                                                                                ? undefined
                                                                                : () => action.onClick!(row)
                                                                        }
                                                                        className={className}
                                                                    >
                                                                        {action.icon && <span className="mr-2">{action.icon}</span>}
                                                                        {action.label}
                                                                    </DropdownMenuItem>
                                                                );
                                                            })}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    // Quando nenhuma ação estiver visível para a linha,
                                                    // renderizamos uma célula vazia para manter o layout.
                                                    <div className="text-xs text-muted-foreground">—</div>
                                                )}
                                            </TableCell>
                                        ) : null}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                            {Math.min(currentPage * itemsPerPage, total)} de {total} registros
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            >
                                Anterior
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    size="sm"
                                    variant={page === currentPage ? "default" : "outline"}
                                    onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 p-0"
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            >
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
