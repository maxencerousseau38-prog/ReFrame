import {
  Sparkles,
  Gauge,
  ShieldCheck,
  PenLine,
  Inbox,
  RefreshCw,
  Globe,
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  MailQuestion,
  type LucideIcon,
} from "lucide-react";

/** Mappe un nom d'icône (string) vers le composant lucide correspondant. */
const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Gauge,
  ShieldCheck,
  PenLine,
  Inbox,
  RefreshCw,
  Globe,
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  MailQuestion,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={className} />;
}
