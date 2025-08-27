export interface Client {
    id: string
    name: string
    document: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    status: string
    user_id: string
    created_at: string
    updated_at: string
}

export interface CreateClientData {
    name: string
    document: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    status: string
}