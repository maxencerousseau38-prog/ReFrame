import type { Database, SiteContent } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Site = Database["public"]["Tables"]["sites"]["Row"];
export type SiteMessage = Database["public"]["Tables"]["site_messages"]["Row"];
export type ContactRequest = Database["public"]["Tables"]["contact_requests"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

export type { SiteContent };
export type {
  UserRole,
  SiteStatus,
  SubscriptionStatus,
} from "./database";

/** Résultat normalisé renvoyé par les Server Actions de formulaire. */
export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };
