import type { WatchItem, Alert } from "./types";

// Default watchlist + intelligent alerts for the demo experience.
export const WATCHLIST: WatchItem[] = [
  {
    companyId: "nimbus-energy",
    scoreDelta: 4.2,
    alerts: [
      {
        id: "a1",
        type: "funding",
        title: "Série B finalisée — €42M",
        detail: "Tour mené par Eurazeo Growth, valorisation post-money €380M.",
        at: "Il y a 2 jours",
        tone: "positive",
      },
      {
        id: "a2",
        type: "score",
        title: "Investment Score™ +4,2 pts",
        detail: "Passage à l'EBITDA positif détecté sur le dernier exercice.",
        at: "Il y a 2 jours",
        tone: "positive",
      },
    ],
  },
  {
    companyId: "quanta-labs",
    scoreDelta: 7.5,
    alerts: [
      {
        id: "a3",
        type: "results",
        title: "Croissance revenue +140 %",
        detail: "Nouveaux contrats industriels CAC 40 signés ce trimestre.",
        at: "Il y a 5 jours",
        tone: "positive",
      },
      {
        id: "a4",
        type: "risk",
        title: "Runway sous 15 mois",
        detail: "Burn rate en hausse — surveiller le prochain tour de financement.",
        at: "Il y a 1 semaine",
        tone: "negative",
      },
    ],
  },
  {
    companyId: "lumen-retail",
    scoreDelta: -2.1,
    alerts: [
      {
        id: "a5",
        type: "risk",
        title: "Churn en hausse détecté",
        detail: "Signal de pression concurrentielle sur le segment retail.",
        at: "Il y a 3 jours",
        tone: "negative",
      },
    ],
  },
  {
    companyId: "veridian-pay",
    scoreDelta: 3.3,
    alerts: [
      {
        id: "a6",
        type: "results",
        title: "Volumes traités +58 %",
        detail: "Publication trimestrielle supérieure au consensus analystes.",
        at: "Il y a 4 jours",
        tone: "positive",
      },
    ],
  },
];

export const ALL_ALERTS: (Alert & { companyId: string })[] = WATCHLIST.flatMap(
  (w) => w.alerts.map((a) => ({ ...a, companyId: w.companyId })),
);
