/**
 * Types de la base de données Supabase.
 *
 * En production, régénérez ce fichier avec :
 *   supabase gen types typescript --linked > types/database.ts
 *
 * Il est maintenu à la main ici pour rester synchronisé avec
 * supabase/migrations/0001_init.sql sans dépendre d'une connexion.
 */

export type UserRole = "user" | "admin";
export type SiteStatus = "analyse" | "brouillon" | "en_ligne" | "hors_ligne";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "inactive";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          nom: string | null;
          entreprise: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: UserRole;
          nom?: string | null;
          entreprise?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      sites: {
        Row: {
          id: string;
          owner_id: string;
          url_origine: string | null;
          nom_domaine: string | null;
          statut: SiteStatus;
          contenu: SiteContent;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          url_origine?: string | null;
          nom_domaine?: string | null;
          statut?: SiteStatus;
          contenu?: SiteContent;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sites"]["Insert"]>;
        Relationships: [];
      };
      site_messages: {
        Row: {
          id: string;
          site_id: string;
          nom: string;
          email: string;
          message: string;
          lu: boolean;
          recu_le: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          nom: string;
          email: string;
          message: string;
          lu?: boolean;
          recu_le?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_messages"]["Insert"]>;
        Relationships: [];
      };
      contact_requests: {
        Row: {
          id: string;
          nom: string;
          email: string;
          message: string;
          traite: boolean;
          recu_le: string;
        };
        Insert: {
          id?: string;
          nom: string;
          email: string;
          message: string;
          traite?: boolean;
          recu_le?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_requests"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          statut: SubscriptionStatus;
          plan: string | null;
          periode_fin: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          statut?: SubscriptionStatus;
          plan?: string | null;
          periode_fin?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      site_status: SiteStatus;
      subscription_status: SubscriptionStatus;
    };
  };
}

/**
 * Structure typée du champ `contenu` (jsonb) d'un site.
 * Tous les champs sont optionnels : l'éditeur les remplit progressivement.
 */
export interface SiteContent {
  entreprise?: string;
  slogan?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  horaires?: string;
  promo?: string;
  apropos?: string;
  couleur?: string;
  photos?: string[];
}
