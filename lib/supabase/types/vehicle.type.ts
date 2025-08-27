// types/vehicle.ts

export interface Vehicle {
    id: string;
    plate: string;
    renavam: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    chassis: string;
    capacity: number;
    mileage: number;
    fuel_type: string;
    status: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface CreateVehicleData {
    plate: string;
    renavam: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    chassis: string;
    capacity: number;
    mileage: number;
    fuel_type: string;
    status: string;
}