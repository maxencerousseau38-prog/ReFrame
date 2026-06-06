"use client";

import { Icon } from "./icons";
import type { IconName } from "@/lib/appData";

export function PlaceholderView({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-beige-light text-ink">
          <Icon name={icon} size={26} />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
        <span className="mt-5 inline-flex rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted">
          Bientôt disponible
        </span>
      </div>
    </div>
  );
}
