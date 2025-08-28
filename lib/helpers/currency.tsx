import { Link } from "lucide-react";

export function VehicleCell({ row }: { row: any }) {
  const v = row.vehicle;
  if (!v) return <span>—</span>;

  const brandModel = [v.brand, v.model].filter(Boolean).join(" ");
  return (
    <Link href={`/dashboard/fleet/vehicles/${v.id}`} className="block hover:underline">
      <div className="font-medium">
        {brandModel || v.plate /* fallback: se não tiver brand/model, mostra placa aqui */}
      </div>
      <div className="text-xs text-muted-foreground tracking-wide">
        {v.plate}
      </div>
    </Link>
  );
}

export function AmountsCell({
  row,
  currency,
}: {
  row: any;
  currency: Intl.NumberFormat;
}) {
  const liters = Number(row.liters ?? 0);
  const ppl = Number(row.price_per_liter ?? 0);
  const total = Number(row.total_cost ?? liters * ppl);

  return (
    <div className="leading-tight">
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">{liters.toLocaleString("pt-BR")} L</span>
        <span className="px-1">•</span>
        <span>{currency.format(ppl)}/L</span>
      </div>
      <div className="font-semibold">{currency.format(total)}</div>
    </div>
  );
}
