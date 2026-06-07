import { AppShell } from "@/components/layout/AppShell";
import { AnalyzeFlow } from "@/components/app/AnalyzeFlow";

export default function AnalyzePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <AppShell title="Nouvelle analyse">
      <div className="py-6">
        <AnalyzeFlow initialQuery={searchParams.q ?? ""} />
      </div>
    </AppShell>
  );
}
