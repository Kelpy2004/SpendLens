export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      stored_audits: {
        Row: {
          id: string;
          audit_id: string;
          email: string;
          input_stack: Json;
          output_result: Json;
          pricing_snapshot: Json;
          pricing_version: string;
          created_at: string;
          notified_at: string | null;
        };
        Insert: {
          id?: string;
          audit_id: string;
          email: string;
          input_stack: Json;
          output_result: Json;
          pricing_snapshot: Json;
          pricing_version: string;
          created_at?: string;
          notified_at?: string | null;
        };
        Update: {
          id?: string;
          audit_id?: string;
          email?: string;
          input_stack?: Json;
          output_result?: Json;
          pricing_snapshot?: Json;
          pricing_version?: string;
          created_at?: string;
          notified_at?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          annual_savings: number;
          audit_id: string;
          company_name: string | null;
          created_at: string;
          email: string;
          email_delivery_status: "not_attempted" | "sent" | "skipped" | "failed";
          id: string;
          monthly_savings: number;
          primary_use_case: string;
          resend_email_id: string | null;
          role: string | null;
          source_url: string | null;
          team_size: number | null;
          user_agent: string | null;
        };
        Insert: {
          annual_savings?: number;
          audit_id: string;
          company_name?: string | null;
          created_at?: string;
          email: string;
          email_delivery_status?: "not_attempted" | "sent" | "skipped" | "failed";
          id?: string;
          monthly_savings?: number;
          primary_use_case: string;
          resend_email_id?: string | null;
          role?: string | null;
          source_url?: string | null;
          team_size?: number | null;
          user_agent?: string | null;
        };
        Update: {
          annual_savings?: number;
          audit_id?: string;
          company_name?: string | null;
          created_at?: string;
          email?: string;
          email_delivery_status?: "not_attempted" | "sent" | "skipped" | "failed";
          id?: string;
          monthly_savings?: number;
          primary_use_case?: string;
          resend_email_id?: string | null;
          role?: string | null;
          source_url?: string | null;
          team_size?: number | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
