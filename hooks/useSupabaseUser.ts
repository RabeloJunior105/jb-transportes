"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export function useSupabaseUser() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<null | {
        id: string;
        email: string | null;
        name?: string | null;
        role?: string | null;
        avatar_url?: string | null;
        raw?: any;
    }>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const { data } = await supabase.auth.getUser();
            if (!mounted) return;
            const u = data.user;
            setUser(
                u
                    ? {
                        id: u.id,
                        email: u.email ?? null,
                        name:
                            (u.user_metadata?.name as string | undefined) ??
                            (u.user_metadata?.full_name as string | undefined) ??
                            null,
                        role: (u.app_metadata?.role as string | undefined) ?? null,
                        avatar_url:
                            (u.user_metadata?.avatar_url as string | undefined) ?? null,
                        raw: u,
                    }
                    : null
            );
            setLoading(false);
        })();

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(
                session?.user
                    ? {
                        id: session.user.id,
                        email: session.user.email ?? null,
                        name:
                            (session.user.user_metadata?.name as string | undefined) ??
                            (session.user.user_metadata?.full_name as string | undefined) ??
                            null,
                        role: (session.user.app_metadata?.role as string | undefined) ?? null,
                        avatar_url:
                            (session.user.user_metadata?.avatar_url as string | undefined) ??
                            null,
                        raw: session.user,
                    }
                    : null
            );
        });

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    return { user, loading, supabase };
}
