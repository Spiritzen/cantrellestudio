// serviceCaseStudyMap — CS-S10B. Source de vérité UNIQUE pour la relation
// Service ↔ Étude de cas, dans les deux sens :
// - "quelle(s) étude(s) prouve(nt) cette offre" (pages Services, via
//   `getProofsForService`) ;
// - "quel Service ce projet illustre-t-il principalement / de façon
//   connexe" (pages études de cas, via `getServicesForProject`).
//
// Ne stocke QUE la relation elle-même (prompt §4) : slug service, libellé/
// lien service, slug projet, rôle sur la page Service (primary/secondary),
// rôle sur la page projet (principal/connexe, absent si non affiché), et
// une phrase de contexte courte (1-2 phrases max, prompt §15). Le titre, le
// résumé, la stack, les médias et les "capacités démontrées" restent lus
// directement depuis la Content Collection `realisations` et
// `caseStudyContent.ts` au moment du rendu (jamais recopiés ici) — voir
// prompt §37 "la Content Collection reste source du contenu projet".
export type ProofRole = "primary" | "secondary";
export type ProjectPageRole = "principal" | "connexe";

export interface ServiceCaseStudyLink {
  serviceSlug: string;
  serviceLabel: string;
  serviceHref: string;
  projectSlug: string;
  /** Rôle de ce projet comme preuve SUR LA PAGE SERVICE. */
  role: ProofRole;
  /** Phrase de contexte courte affichée à la fois sur le bloc preuve
   * (page Service) et sur le bloc "Service associé/connexe" (page projet). */
  angle: string;
  /** Rôle de CE Service sur la page de l'étude elle-même. Absent = ce
   * Service n'est pas affiché comme "associé"/"connexe" sur la page projet
   * (cas de Sereno → Sur mesure : preuve secondaire valable sur la page
   * Service, mais pas de badge Service connexe forcé sur la page Sereno). */
  onProjectPage?: ProjectPageRole;
}

const APPLICATIONS = {
  slug: "applications-metier-saas",
  label: "Applications métier & SaaS",
  href: "/applications-metier-saas/",
};
const SITES = {
  slug: "sites-professionnels",
  label: "Sites professionnels",
  href: "/sites-professionnels/",
};
const SUR_MESURE = {
  slug: "developpement-sur-mesure",
  label: "Développement sur mesure",
  href: "/developpement-sur-mesure/",
};

export const serviceCaseStudyMap: ServiceCaseStudyLink[] = [
  // Applications métier & SaaS — preuve phare Sereno, secondaire AgencyOS
  // (prompt §7, hiérarchie visuelle obligatoire Sereno > AgencyOS).
  {
    serviceSlug: APPLICATIONS.slug,
    serviceLabel: APPLICATIONS.label,
    serviceHref: APPLICATIONS.href,
    projectSlug: "sereno",
    role: "primary",
    angle:
      "Sereno illustre la conception d'un workflow métier soumis à des règles de conformité fortes, dans une architecture SaaS complète.",
    onProjectPage: "principal",
  },
  {
    serviceSlug: APPLICATIONS.slug,
    serviceLabel: APPLICATIONS.label,
    serviceHref: APPLICATIONS.href,
    projectSlug: "agencyos",
    role: "secondary",
    angle:
      "AgencyOS illustre une architecture SaaS multi-tenant qui réunit plusieurs domaines métier dans un même produit.",
    onProjectPage: "principal",
  },

  // Sites professionnels — preuve phare unique Belkhir Dépannage (prompt
  // §8 : ne pas ajouter une seconde étude artificielle pour équilibrer).
  {
    serviceSlug: SITES.slug,
    serviceLabel: SITES.label,
    serviceHref: SITES.href,
    projectSlug: "belkhir-depannage",
    role: "primary",
    angle:
      "Belkhir Dépannage illustre une architecture de contenu pensée pour l'urgence, le mobile et le référencement local.",
    onProjectPage: "principal",
  },

  // Développement sur mesure — micro-sprint "Preuves Sereno/AgencyOS/Trajet
  // Formateur" (PROMPT_CLAUDE_CODE_DEV_SUR_MESURE_PREUVES_SERENO_AGENCYOS_
  // TRAJET_FORMATEUR) — hiérarchie INVERSÉE par décision explicite de
  // Sébastien : Sereno devient la preuve PHARE (carte vedette pleine largeur)
  // sur cette page, AgencyOS repasse secondaire (carte de même importance
  // qu'un 3e projet, Trajet Formateur, ajouté en page — sans entrée dans ce
  // fichier : aucune étude de cas interne, pas de relation Service↔Projet à
  // documenter ici). `onProjectPage` INCHANGÉ pour les deux (rôle sur la
  // page du PROJET lui-même, sans lien avec ce nouveau classement ici) :
  // AgencyOS reste "connexe" sur sa propre page (Service principal =
  // Applications métier & SaaS), Sereno n'affiche toujours aucun badge
  // Service connexe forcé sur la sienne.
  {
    serviceSlug: SUR_MESURE.slug,
    serviceLabel: SUR_MESURE.label,
    serviceHref: SUR_MESURE.href,
    projectSlug: "sereno",
    role: "primary",
    angle: "Sereno illustre la traduction de règles métier complexes en un workflow logiciel fiable et testé.",
  },
  {
    serviceSlug: SUR_MESURE.slug,
    serviceLabel: SUR_MESURE.label,
    serviceHref: SUR_MESURE.href,
    projectSlug: "agencyos",
    role: "secondary",
    angle:
      "AgencyOS illustre une architecture modulaire capable d'intégrer plusieurs domaines métier dans un système cohérent.",
    onProjectPage: "connexe",
  },
];

/** Preuves d'un Service, phare en premier. Consommé par les 3 pages Services. */
export function getProofsForService(serviceSlug: string): ServiceCaseStudyLink[] {
  return serviceCaseStudyMap
    .filter((link) => link.serviceSlug === serviceSlug)
    .sort((a, b) => (a.role === b.role ? 0 : a.role === "primary" ? -1 : 1));
}

/** Service(s) affiché(s) sur la page d'une étude de cas, principal en premier. */
export function getServicesForProject(projectSlug: string): ServiceCaseStudyLink[] {
  return serviceCaseStudyMap
    .filter((link) => link.projectSlug === projectSlug && link.onProjectPage)
    .sort((a, b) => (a.onProjectPage === b.onProjectPage ? 0 : a.onProjectPage === "principal" ? -1 : 1));
}
