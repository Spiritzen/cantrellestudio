// motionUtils — CS-S8. Constantes partagées du langage de mouvement de la
// Home. Module TypeScript pur (pas de React, pas de framework) : importé
// uniquement par HomeMotion.astro. Centralise les valeurs numériques pour
// qu'il n'existe qu'UN SEUL jeu de durées/easings sur toute la page (prompt
// §3 : "pas 12 easings différents").

// Timing recommandé par le prompt §3, repris tel quel.
export const DURATION = {
  micro: 0.2, // 160–240ms
  hover: 0.25, // 220–320ms
  reveal: 0.6, // 500–800ms
  structural: 0.85, // 700–1100ms — CTA final ("fermeture de page")
} as const;

// Un seul easing "entrée" pour tout le site (prompt §3).
export const EASE = "power2.out";

// Stagger faible recommandé pour le Hero (§12) et réutilisé pour les
// listes reveal (Expertises, Approche, Réalisations, Méthode, Capacités) —
// un seul rythme de stagger sur toute la page, pas un par section.
export const STAGGER = 0.08; // 80ms, dans la fourchette 60–120ms demandée

// Décalages verticaux (translation) recommandés par type d'élément (§12/§21).
export const OFFSET = {
  eyebrow: 10,
  title: 20,
  intro: 12,
  cta: 12,
  card: 24,
} as const;

/** true si l'utilisateur préfère un mouvement réduit — vérifié une seule
 * fois au montage (pas de re-lecture par frame, contrairement à la scène
 * 3D qui doit réagir à un changement en direct ; le motion de la Home
 * n'a pas cette exigence). */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
