import type { IconName } from './icons'

export type ViewId =
  | 'dashboard'
  | 'leads'
  | 'inventory'
  | 'appointments'
  | 'sales'
  | 'documents'
  | 'analytics'
  | 'settings'

export interface NavItem {
  id: ViewId
  label: string
  icon: IconName
  badge?: number
}

export const nav: NavItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { id: 'leads', label: 'Prospects', icon: 'leads', badge: 4 },
  { id: 'inventory', label: 'Stock véhicules', icon: 'car' },
  { id: 'appointments', label: 'Rendez-vous', icon: 'calendar', badge: 2 },
  { id: 'sales', label: 'Ventes', icon: 'sales' },
  { id: 'documents', label: 'Documents', icon: 'documents' },
  { id: 'analytics', label: 'Analyses', icon: 'analytics' },
]

export const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)

export interface Stat {
  id: string
  label: string
  value: string
  delta: number
  icon: IconName
  hint: string
}

export const stats: Stat[] = [
  {
    id: 'revenue',
    label: "Chiffre d'affaires",
    value: eur(284500),
    delta: 12.4,
    icon: 'sales',
    hint: 'ce mois-ci',
  },
  {
    id: 'sold',
    label: 'Véhicules vendus',
    value: '37',
    delta: 8.1,
    icon: 'car',
    hint: 'ce mois-ci',
  },
  {
    id: 'leads',
    label: 'Nouveaux prospects',
    value: '128',
    delta: 23.5,
    icon: 'leads',
    hint: '30 derniers jours',
  },
  {
    id: 'conversion',
    label: 'Taux de conversion',
    value: '28,9 %',
    delta: -2.3,
    icon: 'analytics',
    hint: 'vs mois dernier',
  },
]

export const revenueByMonth = [
  { month: 'Jan', value: 162 },
  { month: 'Fév', value: 198 },
  { month: 'Mar', value: 175 },
  { month: 'Avr', value: 224 },
  { month: 'Mai', value: 210 },
  { month: 'Juin', value: 285 },
]

export type LeadStatus = 'Nouveau' | 'Contacté' | 'En essai' | 'Négociation' | 'Gagné'

export interface Lead {
  id: number
  name: string
  vehicle: string
  source: string
  status: LeadStatus
  value: number
  date: string
}

export const leads: Lead[] = [
  { id: 1, name: 'Camille Bernard', vehicle: 'Peugeot 3008 GT', source: 'LeBonCoin', status: 'Négociation', value: 32900, date: 'Aujourd’hui' },
  { id: 2, name: 'Thomas Lefèvre', vehicle: 'Renault Clio V', source: 'Site web', status: 'Nouveau', value: 18500, date: 'Aujourd’hui' },
  { id: 3, name: 'Sophie Marchand', vehicle: 'BMW Série 1', source: 'Référence', status: 'En essai', value: 27400, date: 'Hier' },
  { id: 4, name: 'Lucas Petit', vehicle: 'Volkswagen Golf 8', source: 'AutoScout24', status: 'Contacté', value: 24900, date: 'Hier' },
  { id: 5, name: 'Inès Moreau', vehicle: 'Tesla Model 3', source: 'Instagram', status: 'Gagné', value: 39900, date: '2 j' },
  { id: 6, name: 'Hugo Garnier', vehicle: 'Audi A3 Sportback', source: 'Site web', status: 'Nouveau', value: 29900, date: '3 j' },
  { id: 7, name: 'Léa Dubois', vehicle: 'Dacia Sandero', source: 'LeBonCoin', status: 'Négociation', value: 14200, date: '3 j' },
]

export type FuelType = 'Essence' | 'Diesel' | 'Hybride' | 'Électrique'

export interface Vehicle {
  id: number
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuel: FuelType
  status: 'Disponible' | 'Réservé' | 'En préparation'
  days: number
}

export const vehicles: Vehicle[] = [
  { id: 1, make: 'Peugeot', model: '3008 GT', year: 2022, price: 32900, mileage: 28400, fuel: 'Diesel', status: 'Disponible', days: 12 },
  { id: 2, make: 'Tesla', model: 'Model 3 LR', year: 2023, price: 39900, mileage: 15200, fuel: 'Électrique', status: 'Réservé', days: 5 },
  { id: 3, make: 'Renault', model: 'Clio V', year: 2021, price: 18500, mileage: 42100, fuel: 'Essence', status: 'Disponible', days: 23 },
  { id: 4, make: 'BMW', model: 'Série 1 118i', year: 2022, price: 27400, mileage: 31800, fuel: 'Essence', status: 'En préparation', days: 3 },
  { id: 5, make: 'Volkswagen', model: 'Golf 8', year: 2021, price: 24900, mileage: 38600, fuel: 'Diesel', status: 'Disponible', days: 17 },
  { id: 6, make: 'Toyota', model: 'Yaris Hybride', year: 2023, price: 21900, mileage: 12400, fuel: 'Hybride', status: 'Disponible', days: 8 },
  { id: 7, make: 'Audi', model: 'A3 Sportback', year: 2022, price: 29900, mileage: 26700, fuel: 'Essence', status: 'Réservé', days: 6 },
  { id: 8, make: 'Dacia', model: 'Sandero Stepway', year: 2023, price: 14200, mileage: 9800, fuel: 'Essence', status: 'Disponible', days: 30 },
]

export interface Appointment {
  id: number
  time: string
  client: string
  type: string
  vehicle: string
}

export const appointments: Appointment[] = [
  { id: 1, time: '09:30', client: 'Camille Bernard', type: 'Essai', vehicle: 'Peugeot 3008 GT' },
  { id: 2, time: '11:00', client: 'Lucas Petit', type: 'Reprise', vehicle: 'Volkswagen Golf 8' },
  { id: 3, time: '14:15', client: 'Sophie Marchand', type: 'Signature', vehicle: 'BMW Série 1' },
  { id: 4, time: '16:45', client: 'Hugo Garnier', type: 'Découverte', vehicle: 'Audi A3 Sportback' },
]
