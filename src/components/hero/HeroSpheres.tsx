// HeroSpheres — CS-S6B/C/D/E/F. Contenu 3D pur de la direction "billes
// métalliques" (remplace HeroSculpture.tsx / la sculpture géométrique de
// CS-S6, abandonnée sur verdict esthétique humain). Concept : 3 sphères
// métalliques (le sujet), des filaments de vent en arrière-plan (le
// soutien visuel), et un déplacement droite -> centre piloté par le
// scroll, qui fait de la scène un fond permanent une fois recentrée.
//
// CS-S6D — changement conceptuel du MOUVEMENT (la lecture symbolique
// demandée par Sébastien) : la logique CS-S6C (orbites indépendantes +
// "respiration" de groupe synchronisée) est remplacée par une vraie
// HIÉRARCHIE ORBITALE à 2 niveaux — grosse sphère = centre de gravité
// stable, sphère moyenne orbite autour de la grosse (Terre autour du
// Soleil), petite sphère orbite autour de la moyenne (Lune autour de la
// Terre) et hérite donc indirectement du mouvement de la moyenne.
//
// CS-S6E — la grosse sphère ("le soleil") n'est plus quasi figée : elle
// suit désormais sa PROPRE ELLIPSE (demi-axes distincts, inclinée à ~25°
// par rotation rigide), plus lente et plus ample que nerveuse. Moyenne et
// petite continuent d'orbiter respectivement la grosse et la moyenne
// SANS changement de leur propre logique — elles héritent simplement de
// ce nouveau mouvement du centre via la composition de positions déjà en
// place depuis CS-S6D (medium = large.position + orbite, small =
// medium.position + orbite).
//
// CS-S6F — la Lune (petite) pouvait, dans de rares alignements de phase,
// s'approcher visuellement trop près du Soleil (grosse) : deux
// ajustements combinés corrigent cela — la Terre (moyenne) est reculée
// du Soleil (rayon d'orbite augmenté), et le plan orbital de la Lune est
// nettement plus incliné/transversal, à la fois pour réduire la
// fréquence des rapprochements et pour enrichir la lecture spatiale de
// son orbite. Voir §ANALYSE COLLISION ci-dessous pour le calcul exact.
//
// Toute la logique de position/énergie/pointeur vit ici et se relit
// directement depuis window.scrollY à chaque frame (aucun state React,
// aucun listener de scroll séparé à synchroniser avec Canvas — la lecture
// directe dans useFrame est plus simple et se fige naturellement dès que
// le frameloop passe en "demand", cf. HeroScene.tsx).
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
// TEST RÉVERSIBLE — voir PROMPT_CLAUDE_CODE_TEST_ENV_MAP_PNG_HERO.txt et
// HeroEnvironmentImage.tsx. Remplace temporairement le rig procédural
// <Environment>/<Lightformer> (CS-S6C/D, commenté juste plus bas, jamais
// supprimé) par `src/assets/hdr/hdr.png` comme environment map.
import HeroEnvironmentImage from "./HeroEnvironmentImage";
// PROMPT_CLAUDE_CODE_BALL_GLB_3_CORPS_TAILLES_ORIGINALES.txt — les 3
// sphères procédurales sont remplacées par 3 instances de BALL.glb
// (mêmes geometry/material, scales distincts). Succède au test A/B à 1
// sphère (PROMPT_CLAUDE_CODE_TEST_BALL_GLB_HERO.txt / HeroBallGlb.tsx,
// désormais superflu).
import { useHeroBallModel } from "./useHeroBallModel";

interface HeroSpheresProps {
  /** prefers-reduced-motion actif : pose stable/apaisée (voir §14 CS-S6B). */
  reducedMotion: boolean;
  /** Pointeur "souris fine" détecté (desktop) : autorise l'influence pointeur. */
  pointerEnabled: boolean;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}

// Palette — reflets ivoire, accent Ember ponctuel via la lumière plutôt
// que via la couleur du matériau (une bille entièrement orange serait
// "trop orange", interdit explicitement depuis CS-S6B). Le matériau des
// sphères vient désormais du GLB (BALL.glb, "Material.001") depuis le
// passage aux 3 corps modélisés — plus de matériau procédural graphite
// déclaré ici (CS-S13 : `GRAPHITE_METAL`/`sphereMaterial`, dead code,
// supprimés).
const IVORY = "#F1EFE8";
const EMBER = "#E45F36";
const NEUTRAL_SECONDARY = "#A5A8AE";

