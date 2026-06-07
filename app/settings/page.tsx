import { Settings, User, Bell, CreditCard, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";

export default function SettingsPage() {
  return (
    <AppShell title="Paramètres">
      <Reveal>
        <div className="mb-6">
          <p className="eyebrow flex items-center gap-1.5">
            <Settings className="h-3.5 w-3.5 text-accent-soft" />
            Compte
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Paramètres
          </h1>
        </div>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Panel title="Profil" icon={User}>
            <div className="space-y-3">
              <Row label="Nom" value="Maxence Rousseau" />
              <Row label="Email" value="maxence.rousseau@icloud.com" />
              <Row label="Société" value="Valoryx Capital" />
            </div>
          </Panel>
        </Reveal>
        <Reveal delay={0.05}>
          <Panel title="Abonnement" icon={CreditCard}>
            <div className="space-y-3">
              <Row label="Plan actuel" value="Pro · 99€/mois" />
              <Row label="Analyses utilisées" value="47 / 100" />
              <Row label="Prochaine facture" value="1 juillet 2026" />
            </div>
          </Panel>
        </Reveal>
        <Reveal delay={0.1}>
          <Panel title="Notifications" icon={Bell}>
            <div className="space-y-3">
              <Toggle label="Alertes financements" on />
              <Toggle label="Variations de score" on />
              <Toggle label="Résumé hebdomadaire" on />
              <Toggle label="Risques détectés" on />
            </div>
          </Panel>
        </Reveal>
        <Reveal delay={0.15}>
          <Panel title="Sécurité" icon={Shield}>
            <div className="space-y-3">
              <Row label="Authentification 2FA" value="Activée" />
              <Row label="Dernière connexion" value="Aujourd'hui · Paris" />
              <Row label="Sessions actives" value="2 appareils" />
            </div>
          </Panel>
        </Reveal>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs text-mist-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-mist-200">{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-accent" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </div>
  );
}
