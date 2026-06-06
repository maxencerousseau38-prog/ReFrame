"use client";

/**
 * Lightweight client-side mock auth for the DriveOS app shell.
 * No backend yet — the session is stored in localStorage so the dashboard
 * is usable end-to-end and ready to be wired to a real API later.
 */

export type Plan = "STARTER" | "PRO" | "BUSINESS";
export type User = {
  name: string;
  email: string;
  espace: string;
  plan: Plan;
};

const KEY = "driveos_user";

function deriveName(email: string): string {
  const local = (email.split("@")[0] || "").trim();
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return name || "Utilisateur";
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function login(email: string): User {
  const user: User = {
    name: deriveName(email),
    email,
    espace: "DriveOS",
    plan: "STARTER",
  };
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(KEY);
}
