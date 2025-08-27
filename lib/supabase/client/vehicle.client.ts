// lib/client/vehicle.ts
"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Vehicle, CreateVehicleData } from "../types/vehicle.type";

export async function createClient() {
    return createBrowserClient();
}

export async function getVehiclesClient(): Promise<Vehicle[]> {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
}

export async function getVehicleClient(id: string): Promise<Vehicle> {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) throw error;
    return data as Vehicle;
}

export async function updateVehicleClient(id: string, vehicleData: Partial<CreateVehicleData>): Promise<Vehicle> {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("vehicles")
        .update(vehicleData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;
    return data as Vehicle;
}

export async function createVehicleClient(vehicleData: CreateVehicleData): Promise<Vehicle> {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from("vehicles")
        .insert({ ...vehicleData, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data as Vehicle;
}

export async function deleteVehicleClient(id: string): Promise<void> {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw error;
}

// Funções auxiliares (Helpers)
export function getVehicleType(capacity: number): string {
    if (capacity <= 1500) return "Van";
    if (capacity <= 3500) return "Caminhão Pequeno";
    if (capacity <= 8000) return "Caminhão Baú";
    if (capacity <= 15000) return "Caminhão Refrigerado";
    return "Carreta";
}