"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase côté navigateur.
 * À utiliser dans les composants client (formulaires, interactions temps réel…).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
