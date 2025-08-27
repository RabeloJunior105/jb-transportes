// lib/server/maintenance.ts
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Maintenance, CreateMaintenanceData } from "../types/maintence.type";

export async function getMaintenance(): Promise<Maintenance[]> {
    const supabase = await createServerClient();
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

export async function createMaintenance(maintenanceData: CreateMaintenanceData): Promise<Maintenance> {
    const supabase = await createServerClient();
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

export async function updateMaintenance(id: string, maintenanceData: Partial<CreateMaintenanceData>): Promise<Maintenance> {
    const supabase = await createServerClient();
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

export async function deleteMaintenance(id: string): Promise<void> {
    const supabase = await createServerClient();
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