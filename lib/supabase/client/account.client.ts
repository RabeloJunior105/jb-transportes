"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Account, CreateAccountData } from "../types/accounts.type";

// Helper function to check if account is overdue
export function isOverdue(dueDate: string, status: string): boolean {
    if (status === "paid") return false;
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
}

export async function getAccountsClient(type?: "payable" | "receivable"): Promise<Account[]> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from("accounts")
        .select(`*, clients(name), suppliers(name), services(service_code)`);

    if (error) throw error;
    return data as Account[];
}

export async function getAccountClient(id: string): Promise<Account> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from("accounts")
        .select(`*, clients(name), suppliers(name), services(service_code)`)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as Account;
}

export async function createAccountClient(accountData: CreateAccountData): Promise<Account> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from("accounts")
        .insert(accountData)
        .select()
        .single();

    if (error) throw error;
    return data as Account;
}

export async function updateAccountClient(id: string, accountData: Partial<CreateAccountData>): Promise<Account> {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from("accounts")
        .update(accountData)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Account;
}

export async function deleteAccountClient(id: string): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw error;
}