import { motion } from 'framer-motion'
import { Icon } from '../icons'
import { eur, leads } from '../data'
import { listContainer, listItem } from '../animations'
import { Pill } from '../components/Pill'

export function Leads() {
  return (
    <div className="view">
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Tous les prospects</h3>
            <p className="muted">{leads.length} prospects actifs dans le pipeline</p>
          </div>
          <button className="btn primary sm">
            <Icon name="plus" size={16} />
            Ajouter
          </button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Véhicule visé</th>
                <th>Source</th>
                <th>Statut</th>
                <th className="num">Budget</th>
                <th>Suivi</th>
                <th />
              </tr>
            </thead>
            <motion.tbody variants={listContainer} initial="initial" animate="animate">
              {leads.map((l) => (
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
                  <td className="muted">{l.date}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn ghost sm" aria-label="Appeler">
                        <Icon name="phone" size={16} />
                      </button>
                      <button className="icon-btn ghost sm" aria-label="E-mail">
                        <Icon name="mail" size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