// --- Rig (translation globale droite -> centre au scroll, CS-S6B/C, INCHANGÉ) -
const RIGHT_FRACTION = 0.27;
const RIG_LAMBDA = 3.2;
const FILAMENTS_LAMBDA = 2.0;

// --- Énergie liée à la vitesse de scroll (CS-S6B/C, mécanisme INCHANGÉ) ---
// CS-S6D §6 : "elle peut accentuer légèrement ces mouvements, mais
// l'identité de la scène doit désormais venir surtout de la relation
// orbitale" — l'énergie module maintenant le RAYON des orbites (léger
// gonflement pendant un scroll actif), pas leur vitesse angulaire : la
// lisibilité de la hiérorchie ne doit jamais dépendre de la vitesse de
// scroll de l'utilisateur.
const ENERGY_ATTACK_LAMBDA = 9;
const ENERGY_RELEASE_LAMBDA = 1.4;
const VELOCITY_FOR_MAX_ENERGY = 1800;
const ENERGY_ORBIT_BOOST = 0.3;

// --- CS-S6D §5/§6 — HIÉRARCHIE ORBITALE -----------------------------------
// Rayons choisis pour qu'une orbite à rayon CONSTANT (cercle plat incliné,
// voir orbitOffset ci-dessous — jamais une combinaison de sinus à
// amplitudes différentes par axe, qui dégénérerait à un rayon 3D plus
// petit à certains angles) reste toujours strictement supérieure à la
// somme des deux rayons de sphères + une marge (aucun chevauchement
// géométrique possible par construction, pas seulement "en général").
const LARGE_RADIUS = 0.5;
const MEDIUM_RADIUS = 0.34;
const SMALL_RADIUS = 0.22;
// CS-S6F — marge relevée (0.12 -> 0.16) : filet de sécurité (CS-S6C)
// renforcé en complément des deux ajustements de ce sprint (voir §CS-S6F
// plus bas pour l'analyse complète du risque de collision visuelle
// Lune/Soleil et la justification chiffrée de la combinaison retenue).
const REPULSION_MARGIN = 0.16;

// V2 HERO 3D RÉDUCTION 20% — au chargement (Hero, progress scroll = 0),
// les 3 sphères sont rendues 20% plus petites et leurs orbites (rayons
// UNIQUEMENT — angle/phase/vitesse/tilt intacts) 20% plus compactes, pour
// une composition plus resserrée. Dès la fin du Hero (progress -> 1),
// `heroFactor` vaut 1 et tout redevient BIT POUR BIT l'état déjà validé.
// Volontairement un simple facteur d'échelle appliqué aux constantes de
// rayon existantes (pas de nouvelle position/ancrage) : la logique
// orbitale (Terre autour du Soleil, Lune autour de la Terre, phases, sens,
// vitesse) n'est ni remplacée ni court-circuitée, seule son amplitude
// spatiale varie temporairement.
const HERO_SIZE_FACTOR = 0.8;

// Sphère 1 — LA GROSSE ("le soleil") : centre de gravité du système.
// CS-S6E — la dérive 3 axes quasi imperceptible de CS-S6D ("elle ne
// semble vraiment réagir que lorsqu'une autre sphère la touche ou passe
// près d'elle", verdict Sébastien) est remplacée par une vraie ELLIPSE
// PROPRE : demi-grand axe / demi-petit axe distincts (une vraie ellipse,
// pas un cercle), inclinée d'environ 25° pour une trajectoire "un peu
// plus diagonale" (demande explicite). L'inclinaison se fait par
// ROTATION RIGIDE autour de l'axe de la caméra (Z) — une rotation
// préserve exactement la forme et les longueurs de l'ellipse (contrairement
// à une combinaison de sinus à amplitudes différentes par axe, qui l'aurait
// déformée) et donne un résultat prévisible "à l'écran" (le spectateur voit
// une ellipse inclinée de ~25°, quel que soit l'angle de caméra). Vitesse
// la plus lente et l'amplitude la plus "ample mais pas nerveuse" du trio :
// "elle reste le centre, elle ne doit pas devenir la sphère la plus
// agitée" (prompt §3-D).
const LARGE_ANCHOR = new THREE.Vector3(-0.05, 0.2, 0.1);
const SUN_ELLIPSE_A = 0.32; // demi-grand axe (unités scène)
const SUN_ELLIPSE_B = 0.16; // demi-petit axe — ratio 2:1, ellipse nettement visible, pas un cercle
// V2 HERO 3D VITESSE/ESPACEMENT — vitesse angulaire réduite de 60% (×0.4)
// sur les 3 orbites (soleil/terre/lune), demande explicite "ralentir
// globalement sans figer la scène". Valeur d'origine (CS-S6E) : 0.22 rad/s.
const SUN_ELLIPSE_SPEED = 0.088; // rad/s — période ≈ 71,4 s, la plus lente du système
const SUN_ELLIPSE_PHASE = 0.4;
const SUN_ELLIPSE_TILT_ANGLE = THREE.MathUtils.degToRad(25); // demande explicite : "une rotation de 25 degrés"
const SUN_ELLIPSE_TILT_AXIS = new THREE.Vector3(0, 0, 1); // autour de l'axe caméra : rotation "à l'écran", pas de raccourci de perspective
const SUN_ELLIPSE_DEPTH_AMPLITUDE = 0.05; // légère respiration de profondeur (Z), indépendante du plan de l'ellipse — touche "organique/cosmique" discrète

