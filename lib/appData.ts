export type ViewId =
  | "dashboard"
  | "prospects"
  | "stock"
  | "rdv"
  | "ventes"
  | "documents"
  | "analyses"
  | "parametres";

export type IconName =
  | "grid"
  | "users"
  | "car"
  | "calendar"
  | "trending"
  | "file"
  | "chart"
  | "settings";

export const NAV: { id: ViewId; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: "grid" },
  { id: "prospects", label: "Prospects", icon: "users" },
  { id: "stock", label: "Stock véhicules", icon: "car" },
  { id: "rdv", label: "Rendez-vous", icon: "calendar" },
  { id: "ventes", label: "Ventes", icon: "trending" },
  { id: "documents", label: "Documents", icon: "file" },
  { id: "analyses", label: "Analyses", icon: "chart" },
  { id: "parametres", label: "Paramètres", icon: "settings" },
];

export const META: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: { title: "Tableau de bord", subtitle: "Vue d’ensemble de votre activité" },
  prospects: { title: "Prospects", subtitle: "Gérez votre pipeline commercial" },
  stock: { title: "Stock véhicules", subtitle: "Votre parc disponible à la vente" },
  rdv: { title: "Rendez-vous", subtitle: "Essais, reprises et signatures" },
  ventes: { title: "Ventes", subtitle: "Suivi des transactions et marges" },
  documents: { title: "Documents", subtitle: "Contrats, factures et cartes grises" },
  analyses: { title: "Analyses", subtitle: "Performances et tendances du garage" },
  parametres: { title: "Paramètres", subtitle: "Configuration de votre espace" },
};

export type Kpi = {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delta: string;
};

export const KPIS: Kpi[] = [
  { label: "Prospects actifs", value: 24, delta: "+5 cette semaine" },
  { label: "Véhicules en stock", value: 18, delta: "+2 cette semaine" },
  { label: "Rendez-vous à venir", value: 7, delta: "3 aujourd’hui" },
  { label: "Chiffre d’affaires", value: 48, prefix: "€", suffix: "k", delta: "+12,4 %" },
];

export type Status = "Nouveau" | "En contact" | "Devis envoyé" | "Gagné";

export const PROSPECTS: {
  name: string;
  vehicle: string;
  status: Status;
  value: string;
  last: string;
}[] = [
  { name: "M. Dupont", vehicle: "Peugeot 308 GT", status: "Nouveau", value: "21 990 €", last: "Aujourd’hui" },
  { name: "Mme Leroy", vehicle: "Renault Clio V", status: "En contact", value: "15 490 €", last: "Hier" },
  { name: "M. Bernard", vehicle: "BMW Série 3", status: "Devis envoyé", value: "27 900 €", last: "Il y a 2 j" },
  { name: "Mme Petit", vehicle: "VW Golf 8", status: "Gagné", value: "24 500 €", last: "Il y a 3 j" },
  { name: "M. Moreau", vehicle: "Audi A3", status: "En contact", value: "23 200 €", last: "Il y a 4 j" },
  { name: "Mme Garcia", vehicle: "Toyota Yaris", status: "Nouveau", value: "16 800 €", last: "Il y a 5 j" },
  { name: "M. Lefèvre", vehicle: "Mercedes Classe A", status: "Devis envoyé", value: "31 400 €", last: "Il y a 6 j" },
];

export const VEHICLES: {
  name: string;
  year: string;
  km: string;
  fuel: string;
  price: string;
  status: "Disponible" | "Réservé" | "Vendu";
}[] = [
  { name: "Peugeot 308 GT", year: "2022", km: "28 400 km", fuel: "Diesel", price: "21 990 €", status: "Disponible" },
  { name: "Renault Clio V", year: "2021", km: "34 100 km", fuel: "Essence", price: "15 490 €", status: "Disponible" },
  { name: "BMW Série 3", year: "2020", km: "52 000 km", fuel: "Diesel", price: "27 900 €", status: "Réservé" },
  { name: "Volkswagen Golf 8", year: "2022", km: "19 800 km", fuel: "Hybride", price: "24 500 €", status: "Disponible" },
  { name: "Audi A3 Sportback", year: "2021", km: "41 200 km", fuel: "Essence", price: "23 200 €", status: "Disponible" },
  { name: "Toyota Yaris", year: "2023", km: "12 500 km", fuel: "Hybride", price: "16 800 €", status: "Disponible" },
  { name: "Mercedes Classe A", year: "2020", km: "58 700 km", fuel: "Diesel", price: "31 400 €", status: "Réservé" },
  { name: "Citroën C3", year: "2022", km: "22 900 km", fuel: "Essence", price: "14 700 €", status: "Vendu" },
];

export const ACTIVITY: { text: string; time: string }[] = [
  { text: "Nouveau prospect — M. Dupont (Peugeot 308 GT)", time: "Il y a 12 min" },
  { text: "Relance envoyée à Mme Leroy", time: "Il y a 1 h" },
  { text: "Devis accepté — Mme Petit (VW Golf 8)", time: "Il y a 3 h" },
  { text: "Véhicule ajouté au stock — Toyota Yaris", time: "Hier" },
  { text: "Rendez-vous planifié — essai Audi A3", time: "Hier" },
];

export const RDV: { client: string; time: string; type: string }[] = [
  { client: "Sophie Marchand", time: "09:30", type: "Essai — BMW Série 3" },
  { client: "Karim Bensaïd", time: "11:00", type: "Reprise véhicule" },
  { client: "Julie Caron", time: "14:15", type: "Signature — VW Golf 8" },
];
