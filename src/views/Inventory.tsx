import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Icon } from '../icons'
import { eur, vehicles } from '../data'
import { listContainer, listItem } from '../animations'
import { Pill } from '../components/Pill'

const km = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' km'
const filters = ['Tous', 'Disponibles', 'Réservés', 'En préparation']

export function Inventory() {
  const total = vehicles.reduce((sum, v) => sum + v.price, 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f, i) => (
            <button
              key={f}
              className={cn(
                'rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors',
                i === 0
                  ? 'brand-gradient border-transparent text-white'
                  : 'bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
              {i === 0 && ` (${vehicles.length})`}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          Valeur du stock ·{' '}
          <strong className="text-foreground">{eur(total)}</strong>
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        {vehicles.map((v) => (
          <motion.div key={v.id} variants={listItem} whileHover={{ y: -6 }}>
            <Card className="gap-0 overflow-hidden py-0">
              <div className="from-secondary to-muted relative grid h-32 place-items-center bg-gradient-to-br">
                <Icon name="car" size={46} className="text-muted-foreground" />
                <div className="absolute top-3 right-3">
                  <Pill label={v.status} />
                </div>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold">
                    {v.make} {v.model}
                  </h3>
                  <span className="text-muted-foreground text-[13px] font-semibold">
                    {v.year}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground flex items-center gap-2 text-[13px]">
                    <Icon name="gauge" size={15} /> {km(v.mileage)}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-2 text-[13px]">
                    <Icon name="fuel" size={15} /> {v.fuel}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-2 text-[13px]">
                    <Icon name="clock" size={15} /> {v.days} j en stock
                  </span>
                </div>
                <div className="border-border flex items-center justify-between border-t pt-3">
                  <span className="text-lg font-bold tracking-tight">
                    {eur(v.price)}
                  </span>
                  <Button variant="ghost" size="sm">
                    Détails
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