/** Position sur l'ellipse du soleil à l'angle donné, ellipse construite à
 * plat dans le plan XY (demi-axes a/b distincts, donc une vraie ellipse)
 * puis inclinée par rotation rigide — forme et longueurs exactement
 * préservées, seule l'orientation change. */
function sunEllipseOffset(angle: number, out: THREE.Vector3) {
  out.set(Math.cos(angle) * SUN_ELLIPSE_A, Math.sin(angle) * SUN_ELLIPSE_B, 0);
  out.applyAxisAngle(SUN_ELLIPSE_TILT_AXIS, SUN_ELLIPSE_TILT_ANGLE);
  out.z += Math.sin(angle * 1.3) * SUN_ELLIPSE_DEPTH_AMPLITUDE;
  return out;
}

// Sphère 2 — LA MOYENNE ("Terre") : orbite autour de la grosse ("Soleil").
// CS-S6F §4 — AJUSTEMENT 1 : rayon reculé de 1.0 à 1.45 ("légère à
// modérée", pas un éloignement extrême — reste dans la zone élégante de
// composition, vérifié par capture réelle). Objectif : réduire fortement
// la possibilité que la Lune (orbite imbriquée, voir plus bas) s'approche
// visuellement trop près du Soleil. Voir §ANALYSE COLLISION plus bas pour
// le calcul exact. Vitesse et inclinaison inchangées depuis CS-S6D.
// V2 HERO 3D VITESSE/ESPACEMENT — rayon encore augmenté (1.45 -> 1.9) pour
// écarter davantage la Terre du Soleil ET, combiné à SMALL_ORBIT_RADIUS
// inchangé, rendre la collision visuelle Soleil/Lune géométriquement
// IMPOSSIBLE par construction (plus seulement atténuée par la répulsion
// douce) — voir §ANALYSE COLLISION mise à jour plus bas. Vitesse réduite
// de 60% (×0.4) comme les deux autres orbites (valeur d'origine : 0.5 rad/s).
const MEDIUM_ORBIT_RADIUS = 1.9;
const MEDIUM_ORBIT_SPEED = 0.2; // rad/s
const MEDIUM_PHASE = 0.6;
const MEDIUM_TILT_AXIS = new THREE.Vector3(1, 0.15, 0).normalize();
const MEDIUM_TILT_ANGLE = 0.45; // rad

// Sphère 3 — LA PETITE ("Lune") : orbite autour de la moyenne (hérite donc
// de son mouvement, et maintenant indirectement de l'ellipse du Soleil
// aussi). Rayon inchangé (0.72 — "préserver sa dynamique plus vive",
// prompt §12-B ne demande pas de la réduire). CS-S6F §5 — AJUSTEMENT 2 :
// plan orbital nettement PLUS incliné et transversal par rapport à celui
// de la moyenne (axe (0.15, 0.4, 1) au lieu de (0.3, 1, 0.25), angle
// porté de 0.7 à 1.05 rad soit ~60°) — l'orbite lunaire coupe désormais
// l'espace selon une direction et une profondeur nettement différentes de
// celle de la Terre ("axe/plan incliné... lecture plus spatiale...
// profondeur plus crédible", prompt §5). Voir §ANALYSE COLLISION.
// V2 HERO 3D VITESSE/ESPACEMENT — rayon INCHANGÉ (le sprint ne demandait pas
// de réduire la Lune, seulement d'écarter la Terre — voir MEDIUM_ORBIT_RADIUS
// ci-dessus). Vitesse réduite de 60% (×0.4), valeur d'origine : 1.9 rad/s.
const SMALL_ORBIT_RADIUS = 0.72;
const SMALL_ORBIT_SPEED = 0.76; // rad/s — reste nettement plus vif que la moyenne
const SMALL_PHASE = 2.2;
const SMALL_TILT_AXIS = new THREE.Vector3(0.15, 0.4, 1).normalize();
const SMALL_TILT_ANGLE = 1.05; // rad (~60°)

