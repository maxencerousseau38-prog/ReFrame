import type { IconName } from "@/lib/appData";

const PATHS: Record<IconName | "search" | "logout" | "menu" | "bell" | "close" | "plus", string> = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z",
  users: "M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5.5 19a3 3 0 0 1 4-2.8M18.5 19a3 3 0 0 0-4-2.8",
  car: "M5 11l1.5-4.5h11L19 11M4 16h16M5 16v2M19 16v2M4 11h16v5H4zM7.5 13.5h.01M16.5 13.5h.01",
  calendar: "M4 6h16v14H4zM4 9h16M8 4v3M16 4v3",
  trending: "M3 17l6-6 4 4 7-7M21 8h-5M21 8v5",
  file: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
  chart: "M4 20h16M7 20v-6M12 20V8M17 20v-9",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7.3 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3 12.6a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 7.3a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51",
  search: "M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z",
  logout: "M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
  menu: "M4 7h16M4 12h16M4 17h16",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
};

export function Icon({
  name,
  className = "",
  size = 18,
}: {
  name: keyof typeof PATHS;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
