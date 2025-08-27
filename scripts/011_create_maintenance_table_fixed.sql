-- Create maintenance table
CREATE TABLE IF NOT EXISTS public.maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency')),
    description TEXT NOT NULL,
    service_date DATE NOT NULL,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    mileage_at_service DECIMAL(10,2),
    next_maintenance_date DATE,
    next_maintenance_mileage DECIMAL(10,2),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own maintenance" ON public.maintenance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maintenance" ON public.maintenance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance" ON public.maintenance
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance" ON public.maintenance
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON public.maintenance(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON public.maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_service_date ON public.maintenance(service_date);
