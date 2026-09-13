// externalProjectMedia — CS-S9B. Captures RÉELLES récupérées depuis le
// portfolio public de l'utilisateur (https://spiritzen.github.io/portfolio/)
// et le dépôt GitHub associé (https://github.com/Spiritzen), sources
// explicitement autorisées par le prompt CS-S9B §"Sources autorisées".
// Chaque image a été téléchargée depuis son URL publique réelle (aucune
// image inventée, générée ou d'illustration générique) puis recadrée
// UNIQUEMENT pour retirer le chrome de navigateur quand il était présent
// (BeatStudio), jamais pour modifier le contenu applicatif capturé.
//
// Provenance exacte de chaque fichier :
// - ink-red-plumes-home.jpg : https://spiritzen.github.io/portfolio/images/inkredplumes/shot01-768.jpg
//   (page d'accueil Ink Red Plumes, issue de la galerie "Captures commentées"
//   de la fiche projet https://spiritzen.github.io/portfolio/ink-red-plumes)
// - mydashserv-sessions.jpg : https://spiritzen.github.io/portfolio/images/sessionPlanning/session.jpg
//   (écran "Sessions / Planning" de l'espace admin MyDashServ, fiche
//   https://spiritzen.github.io/portfolio/session-planning)
// - beatstudio.jpg : https://spiritzen.github.io/portfolio/images/beatstudiopiano.jpg
//   (interface du séquenceur BeatStudio, fiche
//   https://spiritzen.github.io/portfolio/creative-suite) — recadrée pour
//   retirer la barre d'adresse du navigateur visible sur la capture source.
// - velocean-hero.jpg : capture d'écran réalisée directement sur la
//   démonstration live https://spiritzen.github.io/velocean/ (frame de la
//   vidéo d'en-tête au chargement) — aucune image de la galerie du
//   portfolio n'étant disponible en dimensions suffisantes pour cet usage.
//   Convertie de PNG (capture brute) en JPG : contenu photographique, un
//   fallback PNG aurait produit un fichier plusieurs fois plus lourd sans
//   aucun bénéfice de qualité visible (mêmes formats que le reste du
//   projet, cf. projectMedia.ts, qui utilise déjà exclusivement du JPG).
import type { ImageMetadata } from "astro";

import inkRedPlumesHome from "../assets/projects/external/ink-red-plumes-home.jpg";
import mydashservSessions from "../assets/projects/external/mydashserv-sessions.jpg";
import beatstudioShot from "../assets/projects/external/beatstudio.jpg";
import veloceanHero from "../assets/projects/external/velocean-hero.jpg";

export interface ExternalMedia {
  image: ImageMetadata;
  alt: string;
}

export const externalProjectMedia: Record<string, ExternalMedia> = {
  inkRedPlumes: {
    image: inkRedPlumesHome,
    alt: "Page d'accueil de la marketplace de livres Ink Red Plumes",
  },
  mydashserv: {
    image: mydashservSessions,
    alt: "Écran de gestion des sessions et du planning dans l'espace admin MyDashServ",
  },
  beatstudio: {
    image: beatstudioShot,
    alt: "Séquenceur de rythmes BeatStudio, avec pistes colorées et clavier virtuel",
  },
  velocean: {
    image: veloceanHero,
    alt: "Écran d'ouverture du démonstrateur Vélocéan, cycliste et nageuse au-dessus et sous la surface de l'eau",
  },
};
