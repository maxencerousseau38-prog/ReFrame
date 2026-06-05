import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '../icons'

interface PlaceholderProps {
  icon: IconName
  title: string
  text: string
}

export function Placeholder({ icon, title, text }: PlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
    >
      <Card className="items-center gap-3 px-6 py-16 text-center">
        <span className="bg-accent text-primary mb-1 grid size-18 place-items-center rounded-2xl">
          <Icon name={icon} size={32} />
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-sm text-sm">{text}</p>
        <Button className="mt-2">
          <Plus />
          Bientôt disponible
        </Button>
      </Card>
    </motion.div>
  )
}