// --- V2 HERO 3D VITESSE/ESPACEMENT — ANALYSE COLLISION LUNE/SOLEIL --------
// La Lune orbite la Terre à rayon constant SMALL_ORBIT_RADIUS ; la Terre
// orbite le Soleil à rayon constant MEDIUM_ORBIT_RADIUS. Par inégalité
// triangulaire, la distance Soleil↔Lune ne peut JAMAIS descendre en
// dessous de |MEDIUM_ORBIT_RADIUS − SMALL_ORBIT_RADIUS| = |1.9−0.72| =
// 1.18, quel que soit l'angle des deux orbites. Un chevauchement est
// géométriquement IMPOSSIBLE dans tous les cas dès que cette borne dépasse
// LARGE_RADIUS + SMALL_RADIUS + REPULSION_MARGIN = 0.5+0.22+0.16 = 0.88
// (seuil de contact) : c'est désormais le cas, avec une marge de 0.30 unité
// au-delà du seuil (contre un déficit de 0.15 unité en CS-S6F, où la
// garantie ne reposait encore que sur la répulsion douce en filet de
// sécurité). La paire Soleil↔Lune est donc protégée PAR CONSTRUCTION, au
// même titre que les paires Soleil↔Terre et Terre↔Lune — plus seulement
// "réduite en fréquence" par l'inclinaison du plan lunaire (conservée
// telle quelle, elle enrichit toujours la lecture spatiale de l'orbite).

/** Décalage circulaire à rayon CONSTANT : un cercle plat dans le plan XY,
 * incliné (rotation rigide, donc longueur préservée) autour de `tiltAxis`.
 * Garantit que la distance au centre de l'orbite ne varie JAMAIS avec
 * l'angle — condition nécessaire pour que "rayon > somme des rayons +
 * marge" empêche réellement tout chevauchement géométrique. */
function orbitOffset(radius: number, angle: number, tiltAxis: THREE.Vector3, tiltAngle: number, out: THREE.Vector3) {
  out.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  out.applyAxisAngle(tiltAxis, tiltAngle);
  return out;
}

