"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import RecordForm from "@/components/RecordForm/form.record";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import {
  SERVICES_TABLE,
  servicesFormConfig,
  serviceSchema,
  serviceTypeHints,
  Service,
} from "../../config";

const Services = createCrudClient<Service, Partial<Service>>({
  table: SERVICES_TABLE,
  select: "*",
  defaultOrder: { column: "updated_at", ascending: false },
});

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function EditServicePage() {
  const params = useParams();
  const id = (Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id) as string | undefined;

  const sb = useMemo(() => createBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<Partial<Service> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id || !UUID_RE.test(id)) {
          toast.error("ID inválido.");
          setLoading(false);
          return;
        }

        const { data, error, status } = await sb
          .from("services")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error && status !== 406) throw error;
        if (!data) {
          toast.error("Serviço não encontrado.");
          setLoading(false);
          return;
        }

        setInitialValues(data as Service);
      } catch (err) {
        console.log(err);
        toast.error("Erro ao carregar dados do serviço.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, sb]);

  if (loading) return null;
  if (!initialValues) return null;

  return (
    <RecordForm
      config={servicesFormConfig as any}
      initialValues={initialValues}
      schema={serviceSchema}
      typeHints={serviceTypeHints}
      onSubmit={async (values) => {
        // não enviar campos de sistema no update
        delete (values as any).id;
        delete (values as any).user_id;
        delete (values as any).created_at;
        delete (values as any).updated_at;

        await Services.update((params as any).id as string, values as Partial<Service>);
      }}
      backHref="/dashboard/services"
    />
  );
}
