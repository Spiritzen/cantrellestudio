// caseStudyContent — CS-S10. Narration enrichie des 3 études de cas
// premium (Sereno, AgencyOS, Belkhir Dépannage).
//
// ARBITRAGE (prompt §41) : la Content Collection `realisations`
// (src/content.config.ts) n'est PAS modifiée. Son schéma existant
// (title/summary/category/technologies/problem/solution/result) reste la
// source de vérité minimale déjà consommée ailleurs (Home, pages
// Services, index /realisations/) — l'enrichir de champs comme
// `challenge`/`approach`/`outcome` aurait dupliqué cette narration très
// spécifique à chaque projet (workflow Sereno, grille de modules
// AgencyOS, blocs éditoriaux Belkhir) dans un schéma générique, au risque
// de transformer la collection en mini-CMS (interdit explicitement).
// Toute la narration bespoke vit ici, importée uniquement par
// `src/pages/realisations/[slug].astro`.
//
// SOURCES ET VÉRITÉ (prompt §4/§42) : chaque fait provient du portfolio
// public de l'utilisateur (https://spiritzen.github.io/portfolio/,
// fiches Sereno/AgencyOS/Belkhir consultées directement) ou de la
// démonstration live Belkhir (https://spiritzen.github.io/belkhir-depannage/).
// Aucun chiffre business, aucun client, aucune donnée de production
// inventée. Les statuts "état réel" (validé / à venir) reprennent la
// distinction explicite déjà posée par l'auteur sur son propre portfolio.

export interface TechItem {
  name: string;
  role: string;
}

export interface CaseStudyContent {
  eyebrow: string;
  statusLabel: string;
  heroSummary: string;
  stackShort: string[];
  problemTitle: string;
  problemBody: string[];
  reflectionQuote: string;
  reflectionBody?: string;
  tech: TechItem[];
  outcomeAchieved: string[];
  outcomeNext: string[];
  proves: string[];
  githubUrl?: string;
  githubLabel?: string;
}

export const sereno: CaseStudyContent = {
  eyebrow: "SaaS métier",
  statusLabel: "MVP SaaS — socle Factur-X validé",
  heroSummary:
    "SaaS de facturation électronique pensé pour les indépendants et TPE françaises, avec un socle de conformité Factur-X déjà validé.",
  stackShort: ["Ruby on Rails", "React / TypeScript", "PostgreSQL"],
  problemTitle: "Une facture n'est pas qu'un document",
  problemBody: [
    "La facturation électronique ne se résume pas à un formulaire : elle implique des données structurées, des statuts de cycle de vie, des règles de conformité, des documents normés (PDF/A, XML) et des contrôles qui doivent bloquer une émission incorrecte avant qu'elle ne parte.",
    "Traduire ces contraintes réglementaires en comportements logiciels fiables — plutôt qu'en simple mise en forme — est le vrai sujet du projet.",
  ],
  reflectionQuote: "Comment transformer ces contraintes en workflow compréhensible ?",
  reflectionBody:
    "Plutôt que d'exposer la complexité réglementaire à l'utilisateur, Sereno la traduit en une suite d'étapes explicites : créer, contrôler, émettre, suivre, corriger par avoir si nécessaire.",
  tech: [
    { name: "Ruby on Rails (API)", role: "API métier en mode pur, pensée pour évoluer sans réécriture lourde." },
    { name: "React / TypeScript", role: "Interface applicative structurée, connectée à une API JSON versionnée." },
    { name: "PostgreSQL", role: "Données relationnelles du SaaS, isolation par organisation (multi-tenant)." },
    { name: "RSpec / Vitest", role: "Suite de tests intégrée à une CI, rejouée sur chaque facture et chaque avoir." },
  ],
  outcomeAchieved: [
    "Génération du socle Factur-X (PDF/A-3 + XML structuré)",
    "Workflow complet facture et avoir",
    "Contrôles de conformité avant émission",
    "Transmission simulée (sandbox) vers un fournisseur externe",
    "Portail destinataire en lecture seule",
    "Socle couvert par une suite de tests",
  ],
  outcomeNext: [
    "Contractualisation avec une Plateforme Agréée réelle",
    "Raccordement à une API et des identifiants de production",
    "Stratégie d'archivage réglementaire",
    "Finalisation de la monétisation",
  ],
  proves: [
    "Modélisation d'un métier complexe",
    "Conformité réglementaire",
    "UX d'un processus contraint",
    "Architecture full-stack",
    "Tests intégrés à la CI",
  ],
  githubUrl: "https://github.com/Spiritzen/sereno-saas",
  githubLabel: "Voir le dépôt sereno-saas",
};

