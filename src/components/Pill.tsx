import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const tone: Record<string, string> = {
  Disponible: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  Gagné: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  Électrique: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  Réservé: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'En préparation': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'En essai': 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  Négociation: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  Contacté: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  Hybride: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  Nouveau: 'bg-primary/12 text-primary',
}

export function Pill({ label }: { label: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn('rounded-full border-transparent', tone[label] ?? 'bg-muted text-muted-foreground')}
    >
      {label}
    </Badge>
  )
}
