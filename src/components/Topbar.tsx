import { motion } from 'framer-motion'
import { Icon } from '../icons'

interface TopbarProps {
  title: string
  subtitle: string
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onMenu: () => void
}

export function Topbar({ title, subtitle, theme, onToggleTheme, onMenu }: TopbarProps) {
  return (
    <header className="topbar">
      <button className="icon-btn ghost menu-btn" onClick={onMenu} aria-label="Menu">
        <Icon name="menu" />
      </button>

      <div className="topbar-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="search">
        <Icon name="search" size={18} />
        <input placeholder="Rechercher un véhicule, un client…" />
        <kbd>⌘K</kbd>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Changer de thème">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
        <button className="icon-btn notif" aria-label="Notifications">
          <Icon name="bell" />
          <span className="dot" />
        </button>
        <motion.button className="btn primary" whileTap={{ scale: 0.96 }}>
          <Icon name="plus" size={18} />
          <span>Nouvelle vente</span>
        </motion.button>
      </div>
    </header>
  )
}
