"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

let supabaseBrowserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
    );
  }

  return supabaseBrowserClient;
}
