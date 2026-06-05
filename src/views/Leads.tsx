import { motion } from 'framer-motion'
import { Mail, Phone, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { eur, leads } from '../data'
import { listContainer, listItem } from '../animations'
import { Pill } from '../components/Pill'

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')

export function Leads() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tous les prospects</CardTitle>
        <p className="text-muted-foreground text-[13px]">
          {leads.length} prospects actifs dans le pipeline
        </p>
        <Button size="sm" className="ml-auto self-center">
          <Plus />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Véhicule visé</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead>Suivi</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <motion.tbody variants={listContainer} initial="initial" animate="animate">
            {leads.map((l) => (
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
                <TableCell className="text-muted-foreground">{l.date}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Appeler">
                      <Phone />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8" aria-label="E-mail">
                      <Mail />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </motion.tbody>
        </Table>
      </CardContent>
    </Card>
  )
}
