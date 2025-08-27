// lib/client/people.ts
"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
    Employee,
    CreateEmployeeData,
    Client,
    CreateClientData,
    Supplier,
    CreateSupplierData,
} from "../types/people.types";

// Employee functions
export async function getEmployeesClient(): Promise<Employee[]> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("employees").select("*");

    if (error) throw error;
    return data as Employee[];
}

export async function getEmployeeClient(id: string): Promise<Employee> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();

    if (error) throw error;
    return data as Employee;
}

export async function createEmployeeClient(employeeData: CreateEmployeeData): Promise<Employee> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("employees").insert(employeeData).select().single();

    if (error) throw error;
    return data as Employee;
}

export async function updateEmployeeClient(id: string, employeeData: Partial<CreateEmployeeData>): Promise<Employee> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from("employees")
        .update(employeeData)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Employee;
}

export async function deleteEmployeeClient(id: string): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) throw error;
}

// Client functions
export async function getClientsClient(): Promise<Client[]> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("clients").select("*");

    if (error) throw error;
    return data as Client[];
}

export async function getClientClient(id: string): Promise<Client> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();

    if (error) throw error;
    return data as Client;
}

export async function createClientClient(clientData: CreateClientData): Promise<Client> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("clients").insert(clientData).select().single();

    if (error) throw error;
    return data as Client;
}

export async function updateClientClient(id: string, clientData: Partial<CreateClientData>): Promise<Client> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Client;
}

export async function deleteClientClient(id: string): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) throw error;
}

// Supplier functions
export async function getSuppliersClient(): Promise<Supplier[]> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("suppliers").select("*");

    if (error) throw error;
    return data as Supplier[];
}

export async function getSupplierClient(id: string): Promise<Supplier> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single();

    if (error) throw error;
    return data as Supplier;
}

export async function createSupplierClient(supplierData: CreateSupplierData): Promise<Supplier> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from("suppliers").insert(supplierData).select().single();

    if (error) throw error;
    return data as Supplier;
}

export async function updateSupplierClient(id: string, supplierData: Partial<CreateSupplierData>): Promise<Supplier> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from("suppliers")
        .update(supplierData)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Supplier;
}

export async function deleteSupplierClient(id: string): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("suppliers").delete().eq("id", id);

    if (error) throw error;
}

// Funções auxiliares (Helpers)
export function isLicenseExpiring(expiryDate: string | null): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
}

export function isLicenseExpired(expiryDate: string | null): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return today > expiry;
}