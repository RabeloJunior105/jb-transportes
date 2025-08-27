"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "email" | "phone" | "date" | "badge";
    options?: { label: string; value: string }[];
    render?: (value: any, row: any) => React.ReactNode;
}

interface ActionConfig {
    label: string;
    icon?: React.ReactNode;
    href?: (row: any) => string;
    onClick?: (row: any) => void;
    color?: "default" | "destructive";
}

interface RecordListProps<T> {
    title: string;
    description?: string;
    fields: FieldConfig[];
    actions?: ActionConfig[];
    fetchData: (params: { page: number; itemsPerPage: number; search?: string; filters?: any }) => Promise<{ data: T[]; total: number }>;
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
    }, [currentPage, searchTerm, filterValues]);

    const load = async () => {
        setLoading(true);
        try {
            const { data, total } = await fetchData({ page: currentPage, itemsPerPage, search: searchTerm, filters: filterValues });
            setRows(data);
            setTotal(total);
        } catch (err) {
            console.error(err);
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
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="animate-spin h-6 w-6 mr-2" /> Carregando...
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
                                {actions?.length && <TableHead>Ações</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row: any) => (
                                <TableRow key={row.id}>
                                    {fields.map((f) => (
                                        <TableCell key={f.name}>
                                            {f.render ? f.render(row[f.name], row) : row[f.name]}
                                        </TableCell>
                                    ))}
                                    {actions?.length && (
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {actions.map((action, i) => (
                                                        <DropdownMenuItem
                                                            key={i}
                                                            onClick={() => action.onClick && action.onClick(row)}
                                                            className={action.color === "destructive" ? "text-destructive" : ""}
                                                        >
                                                            {action.icon && <span className="mr-2">{action.icon}</span>}
                                                            {action.href ? <Link href={action.href(row)}>{action.label}</Link> : action.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
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
