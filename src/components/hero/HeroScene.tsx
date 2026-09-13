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
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import HeroSpheres from "./HeroSpheres";

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
        <HeroSpheres reducedMotion={reducedMotion} pointerEnabled={pointerEnabled} pointerRef={pointerRef} />
      </Canvas>
    </div>
  );
}
