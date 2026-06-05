import { motion } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Icon } from '../icons'
import { nav, type ViewId } from '../data'

interface SidebarProps {
  active: ViewId
  onSelect: (id: ViewId) => void
  open: boolean
  onClose: () => void
}

export function Sidebar({ active, onSelect, open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/45 transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'bg-sidebar border-sidebar-border fixed top-0 left-0 z-50 flex h-screen w-[264px] flex-col border-r p-4 transition-transform md:sticky md:translate-x-0',
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 px-2 pb-5 pt-1">
          <span className="brand-gradient grid size-9 place-items-center rounded-xl text-white shadow-lg shadow-primary/30">
            <Icon name="steering" size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Drive<span className="text-primary">OS</span>
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          <p className="text-muted-foreground px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
            Pilotage
          </p>
          {nav.map((item) => {
            const isActive = item.id === active
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id)
                  onClose()
                }}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="bg-primary absolute -left-4 top-1/2 h-[22px] w-[3px] -translate-y-1/2 rounded-r"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon name={item.icon} size={19} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge className="size-5 justify-center rounded-md p-0 tabular-nums">
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        <div className="border-sidebar-border flex flex-col gap-2.5 border-t pt-3">
          <button
            onClick={() => {
              onSelect('settings')
              onClose()
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active === 'settings'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
            )}
          >
            <Icon name="settings" size={19} />
            <span className="flex-1 text-left">Paramètres</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="bg-secondary/60 hover:bg-secondary flex items-center gap-2.5 rounded-lg p-2 text-left outline-none transition-colors">
              <Avatar className="size-9">
                <AvatarFallback className="brand-gradient text-xs font-bold text-white">
                  MR
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <strong className="truncate text-[13px]">Maxence R.</strong>
                <span className="text-muted-foreground truncate text-xs">
                  Garage Alpine Auto
                </span>
              </div>
              <Icon name="settings" size={15} className="text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Équipe & rôles</DropdownMenuItem>
              <DropdownMenuItem>Facturation</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}
