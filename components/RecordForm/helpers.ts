import { FormErrors } from "./types";

export const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function clsx(...parts: Array<string | false | undefined>) {
    return parts.filter(Boolean).join(" ");
}

export function safeToIso(input: string): string | undefined {
    const s = input.trim();
    if (!s) return undefined;

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const d = new Date(`${s}T00:00:00Z`);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
    }

    // normaliza " " -> "T"
    let normalized = s.replace(" ", "T");
    // adiciona Z se não houver timezone explícito
    if (!/[zZ]|[+\-]\d{2}:?\d{2}$/.test(normalized)) normalized += "Z";

    const d = new Date(normalized);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function parseTypes(
    raw: Record<string, FormDataEntryValue>,
    typeHints?: Record<string, "number" | "date" | "string" | "boolean" | "uuid">
) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
        const hint = typeHints?.[k];
        const str = typeof v === "string" ? v : String(v);
        const trimmed = str.trim();

        if (hint === "number") {
            out[k] = trimmed === "" ? undefined : Number(trimmed);
            continue;
        }
        if (hint === "date") {
            out[k] = trimmed === "" ? undefined : safeToIso(trimmed) ?? undefined;
            continue;
        }
        if (hint === "boolean") {
            out[k] =
                trimmed === "true" || trimmed === "on"
                    ? true
                    : trimmed === "false"
                        ? false
                        : Boolean(trimmed);
            continue;
        }
        if (hint === "uuid") {
            out[k] = trimmed === "" ? undefined : UUID_RE.test(trimmed) ? trimmed : undefined;
            continue;
        }

        out[k] = str; // default string
    }
    return out;
}

export function zodErrorsToMap(err: any): FormErrors {
    const map: FormErrors = {};
    if (err?.issues) {
        for (const issue of err.issues) {
            const key = issue.path?.[0];
            const msg = issue.message;
            if (typeof key === "string") map[key] = msg;
        }
    }
    return map;
}

// hook debounce simples
import { useEffect, useState } from "react";
export function useDebounced<T>(value: T, delay = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}
