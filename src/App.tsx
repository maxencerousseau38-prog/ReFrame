import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Dashboard } from './views/Dashboard'
import { Inventory } from './views/Inventory'
import { Leads } from './views/Leads'
import { Placeholder } from './views/Placeholder'
import { pageVariants } from './animations'
import type { ViewId } from './data'
import './App.css'

const meta: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Tableau de bord', subtitle: 'Vue d’ensemble de votre activité' },
  leads: { title: 'Prospects', subtitle: 'Gérez votre pipeline commercial' },
  inventory: { title: 'Stock véhicules', subtitle: 'Votre parc disponible à la vente' },
  appointments: { title: 'Rendez-vous', subtitle: 'Essais, reprises et signatures' },
  sales: { title: 'Ventes', subtitle: 'Suivi des transactions et contrats' },
  documents: { title: 'Documents', subtitle: 'Contrats, factures et cartes grises' },
  analytics: { title: 'Analyses', subtitle: 'Performances et tendances du garage' },
  settings: { title: 'Paramètres', subtitle: 'Configuration de votre espace' },
}

function App() {
  const [view, setView] = useState<ViewId>('dashboard')
  const [navOpen, setNavOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />
      case 'inventory':
        return <Inventory />
      case 'leads':
        return <Leads />
      case 'appointments':
        return <Placeholder icon="calendar" title="Agenda des rendez-vous" text="Planifiez essais, reprises et signatures au même endroit." />
      case 'sales':
        return <Placeholder icon="sales" title="Suivi des ventes" text="Retrouvez ici vos contrats, marges et objectifs mensuels." />
      case 'documents':
        return <Placeholder icon="documents" title="Coffre documentaire" text="Centralisez contrats, factures et cartes grises." />
      case 'analytics':
        return <Placeholder icon="analytics" title="Analyses avancées" text="Mesurez vos performances commerciales en temps réel." />
      case 'settings':
        return <Placeholder icon="settings" title="Paramètres" text="Personnalisez votre espace DriveOS et votre équipe." />
    }
  }

  return (
    <div className="app">
      <Sidebar active={view} onSelect={setView} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="main">
        <Topbar
          title={meta[view].title}
          subtitle={meta[view].subtitle}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          onMenu={() => setNavOpen(true)}
        />
        <main className="content">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App
