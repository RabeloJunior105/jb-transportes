// lib/server/people.ts
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
    Employee,
    CreateEmployeeData,
    Client,
    CreateClientData,
    Supplier,
    CreateSupplierData,
} from "../types/people.types";

// Employee functions
export async function getEmployees(): Promise<Employee[]> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Employee[];
}

export async function createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("employees")
        .insert({ ...employeeData, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data as Employee;
}

export async function updateEmployee(id: string, employeeData: Partial<CreateEmployeeData>): Promise<Employee> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("employees")
        .update(employeeData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;
    return data as Employee;
}

export async function deleteEmployee(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("employees").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
}

// Client functions
export async function getClients(): Promise<Client[]> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Client[];
}

export async function createClientData(clientData: CreateClientData): Promise<Client> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("clients")
        .insert({ ...clientData, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data as Client;
}

export async function updateClient(id: string, clientData: Partial<CreateClientData>): Promise<Client> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;
    return data as Client;
}

export async function deleteClient(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("clients").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
}

// Supplier functions
export async function getSuppliers(): Promise<Supplier[]> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Supplier[];
}

export async function createSupplier(supplierData: CreateSupplierData): Promise<Supplier> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("suppliers")
        .insert({ ...supplierData, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data as Supplier;
}

export async function updateSupplier(id: string, supplierData: Partial<CreateSupplierData>): Promise<Supplier> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("suppliers")
        .update(supplierData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;
    return data as Supplier;
}

export async function deleteSupplier(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("suppliers").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
}