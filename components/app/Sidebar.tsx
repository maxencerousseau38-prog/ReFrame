"use client";

import { NAV, type ViewId } from "@/lib/appData";
import type { User } from "@/lib/auth";
import { Icon } from "./icons";

export function Sidebar({
  active,
  onSelect,
  user,
  open,
  onClose,
  onLogout,
}: {
  active: ViewId;
  onSelect: (v: ViewId) => void;
  user: User;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform duration-300 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand + espace */}
        <div className="border-b border-line p-4">
          <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tightest text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-paper">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M3 13.5 5 7h14l2 6.5M5.5 17.5h.01M18.5 17.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 13.5h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>
            DriveOS
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-paper px-3 py-2">
            <span className="text-xs text-muted">Espace</span>
            <span className="text-xs font-medium text-ink">{user.espace}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-ink/[0.06] font-medium text-ink"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-beige text-sm font-semibold text-ink">
              {user.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-ink">
                {user.name}
              </div>
              <div className="text-xs text-muted">Plan {user.plan}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <Icon name="logout" />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
