import { motion } from 'framer-motion'
import { Bell, Menu, Moon, Plus, Search, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TopbarProps {
  title: string
  subtitle: string
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onMenu: () => void
}

export function Topbar({ title, subtitle, theme, onToggleTheme, onMenu }: TopbarProps) {
  return (
    <header className="bg-background/80 border-border sticky top-0 z-20 flex items-center gap-4 border-b px-5 py-3 backdrop-blur-md md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenu}
        aria-label="Menu"
      >
        <Menu />
      </Button>

      <div className="hidden md:block">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-[13px]">{subtitle}</p>
      </div>

      <div className="relative ml-auto hidden w-full max-w-xs items-center sm:flex">
        <Search className="text-muted-foreground absolute left-3 size-4" />
        <Input
          placeholder="Rechercher un véhicule, un client…"
          className="bg-card pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleTheme}
          aria-label="Changer de thème"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
          <Bell />
          <span className="bg-destructive border-background absolute right-2 top-2 size-2 rounded-full border-2" />
        </Button>
        <Button asChild className="shadow-lg shadow-primary/25">
          <motion.button whileTap={{ scale: 0.96 }}>
            <Plus />
            <span className="hidden sm:inline">Nouvelle vente</span>
          </motion.button>
        </Button>
      </div>
    </header>
  )
}
