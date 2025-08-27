import { createClient } from "@/lib/supabase/server";
import { Account, CreateAccountData } from "../types/accounts.type";


export async function getAccounts(type?: "payable" | "receivable"): Promise<Account[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    let query = supabase
        .from("accounts")
        .select(`*, clients(name), suppliers(name), services(service_code)`)
        .eq("user_id", user.id);

    if (type) {
        query = query.eq("type", type);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data as Account[];
}

export async function createAccount(accountData: CreateAccountData): Promise<Account> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("accounts")
        .insert({ ...accountData, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data as Account;
}

export async function updateAccount(id: string, accountData: Partial<CreateAccountData>): Promise<Account> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("accounts")
        .update(accountData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;
    return data as Account;
}

export async function deleteAccount(id: string): Promise<void> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw error;
}

export async function getAccount(id: string): Promise<Account> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("accounts")
        .select(`*, clients(name), suppliers(name), services(service_code)`)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) throw error;
    return data as Account;
}