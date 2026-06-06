// ============================================================
//  CASSELIN 3D — Données produits & catégories
//  Titres et descriptions originaux adaptés à l'univers
//  du matériel de cuisine professionnelle.
// ============================================================

export const CATEGORIES = [
  {
    id: "snack",
    name: "Snack & Cuisson",
    tagline: "La puissance du feu, maîtrisée.",
    color: "#e11d1d",
    model: "fryer",
    description:
      "Friteuses, planchas, grills et plaques snacking. Une ligne pensée pour le rush du service, montée en température éclair et nettoyage sans effort.",
  },
  {
    id: "preparation",
    name: "Préparation",
    tagline: "La précision au gramme près.",
    color: "#00bcd4",
    model: "slicer",
    description:
      "Trancheuses, coupe-légumes, batteurs et robots. Des lames affûtées et des moteurs endurants pour transformer la matière première en mise en place parfaite.",
  },
  {
    id: "buffet",
    name: "Buffet",
    tagline: "L'art de recevoir, magnifié.",
    color: "#ffc107",
    model: "buffet",
    description:
      "Petit-déjeuner, brunch et réception : chafing dishes, distributeurs et présentoirs chauffants qui gardent vos mets à température, du premier au dernier convive.",
  },
  {
    id: "froid",
    name: "Froid",
    tagline: "La chaîne du froid, sans faille.",
    color: "#03a9f4",
    model: "fridge",
    description:
      "Vitrines réfrigérées, armoires positives et négatives, tables réfrigérées. Une conservation irréprochable, mise en valeur derrière un verre toujours impeccable.",
  },
  {
    id: "laverie",
    name: "Laverie",
    tagline: "Le propre, à grande cadence.",
    color: "#4caf50",
    model: "dishwasher",
    description:
      "Lave-vaisselle et lave-verres à capot ou frontaux. Cycles ultra-rapides, consommation maîtrisée, verrerie étincelante prête pour le service suivant.",
  },
  {
    id: "hygiene",
    name: "Hygiène",
    tagline: "Une cuisine saine, toujours.",
    color: "#9c27b0",
    model: "hygiene",
    description:
      "Distributeurs, poubelles à pédale, stérilisateurs et accessoires. L'hygiène HACCP intégrée à chaque geste de votre brigade.",
  },
  {
    id: "ligne600",
    name: "Ligne 600",
    tagline: "Le compact qui ne renonce à rien.",
    color: "#607d8b",
    model: "range",
    description:
      "Fourneaux, friteuses et plaques en 600 mm de profondeur. La performance d'une grande cuisine dans l'empreinte d'un food-truck ou d'un coin snack.",
  },
  {
    id: "ligne700",
    name: "Ligne 700",
    tagline: "Le standard des grandes brigades.",
    color: "#455a64",
    model: "range",
    description:
      "Modularité totale en 700 mm : feux vifs, planchas, friteuses et soubassements qui s'assemblent comme un piano de cuisine sur-mesure.",
  },
  {
    id: "familiale",
    name: "Familiale",
    tagline: "Le pro, invité à votre table.",
    color: "#e91e63",
    model: "family",
    description:
      "La robustesse professionnelle adaptée à la maison : appareils à raclette, gaufriers, plaques à snacker et machines à pâtes pour les passionnés.",
  },
];

export const PRODUCTS = [
  {
    id: "friteuse-velocity",
    category: "snack",
    name: "Friteuse Velocity 8L",
    subtitle: "Double cuve · Zone froide",
    model: "fryer",
    price: "à partir de 289 €",
    specs: [
      ["Capacité", "2 × 8 litres"],
      ["Puissance", "2 × 3 200 W"],
      ["Température", "60 – 200 °C"],
      ["Zone froide", "Oui, anti-carbonisation"],
    ],
    description:
      "Montée en température en moins de 6 minutes, double cuve indépendante et zone froide qui prolonge la durée de vie de l'huile. La Velocity tient la cadence d'un service complet sans jamais faiblir.",
  },
  {
    id: "plancha-firewall",
    category: "snack",
    name: "Plancha Firewall Pro",
    subtitle: "Acier rectifié · 4 kW",
    model: "griddle",
    price: "à partir de 419 €",
    specs: [
      ["Surface", "60 × 40 cm"],
      ["Puissance", "4 000 W"],
      ["Plaque", "Acier 8 mm rectifié"],
      ["Bac", "Récupérateur de graisse amovible"],
    ],
    description:
      "Une plaque en acier massif rectifié qui diffuse une chaleur homogène d'un bord à l'autre. Saisie parfaite des viandes, légumes croquants : la Firewall transforme chaque snack en signature.",
  },
  {
    id: "trancheuse-precision",
    category: "preparation",
    name: "Trancheuse Précision 300",
    subtitle: "Lame Ø 300 mm · Gravité",
    model: "slicer",
    price: "à partir de 549 €",
    specs: [
      ["Diamètre lame", "300 mm"],
      ["Épaisseur", "0 – 16 mm réglable"],
      ["Moteur", "320 W ventilé"],
      ["Affûteur", "Intégré deux pierres"],
    ],
    description:
      "Coupe en gravité pour des tranches d'une régularité chirurgicale, du carpaccio translucide à la charcuterie épaisse. Affûteur intégré et carter aluminium poli de qualité alimentaire.",
  },
  {
    id: "vitrine-crystal",
    category: "froid",
    name: "Vitrine Crystal Curve",
    subtitle: "Verre bombé · +2/+8 °C",
    model: "fridge",
    price: "à partir de 1 290 €",
    specs: [
      ["Température", "+2 à +8 °C"],
      ["Éclairage", "LED bandeau froid"],
      ["Verre", "Bombé double paroi"],
      ["Capacité", "3 clayettes inox"],
    ],
    description:
      "Un écrin de verre bombé qui sublime pâtisseries, sandwichs et boissons. Froid ventilé homogène, éclairage LED et hygrométrie maîtrisée pour une vitrine qui vend pour vous.",
  },
  {
    id: "lave-verres-aqua",
    category: "laverie",
    name: "Lave-verres AquaSpeed 40",
    subtitle: "Cycle 120 s · Panier 40 cm",
    model: "dishwasher",
    price: "à partir de 639 €",
    specs: [
      ["Panier", "400 × 400 mm"],
      ["Cycle", "120 secondes"],
      ["Cadence", "30 paniers/heure"],
      ["Adoucisseur", "Compatible intégré"],
    ],
    description:
      "Verrerie cristalline en deux minutes chrono. Double bras de lavage, surchauffeur de rinçage et capot ergonomique : l'AquaSpeed garde le bar à flot pendant le coup de feu.",
  },
  {
    id: "buffet-aurora",
    category: "buffet",
    name: "Chafing Dish Aurora GN1/1",
    subtitle: "Inox brossé · Couvercle roll-top",
    model: "buffet",
    price: "à partir de 129 €",
    specs: [
      ["Format", "GN 1/1 · 9 litres"],
      ["Couvercle", "Roll-top 180°"],
      ["Chauffe", "Électrique ou pâte"],
      ["Finition", "Inox brossé satiné"],
    ],
    description:
      "Le maintien au chaud devient spectacle. Couvercle roll-top à ouverture 180°, châssis inox satiné et chauffe homogène pour un buffet généreux qui reste à température jusqu'au dernier service.",
  },
];
