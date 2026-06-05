import { motion } from 'framer-motion'
import { Icon } from '../icons'
import {
  appointments,
  eur,
  leads,
  revenueByMonth,
  stats,
} from '../data'
import { listContainer, listItem } from '../animations'
import { Pill } from '../components/Pill'

export function Dashboard() {
  const max = Math.max(...revenueByMonth.map((m) => m.value))

  return (
    <div className="view">
      <motion.div className="stat-grid" variants={listContainer} initial="initial" animate="animate">
        {stats.map((s) => {
          const up = s.delta >= 0
          return (
            <motion.div key={s.id} className="card stat" variants={listItem} whileHover={{ y: -4 }}>
              <div className="stat-top">
                <span className="stat-icon">
                  <Icon name={s.icon} size={20} />
                </span>
                <span className={`trend ${up ? 'up' : 'down'}`}>
                  <Icon name={up ? 'arrowUp' : 'trendingDown'} size={14} />
                  {Math.abs(s.delta)} %
                </span>
              </div>
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
              <p className="stat-hint">{s.hint}</p>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid-2">
        <div className="card chart-card">
          <div className="card-head">
            <div>
              <h3>Chiffre d'affaires</h3>
              <p className="muted">6 derniers mois · en milliers d'€</p>
            </div>
            <span className="pill ok">+12,4 %</span>
          </div>
          <div className="chart">
            {revenueByMonth.map((m, i) => (
              <div className="bar-col" key={m.month}>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.value / max) * 100}%` }}
                    transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 120, damping: 18 }}
                  >
                    <span className="bar-tip">{m.value}</span>
                  </motion.div>
                </div>
                <span className="bar-label">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3>Rendez-vous du jour</h3>
              <p className="muted">{appointments.length} créneaux planifiés</p>
            </div>
            <span className="icon-chip">
              <Icon name="calendar" size={18} />
            </span>
          </div>
          <motion.ul className="timeline" variants={listContainer} initial="initial" animate="animate">
            {appointments.map((a) => (
              <motion.li key={a.id} variants={listItem}>
                <span className="time">{a.time}</span>
                <span className="dot-line" />
                <div className="appt-meta">
                  <strong>{a.client}</strong>
                  <span className="muted">
                    {a.type} · {a.vehicle}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Prospects récents</h3>
            <p className="muted">Suivi du pipeline commercial</p>
          </div>
          <button className="btn ghost sm">Tout voir</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Véhicule</th>
                <th>Source</th>
                <th>Statut</th>
                <th className="num">Valeur</th>
              </tr>
            </thead>
            <motion.tbody variants={listContainer} initial="initial" animate="animate">
              {leads.slice(0, 5).map((l) => (
                <motion.tr key={l.id} variants={listItem}>
                  <td>
                    <div className="cell-user">
                      <span className="avatar sm">
                        {l.name.split(' ').map((p) => p[0]).join('')}
                      </span>
                      {l.name}
                    </div>
                  </td>
                  <td>{l.vehicle}</td>
                  <td className="muted">{l.source}</td>
                  <td>
                    <Pill label={l.status} />
                  </td>
                  <td className="num">{eur(l.value)}</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
