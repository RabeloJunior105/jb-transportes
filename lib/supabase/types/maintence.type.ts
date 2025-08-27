// types/vehicle.ts

// Interfaces de Manutenção
export interface Maintenance {
    id: string;
    vehicle_id: string;
    supplier_id: string | null;
    maintenance_type: string;
    description: string;
    cost: number;
    maintenance_date: string;
    next_maintenance_date: string | null;
    mileage: number;
    status: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    // Relações
    vehicles?: { plate: string; brand: string; model: string };
    suppliers?: { name: string };
}

export interface CreateMaintenanceData {
    vehicle_id: string;
    supplier_id?: string;
    maintenance_type: string;
    description: string;
    cost: number;
    maintenance_date: string;
    next_maintenance_date?: string;
    mileage: number;
    status: string;
}

// Interfaces de Combustível
export interface Fuel {
    id: string;
    vehicle_id: string;
    driver_id: string | null;
    supplier_id: string | null;
    fuel_type: string;
    liters: number;
    price_per_liter: number;
    total_cost: number;
    mileage: number;
    location: string;
    fuel_date: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    // Relações
    vehicles?: { plate: string; brand: string; model: string };
    employees?: { name: string };
    suppliers?: { name: string };
}

export interface CreateFuelData {
    vehicle_id: string;
    driver_id?: string;
    supplier_id?: string;
    fuel_type: string;
    liters: number;
    price_per_liter: number;
    total_cost: number;
    mileage: number;
    location: string;
    fuel_date: string;
}

export type FuelRecord = {
    id: string
    vehicle_id: string
    driver_id: string | null
    supplier_id: string | null
    fuel_type: string
    liters: number
    price_per_liter: number
    total_cost: number
    mileage: number
    location: string
    fuel_date: string
    user_id: string
    created_at: string
    updated_at: string
    vehicles?: { plate: string; brand: string; model: string }
    employees?: { name: string }
    suppliers?: { name: string }
}

