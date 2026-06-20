"use client";

import * as React from "react";

/**
 * Lightweight, dependency-free i18n. The browser's auto-translate is disabled
 * app-wide (it breaks React hydration), so we ship real translations and a
 * language switcher instead. Locale persists in localStorage and falls back to
 * the browser language, then English.
 */

export const LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

const en = {
  nav: {
    links: ["Before / after", "How it works", "Examples", "Pricing", "FAQ"],
    cta: "Transform a site",
    language: "Language",
  },
  hero: {
    badge: "Turn visitors into customers",
    titleA: "The website your",
    titleB: "customers",
    titleAccent: "trust.",
    subtitle:
      "Paste your link. ReFrame rebuilds your existing site into one that earns trust on sight, so visitors stop leaving and start buying. No builder, no blank page.",
    placeholder: "yourwebsite.com",
    cta: "Transform my website",
    note: "Free first transformation. No credit card.",
  },
  transform: {
    eyebrow: "See the transformation",
    titleA: "The same business.",
    titleB: "Customers who don't hesitate.",
    sub: "Same content, same brand. Drag the handle to compare the page quietly turning customers away with the one they trust before they've even scrolled.",
    drag: "Drag to compare",
    chips: ["Modern & fast", "Mobile-perfect", "SEO-ready", "Built to convert", "Your content kept"],
  },
  how: {
    title: "From your link to more customers, in three steps.",
    steps: [
      { title: "Paste your URL", body: "Drop in the link to your current website. Nothing to install, nothing to set up." },
      { title: "We spot what's costing you", body: "ReFrame reads your content, images, brand and sector, and pinpoints what's quietly turning visitors away." },
      { title: "A site that wins them over", body: "A faster, modern site your customers trust on sight, rebuilt in minutes. Refine it just by chatting." },
    ],
  },
  engine: {
    badge: "The engine",
    title: "It knows exactly what's turning your customers away.",
    sub: "Four passes turn a tired page into a site visitors trust, and act on. No builder, no blank canvas.",
    steps: [
      { label: "Read", body: "Crawl the live site: copy, media, structure, brand." },
      { label: "Understand", body: "Infer the sector, the intent and what converts." },
      { label: "Compose", body: "Assemble vetted blocks into a coherent system." },
      { label: "Ship", body: "Render a fast, editable site your customers trust, ready to publish." },
    ],
  },
  examples: {
    title: "Real sites, reframed.",
    sub: "Same business, same brand, a site customers finally take seriously, and buy from.",
    before: "before",
    transformed: "Transformed",
    items: [
      { title: "A table you'll remember.", sector: "Restaurant" },
      { title: "Work that earns attention.", sector: "Agency" },
      { title: "The place you pictured.", sector: "Real estate" },
    ],
  },
  trust: {
    eyebrow: "No vendor lock-in",
    title: "Your website. Your domain. Your content.",
    p1: "We don't own your website. We improve it. Keep everything, upgrade everything, and export the whole thing the moment you want to.",
    p2: "You keep your domain, your content and your SEO. You can leave at any time, nothing here holds your site hostage.",
    cards: [
      { title: "Free preview, no card", body: "See your site fully rebuilt before you pay anything. You only pay when you choose to publish it live." },
      { title: "Your content, preserved", body: "We rebuild from your real text, logo, images and colours. We never invent a business or fake your details." },
      { title: "Export anytime", body: "Download your whole site, HTML, CSS, images and every page, and host it anywhere. It keeps working with or without us." },
      { title: "No vendor lock-in", body: "Keep your own domain with automatic SSL, and cancel anytime. If you leave, your exported site keeps working and your domain stays yours." },
      { title: "Only your public pages", body: "We read what is already public on the web. We never ask for your passwords, CMS or hosting access." },
      { title: "Edit anything, anytime", body: "Change copy, colours, add pages or sections by chatting in plain English. Changes go live instantly." },
    ],
  },
  pricing: {
    title: "Pricing that scales when you do.",
    sub: "Start free. Upgrade when you publish. Cancel anytime.",
    ownership: "Your website, your domain, your content. Export everything anytime, no vendor lock-in.",
    popular: "Popular",
    perMonth: "per month",
    forever: "forever",
    tiers: {
      free: {
        name: "Free",
        desc: "Rebuild your site, see the result, download it. Going live needs a plan.",
        features: ["Full AI rebuild + live preview", "AI editor", "Download the HTML", "Publishing not included"],
        cta: "Try it free",
      },
      pro: {
        name: "Pro",
        desc: "Everything you need to turn visitors into paying customers, live and looked after.",
        features: [
          "AI-powered website redesign",
          "Unlimited AI edits",
          "Instant page creation",
          "Redesign without losing content",
          "Keep your brand assets",
          "Custom domain included",
          "Hosting & maintenance included",
          "No code needed",
        ],
        cta: "Choose Pro",
      },
      studio: {
        name: "Agency",
        desc: "For agencies and freelancers running live sites for several clients.",
        features: ["Up to 10 live client sites", "Everything in Pro, per site", "A custom domain on each", "Client workspaces", "Priority support"],
        cta: "Choose Agency",
      },
    },
  },
  faq: {
    title: "Questions, answered honestly.",
    items: [
      { q: "Will it work on my existing website?", a: "Paste your URL and ReFrame reads your live site's text, images, logo and colours, then rebuilds from them. If a site is behind heavy bot-protection or is fully JavaScript-rendered, we tell you honestly and start from the details we could read plus sensible defaults you can edit." },
      { q: "Do I lose my content or my brand?", a: "No. The rebuild keeps your real content, logo, images and colours, and follows your existing structure. Nothing is invented. You can then change anything you like." },
      { q: "Can I keep my own domain?", a: "Yes. On a paid plan you connect your own domain with automatic SSL, and you keep ownership. There's no lock-in: cancel anytime." },
      { q: "What if I don't like the result?", a: "The rebuild and preview are free. You see the full result before paying, and you only pay when you choose to publish it live." },
      { q: "Do I need a developer or to learn a builder?", a: "No code, no builder. You change copy, colours, add pages or sections, switch to dark mode and more just by chatting with the AI editor. Changes appear instantly." },
      { q: "What about SEO?", a: "Rebuilt sites ship clean semantic HTML, proper metadata, social link previews, structured data and a per-site sitemap and robots.txt, so search engines can index them properly." },
      { q: "What happens if I cancel or leave?", a: "Nothing here holds your site hostage. You can export your whole website and host it anywhere, it keeps working with or without us. Your domain stays registered to you, and your content and SEO remain yours. You subscribe because ReFrame keeps improving your site, not because leaving is hard." },
      { q: "Is my data safe?", a: "We only read pages that are already public on the web. We never ask for your passwords, CMS logins or hosting access." },
    ],
  },
  cta: {
    title: "Your website should be winning customers, not losing them.",
    sub: "Paste your link and watch it become the site that turns visitors into customers, in minutes, not months.",
    button: "Start for free",
  },
  footer: {
    tagline: "Paste a link. Get a site worth visiting. Edited by chatting, live in minutes.",
    links: [
      { label: "Pricing", href: "/#pricing" },
      { label: "Examples", href: "/#examples" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Contact", href: "mailto:hello@reframe.design" },
    ],
  },
};

export type Messages = typeof en;

const fr: Messages = {
  nav: {
    links: ["Avant / après", "Comment ça marche", "Exemples", "Tarifs", "FAQ"],
    cta: "Transformer un site",
    language: "Langue",
  },
  hero: {
    badge: "Transformez vos visiteurs en clients",
    titleA: "Le site web que vos",
    titleB: "clients",
    titleAccent: "approuvent.",
    subtitle:
      "Collez votre lien. ReFrame reconstruit votre site existant en une version qui inspire confiance au premier regard, pour que vos visiteurs arrêtent de partir et commencent à acheter. Sans éditeur, sans page blanche.",
    placeholder: "votresite.com",
    cta: "Transformer mon site",
    note: "Première transformation gratuite. Sans carte bancaire.",
  },
  transform: {
    eyebrow: "Voyez la transformation",
    titleA: "La même entreprise.",
    titleB: "Des clients qui n'hésitent plus.",
    sub: "Même contenu, même marque. Glissez la poignée pour comparer la page qui fait fuir vos clients avec celle qu'ils approuvent avant même d'avoir défilé.",
    drag: "Glissez pour comparer",
    chips: ["Moderne & rapide", "Parfait sur mobile", "Optimisé SEO", "Conçu pour convertir", "Votre contenu conservé"],
  },
  how: {
    title: "De votre lien à plus de clients, en trois étapes.",
    steps: [
      { title: "Collez votre URL", body: "Indiquez le lien de votre site actuel. Rien à installer, rien à configurer." },
      { title: "On repère ce qui vous coûte des clients", body: "ReFrame lit votre contenu, vos images, votre marque et votre secteur, et identifie ce qui fait discrètement fuir vos visiteurs." },
      { title: "Un site qui les convainc", body: "Un site moderne et rapide qui inspire confiance immédiatement, reconstruit en quelques minutes. Affinez-le en discutant." },
    ],
  },
  engine: {
    badge: "Le moteur",
    title: "Il sait exactement ce qui fait fuir vos clients.",
    sub: "Quatre passes transforment une page fatiguée en un site auquel les visiteurs font confiance, et qui les fait agir. Sans éditeur, sans page blanche.",
    steps: [
      { label: "Lire", body: "Analyse du site en ligne : textes, médias, structure, marque." },
      { label: "Comprendre", body: "Déduit le secteur, l'intention et ce qui convertit." },
      { label: "Composer", body: "Assemble des blocs éprouvés en un système cohérent." },
      { label: "Publier", body: "Génère un site rapide et éditable, prêt à publier." },
    ],
  },
  examples: {
    title: "De vrais sites, recréés.",
    sub: "Même entreprise, même marque, un site que les clients prennent enfin au sérieux, et qui les fait acheter.",
    before: "avant",
    transformed: "Transformé",
    items: [
      { title: "Une table dont on se souvient.", sector: "Restaurant" },
      { title: "Un travail qui capte l'attention.", sector: "Agence" },
      { title: "Le lieu que vous imaginiez.", sector: "Immobilier" },
    ],
  },
  trust: {
    eyebrow: "Aucune dépendance",
    title: "Votre site. Votre domaine. Votre contenu.",
    p1: "Nous ne possédons pas votre site. Nous l'améliorons. Vous gardez tout, vous améliorez tout, et vous exportez l'ensemble dès que vous le souhaitez.",
    p2: "Vous gardez votre domaine, votre contenu et votre SEO. Vous pouvez partir à tout moment : rien ici ne retient votre site en otage.",
    cards: [
      { title: "Aperçu gratuit, sans carte", body: "Voyez votre site entièrement reconstruit avant de payer quoi que ce soit. Vous ne payez que lorsque vous choisissez de le publier." },
      { title: "Votre contenu, préservé", body: "Nous reconstruisons à partir de vos vrais textes, logo, images et couleurs. Nous n'inventons jamais une entreprise ni de fausses informations." },
      { title: "Export à tout moment", body: "Téléchargez tout votre site, HTML, CSS, images et chaque page, et hébergez-le où vous voulez. Il fonctionne avec ou sans nous." },
      { title: "Aucune dépendance", body: "Gardez votre domaine avec SSL automatique, et annulez à tout moment. Si vous partez, votre site exporté continue de fonctionner et votre domaine reste le vôtre." },
      { title: "Uniquement vos pages publiques", body: "Nous lisons ce qui est déjà public sur le web. Nous ne demandons jamais vos mots de passe, votre CMS ni votre hébergement." },
      { title: "Modifiez tout, quand vous voulez", body: "Changez les textes, les couleurs, ajoutez des pages ou des sections en discutant simplement. Les changements sont visibles instantanément." },
    ],
  },
  pricing: {
    title: "Des tarifs qui évoluent avec vous.",
    sub: "Commencez gratuitement. Passez payant à la publication. Annulez quand vous voulez.",
    ownership: "Votre site, votre domaine, votre contenu. Exportez tout à tout moment, aucune dépendance.",
    popular: "Populaire",
    perMonth: "par mois",
    forever: "à vie",
    tiers: {
      free: {
        name: "Gratuit",
        desc: "Reconstruisez votre site, voyez le résultat, téléchargez-le. La publication nécessite un plan.",
        features: ["Reconstruction IA complète + aperçu live", "Éditeur IA", "Téléchargement du HTML", "Publication non incluse"],
        cta: "Essayer gratuitement",
      },
      pro: {
        name: "Pro",
        desc: "Tout ce qu'il faut pour transformer vos visiteurs en clients, hébergé et entretenu.",
        features: [
          "Refonte de site par IA",
          "Modifications IA illimitées",
          "Création de pages instantanée",
          "Refonte sans perdre votre contenu",
          "Vos éléments de marque conservés",
          "Domaine personnalisé inclus",
          "Hébergement & maintenance inclus",
          "Aucun code requis",
        ],
        cta: "Choisir Pro",
      },
      studio: {
        name: "Agence",
        desc: "Pour les agences et indépendants gérant des sites pour plusieurs clients.",
        features: ["Jusqu'à 10 sites clients en ligne", "Tout Pro, par site", "Un domaine personnalisé sur chacun", "Espaces clients", "Support prioritaire"],
        cta: "Choisir Agence",
      },
    },
  },
  faq: {
    title: "Vos questions, des réponses honnêtes.",
    items: [
      { q: "Est-ce que ça marche sur mon site existant ?", a: "Collez votre URL et ReFrame lit les textes, images, logo et couleurs de votre site en ligne, puis reconstruit à partir de là. Si un site est protégé contre les robots ou entièrement rendu en JavaScript, nous vous le disons honnêtement et partons des éléments lisibles plus des valeurs par défaut que vous pouvez modifier." },
      { q: "Est-ce que je perds mon contenu ou ma marque ?", a: "Non. La reconstruction conserve vos vrais contenus, logo, images et couleurs, et suit votre structure existante. Rien n'est inventé. Vous pouvez ensuite tout modifier." },
      { q: "Puis-je garder mon propre domaine ?", a: "Oui. Avec un plan payant, vous connectez votre domaine avec SSL automatique et vous en gardez la propriété. Aucune dépendance : annulez quand vous voulez." },
      { q: "Et si le résultat ne me plaît pas ?", a: "La reconstruction et l'aperçu sont gratuits. Vous voyez le résultat complet avant de payer, et vous ne payez que lorsque vous choisissez de publier." },
      { q: "Faut-il un développeur ou apprendre un éditeur ?", a: "Aucun code, aucun éditeur à apprendre. Vous changez les textes, les couleurs, ajoutez des pages ou des sections, passez en mode sombre et plus encore en discutant avec l'éditeur IA. Les changements apparaissent instantanément." },
      { q: "Et le SEO ?", a: "Les sites reconstruits livrent un HTML sémantique propre, des métadonnées correctes, des aperçus pour les réseaux sociaux, des données structurées et un sitemap et robots.txt par site, pour une bonne indexation." },
      { q: "Que se passe-t-il si j'annule ou je pars ?", a: "Rien ici ne retient votre site en otage. Vous pouvez exporter tout votre site et l'héberger où vous voulez, il fonctionne avec ou sans nous. Votre domaine reste à votre nom, et votre contenu et votre SEO restent les vôtres. Vous vous abonnez parce que ReFrame améliore continuellement votre site, pas parce que partir est difficile." },
      { q: "Mes données sont-elles en sécurité ?", a: "Nous lisons uniquement les pages déjà publiques sur le web. Nous ne demandons jamais vos mots de passe, identifiants CMS ni accès d'hébergement." },
    ],
  },
  cta: {
    title: "Votre site devrait vous gagner des clients, pas vous en faire perdre.",
    sub: "Collez votre lien et regardez-le devenir le site qui transforme vos visiteurs en clients, en quelques minutes, pas en quelques mois.",
    button: "Commencer gratuitement",
  },
  footer: {
    tagline: "Collez un lien. Obtenez un site qui vaut le détour. Modifié en discutant, en ligne en quelques minutes.",
    links: [
      { label: "Tarifs", href: "/#pricing" },
      { label: "Exemples", href: "/#examples" },
      { label: "Conditions", href: "/terms" },
      { label: "Confidentialité", href: "/privacy" },
      { label: "Contact", href: "mailto:hello@reframe.design" },
    ],
  },
};

const es: Messages = {
  nav: {
    links: ["Antes / después", "Cómo funciona", "Ejemplos", "Precios", "FAQ"],
    cta: "Transformar un sitio",
    language: "Idioma",
  },
  hero: {
    badge: "Convierte visitantes en clientes",
    titleA: "La web en la que tus",
    titleB: "clientes",
    titleAccent: "confían.",
    subtitle:
      "Pega tu enlace. ReFrame reconstruye tu sitio actual en una versión que inspira confianza al instante, para que los visitantes dejen de irse y empiecen a comprar. Sin editor, sin página en blanco.",
    placeholder: "tusitio.com",
    cta: "Transformar mi sitio",
    note: "Primera transformación gratis. Sin tarjeta.",
  },
  transform: {
    eyebrow: "Mira la transformación",
    titleA: "El mismo negocio.",
    titleB: "Clientes que no dudan.",
    sub: "Mismo contenido, misma marca. Arrastra el control para comparar la página que ahuyenta clientes con la que inspira confianza antes incluso de desplazarse.",
    drag: "Arrastra para comparar",
    chips: ["Moderno y rápido", "Perfecto en móvil", "Listo para SEO", "Hecho para convertir", "Tu contenido intacto"],
  },
  how: {
    title: "De tu enlace a más clientes, en tres pasos.",
    steps: [
      { title: "Pega tu URL", body: "Introduce el enlace de tu web actual. Nada que instalar, nada que configurar." },
      { title: "Detectamos lo que te cuesta clientes", body: "ReFrame lee tu contenido, imágenes, marca y sector, e identifica lo que ahuyenta a tus visitantes." },
      { title: "Una web que los convence", body: "Una web moderna y rápida que inspira confianza al instante, reconstruida en minutos. Perfecciónala solo conversando." },
    ],
  },
  engine: {
    badge: "El motor",
    title: "Sabe exactamente qué está ahuyentando a tus clientes.",
    sub: "Cuatro pasos convierten una página cansada en un sitio en el que los visitantes confían, y actúan. Sin editor, sin lienzo en blanco.",
    steps: [
      { label: "Leer", body: "Rastrea el sitio en vivo: textos, medios, estructura, marca." },
      { label: "Entender", body: "Deduce el sector, la intención y lo que convierte." },
      { label: "Componer", body: "Ensambla bloques probados en un sistema coherente." },
      { label: "Publicar", body: "Genera un sitio rápido y editable, listo para publicar." },
    ],
  },
  examples: {
    title: "Sitios reales, recreados.",
    sub: "Mismo negocio, misma marca, un sitio que los clientes por fin se toman en serio, y en el que compran.",
    before: "antes",
    transformed: "Transformado",
    items: [
      { title: "Una mesa que recordarás.", sector: "Restaurante" },
      { title: "Trabajo que capta la atención.", sector: "Agencia" },
      { title: "El lugar que imaginabas.", sector: "Inmobiliaria" },
    ],
  },
  trust: {
    eyebrow: "Sin dependencia",
    title: "Tu web. Tu dominio. Tu contenido.",
    p1: "No somos dueños de tu web. La mejoramos. Conserva todo, mejora todo y exporta el conjunto cuando quieras.",
    p2: "Conservas tu dominio, tu contenido y tu SEO. Puedes irte cuando quieras: aquí nada retiene tu sitio como rehén.",
    cards: [
      { title: "Vista previa gratis, sin tarjeta", body: "Ve tu sitio totalmente reconstruido antes de pagar nada. Solo pagas cuando decides publicarlo." },
      { title: "Tu contenido, preservado", body: "Reconstruimos a partir de tus textos, logo, imágenes y colores reales. Nunca inventamos un negocio ni datos falsos." },
      { title: "Exporta cuando quieras", body: "Descarga todo tu sitio, HTML, CSS, imágenes y cada página, y aloja donde quieras. Funciona con o sin nosotros." },
      { title: "Sin dependencia", body: "Conserva tu dominio con SSL automático y cancela cuando quieras. Si te vas, tu sitio exportado sigue funcionando y tu dominio sigue siendo tuyo." },
      { title: "Solo tus páginas públicas", body: "Leemos lo que ya es público en la web. Nunca pedimos tus contraseñas, CMS ni acceso de alojamiento." },
      { title: "Edita todo, cuando quieras", body: "Cambia textos, colores, añade páginas o secciones conversando. Los cambios se ven al instante." },
    ],
  },
  pricing: {
    title: "Precios que crecen contigo.",
    sub: "Empieza gratis. Mejora al publicar. Cancela cuando quieras.",
    ownership: "Tu web, tu dominio, tu contenido. Exporta todo cuando quieras, sin dependencia.",
    popular: "Popular",
    perMonth: "al mes",
    forever: "para siempre",
    tiers: {
      free: {
        name: "Gratis",
        desc: "Reconstruye tu sitio, ve el resultado, descárgalo. Publicar requiere un plan.",
        features: ["Reconstrucción IA completa + vista previa", "Editor IA", "Descarga del HTML", "Publicación no incluida"],
        cta: "Probar gratis",
      },
      pro: {
        name: "Pro",
        desc: "Todo lo necesario para convertir visitantes en clientes, alojado y mantenido.",
        features: [
          "Rediseño web con IA",
          "Ediciones IA ilimitadas",
          "Creación de páginas instantánea",
          "Rediseño sin perder contenido",
          "Conserva tu identidad de marca",
          "Dominio personalizado incluido",
          "Alojamiento y mantenimiento incluidos",
          "Sin necesidad de código",
        ],
        cta: "Elegir Pro",
      },
      studio: {
        name: "Agencia",
        desc: "Para agencias y autónomos que gestionan sitios de varios clientes.",
        features: ["Hasta 10 sitios de clientes", "Todo Pro, por sitio", "Un dominio propio en cada uno", "Espacios para clientes", "Soporte prioritario"],
        cta: "Elegir Agencia",
      },
    },
  },
  faq: {
    title: "Preguntas, respondidas con honestidad.",
    items: [
      { q: "¿Funcionará en mi web existente?", a: "Pega tu URL y ReFrame lee los textos, imágenes, logo y colores de tu sitio en vivo, y reconstruye a partir de ahí. Si un sitio está tras protección anti-bots o es totalmente JavaScript, te lo decimos con honestidad y partimos de lo que pudimos leer más valores por defecto editables." },
      { q: "¿Pierdo mi contenido o mi marca?", a: "No. La reconstrucción conserva tus contenidos, logo, imágenes y colores reales, y sigue tu estructura. Nada se inventa. Luego puedes cambiar lo que quieras." },
      { q: "¿Puedo conservar mi dominio?", a: "Sí. Con un plan de pago conectas tu dominio con SSL automático y mantienes la propiedad. Sin dependencia: cancela cuando quieras." },
      { q: "¿Y si no me gusta el resultado?", a: "La reconstrucción y la vista previa son gratis. Ves el resultado completo antes de pagar, y solo pagas cuando decides publicar." },
      { q: "¿Necesito un desarrollador o aprender un editor?", a: "Sin código, sin editor que aprender. Cambias textos, colores, añades páginas o secciones, activas el modo oscuro y más, conversando con el editor IA. Los cambios aparecen al instante." },
      { q: "¿Y el SEO?", a: "Los sitios reconstruidos incluyen HTML semántico limpio, metadatos correctos, vistas previas para redes, datos estructurados y un sitemap y robots.txt por sitio, para una buena indexación." },
      { q: "¿Qué pasa si cancelo o me voy?", a: "Aquí nada retiene tu sitio como rehén. Puedes exportar todo tu sitio y alojarlo donde quieras, funciona con o sin nosotros. Tu dominio sigue a tu nombre, y tu contenido y SEO siguen siendo tuyos. Te suscribes porque ReFrame mejora tu sitio continuamente, no porque irse sea difícil." },
      { q: "¿Están seguros mis datos?", a: "Solo leemos páginas ya públicas en la web. Nunca pedimos contraseñas, accesos a CMS ni a alojamiento." },
    ],
  },
  cta: {
    title: "Tu web debería ganarte clientes, no perderlos.",
    sub: "Pega tu enlace y mira cómo se convierte en el sitio que transforma visitantes en clientes, en minutos, no en meses.",
    button: "Empezar gratis",
  },
  footer: {
    tagline: "Pega un enlace. Consigue un sitio que merece visitarse. Editado conversando, en línea en minutos.",
    links: [
      { label: "Precios", href: "/#pricing" },
      { label: "Ejemplos", href: "/#examples" },
      { label: "Términos", href: "/terms" },
      { label: "Privacidad", href: "/privacy" },
      { label: "Contacto", href: "mailto:hello@reframe.design" },
    ],
  },
};

const de: Messages = {
  nav: {
    links: ["Vorher / nachher", "So funktioniert's", "Beispiele", "Preise", "FAQ"],
    cta: "Website transformieren",
    language: "Sprache",
  },
  hero: {
    badge: "Aus Besuchern werden Kunden",
    titleA: "Die Website, der Ihre",
    titleB: "Kunden",
    titleAccent: "vertrauen.",
    subtitle:
      "Link einfügen. ReFrame baut Ihre bestehende Website in eine Version um, die sofort Vertrauen schafft, damit Besucher nicht mehr abspringen, sondern kaufen. Kein Baukasten, keine leere Seite.",
    placeholder: "ihrewebsite.de",
    cta: "Meine Website transformieren",
    note: "Erste Transformation gratis. Keine Kreditkarte.",
  },
  transform: {
    eyebrow: "Sehen Sie die Transformation",
    titleA: "Dasselbe Unternehmen.",
    titleB: "Kunden, die nicht zögern.",
    sub: "Gleicher Inhalt, gleiche Marke. Ziehen Sie den Regler, um die Seite, die Kunden vertreibt, mit der zu vergleichen, der sie schon vor dem Scrollen vertrauen.",
    drag: "Zum Vergleichen ziehen",
    chips: ["Modern & schnell", "Perfekt mobil", "SEO-bereit", "Auf Conversion ausgelegt", "Ihr Inhalt bleibt"],
  },
  how: {
    title: "Von Ihrem Link zu mehr Kunden, in drei Schritten.",
    steps: [
      { title: "URL einfügen", body: "Fügen Sie den Link Ihrer aktuellen Website ein. Nichts zu installieren, nichts einzurichten." },
      { title: "Wir finden, was Sie Kunden kostet", body: "ReFrame liest Inhalt, Bilder, Marke und Branche und erkennt, was Besucher leise vertreibt." },
      { title: "Eine Website, die überzeugt", body: "Eine schnellere, moderne Website, der Kunden sofort vertrauen, in Minuten neu gebaut. Verfeinern Sie sie einfach im Chat." },
    ],
  },
  engine: {
    badge: "Der Motor",
    title: "Er weiß genau, was Ihre Kunden vertreibt.",
    sub: "Vier Durchläufe machen aus einer müden Seite eine Website, der Besucher vertrauen und nach der sie handeln. Kein Baukasten, keine leere Leinwand.",
    steps: [
      { label: "Lesen", body: "Die Live-Seite erfassen: Texte, Medien, Struktur, Marke." },
      { label: "Verstehen", body: "Branche, Absicht und Conversion-Treiber ableiten." },
      { label: "Komponieren", body: "Geprüfte Blöcke zu einem stimmigen System zusammenfügen." },
      { label: "Veröffentlichen", body: "Eine schnelle, editierbare Website rendern, bereit zur Veröffentlichung." },
    ],
  },
  examples: {
    title: "Echte Websites, neu gestaltet.",
    sub: "Gleiches Unternehmen, gleiche Marke, eine Website, die Kunden endlich ernst nehmen und bei der sie kaufen.",
    before: "vorher",
    transformed: "Transformiert",
    items: [
      { title: "Ein Tisch, den man nicht vergisst.", sector: "Restaurant" },
      { title: "Arbeit, die Aufmerksamkeit verdient.", sector: "Agentur" },
      { title: "Der Ort, den Sie sich vorgestellt haben.", sector: "Immobilien" },
    ],
  },
  trust: {
    eyebrow: "Keine Abhängigkeit",
    title: "Ihre Website. Ihre Domain. Ihr Inhalt.",
    p1: "Uns gehört Ihre Website nicht. Wir verbessern sie. Behalten Sie alles, verbessern Sie alles und exportieren Sie das Ganze, wann immer Sie wollen.",
    p2: "Sie behalten Domain, Inhalt und SEO. Sie können jederzeit gehen, hier wird nichts als Geisel gehalten.",
    cards: [
      { title: "Gratis-Vorschau, keine Karte", body: "Sehen Sie Ihre Website komplett neu gebaut, bevor Sie zahlen. Sie zahlen erst, wenn Sie veröffentlichen." },
      { title: "Ihr Inhalt, erhalten", body: "Wir bauen aus Ihren echten Texten, Logo, Bildern und Farben. Wir erfinden kein Unternehmen und keine Daten." },
      { title: "Jederzeit exportieren", body: "Laden Sie Ihre ganze Website herunter, HTML, CSS, Bilder und jede Seite, und hosten Sie überall. Funktioniert mit oder ohne uns." },
      { title: "Keine Abhängigkeit", body: "Behalten Sie Ihre Domain mit automatischem SSL und kündigen Sie jederzeit. Wenn Sie gehen, läuft Ihre exportierte Website weiter und Ihre Domain bleibt Ihre." },
      { title: "Nur Ihre öffentlichen Seiten", body: "Wir lesen, was im Web bereits öffentlich ist. Wir fragen nie nach Passwörtern, CMS- oder Hosting-Zugang." },
      { title: "Alles ändern, jederzeit", body: "Ändern Sie Texte, Farben, fügen Sie Seiten oder Abschnitte im Chat hinzu. Änderungen sind sofort live." },
    ],
  },
  pricing: {
    title: "Preise, die mit Ihnen wachsen.",
    sub: "Gratis starten. Beim Veröffentlichen upgraden. Jederzeit kündbar.",
    ownership: "Ihre Website, Ihre Domain, Ihr Inhalt. Alles jederzeit exportierbar, keine Abhängigkeit.",
    popular: "Beliebt",
    perMonth: "pro Monat",
    forever: "für immer",
    tiers: {
      free: {
        name: "Gratis",
        desc: "Website neu bauen, Ergebnis ansehen, herunterladen. Veröffentlichen erfordert einen Plan.",
        features: ["Komplette KI-Neugestaltung + Live-Vorschau", "KI-Editor", "HTML-Download", "Veröffentlichung nicht enthalten"],
        cta: "Gratis testen",
      },
      pro: {
        name: "Pro",
        desc: "Alles, um aus Besuchern zahlende Kunden zu machen, gehostet und gepflegt.",
        features: [
          "KI-gestützte Website-Neugestaltung",
          "Unbegrenzte KI-Änderungen",
          "Sofortige Seitenerstellung",
          "Neugestaltung ohne Inhaltsverlust",
          "Ihre Markenelemente bleiben",
          "Eigene Domain inklusive",
          "Hosting & Wartung inklusive",
          "Kein Code nötig",
        ],
        cta: "Pro wählen",
      },
      studio: {
        name: "Agentur",
        desc: "Für Agenturen und Freelancer mit Websites für mehrere Kunden.",
        features: ["Bis zu 10 Kunden-Websites", "Alles aus Pro, pro Website", "Eigene Domain für jede", "Kunden-Arbeitsbereiche", "Priorisierter Support"],
        cta: "Agentur wählen",
      },
    },
  },
  faq: {
    title: "Fragen, ehrlich beantwortet.",
    items: [
      { q: "Funktioniert es mit meiner bestehenden Website?", a: "URL einfügen, und ReFrame liest Texte, Bilder, Logo und Farben Ihrer Live-Seite und baut daraus neu. Bei starkem Bot-Schutz oder reinem JavaScript sagen wir es ehrlich und starten mit dem Lesbaren plus sinnvollen, editierbaren Vorgaben." },
      { q: "Verliere ich Inhalt oder Marke?", a: "Nein. Die Neugestaltung behält Ihre echten Inhalte, Logo, Bilder und Farben und folgt Ihrer Struktur. Nichts wird erfunden. Danach ändern Sie alles nach Belieben." },
      { q: "Kann ich meine Domain behalten?", a: "Ja. In einem bezahlten Plan verbinden Sie Ihre Domain mit automatischem SSL und behalten das Eigentum. Keine Abhängigkeit: jederzeit kündbar." },
      { q: "Was, wenn mir das Ergebnis nicht gefällt?", a: "Neugestaltung und Vorschau sind gratis. Sie sehen das volle Ergebnis vor dem Bezahlen und zahlen erst beim Veröffentlichen." },
      { q: "Brauche ich einen Entwickler oder einen Baukasten?", a: "Kein Code, kein Baukasten. Texte, Farben, Seiten oder Abschnitte, Dark Mode und mehr, alles im Chat mit dem KI-Editor. Änderungen erscheinen sofort." },
      { q: "Wie steht es um SEO?", a: "Neu gebaute Seiten liefern sauberes semantisches HTML, korrekte Metadaten, Social-Vorschauen, strukturierte Daten sowie Sitemap und robots.txt pro Website, für gute Indexierung." },
      { q: "Was passiert, wenn ich kündige oder gehe?", a: "Hier wird nichts als Geisel gehalten. Sie können Ihre ganze Website exportieren und überall hosten, sie läuft mit oder ohne uns. Ihre Domain bleibt auf Ihren Namen, Inhalt und SEO bleiben Ihre. Sie abonnieren, weil ReFrame Ihre Website laufend verbessert, nicht weil Gehen schwer ist." },
      { q: "Sind meine Daten sicher?", a: "Wir lesen nur im Web bereits öffentliche Seiten. Wir fragen nie nach Passwörtern, CMS-Logins oder Hosting-Zugang." },
    ],
  },
  cta: {
    title: "Ihre Website sollte Kunden gewinnen, nicht verlieren.",
    sub: "Link einfügen und zusehen, wie daraus die Website wird, die Besucher in Kunden verwandelt, in Minuten, nicht Monaten.",
    button: "Kostenlos starten",
  },
  footer: {
    tagline: "Link einfügen. Eine Website, die einen Besuch wert ist. Im Chat bearbeitet, in Minuten online.",
    links: [
      { label: "Preise", href: "/#pricing" },
      { label: "Beispiele", href: "/#examples" },
      { label: "AGB", href: "/terms" },
      { label: "Datenschutz", href: "/privacy" },
      { label: "Kontakt", href: "mailto:hello@reframe.design" },
    ],
  },
};

const it: Messages = {
  nav: {
    links: ["Prima / dopo", "Come funziona", "Esempi", "Prezzi", "FAQ"],
    cta: "Trasforma un sito",
    language: "Lingua",
  },
  hero: {
    badge: "Trasforma i visitatori in clienti",
    titleA: "Il sito di cui i tuoi",
    titleB: "clienti",
    titleAccent: "si fidano.",
    subtitle:
      "Incolla il tuo link. ReFrame ricostruisce il tuo sito attuale in una versione che ispira fiducia al primo sguardo, così i visitatori smettono di andarsene e iniziano a comprare. Nessun editor, nessuna pagina bianca.",
    placeholder: "tuosito.com",
    cta: "Trasforma il mio sito",
    note: "Prima trasformazione gratis. Senza carta.",
  },
  transform: {
    eyebrow: "Guarda la trasformazione",
    titleA: "La stessa attività.",
    titleB: "Clienti che non esitano.",
    sub: "Stesso contenuto, stesso brand. Trascina la maniglia per confrontare la pagina che allontana i clienti con quella di cui si fidano prima ancora di scorrere.",
    drag: "Trascina per confrontare",
    chips: ["Moderno e veloce", "Perfetto su mobile", "Pronto per la SEO", "Pensato per convertire", "Il tuo contenuto resta"],
  },
  how: {
    title: "Dal tuo link a più clienti, in tre passi.",
    steps: [
      { title: "Incolla il tuo URL", body: "Inserisci il link del tuo sito attuale. Niente da installare, niente da configurare." },
      { title: "Troviamo cosa ti costa clienti", body: "ReFrame legge contenuti, immagini, brand e settore e individua ciò che allontana i visitatori." },
      { title: "Un sito che li convince", body: "Un sito moderno e veloce di cui i clienti si fidano subito, ricostruito in pochi minuti. Affinalo solo conversando." },
    ],
  },
  engine: {
    badge: "Il motore",
    title: "Sa esattamente cosa allontana i tuoi clienti.",
    sub: "Quattro passaggi trasformano una pagina stanca in un sito di cui i visitatori si fidano, e su cui agiscono. Nessun editor, nessuna tela bianca.",
    steps: [
      { label: "Leggere", body: "Analizza il sito live: testi, media, struttura, brand." },
      { label: "Capire", body: "Deduce il settore, l'intento e cosa converte." },
      { label: "Comporre", body: "Assembla blocchi collaudati in un sistema coerente." },
      { label: "Pubblicare", body: "Genera un sito veloce e modificabile, pronto da pubblicare." },
    ],
  },
  examples: {
    title: "Siti veri, ricreati.",
    sub: "Stessa attività, stesso brand, un sito che i clienti prendono finalmente sul serio, e su cui comprano.",
    before: "prima",
    transformed: "Trasformato",
    items: [
      { title: "Un tavolo da ricordare.", sector: "Ristorante" },
      { title: "Lavoro che cattura l'attenzione.", sector: "Agenzia" },
      { title: "Il luogo che immaginavi.", sector: "Immobiliare" },
    ],
  },
  trust: {
    eyebrow: "Nessun vincolo",
    title: "Il tuo sito. Il tuo dominio. I tuoi contenuti.",
    p1: "Il tuo sito non è nostro. Lo miglioriamo. Tieni tutto, migliora tutto ed esporta l'insieme quando vuoi.",
    p2: "Tieni dominio, contenuti e SEO. Puoi andartene quando vuoi: qui niente tiene in ostaggio il tuo sito.",
    cards: [
      { title: "Anteprima gratis, senza carta", body: "Vedi il tuo sito completamente ricostruito prima di pagare. Paghi solo quando scegli di pubblicarlo." },
      { title: "Il tuo contenuto, preservato", body: "Ricostruiamo dai tuoi testi, logo, immagini e colori reali. Non inventiamo mai un'attività né dati falsi." },
      { title: "Esporta quando vuoi", body: "Scarica tutto il sito, HTML, CSS, immagini e ogni pagina, e ospitalo ovunque. Funziona con o senza di noi." },
      { title: "Nessun vincolo", body: "Tieni il tuo dominio con SSL automatico e disdici quando vuoi. Se te ne vai, il sito esportato continua a funzionare e il dominio resta tuo." },
      { title: "Solo le tue pagine pubbliche", body: "Leggiamo ciò che è già pubblico sul web. Non chiediamo mai password, CMS o accessi all'hosting." },
      { title: "Modifica tutto, quando vuoi", body: "Cambia testi, colori, aggiungi pagine o sezioni conversando. Le modifiche sono subito online." },
    ],
  },
  pricing: {
    title: "Prezzi che crescono con te.",
    sub: "Inizia gratis. Passa a pagamento quando pubblichi. Disdici quando vuoi.",
    ownership: "Il tuo sito, il tuo dominio, i tuoi contenuti. Esporta tutto quando vuoi, nessun vincolo.",
    popular: "Popolare",
    perMonth: "al mese",
    forever: "per sempre",
    tiers: {
      free: {
        name: "Gratis",
        desc: "Ricostruisci il sito, vedi il risultato, scaricalo. La pubblicazione richiede un piano.",
        features: ["Ricostruzione IA completa + anteprima live", "Editor IA", "Download dell'HTML", "Pubblicazione non inclusa"],
        cta: "Prova gratis",
      },
      pro: {
        name: "Pro",
        desc: "Tutto ciò che serve per trasformare i visitatori in clienti, ospitato e mantenuto.",
        features: [
          "Restyling del sito con IA",
          "Modifiche IA illimitate",
          "Creazione di pagine istantanea",
          "Restyling senza perdere contenuti",
          "I tuoi elementi di brand restano",
          "Dominio personalizzato incluso",
          "Hosting e manutenzione inclusi",
          "Nessun codice richiesto",
        ],
        cta: "Scegli Pro",
      },
      studio: {
        name: "Agenzia",
        desc: "Per agenzie e freelance che gestiscono siti per più clienti.",
        features: ["Fino a 10 siti cliente online", "Tutto Pro, per sito", "Un dominio personalizzato su ciascuno", "Spazi per i clienti", "Supporto prioritario"],
        cta: "Scegli Agenzia",
      },
    },
  },
  faq: {
    title: "Domande, risposte oneste.",
    items: [
      { q: "Funzionerà sul mio sito esistente?", a: "Incolla l'URL e ReFrame legge testi, immagini, logo e colori del tuo sito live, poi ricostruisce da lì. Se un sito ha forte protezione anti-bot o è tutto in JavaScript, te lo diciamo con onestà e partiamo da ciò che abbiamo letto più impostazioni predefinite modificabili." },
      { q: "Perdo i miei contenuti o il mio brand?", a: "No. La ricostruzione mantiene testi, logo, immagini e colori reali e segue la tua struttura. Niente è inventato. Poi puoi cambiare ciò che vuoi." },
      { q: "Posso tenere il mio dominio?", a: "Sì. Con un piano a pagamento colleghi il tuo dominio con SSL automatico e ne mantieni la proprietà. Nessun vincolo: disdici quando vuoi." },
      { q: "E se il risultato non mi piace?", a: "Ricostruzione e anteprima sono gratis. Vedi il risultato completo prima di pagare e paghi solo quando scegli di pubblicare." },
      { q: "Mi serve uno sviluppatore o imparare un editor?", a: "Niente codice, niente editor da imparare. Cambi testi, colori, aggiungi pagine o sezioni, attivi la modalità scura e altro conversando con l'editor IA. Le modifiche appaiono subito." },
      { q: "E la SEO?", a: "I siti ricostruiti includono HTML semantico pulito, metadati corretti, anteprime social, dati strutturati e sitemap e robots.txt per sito, per una buona indicizzazione." },
      { q: "Cosa succede se disdico o me ne vado?", a: "Qui niente tiene in ostaggio il tuo sito. Puoi esportare tutto il sito e ospitarlo ovunque, funziona con o senza di noi. Il dominio resta a tuo nome, contenuti e SEO restano tuoi. Ti abboni perché ReFrame migliora di continuo il tuo sito, non perché andarsene è difficile." },
      { q: "I miei dati sono al sicuro?", a: "Leggiamo solo pagine già pubbliche sul web. Non chiediamo mai password, accessi al CMS o all'hosting." },
    ],
  },
  cta: {
    title: "Il tuo sito dovrebbe farti guadagnare clienti, non perderli.",
    sub: "Incolla il tuo link e guardalo diventare il sito che trasforma i visitatori in clienti, in minuti, non mesi.",
    button: "Inizia gratis",
  },
  footer: {
    tagline: "Incolla un link. Ottieni un sito che vale la visita. Modificato conversando, online in pochi minuti.",
    links: [
      { label: "Prezzi", href: "/#pricing" },
      { label: "Esempi", href: "/#examples" },
      { label: "Termini", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Contatto", href: "mailto:hello@reframe.design" },
    ],
  },
};

const dict: Record<Locale, Messages> = { en, fr, es, de, it };

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: Messages };
const I18nContext = React.createContext<Ctx>({ locale: "en", setLocale: () => {}, t: en });

const STORAGE_KEY = "reframe-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Start at "en" on the server and the first client render to avoid a
  // hydration mismatch; pick up the saved / browser locale right after mount.
  const [locale, setLocaleState] = React.useState<Locale>("en");

  React.useEffect(() => {
    let next: Locale | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && dict[saved]) next = saved;
    } catch {
      /* ignore */
    }
    if (!next && typeof navigator !== "undefined") {
      const guess = navigator.language.slice(0, 2).toLowerCase() as Locale;
      if (dict[guess]) next = guess;
    }
    if (next && next !== "en") setLocaleState(next);
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    if (!dict[l]) return;
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }, []);

  const value = React.useMemo<Ctx>(() => ({ locale, setLocale, t: dict[locale] }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the active locale, the setter, and the translated messages. */
export function useI18n(): Ctx {
  return React.useContext(I18nContext);
}

/* -------------------------------------------------------------------------- */
/*  Dashboard (connected app) strings                                         */
/* -------------------------------------------------------------------------- */

type Dash = {
  nav: string[]; // Dashboard, My sites, Result, AI Editor
  signedIn: string;
  signIn: string;
  signOut: string;
  verifyMsg: string;
  verifyResend: string;
  verifySending: string;
  verifySent: string;
  title: string;
  subtitle: string;
  urlPlaceholder: string;
  analyze: string;
};

const DASH: Record<Locale, Dash> = {
  en: {
    nav: ["Dashboard", "My sites", "Leads", "Result", "AI Editor"],
    signedIn: "Signed in", signIn: "Sign in", signOut: "Sign out",
    verifyMsg: "Confirm your email to secure your account.",
    verifyResend: "Resend email", verifySending: "Sending…", verifySent: "Verification sent",
    title: "Win back your customers",
    subtitle: "Paste your URL. ReFrame rebuilds your site into one your customers trust on sight, in minutes.",
    urlPlaceholder: "yourwebsite.com", analyze: "Analyze",
  },
  fr: {
    nav: ["Tableau de bord", "Mes sites", "Leads", "Résultat", "Éditeur IA"],
    signedIn: "Connecté", signIn: "Se connecter", signOut: "Se déconnecter",
    verifyMsg: "Confirmez votre e-mail pour sécuriser votre compte.",
    verifyResend: "Renvoyer l'e-mail", verifySending: "Envoi…", verifySent: "E-mail envoyé",
    title: "Reconquérez vos clients",
    subtitle: "Collez votre URL. ReFrame reconstruit votre site en une version qui inspire confiance immédiatement, en quelques minutes.",
    urlPlaceholder: "votresite.com", analyze: "Analyser",
  },
  es: {
    nav: ["Panel", "Mis sitios", "Leads", "Resultado", "Editor IA"],
    signedIn: "Conectado", signIn: "Iniciar sesión", signOut: "Cerrar sesión",
    verifyMsg: "Confirma tu correo para proteger tu cuenta.",
    verifyResend: "Reenviar correo", verifySending: "Enviando…", verifySent: "Correo enviado",
    title: "Recupera tus clientes",
    subtitle: "Pega tu URL. ReFrame reconstruye tu sitio en una versión que inspira confianza al instante, en minutos.",
    urlPlaceholder: "tusitio.com", analyze: "Analizar",
  },
  de: {
    nav: ["Dashboard", "Meine Seiten", "Leads", "Ergebnis", "KI-Editor"],
    signedIn: "Angemeldet", signIn: "Anmelden", signOut: "Abmelden",
    verifyMsg: "Bestätigen Sie Ihre E-Mail, um Ihr Konto zu sichern.",
    verifyResend: "E-Mail erneut senden", verifySending: "Senden…", verifySent: "E-Mail gesendet",
    title: "Gewinnen Sie Ihre Kunden zurück",
    subtitle: "URL einfügen. ReFrame baut Ihre Website in Minuten in eine um, der Kunden sofort vertrauen.",
    urlPlaceholder: "ihrewebsite.de", analyze: "Analysieren",
  },
  it: {
    nav: ["Dashboard", "I miei siti", "Lead", "Risultato", "Editor IA"],
    signedIn: "Connesso", signIn: "Accedi", signOut: "Esci",
    verifyMsg: "Conferma la tua email per proteggere l'account.",
    verifyResend: "Reinvia email", verifySending: "Invio…", verifySent: "Email inviata",
    title: "Riconquista i tuoi clienti",
    subtitle: "Incolla il tuo URL. ReFrame ricostruisce il tuo sito in una versione di cui i clienti si fidano subito, in pochi minuti.",
    urlPlaceholder: "tuosito.com", analyze: "Analizza",
  },
};

/** Dashboard strings for the active locale. */
export function useDash(): Dash {
  const { locale } = useI18n();
  return DASH[locale];
}
