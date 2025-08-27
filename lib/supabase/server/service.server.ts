// lib/server/service.ts
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Service, CreateServiceData } from "../types/services.type";

export async function getServices(): Promise<Service[]> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("services")
        .select(`*, clients(name), vehicles(plate), employees(name)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Service[];
}

export async function createService(serviceData: CreateServiceData): Promise<Service> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("services")
        .insert({ ...serviceData, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data as Service;
}

export async function updateService(id: string, serviceData: Partial<CreateServiceData>): Promise<Service> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("services")
        .update(serviceData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;
    return data as Service;
}

export async function deleteService(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("services").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
}