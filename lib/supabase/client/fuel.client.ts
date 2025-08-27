// lib/client/fuel.ts
"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Fuel, CreateFuelData } from "../types/maintence.type";

export async function getFuelClient(): Promise<Fuel[]> {
    const supabase = createBrowserClient();
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

export async function getFuelClientById(id: string): Promise<Fuel> {
    const supabase = createBrowserClient();
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
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) {
        throw error;
    }
    return data as Fuel;
}

export async function updateFuelClient(id: string, fuelData: Partial<CreateFuelData>): Promise<Fuel> {
    const supabase = createBrowserClient();
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

export async function createFuelClient(fuelData: CreateFuelData): Promise<Fuel> {
    const supabase = createBrowserClient();
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

export async function deleteFuelClient(id: string): Promise<void> {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("fuel").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
        throw error;
    }
}
export function calculateConsumption(previousMileage: number, currentMileage: number, liters: number): number {
    const distance = currentMileage - previousMileage;
    return distance > 0 ? distance / liters : 0;
}

export function getFuelTypeLabel(fuelType: string): string {
    const labels = {
        diesel: "Diesel S10",
        gasoline: "Gasolina",
        ethanol: "Etanol",
        cng: "GNV",
    };
    return labels[fuelType as keyof typeof labels] || fuelType;
}

export function getMaintenanceTypeLabel(maintenanceType: string): string {
    const labels = {
        preventive: "Preventiva",
        corrective: "Corretiva",
        emergency: "Emergencial",
        inspection: "Inspeção",
    };
    return labels[maintenanceType as keyof typeof labels] || maintenanceType;
}

export function isLicenseExpiring(expiryDate: string | null): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
}

export function isLicenseExpired(expiryDate: string | null): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return today > expiry;
}

export function getVehicleType(capacity: number): string {
    if (capacity <= 1500) return "Van";
    if (capacity <= 3500) return "Caminhão Pequeno";
    if (capacity <= 8000) return "Caminhão Baú";
    if (capacity <= 15000) return "Caminhão Refrigerado";
    return "Carreta";
}