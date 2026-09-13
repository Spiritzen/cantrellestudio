// projectMedia — CS-S5 §18, étendu CS-S10 §7-9. Mapping typé slug → médias
// réels. `primary`/`secondary` restent STRICTEMENT inchangés (mêmes images,
// mêmes alt) : consommés par la Home (ProjectCard.astro, non modifié dans
// ce sprint) et par les pages Services (ServiceProofCard.astro, non
// modifié). CS-S10 ajoute uniquement `gallery`, une sélection de 5-6
// captures par projet pour les études de cas premium, dans l'ordre
// narratif recommandé par le prompt (§15/§18/§21). Chaque légende est un
// rôle démonstratif concret (jamais "capture d'écran n°3").
//
// Provenance CS-S10 : `primary`/`secondary` proviennent de CS-S5 (déjà en
// place). Les captures supplémentaires proviennent du portfolio public de
// l'utilisateur (https://spiritzen.github.io/portfolio/, source autorisée
// par le prompt) ; pour Sereno et AgencyOS, les fichiers déjà locaux
// (`sereno-dashboard.jpg`, `sereno-facture.jpg`, `agencyos-dashboard.jpg`,
// `agencyos-factures.jpg`) se sont révélés être, à la vérification par
// hash MD5, BYTE-IDENTIQUES aux captures 01/02 (Sereno) et 1/5 (AgencyOS)
// du portfolio — aucune duplication, aucun conflit d'obsolescence. Pour
// Belkhir Dépannage, les 3 captures supplémentaires proviennent
// directement de la démonstration live
// (https://spiritzen.github.io/belkhir-depannage/), le portfolio
// n'affichant qu'une seule vignette pour ce projet.
import type { ImageMetadata } from "astro";

import serenoDashboard from "../assets/projects/sereno/sereno-dashboard.jpg";
import serenoFacture from "../assets/projects/sereno/sereno-facture.jpg";
import serenoConformite from "../assets/projects/sereno/sereno-conformite.jpg";
import serenoCycleVie from "../assets/projects/sereno/sereno-cycle-vie.jpg";
import serenoTransmission from "../assets/projects/sereno/sereno-transmission.jpg";
import serenoFacturePdf from "../assets/projects/sereno/sereno-facture-pdf.jpg";

import agencyosDashboard from "../assets/projects/agencyos/agencyos-dashboard.jpg";
import agencyosFactures from "../assets/projects/agencyos/agencyos-factures.jpg";
import agencyosCrm from "../assets/projects/agencyos/agencyos-crm.jpg";
import agencyosProjets from "../assets/projects/agencyos/agencyos-projets.jpg";
import agencyosTimesheet from "../assets/projects/agencyos/agencyos-timesheet.jpg";

import belkhirHero from "../assets/projects/belkhir-depannage/belkhir-hero.jpg";
import belkhirUrgences from "../assets/projects/belkhir-depannage/belkhir-urgences.jpg";
import belkhirDomaines from "../assets/projects/belkhir-depannage/belkhir-domaines.jpg";
import belkhirZones from "../assets/projects/belkhir-depannage/belkhir-zones.jpg";
import belkhirMobile from "../assets/projects/belkhir-depannage/belkhir-mobile.jpg";

export interface GalleryMedia {
  image: ImageMetadata;
  alt: string;
  caption: string;
}

export interface ProjectMedia {
  primary: ImageMetadata;
  primaryAlt: string;
  secondary?: ImageMetadata;
  secondaryAlt?: string;
  /** CS-S10 — galerie complète pour l'étude de cas (4-7 médias, prompt §7). */
  gallery?: GalleryMedia[];
}

