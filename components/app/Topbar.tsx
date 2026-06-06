"use client";

import { Icon } from "./icons";

export function Topbar({
  title,
  subtitle,
  onMenu,
}: {
  title: string;
  subtitle: string;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/80 px-4 backdrop-blur-xl md:px-8">
      <button
        onClick={onMenu}
        aria-label="Ouvrir le menu"
        className="grid h-9 w-9 place-items-center rounded-lg text-ink hover:bg-white md:hidden"
      >
        <Icon name="menu" size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="hidden truncate text-xs text-muted sm:block">{subtitle}</p>
      </div>

      <div className="hidden items-center rounded-full border border-line bg-white px-3 py-1.5 text-sm text-muted md:flex">
        <Icon name="search" size={16} />
        <input
          placeholder="Rechercher…"
          className="ml-2 w-40 bg-transparent outline-none placeholder:text-muted"
        />
      </div>

      <button
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-white hover:text-ink"
      >
        <Icon name="bell" size={18} />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ink" />
      </button>
    </header>
  );
}
