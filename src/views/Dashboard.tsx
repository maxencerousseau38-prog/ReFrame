import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Icon } from '../icons'
import { appointments, eur, leads, revenueByMonth, stats } from '../data'
import { listContainer, listItem } from '../animations'
import { Pill } from '../components/Pill'

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')

export function Dashboard() {
  const max = Math.max(...revenueByMonth.map((m) => m.value))

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        {stats.map((s) => {
          const up = s.delta >= 0
          return (
            <motion.div key={s.id} variants={listItem} whileHover={{ y: -4 }}>
              <Card className="gap-0 py-5">
                <CardContent className="flex flex-col gap-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="bg-accent text-primary grid size-10 place-items-center rounded-xl">
                      <Icon name={s.icon} size={20} />
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'gap-1 rounded-md border-transparent font-bold',
                        up
                          ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                          : 'bg-destructive/12 text-destructive',
                      )}
                    >
                      {up ? <ArrowUpRight /> : <TrendingDown />}
                      {Math.abs(s.delta)} %
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-muted-foreground text-xs">{s.hint}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Chiffre d'affaires</CardTitle>
            <p className="text-muted-foreground text-[13px]">
              6 derniers mois · en milliers d'€
            </p>
            <Badge
              variant="secondary"
              className="ml-auto self-center border-transparent bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
            >
              +12,4 %
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-3.5 pt-2">
              {revenueByMonth.map((m, i) => (
                <div key={m.month} className="group flex h-full flex-1 flex-col items-center gap-2.5">
                  <div className="flex w-full flex-1 items-end justify-center">
                    <motion.div
                      className="from-primary relative w-3/5 max-w-[42px] rounded-t-lg bg-gradient-to-t to-violet-500"
                      initial={{ height: 0 }}
                      animate={{ height: `${(m.value / max) * 100}%` }}
                      transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 120, damping: 18 }}
                    >
                      <span className="text-muted-foreground absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100">
                        {m.value}
                      </span>
                    </motion.div>
                  </div>
                  <span className="text-muted-foreground text-xs font-medium">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous du jour</CardTitle>
            <p className="text-muted-foreground text-[13px]">
              {appointments.length} créneaux planifiés
            </p>
            <span className="bg-accent text-primary ml-auto grid size-9 place-items-center self-center rounded-lg">
              <CalendarDays className="size-[18px]" />
            </span>
          </CardHeader>
          <CardContent>
            <motion.ul variants={listContainer} initial="initial" animate="animate">
              {appointments.map((a, i) => (
                <motion.li
                  key={a.id}
                  variants={listItem}
                  className={cn(
                    'flex items-center gap-3.5 py-3',
                    i !== appointments.length - 1 && 'border-border border-b',
                  )}
                >
                  <span className="w-10 text-[13px] font-bold">{a.time}</span>
                  <span className="bg-primary ring-accent size-2.5 rounded-full ring-4" />
                  <div className="flex flex-col leading-snug">
                    <strong className="text-sm">{a.client}</strong>
                    <span className="text-muted-foreground text-[13px]">
                      {a.type} · {a.vehicle}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prospects récents</CardTitle>
          <p className="text-muted-foreground text-[13px]">Suivi du pipeline commercial</p>
          <Button variant="ghost" size="sm" className="ml-auto self-center">
            Tout voir
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
              </TableRow>
            </TableHeader>
            <motion.tbody variants={listContainer} initial="initial" animate="animate">
              {leads.slice(0, 5).map((l) => (
                <motion.tr
                  key={l.id}
                  variants={listItem}
                  className="hover:bg-muted/50 border-b transition-colors last:border-0"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5 font-medium">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-accent text-primary text-[11px] font-bold">
                          {initials(l.name)}
                        </AvatarFallback>
                      </Avatar>
                      {l.name}
                    </div>
                  </TableCell>
                  <TableCell>{l.vehicle}</TableCell>
                  <TableCell className="text-muted-foreground">{l.source}</TableCell>
                  <TableCell>
                    <Pill label={l.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {eur(l.value)}
                  </TableCell>
                </motion.tr>
              ))}
            </motion.tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
