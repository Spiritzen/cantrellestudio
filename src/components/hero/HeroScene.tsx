// HeroScene — CS-S6B. Refonte de direction du Hero 3D. CS-S6 (premier
// prototype) a été validé techniquement mais rejeté esthétiquement par
// Sébastien : "objet noir qui ne raconte rien", rendu "widget 3D dans une
// carte", cadres/lignes CSS parasites visibles derrière l'objet. CS-S6B
// conserve l'acquis technique (Astro/R3F/client:media/reduced-motion/DPR
// cappé) et change radicalement le langage visuel :
//
// - Le Canvas n'est plus confiné dans la petite boîte `.home-hero__stage` :
//   il devient un FOND FIXE PLEIN VIEWPORT (`position:fixed`), sans bordure
//   ni cadre visible — plus jamais un "widget dans une carte".
// - `pointer-events:none` sur ce fond : structurellement, il ne peut plus
//   jamais intercepter un clic ni passer devant un CTA (voir aussi le
//   z-index négatif, home.css).
// - La scène (3 sphères + filaments, HeroSpheres.tsx) démarre ancrée à
//   droite (dans l'esprit du Hero d'origine) puis migre vers le centre dès
//   le début du scroll pour devenir une présence de fond permanente — ce
//   calcul vit entièrement dans HeroSpheres (lecture directe de
//   window.scrollY à chaque frame), ce composant-ci ne gère que
//   l'hydratation, la préférence reduced-motion et le pointeur.
//
// La copy HTML du Hero (H1, sous-texte, CTA — src/pages/index.astro) reste
// entièrement hors de ce composant. Hydratation inchangée depuis CS-S6,
// re-testée fonctionnelle avec ce nouveau positionnement fixed :
// `client:media="(min-width: 900px)"` (voir rapport CS-S6B).
//
// V2 ANCRAGE RESPONSIVE 3D — ÉTAPE 2 : la position HORIZONTALE initiale
// (droite du Hero, avant scroll) de la composition orbitale n'était dérivée
// que d'une fraction arbitraire du viewport R3F plein écran
// (`RIGHT_FRACTION` dans HeroSpheres.tsx, cf. le même défaut de principe
// déjà corrigé sur le téléphone /sites-professionnels/, voir
// SitesPhoneScene.tsx) — jamais de la vraie zone DOM réservée à la 3D
// (`.home-hero__stage`), qui elle est plafonnée par `.container`
// (`--content-width`) : sur un grand écran, l'ancienne fraction continuait
// de grandir avec la fenêtre alors que le stage réel (donc le texte auquel
// la composition doit rester visuellement rattachée) restait, lui, plafonné
// — la composition dérivait loin du texte. Ce fichier mesure maintenant le
// centre HORIZONTAL réel de cette zone et transmet une ancre en PROPS ;
// HeroSpheres reste seul maître de la composition orbitale elle-même (rig
// global, jamais Soleil/Terre/Lune déplacés indépendamment). Vertical (Y) :
// délibérément NON ancré au DOM — voir le commentaire détaillé dans
// HeroSpheres.tsx (audit : cet axe est indépendant de la résolution pour
// une caméra à FOV fixe, contrairement à X ; un ancrage Y basé sur le stage
// a été testé puis abandonné, il rapprochait la composition du header).
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import HeroSpheres from "./HeroSpheres";

/** Ancre DOM → monde de la composition orbitale, mesurée sur
 * `.home-hero__stage` (la colonne droite réservée du Hero). */
export interface HeroSphereAnchor {
  /** Centre HORIZONTAL du stage, fraction (0..1) de la largeur de fenêtre,
   * TEL QU'IL SERAIT à scroll=0 (robuste à une mesure prise pendant que la
   * page est déjà défilée — même principe que SitesPhoneScene.tsx : le
   * Canvas doit rester fixed pendant le scroll, jamais suivre le DOM). */
  fracX: number;
}

/** Même principe que `measureSlotAnchor` (SitesPhoneScene.tsx), appliqué à
 * `.home-hero__stage` au lieu du slot téléphone — repris ici car ce
 * composant n'importe pas SitesPhoneScene.tsx (prompt §6 : ne pas toucher
 * ce fichier, seulement s'inspirer de sa méthode). */
