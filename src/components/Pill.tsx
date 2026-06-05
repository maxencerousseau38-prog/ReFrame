const tone: Record<string, string> = {
  Disponible: 'ok',
  Gagné: 'ok',
  Réservé: 'warn',
  'En essai': 'info',
  Négociation: 'info',
  Contacté: 'info',
  'En préparation': 'warn',
  Nouveau: 'accent',
  Électrique: 'ok',
  Hybride: 'info',
  Diesel: 'muted',
  Essence: 'muted',
}

export function Pill({ label }: { label: string }) {
  return <span className={`pill ${tone[label] ?? 'muted'}`}>{label}</span>
}