export const agencyos: CaseStudyContent = {
  eyebrow: "SaaS multi-tenant",
  statusLabel: "SaaS multi-tenant — déployé sur serveur (Docker, HTTPS), démonstration publique actuellement hors ligne",
  heroSummary:
    "Plateforme SaaS multi-tenant qui centralise CRM, projets, temps et finance pour une agence ou une activité de service.",
  stackShort: ["Java 21 / Spring Boot", "React / TypeScript", "PostgreSQL"],
  problemTitle: "Une activité de service disperse vite ses outils",
  problemBody: [
    "Une agence ou une structure de service jongle souvent entre plusieurs outils : CRM, gestion de projet, facturation, feuilles de temps, reporting. Les données se dupliquent, se désynchronisent et deviennent peu fiables.",
  ],
  reflectionQuote: "Comment réunir plusieurs domaines métier sans créer un outil illisible ?",
  reflectionBody:
    "AgencyOS centralise l'ensemble du workflow — clients, projets, temps, finance, équipe — dans une plateforme unique et sécurisée, avec une isolation stricte des données par organisation.",
  tech: [
    { name: "Java 21 / Spring Boot", role: "Backend applicatif, architecture en couches (Controller → Service → Repository)." },
    { name: "React / TypeScript", role: "Interface applicative multi-module (CRM, projets, finance, équipe)." },
    { name: "PostgreSQL", role: "Données relationnelles, isolation par organisation (tenant)." },
    { name: "JWT (cookies HttpOnly) + rôles", role: "Authentification stateless et contrôle d'accès par rôle." },
    { name: "Docker", role: "Déploiement conteneurisé, expérimenté sur un VPS en HTTPS." },
  ],
  outcomeAchieved: [
    "Architecture SaaS multi-tenant avec isolation des données par organisation",
    "Authentification JWT et gestion des rôles",
    "CRM clients et contacts",
    "Gestion des projets, tâches et temps passé",
    "Devis, factures, paiements, dépenses et reporting financier",
    "Gestion des équipes et invitations",
    "Déploiement Docker et HTTPS expérimenté en conditions réelles",
  ],
  outcomeNext: [
    "Migration vers une nouvelle infrastructure d'hébergement",
    "Environnement de démonstration réinitialisable et isolé",
    "Plans d'abonnement et paiement",
  ],
  proves: [
    "Conception d'un SaaS multi-domaine",
    "Architecture multi-tenant",
    "Cohérence entre modules",
    "Sécurité applicative (JWT, rôles)",
    "Full-stack (front, back, données)",
  ],
};

export const belkhir: CaseStudyContent = {
  eyebrow: "Site professionnel",
  statusLabel: "Projet de refonte pour un client réel, actuellement en validation — non indexé, formulaire pas encore branché",
  heroSummary:
    "Maquette multi-pages d'un site de dépannage d'urgence, pensée pour l'urgence, le mobile et le référencement local.",
  stackShort: ["Astro 7", "TypeScript strict", "CSS natif"],
  problemTitle: "Un service d'urgence ne laisse pas le temps de chercher",
  problemBody: [
    "Pour un service de dépannage, le visiteur doit comprendre immédiatement à qui il a affaire, voir un numéro de téléphone, identifier son métier (plomberie, chauffage, serrurerie...), vérifier que sa zone est couverte et être rassuré — le tout depuis un mobile, dans l'urgence.",
  ],
  reflectionQuote: "Comment hiérarchiser l'urgence sans transformer le site en panneau publicitaire ?",
  reflectionBody:
    "Chaque page qualifie d'abord la situation avant de pousser l'appel : une carte par type d'urgence, une page par métier, une vérification de secteur avant le devis.",
  tech: [
    { name: "Astro 7", role: "Contenu et SEO en rendu statique, JavaScript minimal." },
    { name: "TypeScript strict", role: "Fiabilité du code sur un site multi-pages." },
    { name: "astro:assets", role: "Images optimisées (formats modernes, dimensions adaptées)." },
    { name: "CSS natif", role: "Direction artistique propre au projet, sans dépendance de style lourde." },
  ],
  outcomeAchieved: [
    "Maquette multi-pages structurée (accueil, 5 pages métiers, zones d'intervention)",
    "Navigation mobile accessible",
    "CTA d'appel et de devis toujours visibles",
    "Vérification de zone d'intervention (recherche locale, sans envoi de données)",
    "Base SEO technique (title, meta, structure sémantique)",
  ],
  outcomeNext: ["Validation finale par le client", "Branchement réel de l'envoi du formulaire de devis", "Indexation du site"],
  proves: [
    "Architecture de contenu SEO",
    "Hiérarchie de l'urgence",
    "Conception mobile-first",
    "Conversion (appel, devis)",
    "Direction artistique sobre",
  ],
  githubUrl: "https://github.com/Spiritzen/belkhir-depannage",
  githubLabel: "Voir le dépôt belkhir-depannage",
};

export const caseStudyContent: Record<string, CaseStudyContent> = {
  sereno,
  agencyos,
  "belkhir-depannage": belkhir,
};

/** Cycle "projet suivant" (prompt §39) : Sereno → AgencyOS → Belkhir → Sereno. */
export const nextProjectSlug: Record<string, string> = {
  sereno: "agencyos",
  agencyos: "belkhir-depannage",
  "belkhir-depannage": "sereno",
};
