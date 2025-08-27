// lib/client/service.ts
"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Service, CreateServiceData } from "../types/services.type";

export async function createClient() {
    return createBrowserClient();
}

export async function getServicesClient(): Promise<Service[]> {
    const supabase = createBrowserClient();
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

export async function getServiceClient(id: string): Promise<Service> {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("services")
        .select(`*, clients(name), vehicles(plate), employees(name)`)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) throw error;
    return data as Service;
}

export async function updateServiceClient(id: string, serviceData: Partial<CreateServiceData>): Promise<Service> {
    const supabase = createBrowserClient();
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

export async function createServiceClient(serviceData: CreateServiceData): Promise<Service> {
    const supabase = createBrowserClient();
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

export async function deleteServiceClient(id: string): Promise<void> {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("services").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
}