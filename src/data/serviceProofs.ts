// serviceProofs — CS-S9. Faits vérifiés (Source Pack du prompt CS-S9 §5)
// pour les preuves SANS Content Collection ni média local (MyDashServ, Ink
// Red Plumes, BeatStudio, GlassTrack/Saverglass, Vélocéan). Centralisé ici
// car MyDashServ est utilisé par deux pages (Applications et Sur mesure) :
// évite de dupliquer les mêmes faits à deux endroits. Aucune métrique,
// aucun client, aucun résultat chiffré n'est inventé — uniquement les faits
// donnés par le Source Pack.

export interface SecondaryProof {
  title: string;
  angle: string;
  facts: string[];
  /** Si vrai, le composant qui consomme cette donnée doit afficher
   * explicitement le mot "démonstrateur" (prompt §45, test de vérité) —
   * jamais présenté comme une mission ou un client. */
  isDemonstrator?: boolean;
}

export const mydashserv: SecondaryProof = {
  title: "MyDashServ",
  angle: "Organisation et planning de formations : une logique métier spécifique.",
  facts: [
    "Application métier full-stack",
    "Multi-rôles",
    "Matching formateur / session",
    "Détection de conflits de planning",
    "Spring Boot",
    "React",
    "JWT",
    "MariaDB",
  ],
};

export const inkRedPlumes: SecondaryProof = {
  title: "Ink Red Plumes",
  angle: "Vente et gestion de livres, avec des rôles distincts par type d'utilisateur.",
  facts: ["Plateforme full-stack", "Rôles lecteurs / auteurs / administrateurs", "Spring Boot", "React", "MariaDB", "JWT"],
};

export const beatstudio: SecondaryProof = {
  title: "BeatStudio",
  angle: "Un séquenceur audio dans le navigateur — le sur-mesure peut sortir du CRUD classique.",
  facts: [
    "Outil web dans le navigateur",
    "React / TypeScript",
    "Tone.js / Web Audio",
    "Import de samples",
    "Effets audio",
    "Sauvegarde locale",
    "Export JSON / WAV",
    "Zéro backend obligatoire",
  ],
};

export const glasstrack: SecondaryProof = {
  title: "GlassTrack",
  angle: "Un démonstrateur d'adaptation à un environnement Delphi / Oracle industriel.",
  facts: ["Démonstrateur de montée en compétence", "Delphi", "Oracle", "FireDAC", "PL/SQL", "Architecture 3-tiers"],
  isDemonstrator: true,
};

export const velocean: SecondaryProof = {
  title: "Vélocéan",
  angle: "Un démonstrateur d'expérience web immersive.",
  facts: [
    "React / TypeScript",
    "Hero vidéo",
    "Three.js / React Three Fiber",
    "Fallback WebGL",
    "Reduced-motion",
    "Responsive",
    "Accessibilité",
  ],
  isDemonstrator: true,
};