export default function HeroSpheres({ reducedMotion, pointerEnabled, pointerRef }: HeroSpheresProps) {
  const rigRef = useRef<THREE.Group>(null);
  const filamentsRigRef = useRef<THREE.Group>(null);
  const largeMeshRef = useRef<THREE.Mesh>(null);
  const mediumMeshRef = useRef<THREE.Mesh>(null);
  const smallMeshRef = useRef<THREE.Mesh>(null);

  // Vecteurs/positions réutilisés chaque frame — alloués une seule fois
  // (pas de `new THREE.Vector3()` par frame). Initialisées à l'angle de
  // phase de départ (pas à l'origine) pour que la position JSX affichée
  // avant le tout premier useFrame soit déjà la bonne, sans flash.
  const largeOffsetVec = useRef(sunEllipseOffset(SUN_ELLIPSE_PHASE, new THREE.Vector3()));
  const largePos = useRef(LARGE_ANCHOR.clone().add(largeOffsetVec.current));
  const mediumOffsetVec = useRef(orbitOffset(MEDIUM_ORBIT_RADIUS, MEDIUM_PHASE, MEDIUM_TILT_AXIS, MEDIUM_TILT_ANGLE, new THREE.Vector3()));
  const smallOffsetVec = useRef(new THREE.Vector3());
  const mediumPos = useRef(largePos.current.clone().add(mediumOffsetVec.current));
  const smallPos = useRef(
    mediumPos.current
      .clone()
      .add(orbitOffset(SMALL_ORBIT_RADIUS, SMALL_PHASE, SMALL_TILT_AXIS, SMALL_TILT_ANGLE, smallOffsetVec.current)),
  );

  const rigX = useRef(0);
  const rigZ = useRef(0);
  const rigScale = useRef(1);
  const filamentsRigX = useRef(0);
  const energy = useRef(0);
  const lastScrollY = useRef(0);
  const heroHeight = useRef(600);
  const measured = useRef(false);

  // PROMPT_CLAUDE_CODE_BALL_GLB_3_CORPS_TAILLES_ORIGINALES.txt — geometry
  // + material extraits UNE SEULE FOIS de BALL.glb (cache useGLTF, un seul
  // chargement réseau), partagés PAR RÉFÉRENCE par les 3 <mesh> plus bas
  // (pas de scene.clone(), le GLB ne contient qu'un mesh). `ballRawRadius`
  // = rayon du modèle brut, jamais mis à l'échelle : sert à convertir les
  // anciens rayons validés (LARGE/MEDIUM/SMALL_RADIUS, INCHANGÉS) en scale
  // par sphère, pour reproduire EXACTEMENT les proportions Soleil > Terre
  // > Lune d'avant le test GLB. Ne PAS appliquer le même scale aux 3.
  const { geometry: ballGeometry, material: ballMaterial, rawRadius: ballRawRadius } = useHeroBallModel();
  const largeBallScale = LARGE_RADIUS / ballRawRadius;
  const mediumBallScale = MEDIUM_RADIUS / ballRawRadius;
  const smallBallScale = SMALL_RADIUS / ballRawRadius;

  // 5 filaments — génération procédurale biaisée horizontale (micro-sprint
  // "Hero filaments random avec biais horizontal"). Remplace les 5 courbes
  // fixes CS-S6B/C (mêmes bornes d'espace x/y/z conservées à l'identique,
  // seule la logique de génération change) : ~75% des lignes reçoivent une
  // amplitude verticale fortement contrainte par rapport à leur étendue
  // horizontale (lignes tendues, peu pentues, "extension latérale"), le
  // reste garde une liberté verticale plus large pour préserver la variété
  // et éviter un rendu mécanique. Toujours procédural (Math.random),
  // calculé une seule fois par montage (déps `[]` inchangées) : le rendu
  // change à chaque chargement sans aucun coût par frame — ni la couleur/
  // opacité (JSX plus bas, inchangé) ni le reste du rig ne sont affectés.
  const HORIZONTAL_BIAS_PROBABILITY = 0.75;
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  const filamentPoints = useMemo(() => {
    const defs: [number, number, number][][] = Array.from({ length: 5 }, () => {
      const horizontalBias = Math.random() < HORIZONTAL_BIAS_PROBABILITY;
      const pointCount = Math.random() < 0.5 ? 3 : 4;
      // Étendue horizontale large, façon "traverse tout le champ de vision" —
      // mêmes bornes x que l'ancien jeu de courbes fixes (-4.6 à 4.6).
      const xStart = rand(-4.6, -3.3);
      const xEnd = rand(3.3, 4.6);
      const z = rand(-4.4, -2.6);
      const yCenter = rand(-1.7, 1.7);
      // Amplitude verticale : contrainte (biais horizontal, ~70-80% des cas)
      // ou libre (variété, comme les anciennes courbes les plus pentues).
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

  useFrame((state, delta) => {
    const rig = rigRef.current;
    const filamentsRig = filamentsRigRef.current;
    if (!rig || !filamentsRig) return;

    if (!measured.current) {
      const heroEl = document.querySelector(".home-hero");
      heroHeight.current = heroEl instanceof HTMLElement && heroEl.offsetHeight > 0 ? heroEl.offsetHeight : 600;
      lastScrollY.current = window.scrollY;
      measured.current = true;
    }

    const scrollY = window.scrollY;
    // Progression 0 (haut de page, ancrage droite) -> 1 (scène recentrée,
    // devenue fond permanent) sur la hauteur réelle du Hero. INCHANGÉ.
    const progress = THREE.MathUtils.clamp(scrollY / Math.max(heroHeight.current, 1), 0, 1);
    const rightOffset = state.viewport.width * RIGHT_FRACTION;
    const targetX = THREE.MathUtils.lerp(rightOffset, 0, progress);
    const targetZ = THREE.MathUtils.lerp(0, -1.15, progress);
    const targetScale = THREE.MathUtils.lerp(1, 0.82, progress);
    // V2 HERO 3D RÉDUCTION 20% — 0.8 en haut du Hero -> 1.0 une fois le
    // Hero défilé. À progress=1 ceci vaut exactement 1 : aucune section
    // suivante n'est affectée.
    const heroFactor = THREE.MathUtils.lerp(HERO_SIZE_FACTOR, 1, progress);

    if (reducedMotion) {
      // CS-S6B §14 — pose stable/apaisée, INCHANGÉ dans son principe :
      // le repositionnement droite -> centre reste appliqué (utile, piloté
      // par le scroll de l'utilisateur), sans lissage/glisser continu, et
      // SANS aucune sous-animation décorative. CS-S6D : la pose statique
      // montre maintenant un "instantané" de la hiérarchie orbitale
      // (angle de référence = phase de départ de chaque orbite) plutôt que
      // les anciennes positions de base indépendantes — la relation
      // grosse/moyenne/petite reste lisible même figée.
      rig.position.set(targetX, 0, targetZ);
      rig.scale.setScalar(targetScale);
      filamentsRig.position.x = targetX;

      sunEllipseOffset(SUN_ELLIPSE_PHASE, largeOffsetVec.current);
      largePos.current.copy(LARGE_ANCHOR).add(largeOffsetVec.current);
      // V2 HERO 3D RÉDUCTION 20% — seul le RAYON passé à orbitOffset est mis
      // à l'échelle par heroFactor ; angle (phase de référence ici), axe et
      // inclinaison INCHANGÉS.
      orbitOffset(MEDIUM_ORBIT_RADIUS * heroFactor, MEDIUM_PHASE, MEDIUM_TILT_AXIS, MEDIUM_TILT_ANGLE, mediumOffsetVec.current);
      mediumPos.current.copy(largePos.current).add(mediumOffsetVec.current);
      orbitOffset(SMALL_ORBIT_RADIUS * heroFactor, SMALL_PHASE, SMALL_TILT_AXIS, SMALL_TILT_ANGLE, smallOffsetVec.current);
      smallPos.current.copy(mediumPos.current).add(smallOffsetVec.current);

      if (largeMeshRef.current) {
        largeMeshRef.current.position.copy(largePos.current);
        largeMeshRef.current.scale.setScalar(largeBallScale * heroFactor);
      }
      if (mediumMeshRef.current) {
        mediumMeshRef.current.position.copy(mediumPos.current);
        mediumMeshRef.current.scale.setScalar(mediumBallScale * heroFactor);
      }
      if (smallMeshRef.current) {
        smallMeshRef.current.position.copy(smallPos.current);
        smallMeshRef.current.scale.setScalar(smallBallScale * heroFactor);
      }
      return;
    }

    // --- Énergie scroll : attaque rapide, relâchement doux (CS-S6B/C, INCHANGÉ) -
    const scrollDelta = Math.abs(scrollY - lastScrollY.current);
    lastScrollY.current = scrollY;
    const instantVelocity = scrollDelta / Math.max(delta, 1 / 240);
    const targetEnergy = THREE.MathUtils.clamp(instantVelocity / VELOCITY_FOR_MAX_ENERGY, 0, 1);
    const energyLambda = targetEnergy > energy.current ? ENERGY_ATTACK_LAMBDA : ENERGY_RELEASE_LAMBDA;
    energy.current = THREE.MathUtils.damp(energy.current, targetEnergy, energyLambda, delta);

    // --- Rig sphères : translation + retrait + échelle, amorti (INCHANGÉ) -
    rigX.current = THREE.MathUtils.damp(rigX.current, targetX, RIG_LAMBDA, delta);
    rigZ.current = THREE.MathUtils.damp(rigZ.current, targetZ, RIG_LAMBDA, delta);
    rigScale.current = THREE.MathUtils.damp(rigScale.current, targetScale, RIG_LAMBDA, delta);
    rig.position.x = rigX.current;
    rig.position.z = rigZ.current;
    rig.scale.setScalar(rigScale.current);

    // --- Filaments : même cible, damping plus lent (INCHANGÉ) -----------
    filamentsRigX.current = THREE.MathUtils.damp(filamentsRigX.current, targetX, FILAMENTS_LAMBDA, delta);
    filamentsRig.position.x = filamentsRigX.current;
    filamentsRig.rotation.y += delta * (0.012 + energy.current * 0.01);

    // --- Pointeur : appliqué UNIQUEMENT à la grosse sphère (le centre) —
    // moyenne et petite en héritent indirectement puisqu'elles sont
    // définies relativement à sa position. Influence décroissante à
    // mesure que la scène recentre (INCHANGÉ dans le principe).
    const pointerInfluence = pointerEnabled ? 1 - progress : 0;
    const pointerOffsetX = pointerRef.current.x * 0.18 * pointerInfluence;
    const pointerOffsetY = -pointerRef.current.y * 0.12 * pointerInfluence;

    const t = state.clock.elapsedTime;

    // --- CS-S6E — Sphère 1 (GROSSE / "soleil") : ellipse propre, inclinée
    // ~25°, jamais une simple dérive. Vitesse angulaire la plus lente du
    // système (0.22 rad/s < 0.5 rad/s de la moyenne) : reste "le centre",
    // jamais la plus agitée. -----------------------------------------------
    sunEllipseOffset(t * SUN_ELLIPSE_SPEED + SUN_ELLIPSE_PHASE, largeOffsetVec.current);
    largePos.current.set(
      LARGE_ANCHOR.x + largeOffsetVec.current.x + pointerOffsetX,
      LARGE_ANCHOR.y + largeOffsetVec.current.y + pointerOffsetY,
      LARGE_ANCHOR.z + largeOffsetVec.current.z,
    );

    // --- CS-S6D — Sphère 2 (MOYENNE) : orbite la grosse, rayon amplifié
    // légèrement par l'énergie de scroll (gonflement, pas accélération).
    // V2 HERO 3D RÉDUCTION 20% — rayon mis à l'échelle par heroFactor
    // (angle t*MEDIUM_ORBIT_SPEED+MEDIUM_PHASE, axe, inclinaison : INCHANGÉS,
    // donc la Terre continue de tourner autour du Soleil exactement pareil,
    // juste sur un cercle temporairement plus petit près du chargement). --
    const mediumRadius = MEDIUM_ORBIT_RADIUS * heroFactor * (1 + energy.current * ENERGY_ORBIT_BOOST);
    orbitOffset(mediumRadius, t * MEDIUM_ORBIT_SPEED + MEDIUM_PHASE, MEDIUM_TILT_AXIS, MEDIUM_TILT_ANGLE, mediumOffsetVec.current);
    mediumPos.current.copy(largePos.current).add(mediumOffsetVec.current);

    // --- CS-S6D — Sphère 3 (PETITE) : orbite la moyenne, hérite donc
    // indirectement de son mouvement (et de celui de la grosse). Même
    // principe heroFactor que ci-dessus, même logique inchangée. ---------
    const smallRadius = SMALL_ORBIT_RADIUS * heroFactor * (1 + energy.current * ENERGY_ORBIT_BOOST);
    orbitOffset(smallRadius, t * SMALL_ORBIT_SPEED + SMALL_PHASE, SMALL_TILT_AXIS, SMALL_TILT_ANGLE, smallOffsetVec.current);
    smallPos.current.copy(mediumPos.current).add(smallOffsetVec.current);

    // --- Répulsion douce (CS-S6C, renforcée CS-S6F) : sécurité géométrique,
    // pas une force physique. Les paires Soleil-Terre et Terre-Lune ne
    // peuvent structurellement jamais se chevaucher (rayon d'orbite >
    // somme des rayons + marge, garanti par construction). La paire
    // Soleil-Lune, elle, n'a qu'une borne résiduelle de 0.15 unité au-delà
    // du seuil de contact (voir §ANALYSE COLLISION) : c'est le seul cas où
    // ce filet peut réellement intervenir, et seulement pour une correction
    // faible désormais (0.56 unité de dépassement possible avant ce sprint,
    // 0.15 après). ----------------------------------------------------------
    const positions = [largePos.current, mediumPos.current, smallPos.current];
    // V2 HERO 3D RÉDUCTION 20% — rayons de sécurité mis à l'échelle par
    // heroFactor pour rester cohérents avec la taille RENDUE des sphères
    // (20% plus petites près du chargement). À progress=1, heroFactor=1 :
    // radii strictement INCHANGÉS, comme le reste du filet de sécurité.
    const radii = [LARGE_RADIUS * heroFactor, MEDIUM_RADIUS * heroFactor, SMALL_RADIUS * heroFactor];
    for (let a = 0; a < positions.length; a++) {
      for (let b = a + 1; b < positions.length; b++) {
        const pa = positions[a];
        const pb = positions[b];
        const minDist = radii[a] + radii[b] + REPULSION_MARGIN;
        const diff = pb.clone().sub(pa);
        const dist = diff.length();
        if (dist > 0.0001 && dist < minDist) {
          const push = diff.multiplyScalar((minDist - dist) / dist / 2);
          pa.sub(push);
          pb.add(push);
        }
      }
    }

    if (largeMeshRef.current) {
      largeMeshRef.current.position.copy(largePos.current);
      largeMeshRef.current.scale.setScalar(largeBallScale * heroFactor);
    }
    if (mediumMeshRef.current) {
      mediumMeshRef.current.position.copy(mediumPos.current);
      mediumMeshRef.current.scale.setScalar(mediumBallScale * heroFactor);
    }
    if (smallMeshRef.current) {
      smallMeshRef.current.position.copy(smallPos.current);
      smallMeshRef.current.scale.setScalar(smallBallScale * heroFactor);
    }
  });

  return (
    <>
      {/* Lumières — CS-S6D §7 : intensités nettement relevées (demande
          explicite "augmenter encore l'intensité lumineuse sur les
          artefacts 3D"), sans toucher la structure (toujours 1 clé + 1 rim
          + 1 point Ember, pas de shadow map). La rim (2e directionalLight)
          est celle qui révèle le mieux les volumes en contre-jour : son
          intensité est celle qui a le plus augmenté. */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3.5, 4, 5]} intensity={1.35} color={IVORY} />
      <directionalLight position={[-4, -1.5, -2]} intensity={0.5} color={NEUTRAL_SECONDARY} />
      <pointLight position={[1.4, 1.1, 2.2]} intensity={1.7} color={EMBER} distance={6} decay={2} />

      {/* Rig d'environnement PROCÉDURAL (CS-S6C/D) — DÉSACTIVÉ pour le test
          RÉVERSIBLE PROMPT_CLAUDE_CODE_TEST_ENV_MAP_PNG_HERO.txt, remplacé
          juste en dessous par <HeroEnvironmentImage />. Pour revenir en
          arrière : supprimer <HeroEnvironmentImage /> et dé-commenter ce
          bloc.
      <Environment resolution={96} frames={1}>
        <Lightformer form="rect" color={IVORY} intensity={3.4} position={[3, 3.2, 2.5]} scale={[3.4, 1.8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" color={NEUTRAL_SECONDARY} intensity={1.6} position={[-3.2, -1.4, 2.8]} scale={[2.6, 3.2, 1]} target={[0, 0, 0]} />
        <Lightformer form="circle" color={EMBER} intensity={2.4} position={[1.6, -1.3, 3.2]} scale={1} target={[0, 0, 0]} />
        <Lightformer form="rect" color={IVORY} intensity={0.9} position={[0, -3.4, -2]} scale={[4, 2, 1]} />
      </Environment>
      */}
      <HeroEnvironmentImage />

      {/* Filaments — géométrie générée ci-dessus (biais horizontal) ;
          rendu (couleur/opacité alternée, rig, mouvement) INCHANGÉ. */}
      <group ref={filamentsRigRef}>
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

      {/* Rig des sphères — hiérarchie orbitale CS-S6D : grosse (centre),
          moyenne (orbite la grosse), petite (orbite la moyenne). Positions
          initiales JSX = ancrage/orbite à l'angle de phase de départ,
          pour éviter tout flash de position avant le premier useFrame. */}
      <group ref={rigRef}>
        {/* PROMPT_CLAUDE_CODE_BALL_GLB_3_CORPS_TAILLES_ORIGINALES.txt — les
            3 sphères procédurales (<sphereGeometry> + sphereMaterial,
            commentées ci-dessous chacune, jamais supprimées) sont
            remplacées par 3 <mesh> partageant LA MÊME geometry/material
            de BALL.glb (useHeroBallModel). Seul le `scale` diffère par
            sphère (voir calcul plus haut) : hiérarchie de tailles Soleil >
            Terre > Lune inchangée, position/mouvement/orbites INCHANGÉS.
            Retrait : remplacer chaque <mesh> par le bloc commenté
            au-dessus de lui — ET restaurer la déclaration
            `const sphereMaterial = useMemo(...)` retirée en CS-S13 (dead
            code : plus aucun <mesh> actif ne la référençait, uniquement
            ces blocs commentés). */}
        {/*
        <mesh ref={largeMeshRef} position={largePos.current} material={sphereMaterial}>
          <sphereGeometry args={[LARGE_RADIUS, 40, 40]} />
        </mesh>
        */}
        <mesh
          ref={largeMeshRef}
          position={largePos.current}
          geometry={ballGeometry}
          material={ballMaterial}
          scale={largeBallScale * HERO_SIZE_FACTOR}
        />
        {/*
        <mesh ref={mediumMeshRef} position={mediumPos.current} material={sphereMaterial}>
          <sphereGeometry args={[MEDIUM_RADIUS, 40, 40]} />
        </mesh>
        */}
        <mesh
          ref={mediumMeshRef}
          position={mediumPos.current}
          geometry={ballGeometry}
          material={ballMaterial}
          scale={mediumBallScale * HERO_SIZE_FACTOR}
        />
        {/*
        <mesh ref={smallMeshRef} position={smallPos.current} material={sphereMaterial}>
          <sphereGeometry args={[SMALL_RADIUS, 32, 32]} />
        </mesh>
        */}
        <mesh
          ref={smallMeshRef}
          position={smallPos.current}
          geometry={ballGeometry}
          material={ballMaterial}
          scale={smallBallScale * HERO_SIZE_FACTOR}
        />
      </group>
    </>
  );
}
