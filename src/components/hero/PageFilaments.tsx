// PageFilaments — système de filaments Three.js réutilisable pour les
// pages Services (PROMPT_CLAUDE_CODE_V2_PAGE_FILAMENTS_APPLICATIONS_SAAS),
// implémenté à partir de la source de vérité :
// docs/rapports/rapport_audit_filaments_landing_reutilisation_v2.txt
// (architecture recommandée : Option B).
//
// Reprend FIDÈLEMENT le mécanisme réel des filaments de la Home
// (HeroSpheres.tsx) — génération, biais horizontal, rotation continue du
// rig, énergie de scroll, reduced-motion, Page Visibility — SANS rien de
// ce qui appartient aux sphères : pas de Soleil/Terre/Lune, pas de
// BALL.glb, pas de useHeroBallModel, pas de HDR/Environment, pas de
// lumières, pas d'orbites. `HeroSpheres.tsx`/`HeroScene.tsx` ne sont PAS
// modifiés par ce fichier (aucun import croisé, aucun partage de state) :
// la Home continue de tourner sur son propre code, inchangé.
//
// Différence assumée avec la Home (prompt §8, volontaire) : pas de
// migration droite -> centre liée au scroll du Hero — le rig reste
// CENTRÉ dans le viewport dès le montage, sans `targetX`/`targetZ`/scale.
// Le besoin ici est un fond de page persistant, pas une scène Hero avec
// des sphères à repositionner.
//
// Architecture Canvas (audit §2/§24-25, erreur structurelle à ne pas
// répéter) : wrapper `position:fixed; inset:0; z-index bas; pointer-
// events:none`, EXACTEMENT le principe de `.hero-scene` (home.css) —
// jamais un conteneur `overflow:hidden` borné à une section. Monté UNE
// SEULE FOIS au niveau de la page (voir applications-metier-saas.astro),
// jamais recréé par section.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// Palette — mêmes valeurs EXACTES que HeroSpheres.tsx (IVORY/EMBER),
// jamais une nouvelle couleur.
const IVORY = "#F1EFE8";
const EMBER = "#E45F36";

// Référence connue du projet (audit §6/§7) — reprise à l'identique.
// Ne jamais faire diverger cette valeur de celle de HeroSpheres.tsx sans
// mettre à jour les deux fichiers consciemment.
const HORIZONTAL_BIAS_PROBABILITY = 0.75;

// Énergie de scroll — mêmes constantes EXACTES que HeroSpheres.tsx
// (ENERGY_ATTACK_LAMBDA/ENERGY_RELEASE_LAMBDA/VELOCITY_FOR_MAX_ENERGY).
// Extraction locale minimale (prompt §7) : HeroSpheres.tsx n'exporte rien
// et ne doit pas être modifié pour exposer ces constantes — la duplication
// de ces 3 nombres est le compromis le plus simple et le plus sûr.
const ENERGY_ATTACK_LAMBDA = 9;
const ENERGY_RELEASE_LAMBDA = 1.4;
const VELOCITY_FOR_MAX_ENERGY = 1800;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface PageFilamentsSceneProps {
  reducedMotion: boolean;
}

function PageFilamentsScene({ reducedMotion }: PageFilamentsSceneProps) {
  const rigRef = useRef<THREE.Group>(null);
  const energy = useRef(0);
  const lastScrollY = useRef(0);
  const measured = useRef(false);

  // 5 filaments — génération procédurale à biais horizontal, copie fidèle
  // de HeroSpheres.tsx (mêmes bornes, même logique). Calculée UNE SEULE
  // FOIS au montage (`useMemo(..., [])`), jamais recalculée par frame.
  const filamentPoints = useMemo(() => {
    const defs: [number, number, number][][] = Array.from({ length: 5 }, () => {
      const horizontalBias = Math.random() < HORIZONTAL_BIAS_PROBABILITY;
      const pointCount = Math.random() < 0.5 ? 3 : 4;
      const xStart = rand(-4.6, -3.3);
      const xEnd = rand(3.3, 4.6);
      const z = rand(-4.4, -2.6);
      const yCenter = rand(-1.7, 1.7);
      const verticalSpread = horizontalBias ? rand(0.15, 0.55) : rand(0.9, 2.0);

      return Array.from({ length: pointCount }, (_, p) => {
        const t = p / (pointCount - 1);
        const x = THREE.MathUtils.lerp(xStart, xEnd, t) + rand(-0.3, 0.3);
        const y = yCenter + rand(-verticalSpread, verticalSpread);
        const pz = z + rand(-0.3, 0.3);
        return [x, y, pz] as [number, number, number];
      });
    });
    return defs.map((pts) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))).getPoints(48));
  }, []);

  useFrame((_state, delta) => {
    const rig = rigRef.current;
    if (!rig) return;

    // Reduced-motion : jamais de rotation continue, le rig reste
    // strictement statique (audit §17 : "les lignes peuvent rester
    // visibles statiquement", jamais un trou visuel). Aucune boucle rAF
    // utile ici de toute façon : `frameloop` passe à "demand" plus bas
    // (voir PageFilaments), ce garde-fou couvre le cas où une frame serait
    // malgré tout déclenchée (resize, invalidation ponctuelle).
    if (reducedMotion) return;

    // Énergie liée à la vitesse de scroll — attaque rapide, relâchement
    // lent, EXACTEMENT la formule de HeroSpheres.tsx.
    if (!measured.current) {
      lastScrollY.current = window.scrollY;
      measured.current = true;
    }
    const scrollY = window.scrollY;
    const scrollDelta = Math.abs(scrollY - lastScrollY.current);
    lastScrollY.current = scrollY;
    const instantVelocity = scrollDelta / Math.max(delta, 1 / 240);
    const targetEnergy = THREE.MathUtils.clamp(instantVelocity / VELOCITY_FOR_MAX_ENERGY, 0, 1);
    const energyLambda = targetEnergy > energy.current ? ENERGY_ATTACK_LAMBDA : ENERGY_RELEASE_LAMBDA;
    energy.current = THREE.MathUtils.damp(energy.current, targetEnergy, energyLambda, delta);

    // Mouvement — POINT CRITIQUE (prompt §6) : rotation CONTINUE, MONOTONE,
    // autour de l'axe Y LOCAL du groupe (pivot = centre du rig lui-même,
    // jamais un pivot externe). Aucune position.x/z, aucun scale (prompt
    // §8 : pas de migration droite->centre pour cette première version
    // Page Services, le rig reste centré dans le viewport dès le départ).
    rig.rotation.y += delta * (0.012 + energy.current * 0.01);
  });

  return (
    <group ref={rigRef}>
      {filamentPoints.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={i % 2 === 0 ? IVORY : EMBER}
          transparent
          opacity={i % 2 === 0 ? 0.12 : 0.09}
          lineWidth={1}
          depthWrite={false}
        />
      ))}
    </group>
  );
}

export default function PageFilaments() {
  // Mêmes patterns EXACTS que HeroScene.tsx (reduced-motion + Page
  // Visibility API) — copie fidèle, aucune nouvelle logique inventée.
  const [tabVisible, setTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    motionQuery.addEventListener("change", onMotionChange);
    return () => motionQuery.removeEventListener("change", onMotionChange);
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const frameloop = tabVisible && !reducedMotion ? "always" : "demand";

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 34, position: [0, 0, 7] }}
      >
        <PageFilamentsScene reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
