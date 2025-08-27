// lib/client/maintenance.ts
"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Maintenance, CreateMaintenanceData } from "../types/maintence.type";

export async function getMaintenanceClient(): Promise<Maintenance[]> {
    const supabase = createBrowserClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("maintenance")
        .select(
            `
      *,
      vehicles(plate, brand, model),
      suppliers(name)
    `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }
    return data as Maintenance[];
}

export async function getMaintenanceClientById(id: string): Promise<Maintenance> {
    const supabase = createBrowserClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("maintenance")
        .select(
            `
      *,
      vehicles(plate, brand, model),
      suppliers(name)
    `
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) {
        throw error;
    }
    return data as Maintenance;
}

export async function createMaintenanceClient(maintenanceData: CreateMaintenanceData): Promise<Maintenance> {
    const supabase = createBrowserClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("maintenance")
        .insert({
            ...maintenanceData,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }
    return data as Maintenance;
}

export async function updateMaintenanceClient(id: string, maintenanceData: Partial<CreateMaintenanceData>): Promise<Maintenance> {
    const supabase = createBrowserClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("maintenance")
        .update(maintenanceData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }
    return data as Maintenance;
}

export async function deleteMaintenanceClient(id: string): Promise<void> {
    const supabase = createBrowserClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("maintenance").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
        throw error;
    }
}