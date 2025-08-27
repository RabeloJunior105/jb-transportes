-- Create fuel table
CREATE TABLE IF NOT EXISTS public.fuel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    fuel_date DATE NOT NULL,
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel', 'ethanol', 'cng')),
    liters DECIMAL(8,3) NOT NULL,
    price_per_liter DECIMAL(6,3) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    mileage DECIMAL(10,2),
    fuel_station TEXT,
    location TEXT,
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fuel ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own fuel records" ON public.fuel
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fuel records" ON public.fuel
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fuel records" ON public.fuel
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fuel records" ON public.fuel
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fuel_user_id ON public.fuel(user_id);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_id ON public.fuel(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_date ON public.fuel(fuel_date);
