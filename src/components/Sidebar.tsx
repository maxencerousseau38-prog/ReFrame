import { motion } from 'framer-motion'
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
        className={`sidebar-scrim ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <Icon name="steering" size={22} />
          </span>
          <span className="brand-name">
            Drive<span>OS</span>
          </span>
        </div>

        <nav className="nav">
          <p className="nav-section">Pilotage</p>
          {nav.map((item) => {
            const isActive = item.id === active
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelect(item.id)
                  onClose()
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="nav-indicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon name={item.icon} size={19} />
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <button
            className={`nav-item ${active === 'settings' ? 'active' : ''}`}
            onClick={() => {
              onSelect('settings')
              onClose()
            }}
          >
            <Icon name="settings" size={19} />
            <span className="nav-label">Paramètres</span>
          </button>

          <div className="user-card">
            <span className="avatar">MR</span>
            <div className="user-meta">
              <strong>Maxence R.</strong>
              <span>Garage Alpine Auto</span>
            </div>
            <button className="icon-btn ghost" aria-label="Se déconnecter">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
