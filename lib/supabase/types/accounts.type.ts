// types/account.ts
export interface Account {
    id: string;
    type: 'payable' | 'receivable';
    description: string;
    amount: number;
    due_date: string;
    payment_date: string | null;
    payment_method: string | null;
    status: string;
    category: string;
    reference_number: string | null;
    notes: string | null;
    user_id: string;
    client_id: string | null;
    supplier_id: string | null;
    service_id: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    clients?: { name: string };
    suppliers?: { name: string };
    services?: { service_code: string };
}

export interface CreateAccountData {
    type: 'payable' | 'receivable';
    description: string;
    amount: number;
    due_date: string;
    payment_date?: string;
    payment_method?: string;
    status: string;
    category: string;
    reference_number?: string;
    notes?: string;
    client_id?: string;
    supplier_id?: string;
    service_id?: string;
}