import type { Company } from "./types";
import { computeInvestmentScore, verdictFromScore } from "./scoring";

// ─────────────────────────────────────────────────────────────────────────────
// Mock intelligence layer.
// In production these objects are produced by the Valoryx analysis pipeline
// (SIREN/INPI ingestion → financial normalization → LLM reasoning → scoring).
// For the MVP they are deterministic fixtures so every screen renders richly.
// ─────────────────────────────────────────────────────────────────────────────

function finalize(c: Omit<Company, "score" | "verdict">): Company {
  const score = computeInvestmentScore(c.criteria);
  return { ...c, score, verdict: verdictFromScore(score) };
}

const RAW: Omit<Company, "score" | "verdict">[] = [
  {
    id: "nimbus-energy",
    name: "Nimbus Energy",
    logo: "◈",
    sector: "Climate Tech · Énergie",
    location: "Lyon, France",
    website: "nimbusenergy.io",
    siren: "894 512 207",
    founded: 2018,
    headcount: 240,
    stage: "Private",
    tagline:
      "Plateforme de pilotage énergétique des bâtiments tertiaires par IA.",
    trend: 4.2,
    summary: {
      whatToKnow:
        "Nimbus opère une plateforme SaaS de pilotage énergétique déployée sur 3 400 bâtiments tertiaires. Le modèle combine un abonnement récurrent et une commission sur les économies d'énergie générées, avec une rétention nette de 128 %.",
      whyInvest: [
        "Croissance ARR de +71 % sur 12 mois avec une rétention nette > 125 %.",
        "Marge brute de 79 % et passage à l'EBITDA positif au dernier exercice.",
        "Régulation européenne (CSRD, décret tertiaire) qui agit comme un vent porteur structurel.",
      ],
      whyNot: [
        "Dépendance à un canal d'acquisition (grands comptes immobiliers).",
        "Cycle de vente long (6–9 mois) qui pèse sur la prévisibilité trimestrielle.",
      ],
      keyRisk:
        "Concentration : les 10 premiers clients représentent 41 % de l'ARR.",
      upside:
        "Potentiel x3–x4 de la valorisation à horizon 4 ans si l'expansion DACH se confirme au rythme actuel.",
    },
    criteria: [
      {
        key: "growth",
        label: "Croissance",
        score: 88,
        summary:
          "Croissance ARR soutenue et accélérée par l'expansion géographique et l'upsell.",
        strengths: [
          "ARR +71 % en glissement annuel",
          "Net Revenue Retention de 128 %",
          "Pipeline commercial couvrant 2,3x l'objectif annuel",
        ],
        weaknesses: ["Croissance encore concentrée sur le marché français"],
      },
      {
        key: "profitability",
        label: "Rentabilité",
        score: 74,
        summary:
          "Marges brutes élevées et bascule récente vers un EBITDA positif.",
        strengths: ["Marge brute 79 %", "EBITDA positif au S2", "Magic number 1,3"],
        weaknesses: ["Résultat net encore légèrement négatif"],
      },
      {
        key: "financial-strength",
        label: "Solidité financière",
        score: 80,
        summary:
          "Trésorerie confortable après la Série B, endettement maîtrisé.",
        strengths: ["28 mois de runway", "Dette nette négative"],
        weaknesses: ["Burn encore élevé sur le S&M"],
      },
      {
        key: "market-position",
        label: "Position marché",
        score: 78,
        summary:
          "Top 3 européen sur un marché tiré par la réglementation climatique.",
        strengths: ["Marché adressable €14 Md", "Avance technologique IA"],
        weaknesses: ["Concurrence de suites ESG généralistes"],
      },
      {
        key: "scalability",
        label: "Scalabilité",
        score: 83,
        summary: "Architecture SaaS multi-tenant, coût marginal très faible.",
        strengths: ["Onboarding self-serve pour le mid-market", "Marge incrémentale 88 %"],
        weaknesses: ["Déploiements grands comptes nécessitant de l'intégration"],
      },
      {
        key: "management",
        label: "Management",
        score: 82,
        summary: "Équipe expérimentée, mix tech + énergie, faible turnover.",
        strengths: ["CEO ex-Schneider Electric", "CTO ayant déjà scalé un SaaS B2B"],
        weaknesses: ["CFO recruté il y a moins d'un an"],
      },
      {
        key: "risk",
        label: "Risque",
        score: 68,
        summary: "Profil de risque modéré, principalement lié à la concentration client.",
        strengths: ["Récurrence du revenu élevée", "Faible exposition FX"],
        weaknesses: ["Top 10 clients = 41 % de l'ARR", "Cycle de vente long"],
      },
    ],
    financials: [
      { year: "2021", revenue: 8, ebitda: -4, netIncome: -5, valuation: 60 },
      { year: "2022", revenue: 15, ebitda: -3, netIncome: -4, valuation: 110 },
      { year: "2023", revenue: 27, ebitda: -1, netIncome: -2, valuation: 210 },
      { year: "2024", revenue: 46, ebitda: 4, netIncome: -1, valuation: 380 },
      { year: "2025e", revenue: 72, ebitda: 12, netIncome: 5, valuation: 560 },
    ],
    revenueSegments: [
      { name: "Abonnement SaaS", value: 64 },
      { name: "Commission économies", value: 22 },
      { name: "Services & intégration", value: 14 },
    ],
    competitors: [
      { name: "Nimbus Energy", score: 0, revenue: 46, growth: 71, valuation: 380, isSelf: true },
      { name: "GridSense", score: 74, revenue: 88, growth: 38, valuation: 720 },
      { name: "Voltik", score: 66, revenue: 31, growth: 52, valuation: 240 },
      { name: "EcoPulse", score: 59, revenue: 120, growth: 19, valuation: 640 },
    ],
    funding: [
      { date: "2024-03", stage: "Série B", amount: 42, leadInvestor: "Eurazeo Growth", valuation: 380 },
      { date: "2022-06", stage: "Série A", amount: 14, leadInvestor: "Partech", valuation: 110 },
      { date: "2020-09", stage: "Seed", amount: 3.5, leadInvestor: "Kima Ventures", valuation: 22 },
    ],
    management: [
      { name: "Camille Dervaux", role: "CEO & Co-fondatrice", note: "Ex-Schneider Electric, 12 ans dans l'énergie." },
      { name: "Tomás Léger", role: "CTO & Co-fondateur", note: "A scalé un SaaS B2B jusqu'à 50M ARR." },
      { name: "Inès Bah", role: "CFO", note: "Ex-Goldman Sachs, en poste depuis 9 mois." },
    ],
    metrics: {
      revenue: 46,
      revenueGrowth: 71,
      ebitdaMargin: 8.7,
      netMargin: -2.2,
      cash: 38,
      debt: 6,
      runwayMonths: 28,
      valuation: 380,
    },
  },
  {
    id: "atlas-health",
    name: "Atlas Health",
    logo: "✚",
    sector: "HealthTech · SaaS",
    location: "Paris, France",
    website: "atlashealth.eu",
    siren: "823 901 556",
    founded: 2016,
    headcount: 410,
    stage: "Private",
    tagline: "Système d'exploitation clinique pour les groupes de santé européens.",
    trend: 1.8,
    summary: {
      whatToKnow:
        "Atlas Health équipe 1 200 établissements de santé avec un logiciel de coordination des soins. Revenu très récurrent, mais croissance qui ralentit à mesure que le marché domestique mûrit.",
      whyInvest: [
        "Base installée massive et coûts de changement très élevés.",
        "Marge d'EBITDA de 31 %, génération de cash robuste.",
        "Réglementation favorable à la digitalisation hospitalière.",
      ],
      whyNot: [
        "Croissance ralentie à +24 % (vs +40 % il y a deux ans).",
        "Cycles d'achat publics longs et politiques.",
      ],
      keyRisk: "Exposition aux budgets publics de santé sous pression.",
      upside: "Consolidateur naturel du secteur — potentiel de build-up M&A.",
    },
    criteria: [
      { key: "growth", label: "Croissance", score: 70, summary: "Croissance solide mais en décélération.", strengths: ["+24 % ARR", "Expansion vers 3 nouveaux pays"], weaknesses: ["Décélération depuis 2 ans"] },
      { key: "profitability", label: "Rentabilité", score: 86, summary: "Forte rentabilité et génération de cash.", strengths: ["EBITDA 31 %", "Free cash-flow positif"], weaknesses: ["Capex produit en hausse"] },
      { key: "financial-strength", label: "Solidité financière", score: 84, summary: "Bilan sain, peu de dette.", strengths: ["Trésorerie nette positive", "Faible churn"], weaknesses: [] },
      { key: "market-position", label: "Position marché", score: 81, summary: "Leader sur son segment domestique.", strengths: ["#1 en France", "Effets de réseau hospitaliers"], weaknesses: ["Notoriété faible hors France"] },
      { key: "scalability", label: "Scalabilité", score: 68, summary: "Scalabilité limitée par l'intégration.", strengths: ["Plateforme modulaire"], weaknesses: ["Déploiements lourds", "Forte composante services"] },
      { key: "management", label: "Management", score: 79, summary: "Équipe stable et expérimentée.", strengths: ["Faible turnover", "Board de qualité"], weaknesses: ["Fondateur unique, risque de dépendance"] },
      { key: "risk", label: "Risque", score: 72, summary: "Risque maîtrisé, exposition au public.", strengths: ["Revenu récurrent", "Contrats pluriannuels"], weaknesses: ["Dépendance budgets publics"] },
    ],
    financials: [
      { year: "2021", revenue: 64, ebitda: 12, netIncome: 6, valuation: 340 },
      { year: "2022", revenue: 82, ebitda: 19, netIncome: 11, valuation: 480 },
      { year: "2023", revenue: 104, ebitda: 28, netIncome: 17, valuation: 640 },
      { year: "2024", revenue: 129, ebitda: 40, netIncome: 24, valuation: 820 },
      { year: "2025e", revenue: 160, ebitda: 52, netIncome: 32, valuation: 1010 },
    ],
    revenueSegments: [
      { name: "Licences SaaS", value: 58 },
      { name: "Services managés", value: 27 },
      { name: "Modules add-on", value: 15 },
    ],
    competitors: [
      { name: "Atlas Health", score: 0, revenue: 129, growth: 24, valuation: 820, isSelf: true },
      { name: "MediCore", score: 71, revenue: 210, growth: 16, valuation: 1300 },
      { name: "CareGraph", score: 64, revenue: 58, growth: 41, valuation: 410 },
    ],
    funding: [
      { date: "2023-11", stage: "Série C", amount: 80, leadInvestor: "Sofinnova", valuation: 640 },
      { date: "2021-04", stage: "Série B", amount: 35, leadInvestor: "Idinvest", valuation: 280 },
    ],
    management: [
      { name: "Dr. Hélène Costa", role: "CEO & Fondatrice", note: "Médecin et entrepreneuse, fondatrice unique." },
      { name: "Marc Vidal", role: "COO", note: "Ex-Doctolib, expert scaling santé." },
    ],
    metrics: { revenue: 129, revenueGrowth: 24, ebitdaMargin: 31, netMargin: 18.6, cash: 95, debt: 12, runwayMonths: 999, valuation: 820 },
  },
  {
    id: "quanta-labs",
    name: "Quanta Labs",
    logo: "⬡",
    sector: "Deep Tech · IA",
    location: "Grenoble, France",
    website: "quanta-labs.ai",
    siren: "911 240 883",
    founded: 2021,
    headcount: 65,
    stage: "Private",
    tagline: "Infrastructure d'inférence IA optimisée pour l'edge industriel.",
    trend: 7.5,
    summary: {
      whatToKnow:
        "Quanta Labs développe des accélérateurs logiciels d'inférence IA pour l'industrie. Très forte croissance, technologie différenciante, mais profil pre-profitability et fortement capitalistique.",
      whyInvest: [
        "Croissance hyper-rapide (+140 %) sur un marché en explosion.",
        "Avantage technologique défendable (brevets, talents rares).",
        "Premiers contrats avec des industriels du CAC 40.",
      ],
      whyNot: [
        "Pertes importantes et runway court (14 mois).",
        "Modèle non encore prouvé à grande échelle.",
      ],
      keyRisk: "Risque d'exécution et de financement avant l'atteinte du seuil de rentabilité.",
      upside: "Profil 'venture' à fort beta — potentiel x10 ou échec, peu d'entre-deux.",
    },
    criteria: [
      { key: "growth", label: "Croissance", score: 94, summary: "Hyper-croissance early-stage.", strengths: ["+140 % de revenu", "Pipeline industriel premium"], weaknesses: ["Base de revenu encore faible"] },
      { key: "profitability", label: "Rentabilité", score: 38, summary: "Loin de la rentabilité.", strengths: ["Marge brute en amélioration"], weaknesses: ["EBITDA très négatif", "Pertes nettes lourdes"] },
      { key: "financial-strength", label: "Solidité financière", score: 48, summary: "Runway court, dépendance au prochain tour.", strengths: ["Pas de dette"], weaknesses: ["14 mois de runway", "Burn élevé"] },
      { key: "market-position", label: "Position marché", score: 76, summary: "Niche défendable, marché naissant.", strengths: ["Technologie différenciante", "Brevets déposés"], weaknesses: ["Hyperscalers comme menace potentielle"] },
      { key: "scalability", label: "Scalabilité", score: 80, summary: "Logiciel hautement scalable une fois adopté.", strengths: ["Déploiement logiciel", "Coût marginal faible"], weaknesses: ["Intégration matérielle complexe"] },
      { key: "management", label: "Management", score: 74, summary: "Équipe scientifique de premier plan.", strengths: ["Fondateurs PhD reconnus", "Conseillers de renom"], weaknesses: ["Peu d'expérience go-to-market"] },
      { key: "risk", label: "Risque", score: 44, summary: "Risque élevé typique du deep tech early-stage.", strengths: ["Propriété intellectuelle forte"], weaknesses: ["Risque de financement", "Time-to-market incertain"] },
    ],
    financials: [
      { year: "2022", revenue: 1, ebitda: -3, netIncome: -3, valuation: 25 },
      { year: "2023", revenue: 4, ebitda: -6, netIncome: -7, valuation: 70 },
      { year: "2024", revenue: 10, ebitda: -9, netIncome: -10, valuation: 160 },
      { year: "2025e", revenue: 24, ebitda: -8, netIncome: -9, valuation: 320 },
    ],
    revenueSegments: [
      { name: "Licences runtime", value: 70 },
      { name: "Support entreprise", value: 18 },
      { name: "Conseil R&D", value: 12 },
    ],
    competitors: [
      { name: "Quanta Labs", score: 0, revenue: 10, growth: 140, valuation: 160, isSelf: true },
      { name: "EdgeForge", score: 70, revenue: 22, growth: 95, valuation: 300 },
      { name: "NeuronX", score: 62, revenue: 6, growth: 120, valuation: 140 },
    ],
    funding: [
      { date: "2024-09", stage: "Série A", amount: 22, leadInvestor: "Index Ventures", valuation: 160 },
      { date: "2022-12", stage: "Seed", amount: 6, leadInvestor: "Elaia", valuation: 30 },
    ],
    management: [
      { name: "Dr. Yanis Moreau", role: "CEO & Co-fondateur", note: "PhD ML, ex-DeepMind." },
      { name: "Dr. Sofia Renault", role: "CSO & Co-fondatrice", note: "Spécialiste hardware acceleration." },
    ],
    metrics: { revenue: 10, revenueGrowth: 140, ebitdaMargin: -90, netMargin: -100, cash: 18, debt: 0, runwayMonths: 14, valuation: 160 },
  },
  {
    id: "lumen-retail",
    name: "Lumen Retail",
    logo: "▦",
    sector: "Retail Tech · E-commerce",
    location: "Bordeaux, France",
    website: "lumenretail.com",
    siren: "799 334 102",
    founded: 2014,
    headcount: 320,
    stage: "Private",
    tagline: "Suite d'optimisation merchandising omnicanal pour le retail.",
    trend: -2.1,
    summary: {
      whatToKnow:
        "Lumen équipe des enseignes retail d'outils d'optimisation merchandising. Croissance atone et pression concurrentielle forte sur un marché mature et cyclique.",
      whyInvest: [
        "Base clients fidèle et revenu récurrent.",
        "Rentabilité positive et stable.",
      ],
      whyNot: [
        "Croissance faible (+6 %) et marché saturé.",
        "Pression sur les prix et churn en hausse.",
        "Exposition au cycle de consommation.",
      ],
      keyRisk: "Érosion concurrentielle et churn croissant.",
      upside: "Cible de consolidation plus qu'une histoire de croissance.",
    },
    criteria: [
      { key: "growth", label: "Croissance", score: 42, summary: "Croissance atone sur un marché mature.", strengths: ["Revenu récurrent stable"], weaknesses: ["+6 % seulement", "Churn en hausse"] },
      { key: "profitability", label: "Rentabilité", score: 72, summary: "Rentabilité correcte et stable.", strengths: ["EBITDA 22 %"], weaknesses: ["Pression sur les marges"] },
      { key: "financial-strength", label: "Solidité financière", score: 64, summary: "Bilan acceptable, dette modérée.", strengths: ["Cash-flow positif"], weaknesses: ["Dette LBO résiduelle"] },
      { key: "market-position", label: "Position marché", score: 55, summary: "Position contestée sur un marché saturé.", strengths: ["Marque établie"], weaknesses: ["Nouveaux entrants agressifs"] },
      { key: "scalability", label: "Scalabilité", score: 58, summary: "Scalabilité limitée par la maturité.", strengths: ["Plateforme cloud"], weaknesses: ["Marché plafonné"] },
      { key: "management", label: "Management", score: 60, summary: "Management solide mais peu offensif.", strengths: ["Expérience retail"], weaknesses: ["Faible appétit d'innovation"] },
      { key: "risk", label: "Risque", score: 58, summary: "Risque cyclique et concurrentiel.", strengths: ["Diversification clients"], weaknesses: ["Exposition au cycle conso", "Churn"] },
    ],
    financials: [
      { year: "2021", revenue: 58, ebitda: 11, netIncome: 5, valuation: 190 },
      { year: "2022", revenue: 61, ebitda: 12, netIncome: 6, valuation: 200 },
      { year: "2023", revenue: 64, ebitda: 13, netIncome: 6, valuation: 210 },
      { year: "2024", revenue: 68, ebitda: 15, netIncome: 7, valuation: 215 },
      { year: "2025e", revenue: 72, ebitda: 16, netIncome: 8, valuation: 225 },
    ],
    revenueSegments: [
      { name: "SaaS merchandising", value: 52 },
      { name: "Analytics", value: 30 },
      { name: "Services", value: 18 },
    ],
    competitors: [
      { name: "Lumen Retail", score: 0, revenue: 68, growth: 6, valuation: 215, isSelf: true },
      { name: "ShelfIQ", score: 68, revenue: 92, growth: 18, valuation: 380 },
      { name: "Retailo", score: 61, revenue: 45, growth: 24, valuation: 240 },
    ],
    funding: [
      { date: "2019-05", stage: "LBO", amount: 60, leadInvestor: "Ardian", valuation: 180 },
    ],
    management: [
      { name: "Pierre Lemoine", role: "CEO", note: "Dirigeant nommé post-LBO, profil opérationnel." },
    ],
    metrics: { revenue: 68, revenueGrowth: 6, ebitdaMargin: 22, netMargin: 10.3, cash: 14, debt: 48, runwayMonths: 999, valuation: 215 },
  },
  {
    id: "veridian-pay",
    name: "Veridian Pay",
    logo: "◆",
    sector: "Fintech · Paiement",
    location: "Paris, France",
    website: "veridianpay.com",
    siren: "880 117 449",
    founded: 2017,
    headcount: 520,
    stage: "Public",
    tagline: "Infrastructure de paiement et orchestration pour les plateformes.",
    trend: 3.3,
    summary: {
      whatToKnow:
        "Veridian Pay est une fintech cotée fournissant une infrastructure de paiement aux marketplaces. Croissance forte, prise de part de marché, mais valorisation déjà exigeante.",
      whyInvest: [
        "Volumes traités en hausse de +58 %, effet réseau puissant.",
        "Marges en expansion et discipline de coûts post-IPO.",
        "Marché du paiement embarqué structurellement en croissance.",
      ],
      whyNot: [
        "Valorisation premium (28x EBITDA) laissant peu de marge d'erreur.",
        "Environnement réglementaire et risque de fraude.",
      ],
      keyRisk: "Compression de multiple en cas de ralentissement macro.",
      upside: "Plateforme de consolidation du paiement européen.",
    },
    criteria: [
      { key: "growth", label: "Croissance", score: 85, summary: "Croissance des volumes très forte.", strengths: ["TPV +58 %", "Effet réseau"], weaknesses: ["Comparables exigeants"] },
      { key: "profitability", label: "Rentabilité", score: 78, summary: "Rentabilité en expansion.", strengths: ["Take rate stable", "Discipline coûts"], weaknesses: ["Investissements compliance"] },
      { key: "financial-strength", label: "Solidité financière", score: 82, summary: "Bilan robuste post-IPO.", strengths: ["Trésorerie élevée", "Accès aux marchés"], weaknesses: [] },
      { key: "market-position", label: "Position marché", score: 84, summary: "Acteur de référence du paiement embarqué.", strengths: ["Part de marché en hausse", "Intégrations clés"], weaknesses: ["Concurrence des géants US"] },
      { key: "scalability", label: "Scalabilité", score: 88, summary: "Modèle d'infrastructure hautement scalable.", strengths: ["Coût marginal faible", "API-first"], weaknesses: [] },
      { key: "management", label: "Management", score: 80, summary: "Direction expérimentée et exécution solide.", strengths: ["Track record IPO", "Board international"], weaknesses: [] },
      { key: "risk", label: "Risque", score: 64, summary: "Risque réglementaire et de valorisation.", strengths: ["Diversification géographique"], weaknesses: ["Multiple premium", "Risque fraude/réglementaire"] },
    ],
    financials: [
      { year: "2021", revenue: 180, ebitda: 22, netIncome: 8, valuation: 1400 },
      { year: "2022", revenue: 260, ebitda: 41, netIncome: 19, valuation: 2200 },
      { year: "2023", revenue: 360, ebitda: 70, netIncome: 38, valuation: 3100 },
      { year: "2024", revenue: 470, ebitda: 104, netIncome: 61, valuation: 3900 },
      { year: "2025e", revenue: 600, ebitda: 145, netIncome: 90, valuation: 4600 },
    ],
    revenueSegments: [
      { name: "Commissions paiement", value: 68 },
      { name: "Orchestration / SaaS", value: 20 },
      { name: "Services financiers", value: 12 },
    ],
    competitors: [
      { name: "Veridian Pay", score: 0, revenue: 470, growth: 58, valuation: 3900, isSelf: true },
      { name: "Paywave", score: 76, revenue: 980, growth: 30, valuation: 8200 },
      { name: "Settle", score: 70, revenue: 220, growth: 64, valuation: 2100 },
    ],
    funding: [
      { date: "2023-06", stage: "IPO", amount: 320, leadInvestor: "Euronext Paris", valuation: 3100 },
      { date: "2021-02", stage: "Série C", amount: 110, leadInvestor: "Tiger Global", valuation: 1400 },
    ],
    management: [
      { name: "Léa Fontaine", role: "CEO & Co-fondatrice", note: "A mené l'IPO en 2023." },
      { name: "David Okafor", role: "CFO", note: "Ex-Adyen, expert paiement." },
    ],
    metrics: { revenue: 470, revenueGrowth: 58, ebitdaMargin: 22.1, netMargin: 13, cash: 410, debt: 90, runwayMonths: 999, valuation: 3900 },
  },
  {
    id: "fieldforge",
    name: "FieldForge",
    logo: "⬢",
    sector: "Industrial SaaS · Robotique",
    location: "Toulouse, France",
    website: "fieldforge.io",
    siren: "902 556 718",
    founded: 2019,
    headcount: 150,
    stage: "Private",
    tagline: "Orchestration logicielle de flottes robotiques pour la logistique.",
    trend: 5.1,
    summary: {
      whatToKnow:
        "FieldForge fournit la couche logicielle d'orchestration de flottes robotiques pour entrepôts. Croissance forte, modèle hybride hardware-light, rentabilité en approche.",
      whyInvest: [
        "Croissance +95 % portée par l'automatisation logistique.",
        "Modèle asset-light (logiciel sur robots tiers).",
        "Contrats pluriannuels avec de grands logisticiens.",
      ],
      whyNot: [
        "Encore déficitaire, dépendance à quelques grands déploiements.",
        "Cycle de vente industriel long.",
      ],
      keyRisk: "Concentration des déploiements et dépendance aux constructeurs de robots.",
      upside: "Devenir le 'système d'exploitation' standard des entrepôts automatisés.",
    },
    criteria: [
      { key: "growth", label: "Croissance", score: 90, summary: "Croissance très forte sur un marché porteur.", strengths: ["+95 % de revenu", "Demande structurelle d'automatisation"], weaknesses: ["Base de clients concentrée"] },
      { key: "profitability", label: "Rentabilité", score: 56, summary: "Rentabilité en approche mais non atteinte.", strengths: ["Marge brute logicielle 72 %"], weaknesses: ["EBITDA encore négatif"] },
      { key: "financial-strength", label: "Solidité financière", score: 66, summary: "Trésorerie correcte après la Série A.", strengths: ["20 mois de runway"], weaknesses: ["Besoin de financement à moyen terme"] },
      { key: "market-position", label: "Position marché", score: 74, summary: "Position prometteuse sur une niche en croissance.", strengths: ["Indépendance vis-à-vis du hardware", "Partenariats constructeurs"], weaknesses: ["Marché encore fragmenté"] },
      { key: "scalability", label: "Scalabilité", score: 82, summary: "Couche logicielle hautement réplicable.", strengths: ["Asset-light", "Déploiement multi-sites"], weaknesses: ["Intégration initiale lourde"] },
      { key: "management", label: "Management", score: 76, summary: "Équipe technique solide, GTM en construction.", strengths: ["Fondateurs robotique", "Recrutements seniors"], weaknesses: ["Organisation commerciale jeune"] },
      { key: "risk", label: "Risque", score: 58, summary: "Risque modéré-élevé lié à la concentration.", strengths: ["Contrats pluriannuels"], weaknesses: ["Dépendance grands comptes", "Dépendance hardware tiers"] },
    ],
    financials: [
      { year: "2022", revenue: 6, ebitda: -4, netIncome: -5, valuation: 40 },
      { year: "2023", revenue: 13, ebitda: -4, netIncome: -5, valuation: 90 },
      { year: "2024", revenue: 25, ebitda: -2, netIncome: -3, valuation: 180 },
      { year: "2025e", revenue: 49, ebitda: 3, netIncome: -1, valuation: 320 },
    ],
    revenueSegments: [
      { name: "Licences orchestration", value: 66 },
      { name: "Support & SLA", value: 22 },
      { name: "Intégration", value: 12 },
    ],
    competitors: [
      { name: "FieldForge", score: 0, revenue: 25, growth: 95, valuation: 180, isSelf: true },
      { name: "WarehouseOS", score: 72, revenue: 60, growth: 48, valuation: 420 },
      { name: "RoboFlux", score: 60, revenue: 18, growth: 70, valuation: 130 },
    ],
    funding: [
      { date: "2024-05", stage: "Série A", amount: 28, leadInvestor: "Balderton", valuation: 180 },
      { date: "2021-10", stage: "Seed", amount: 5, leadInvestor: "Daphni", valuation: 28 },
    ],
    management: [
      { name: "Nora Aguilar", role: "CEO & Co-fondatrice", note: "Ex-robotique Amazon." },
      { name: "Julien Roy", role: "CTO & Co-fondateur", note: "Spécialiste systèmes temps réel." },
    ],
    metrics: { revenue: 25, revenueGrowth: 95, ebitdaMargin: -8, netMargin: -12, cash: 22, debt: 2, runwayMonths: 20, valuation: 180 },
  },
];

export const COMPANIES: Company[] = RAW.map(finalize);

export function getCompany(id: string): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}

export function searchCompanies(query: string): Company[] {
  const q = query.trim().toLowerCase();
  if (!q) return COMPANIES;
  return COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q),
  );
}
