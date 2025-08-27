// lib/server/vehicle.ts
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Vehicle, CreateVehicleData } from "../types/vehicle.type";

export async function getVehicles(): Promise<Vehicle[]> {
    const supabase = await createServerClient();
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

export async function createVehicle(vehicleData: CreateVehicleData): Promise<Vehicle> {
    const supabase = await createServerClient();
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

export async function updateVehicle(id: string, vehicleData: Partial<CreateVehicleData>): Promise<Vehicle> {
    const supabase = await createServerClient();
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

export async function deleteVehicle(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("vehicles").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
}