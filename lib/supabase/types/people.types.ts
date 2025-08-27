// types/people.ts

// Employee interfaces
export interface Employee {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  position: string;
  salary: number;
  hire_date: string;
  license_number: string | null;
  license_category: string | null;
  license_expiry: string | null;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeData {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  position: string;
  salary: number;
  hire_date: string;
  license_number?: string;
  license_category?: string;
  license_expiry?: string;
  status: string;
  user_id?: string;
}

// Client interfaces
export interface Client {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: string;
}

// Supplier interfaces
export interface Supplier {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  category: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierData {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  category: string;
  status: string;
}