export const projectMedia: Record<string, ProjectMedia> = {
  sereno: {
    primary: serenoDashboard,
    primaryAlt: "Tableau de bord de Sereno, application de facturation électronique",
    secondary: serenoFacture,
    secondaryAlt: "Interface de création d'une facture dans Sereno",
    gallery: [
      {
        image: serenoDashboard,
        alt: "Tableau de bord Sereno affichant l'encaissement constaté, les montants en attente et en retard, la complétude des documents, ainsi que les factures récentes et les échéances à venir",
        caption: "Vision globale : encaissements, échéances et complétude documentaire en un coup d'œil.",
      },
      {
        image: serenoFacture,
        alt: "Formulaire de création d'une facture avec lignes de prestation et calcul automatique de la TVA et des totaux",
        caption: "Création d'une facture : lignes de prestation, totaux et TVA recalculés côté serveur.",
      },
      {
        image: serenoConformite,
        alt: "Écran de contrôle avant émission affichant les totaux HT/TVA/TTC et le message « Facture conforme, aucune erreur bloquante détectée »",
        caption: "Pré-contrôle de conformité : l'émission reste bloquée tant qu'une erreur est détectée.",
      },
      {
        image: serenoCycleVie,
        alt: "Détail d'une facture émise avec accès aux fichiers PDF et XML, et frise du cycle de vie du brouillon jusqu'au paiement reçu",
        caption: "Cycle de vie de la facture : du brouillon à l'émission, jusqu'au paiement.",
      },
      {
        image: serenoTransmission,
        alt: "Supervision de la transmission d'une facture : dépôt marqué « simulation » vers un fournisseur sandbox, identifiant externe et historique des avoirs liés",
        caption: "Transmission (sandbox) et gestion des avoirs — étape simulée, jamais présentée comme réelle.",
      },
      {
        image: serenoFacturePdf,
        alt: "Facture Factur-X ouverte dans un lecteur PDF, avec bandeau de conformité PDF/A et pièce jointe XML de la facture électronique",
        caption: "Document Factur-X : PDF/A-3 lisible avec XML structuré en pièce jointe.",
      },
    ],
  },
  agencyos: {
    primary: agencyosDashboard,
    primaryAlt: "Tableau de bord de la plateforme SaaS AgencyOS",
    secondary: agencyosFactures,
    secondaryAlt: "Interface de suivi des factures et paiements dans AgencyOS",
    gallery: [
      {
        image: agencyosDashboard,
        alt: "Tableau de bord AgencyOS : chiffre d'affaires du mois, projets actifs, tâches ouvertes et factures impayées",
        caption: "Vision globale : un seul tableau de bord pour plusieurs domaines métier.",
      },
      {
        image: agencyosCrm,
        alt: "Fiche client en édition dans le CRM AgencyOS, avec coordonnées, statut et site web",
        caption: "CRM : clients et contacts centralisés, statuts de prospection suivis.",
      },
      {
        image: agencyosProjets,
        alt: "Détail d'un projet AgencyOS avec phases, tâches, priorités et progression",
        caption: "Projets : phases, tâches et progression suivies jusqu'au détail.",
      },
      {
        image: agencyosTimesheet,
        alt: "Timesheet hebdomadaire AgencyOS avec heures saisies par jour et par tâche",
        caption: "Timesheet : temps passé par projet, saisi automatiquement ou manuellement.",
      },
      {
        image: agencyosFactures,
        alt: "Interface de suivi des factures et paiements dans AgencyOS",
        caption: "Finance : devis, factures et paiements dans le même espace.",
      },
    ],
  },
  "belkhir-depannage": {
    primary: belkhirHero,
    primaryAlt: "Hero de la maquette Belkhir Dépannage",
    secondary: belkhirUrgences,
    secondaryAlt: "Parcours de sélection d'une urgence sur la maquette Belkhir Dépannage",
    gallery: [
      {
        image: belkhirHero,
        alt: "Page d'accueil de Belkhir Dépannage : dépannage d'urgence 24h/24 et 7j/7 dans les Hauts-de-France, avec numéro d'urgence visible",
        caption: "Accueil : le besoin (urgence) et l'action (appeler) visibles immédiatement.",
      },
      {
        image: belkhirUrgences,
        alt: "Section « Quelle est votre urgence ? » avec les situations fréquentes (fuite d'eau, chauffage en panne, porte bloquée, vitre cassée)",
        caption: "Qualification de l'urgence avant l'appel, sans transformer le site en panneau publicitaire.",
      },
      {
        image: belkhirDomaines,
        alt: "Page métier « Dépannage plomberie d'urgence » avec CTA d'appel et vérification de secteur",
        caption: "Une page dédiée par métier, avec son propre message et son propre appel à l'action.",
      },
      {
        image: belkhirZones,
        alt: "Carte des zones d'intervention dans les Hauts-de-France avec recherche de commune ou code postal",
        caption: "Zones couvertes : vérification du secteur avant l'appel, recherche effectuée localement dans le navigateur.",
      },
      {
        image: belkhirMobile,
        alt: "Version mobile de la page d'accueil Belkhir Dépannage, avec barre d'appel permanente en bas d'écran",
        caption: "Mobile : la barre d'appel reste accessible en permanence, sur l'écran le plus utilisé en urgence.",
      },
    ],
  },
};
