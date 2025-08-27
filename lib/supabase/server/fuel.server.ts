// lib/server/fuel.ts
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Fuel, CreateFuelData } from "../types/maintence.type";

export async function getFuel(): Promise<Fuel[]> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("fuel")
        .select(
            `
      *,
      vehicles(plate, brand, model),
      employees(name),
      suppliers(name)
    `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }
    return data as Fuel[];
}

export async function createFuel(fuelData: CreateFuelData): Promise<Fuel> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("fuel")
        .insert({
            ...fuelData,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }
    return data as Fuel;
}

export async function updateFuel(id: string, fuelData: Partial<CreateFuelData>): Promise<Fuel> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
        .from("fuel")
        .update(fuelData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }
    return data as Fuel;
}

export async function deleteFuel(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("fuel").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
        throw error;
    }
}