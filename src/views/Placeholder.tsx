import { motion } from 'framer-motion'
import { Icon, type IconName } from '../icons'

interface PlaceholderProps {
  icon: IconName
  title: string
  text: string
}

export function Placeholder({ icon, title, text }: PlaceholderProps) {
  return (
    <div className="view">
      <motion.div
        className="card empty"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <span className="empty-icon">
          <Icon name={icon} size={32} />
        </span>
        <h3>{title}</h3>
        <p className="muted">{text}</p>
        <button className="btn primary">
          <Icon name="plus" size={16} />
          Bientôt disponible
        </button>
      </motion.div>
    </div>
  )
}
