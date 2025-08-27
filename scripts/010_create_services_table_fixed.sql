-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_code TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    collection_date DATE NOT NULL,
    entry_time TIME,
    exit_time TIME,
    description TEXT,
    origin_location TEXT NOT NULL,
    destination_location TEXT NOT NULL,
    service_value DECIMAL(10,2),
    toll_cost DECIMAL(10,2) DEFAULT 0,
    fuel_cost DECIMAL(10,2) DEFAULT 0,
    other_costs DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own services" ON public.services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services" ON public.services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" ON public.services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" ON public.services
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_collection_date ON public.services(collection_date);
