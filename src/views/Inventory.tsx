import { motion } from 'framer-motion'
import { Icon } from '../icons'
import { eur, vehicles } from '../data'
import { listContainer, listItem } from '../animations'
import { Pill } from '../components/Pill'

const km = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' km'

export function Inventory() {
  const total = vehicles.reduce((sum, v) => sum + v.price, 0)

  return (
    <div className="view">
      <div className="toolbar">
        <div className="chips">
          <button className="chip active">Tous ({vehicles.length})</button>
          <button className="chip">Disponibles</button>
          <button className="chip">Réservés</button>
          <button className="chip">En préparation</button>
        </div>
        <p className="muted">
          Valeur du stock · <strong className="strong">{eur(total)}</strong>
        </p>
      </div>

      <motion.div className="vehicle-grid" variants={listContainer} initial="initial" animate="animate">
        {vehicles.map((v) => (
          <motion.article key={v.id} className="card vehicle" variants={listItem} whileHover={{ y: -6 }}>
            <div className="vehicle-photo">
              <Icon name="car" size={46} />
              <Pill label={v.status} />
            </div>
            <div className="vehicle-body">
              <div className="vehicle-head">
                <h3>
                  {v.make} {v.model}
                </h3>
                <span className="year">{v.year}</span>
              </div>
              <div className="specs">
                <span>
                  <Icon name="gauge" size={15} /> {km(v.mileage)}
                </span>
                <span>
                  <Icon name="fuel" size={15} /> {v.fuel}
                </span>
                <span>
                  <Icon name="clock" size={15} /> {v.days} j en stock
                </span>
              </div>
              <div className="vehicle-foot">
                <span className="price">{eur(v.price)}</span>
                <button className="btn ghost sm">Détails</button>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </div>
  )
}