function measureHeroAnchor(stageEl: HTMLElement): HeroSphereAnchor | null {
  const rect = stageEl.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  if (rect.width === 0 || viewportWidth === 0) {
    // Stage masqué (<900px, cf. home.css) ou pas encore mis en page.
    return null;
  }
  const restLeft = rect.left; // pas de scroll horizontal sur ce site
  return {
    fracX: (restLeft + rect.width / 2) / viewportWidth,
  };
}

export default function HeroScene() {
  // CS-S6B — la scène est désormais un fond PERMANENT de toute la page, pas
  // seulement du Hero : la pause "hors viewport" de CS-S6 (IntersectionObserver
  // sur la petite zone du stage) n'a plus de sens ici, puisque la scène doit
  // justement continuer d'exister comme arrière-plan pendant tout le scroll.
  // Remplacée par la Page Visibility API : seule une vraie raison de
  // suspendre le rendu (onglet masqué) coupe le frameloop continu.
  const [tabVisible, setTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pointerEnabled, setPointerEnabled] = useState(false);
  // Réf plutôt que state : lue à chaque frame dans HeroSpheres, jamais
  // besoin de re-render React sur un mousemove.
  const pointerRef = useRef({ x: 0, y: 0 });
  // Ancrage responsive (V2 ANCRAGE ÉTAPE 2) — null jusqu'à la première
  // mesure (useLayoutEffect ci-dessous, avant le premier paint).
  const [heroAnchor, setHeroAnchor] = useState<HeroSphereAnchor | null>(null);

  // Mesure de l'ancrage — même stratégie que SitesPhoneScene.tsx (prompt
  // §2) : au montage + resize/ResizeObserver UNIQUEMENT, jamais sur scroll
  // (le Canvas doit rester fixed pendant le scroll — une mesure prise
  // pendant que la page est déjà défilée reconstitue la position de repos
  // via `rect.top + window.scrollY`, voir `measureHeroAnchor`), coalescée
  // dans un seul requestAnimationFrame, cleanup complet. Effet séparé des
  // 3 autres ci-dessous (préoccupations indépendantes).
  useLayoutEffect(() => {
    const stage = document.querySelector<HTMLElement>(".home-hero__stage");
    if (!stage) return;

    let pendingFrame = 0;
    const measure = () => {
      pendingFrame = 0;
      const anchor = measureHeroAnchor(stage);
      if (anchor) setHeroAnchor(anchor);
    };
    const scheduleMeasure = () => {
      if (pendingFrame) return;
      pendingFrame = requestAnimationFrame(measure);
    };

    measure();

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(stage);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("orientationchange", scheduleMeasure);

    return () => {
      if (pendingFrame) cancelAnimationFrame(pendingFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
    };
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setReducedMotion(motionQuery.matches);
    setPointerEnabled(pointerQuery.matches);

    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    const onPointerChange = (event: MediaQueryListEvent) => setPointerEnabled(event.matches);
    motionQuery.addEventListener("change", onMotionChange);
    pointerQuery.addEventListener("change", onPointerChange);
    return () => {
      motionQuery.removeEventListener("change", onMotionChange);
      pointerQuery.removeEventListener("change", onPointerChange);
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    // Le Canvas est pointer-events:none (fond, jamais interactif) : le
    // pointeur ne peut donc pas être lu via les événements internes de R3F
    // (le Canvas ne les recevrait jamais). Suivi manuel, document entier,
    // desktop uniquement (pointerEnabled = hover:hover + pointer:fine).
    if (!pointerEnabled) return;
    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [pointerEnabled]);

  const frameloop = tabVisible && !reducedMotion ? "always" : "demand";

  return (
    <div className="hero-scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 34, position: [0, 0, 7] }}
      >
        <HeroSpheres
          reducedMotion={reducedMotion}
          pointerEnabled={pointerEnabled}
          pointerRef={pointerRef}
          heroAnchor={heroAnchor}
        />
      </Canvas>
    </div>
  );
}
