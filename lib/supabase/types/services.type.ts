// types/service.ts

export interface Service {
    id: string;
    service_code: string;
    collection_date: string;
    delivery_date: string | null;
    origin: string;
    destination: string;
    description: string;
    service_value: number;
    toll_cost: number;
    fuel_cost: number;
    other_costs: number;
    status: string;
    client_id: string;
    vehicle_id: string;
    driver_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    // Relations
    clients?: { name: string };
    vehicles?: { plate: string };
    employees?: { name: string };
}

export interface CreateServiceData {
    service_code: string;
    collection_date: string;
    delivery_date?: string;
    origin: string;
    destination: string;
    description: string;
    service_value: number;
    toll_cost: number;
    fuel_cost: number;
    other_costs: number;
    status: string;
    client_id: string;
    vehicle_id: string;
    driver_id: string;
}