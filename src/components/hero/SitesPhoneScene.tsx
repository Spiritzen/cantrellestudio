// SitesPhoneScene — /sites-professionnels/, téléphone 3D.
//
// V1 (PROMPT_CLAUDE_CODE_V2_SITES_PROFESSIONNELS_PHONE_3D_TEST) : premier
// test, image appliquée sur la geometry de `WhiteScreen` (seul écran
// disponible dans le GLB à l'époque).
//
// V2 (PROMPT_CLAUDE_CODE_V2_SITES_PRO_PHONE_SCREENDISPLAY_ENVIRONMENT) :
// le GLB a été retravaillé dans Blender et a reçu un 3e node dédié,
// `ScreenDisplay` (plan simple, 4 sommets), destiné explicitement à
// porter l'image/future vidéo — remplace `WhiteScreen` comme support de
// la capture. `WhiteScreen` restait alors monté avec son matériau GLB
// d'origine (glow émissif) comme halo derrière `ScreenDisplay`.
//
// V3 — CE FICHIER (PROMPT_CLAUDE_CODE_PHONE_SCREENDISPLAY_ONLY_TEST) :
// le GLB a été nettoyé à nouveau dans Blender — `WhiteScreen` N'EXISTE
// PLUS (seuls `PhoneBody` et `ScreenDisplay` subsistent). Toute
// dépendance à `WhiteScreen` (node, geometry, matériau, opacité de
// cohabitation, offset géométrique anti-z-fighting, renderOrder) a été
// retirée. `ScreenDisplay` est désormais l'UNIQUE support visuel de
// l'écran, opacity 1.0 (base de test propre pour isoler la cause du
// scintillement — l'effet lumineux sera retravaillé plus tard, une fois
// l'absence de scintillement confirmée).
//
// Shell (hydratation/reduced-motion/Page Visibility/wrapper fixed/Canvas)
// INCHANGÉ depuis la V1 — copié fidèlement du principe déjà validé de
// PageFilaments.tsx/HeroScene.tsx (prompt §10 : "ne pas refaire
// l'architecture, le protéger").
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import phoneGlbUrl from "../../assets/3d/PhoneFinal.glb?url";
// Micro-ajustements (PROMPT micro-ajustements téléphone 3D) — nouvelle
// capture d'écran, même dossier que l'ancienne (`belkhir-mobile.jpg`,
// conservée sur disque, non supprimée : simplement plus référencée ici).
//
// Micro-sprint "Remplacement image initiale téléphone" (PROMPT_CLAUDE_CODE_
// SITES_PRO_REMPLACEMENT_IMAGE_INITIALE_VIDEO_TELEPHONE) — remplacée à son
// tour par `imagePhoneSite.jpg` (fournie par Sébastien, ratio 557×1038 =
// 1,8635, nettement plus proche du ratio réel de ScreenDisplay/de la vidéo
// — 1,8608/1,8611 — que l'ancien fichier 1080×2160 = 2,0, pour une
// transition image -> vidéo moins perceptible). `belkhir-mobile1.jpg` N'EST
// PAS supprimée du disque (prompt : "ne pas supprimer l'ancien JPG"),
// simplement plus référencée ici, seul et unique point d'usage de ce
// fichier dans le dépôt.
import belkhirScreenUrl from "../../assets/projects/belkhir-depannage/imagePhoneSite.jpg?url";
// Environnement EXR 1K (PROMPT_CLAUDE_CODE_PHONE_ENVIRONMENT_EXR_1K) —
// remplace `modern_bathroom_4k.webp` : vrai HDR linéaire (pas une image
// SDR passée par TextureLoader). `?url` (comme le GLB ci-dessus) : un
// binaire chargé par EXRLoader, jamais par le pipeline astro:assets
// (celui-ci ne connaît pas le format .exr).
import phoneEnvironmentExrUrl from "../../assets/hdr/blue_photo_studio_1k.exr?url";
// Vidéo écran (PROMPT_CLAUDE_CODE_INTEGRATION_VIDEO_SCREENDISPLAY_SITES_PRO)
// — même convention `?url` que le GLB/EXR ci-dessus : Vite résout un chemin
// final compatible avec le base path GitHub Pages, jamais un `/src/assets/...`
// codé en dur. Fichier fourni tel quel (jamais réencodé), contrôlé
// binairement avant intégration : MP4 H.264 (`avc1`), 720x1340, 30 i/s,
// ~50,7s, aucune piste audio, ~3,34 Mo (voir rapport pour le détail du
// contrôle) — conforme à l'export attendu.
import phoneVideoUrl from "../../assets/videos/videoPhoneCantrelleStudio.mp4?url";

// --- Placement du téléphone (micro-ajustements) ---------------------------
// Rotation de base -90°/Y (validée V1/V2 : amène l'écran face caméra,
// +X local -> +Z monde) + une rotation ADDITIONNELLE demandée par ce
// sprint ("orienté du mauvais côté... il faut l'orienter vers la gauche,
// donc vers le texte / le centre de la composition") : le téléphone est
// tourné DAVANTAGE (au lieu de rester bien en face de la caméra) pour que
// sa face regarde partiellement vers -X (gauche = côté texte, puisque le
// groupe téléphone est positionné en X positif). Valeur ajustée par
// vérification visuelle réelle (voir rapport).
const PHONE_ROTATION_Y = -Math.PI / 2 - Math.PI / 7;
// Réduction supplémentaire de 10 % demandée pour ce sprint, sur la base
// d'ORIGINE 7.2 (jamais sur le 5.1 du sprint précédent) : objectif final
// -40 % au total, soit 7.2 * 0.60 = 4.32 très exactement — valeur imposée
// par le prompt ("ne pas approximer à 4.5"), conservée telle quelle.
// V2 ANCRAGE (ce sprint) : redevient uniquement la valeur de RÉFÉRENCE/
// repli (voir `resolvedScale` dans SitesPhoneModel) — la taille
// réellement affichée est désormais calculée depuis la vraie place
// disponible dans `.sites-hero-layout__phone-slot`, mais reste bornée
// autour de cette valeur pour ne pas dégrader le rendu 1440/1024 déjà
// validé.
const PHONE_SCALE = 4.32;
// V2 ANCRAGE (ce sprint) : ces 2 constantes ne pilotent plus la position
// réelle du téléphone (remplacées par l'ancrage DOM → monde ci-dessous,
// voir `PhoneSlotAnchor`/`measureSlotAnchor`) — conservées UNIQUEMENT
// comme repli pour la ou les toutes premières frames avant que la mesure
// du slot ne soit disponible (évite un flash à une position arbitraire).
const PHONE_RIGHT_FRACTION = 0.4;
const PHONE_Y_OFFSET = 0.3;

// --- Ancrage responsive sur le slot DOM (V2 ANCRAGE RESPONSIVE 3D) --------
// Cause du défaut à 2560×1440 (voir audit, rapport) : la position n'était
// dérivée que d'une fraction arbitraire du viewport R3F plein écran
// (`viewport.width` dépend de l'aspect ratio de la FENÊTRE, pas de la
// largeur réelle, plafonnée par `--content-width`, du Container centré) —
// aucun rapport avec la vraie boîte englobante de
// `.sites-hero-layout__phone-slot`. Sur un écran large/haut, le Hero (donc
// le slot) occupe une fraction PLUS PETITE de la hauteur de la fenêtre
// (texte qui tient sur moins de lignes dans un Container plafonné), alors
// que l'ancien calcul gardait la même fraction fixe indépendamment de la
// vraie mise en page — le téléphone dérivait donc sous le slot, dans la
// section suivante opaque.
interface PhoneSlotAnchor {
  /** Centre du slot, en fraction (0..1) de la largeur de la fenêtre, TEL
   * QU'IL SERAIT à scroll=0 (voir `measureSlotAnchor` — robuste à une
   * mesure prise pendant que la page est déjà scrollée). */
  fracX: number;
  /** Idem en fraction de la hauteur de la fenêtre. */
  fracY: number;
  /** Dimensions réelles du slot en pixels CSS — utilisées pour calculer
   * l'échelle (place réellement disponible), jamais pour le centre. */
  pxWidth: number;
  pxHeight: number;
  /** FIX "limiter au Hero" — position ABSOLUE (repère document, jamais
   * viewport) du bord bas de `.sites-hero-section` (la vraie section Hero,
   * pas seulement le slot), c'est-à-dire `rect.bottom + window.scrollY`.
   * Comme pour `fracX`/`fracY`, cette valeur ne dépend PAS du scroll au
   * moment de la mesure (le terme `+ window.scrollY` l'annule) : c'est la
   * distance, en pixels, entre le HAUT DU DOCUMENT et le bas du Hero.
   * Comparée à `window.scrollY` courant (lu à chaque frame, jamais
   * remesurée), elle indique si le Hero est encore au moins partiellement
   * visible (`scrollY < heroBottomRestPx`) : un seuil DÉRIVÉ de la vraie
   * frontière DOM, jamais un nombre de pixels arbitraire. `Infinity` si
   * `.sites-hero-section` est introuvable (repli sûr : ne jamais masquer
   * le téléphone par erreur). */
  heroBottomRestPx: number;
}

/** Mesure `.sites-hero-layout__phone-slot` (centre + taille, pour
 * l'ancrage et l'échelle) ET `.sites-hero-section` (frontière basse, pour
 * savoir quand le téléphone a quitté le Hero — FIX "limiter au Hero").
 * ROBUSTE au scroll : `rect.top`/`rect.bottom` seuls suivraient le DOM
 * vers le haut pendant qu'on défile (le Canvas est fixed — jamais voulu
 * ici), donc on recompose la position que ces éléments AURAIENT à
 * scroll=0 (`rect.top/bottom + window.scrollY`) avant toute conversion.
 * Un simple appel ponctuel (resize/ResizeObserver), jamais par frame. */
function measureSlotAnchor(slotEl: HTMLElement, heroSectionEl: HTMLElement | null): PhoneSlotAnchor | null {
  const rect = slotEl.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  if (rect.width === 0 || rect.height === 0 || viewportWidth === 0 || viewportHeight === 0) {
    // Slot pas encore mis en page (ex. display:none temporaire) — on
    // ignore cette mesure plutôt que de diviser par 0 / ancrer sur du vide.
    return null;
  }
  const restTop = rect.top + window.scrollY;
  const restLeft = rect.left; // pas de scroll horizontal sur ce site
  const heroBottomRestPx = heroSectionEl
    ? heroSectionEl.getBoundingClientRect().bottom + window.scrollY
    : Infinity;
  return {
    fracX: (restLeft + rect.width / 2) / viewportWidth,
    fracY: (restTop + rect.height / 2) / viewportHeight,
    pxWidth: rect.width,
    pxHeight: rect.height,
    heroBottomRestPx,
  };
}

// --- Animation d'entrée + idle (storyboard imposé) ------------------------
// Position de repos = position/rotation actuelles ci-dessus, considérées
// comme LA position finale : jamais modifiées par ce sprint, uniquement
// approchées depuis un point de départ différent.
//
// Étape A/D : le téléphone démarre plus à droite (offset local ajouté à la
// position finale du groupe, jamais une nouvelle valeur de `phoneX`) et
// glisse jusqu'à 0 (= position finale exacte).
// Fix "2 tours réellement visibles" — REVENU à 3.4 (valeur pré-"peps").
// Audit : à 5, le téléphone démarrait entièrement hors du viewport visible
// (position monde ≈ phoneX + 5, largement au-delà de la demi-largeur du
// viewport à 1440px) ; comme la translation ET la rotation partageaient
// jusqu'ici le MÊME `eased` (easeOutCubic, très front-loaded), le
// téléphone ne redevenait visible qu'une fois `eased` déjà avancé à
// ~0,59-0,6 — c'est-à-dire après que 59-60% des 2.25 tours (environ 480-
// 486°, plus d'un tour complet) avaient déjà tourné HORS ÉCRAN. Il ne
// restait donc plus qu'un arc résiduel (~330°, à peine 1 tour) à observer
// une fois le téléphone visible — d'où le symptôme rapporté ("+/- un demi-
// tour"). Revenir à 3.4 réduit mécaniquement cette fenêtre hors écran,
// mais l'essentiel du fix est le DÉCOUPLAGE ci-dessous (§ENTERING) : avec
// une rotation qui ne suit plus le easeOutCubic très agressif de la
// translation, la fraction de rotation "consommée" avant que le téléphone
// soit visible reste faible quelle que soit la valeur exacte de cet
// offset.
const ENTRY_START_X_OFFSET = 3.4;
// Étape B : rotation cumulée sur l'axe vertical (Y) UNIQUEMENT — jamais
// une bascule sur X/Z. 2.25 tours (810°), au-dessus du minimum imposé de
// 2 tours (720°) pour une lecture nette sans être excessif. INCHANGÉ.
const ENTRY_SPIN_TURNS = 2.25;
const ENTRY_SPIN_RADIANS = ENTRY_SPIN_TURNS * Math.PI * 2;
// Étape C : durée — 3.2s INCHANGÉE (dans la fourchette validée, prompt
// §8 : "ne pas raccourcir... conserver ~3.2s").
const ENTRY_DURATION = 3.2;
// Translation — easeOutCubic INCHANGÉ (donne l'impact "rapide au départ,
// ralentissement progressif, arrivée douce" recherché pour l'ARRIVÉE du
// téléphone dans le cadre).
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
// Fix "2 tours réellement visibles" — ROTATION DÉCOUPLÉE de la
// translation (prompt §6 : `moveProgress`/`spinProgress` séparés mais
// synchronisés dans la même phase ENTERING, jamais après). Un ease-out
// quadratique, nettement MOINS front-loaded que le cubique de la
// translation (à t=0.15, quad ≈ 27,75% contre cubic ≈ 39%), pour que la
// majorité de la rotation reste à jouer PENDANT que le téléphone devient
// progressivement visible — "progression temporelle plus régulière /
// légèrement ease-out" (prompt §6), tout en conservant une décélération
// perceptible en fin de course (contrairement à un linéaire pur, qui
// stopperait net à vitesse angulaire constante). Rotation TOUJOURS
// pilotée par une valeur cumulative explicite (lerp entre 2 radians
// absolus, jamais de quaternion.slerp/normalize/modulo/chemin le plus
// court, prompt §7) : aucun risque de réduction visuelle des 810° à un
// petit arc.
function easeOutQuadSpin(t: number) {
  return 1 - Math.pow(1 - t, 2);
}
// Étape E : idle — léger pivot droite/gauche autour de l'axe vertical,
// continu, jamais figé. Amplitude modérée (ni trop faible ni exagérée) et
// période lente pour un rendu premium, pas un tic nerveux.
const IDLE_AMPLITUDE = THREE.MathUtils.degToRad(6);
const IDLE_SPEED = 0.45; // rad/s de la phase du sinus (période ≈ 14s)

// --- Environnement EXR 1K (PROMPT_CLAUDE_CODE_PHONE_ENVIRONMENT_EXR_1K) ---
// Valeur de départ imposée par le prompt (§3). Ajustable visuellement entre
// 1.0 (si surexposé) et 1.4 maximum (si reflets trop faibles) — jamais
// au-delà sans validation visuelle. 1.2 conservée : ni surexposition ni
// reflets trop faibles constatés lors de la validation de ce sprint (voir
// rapport).
const PHONE_ENVIRONMENT_INTENSITY = 1.2;
// Orientation naturelle de l'EXR conservée (prompt §4 : "ne pas inventer
// une rotation forte arbitraire... commencer avec l'orientation naturelle
// de l'EXR"). Validation visuelle de ce sprint : les grandes sources
// lumineuses de `blue_photo_studio_1k.exr` tombent déjà correctement sur
// la coque (tranche métallique, contour supérieur, flancs, lentilles) sans
// aucun ajustement — rotation laissée à 0.
const PHONE_ENVIRONMENT_ROTATION_Y = 0;

// --- Interaction utilisateur — drag souris (PROMPT_CLAUDE_CODE_PHONE_
// USER_DRAG_RETURN_IDLE) — active UNIQUEMENT une fois IDLE atteint (jamais
// pendant WAITING/PAUSING/ENTERING). Sensibilité au milieu de la fourchette
// recommandée (0.005-0.008 rad/px).
const DRAG_SENSITIVITY = 0.006; // rad par pixel de déplacement souris
// Yaw (Y) : volontairement AUCUN clamp — "l'utilisateur doit pouvoir voir
// les côtés et l'arrière", rotation libre à 360°.
// Pitch (X) : clamp large (60°, milieu de la fourchette ±55°/±65°
// recommandée) — permet une inclinaison nette sans jamais présenter le
// téléphone totalement inversé.
const DRAG_PITCH_CLAMP = THREE.MathUtils.degToRad(60);
// Retour automatique après inactivité — mesurée depuis le DERNIER
// mouvement réel (jamais depuis pointerup), lambda au milieu de la
// fourchette 4-6 recommandée (retour perceptuellement ~0.8-1.2s).
const DRAG_RETURN_TIMEOUT = 1; // secondes sans mouvement avant RETURNING
const RETURN_LAMBDA = 5;
// Seuil angulaire (rad) sous lequel RETURNING est considéré "arrivé" et
// clampe proprement sur l'orientation de repos avant de repasser en IDLE.
const RETURN_SETTLE_THRESHOLD = 0.01;

/** Clone la geometry source (jamais l'originale mise en cache par
 * useGLTF/drei — mutée ici) et normalise son attribut UV vers 0..1
 * (prompt §3 : le nouveau `ScreenDisplay` a des UV bruts qui ne couvrent
 * qu'une partie de l'espace 0..1, ex. U ∈ [0, 0.538] mesuré dans le GLB
 * réel — un mapping direct laisserait l'essentiel de la texture inutilisé
 * et l'image apparaîtrait comme comprimée/déformée sur la largeur, l'effet
 * "machine à laver" que le prompt demande explicitement d'éviter). Aucune
 * modification du GLB sur disque : uniquement une geometry clonée en
 * mémoire, locale à ce composant. */
function normalizeUv(sourceGeometry: THREE.BufferGeometry) {
  const geometry = sourceGeometry.clone();
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  let uMin = Infinity;
  let uMax = -Infinity;
  let vMin = Infinity;
  let vMax = -Infinity;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    uMin = Math.min(uMin, u);
    uMax = Math.max(uMax, u);
    vMin = Math.min(vMin, v);
    vMax = Math.max(vMax, v);
  }
  const uRange = uMax - uMin || 1;
  const vRange = vMax - vMin || 1;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) - uMin) / uRange, (uv.getY(i) - vMin) / vRange);
  }
  uv.needsUpdate = true;
  return geometry;
}

/** Fix "haut de l'image manquant" (PROMPT_CLAUDE_CODE — fix mapping écran
 * contain) — remplace l'ancien mapping `cover` (`buildCoverRepeat`, qui
 * recadrait l'axe en excédent via `repeat`/`offset` et coupait le haut de
 * l'image quand `imageAspect > planeAspect`) par un vrai `contain` :
 * l'image entière est TOUJOURS visible, jamais recadrée, jamais déformée
 * (aucun stretch). Implémenté en pré-composant l'image sur un canvas aux
 * dimensions de l'écran (`planeAspect`), avec l'image centrée à l'échelle
 * qui la fait tenir entièrement dedans — les marges résiduelles (si le
 * ratio image/écran diffère légèrement) sont remplies d'un noir profond
 * sobre, cohérent avec un écran de téléphone, plutôt que de laisser
 * `ClampToEdgeWrapping` étirer les pixels de bord (rendu sale). `repeat`/
 * `offset`/`center`/`rotation` restent à leur valeur PAR DÉFAUT sur la
 * texture résultante : le canvas a déjà le bon cadrage, aucun mapping UV
 * supplémentaire n'est nécessaire ni appliqué. `planeAspect`/`imageAspect`
 * sont tous deux hauteur/largeur. */
function buildContainCanvas(image: unknown, planeAspect: number) {
  // `Texture.image` est typé `unknown` côté three.js — `useTexture` charge
  // toujours un `HTMLImageElement` via `TextureLoader` (jamais une vidéo/
  // un canvas source ici), cast direct sans vérification supplémentaire.
  const source = image as HTMLImageElement;
  const imgWidth = source.naturalWidth || source.width;
  const imgHeight = source.naturalHeight || source.height;

  const canvas = document.createElement("canvas");
  canvas.width = imgWidth;
  canvas.height = Math.round(imgWidth * planeAspect);
  const ctx = canvas.getContext("2d")!;

  // Couleur de marge — noir profond, se fond dans l'écran/la coque plutôt
  // que de trancher avec un blanc/gris visible.
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;
  const dx = (canvas.width - drawWidth) / 2;
  const dy = (canvas.height - drawHeight) / 2;
  ctx.drawImage(source, dx, dy, drawWidth, drawHeight);

  return canvas;
}

/** Pont entre la couche DOM (écouteurs Pointer Events sur
 * `.sites-hero-layout__phone-slot`, en dehors du Canvas R3F — voir
 * `SitesPhoneScene`) et la boucle d'animation (`useFrame` dans
 * `SitesPhoneModel`). Même principe que `pointerRef` dans HeroScene.tsx :
 * un simple objet muté directement par les gestionnaires DOM, lu/consommé
 * chaque frame — aucun state React, aucun re-render. */
interface PhoneInteractionBridge {
  /** Élément DOM de la zone d'interaction, mis en cache une seule fois. */
  zoneEl: HTMLElement | null;
  /** Micro-sprint "Indication d'interaction du téléphone 3D" — élément DOM
   * du texte d'aide (`.sites-hero-layout__phone-hint`), mis en cache une
   * seule fois au même endroit que `zoneEl` ci-dessus. `null` si l'élément
   * est absent (ex. balisage retiré) : les 2 `classList` optionnels
   * plus bas (SitesPhoneModel) deviennent alors des no-op silencieux,
   * jamais une erreur. */
  hintEl: HTMLElement | null;
  /** Flag "one-shot" : un pointerdown vient d'avoir lieu, pas encore
   * consommé par `useFrame`. */
  justPressed: boolean;
  /** Delta cumulé depuis la dernière consommation par `useFrame`. */
  deltaX: number;
  deltaY: number;
  /** Flag "one-shot" : au moins un pointermove a eu lieu depuis la
   * dernière frame consommée (sert à réinitialiser l'inactivité). */
  moved: boolean;
}

interface SitesPhoneModelProps {
  reducedMotion: boolean;
  // Vidéo écran (PROMPT_CLAUDE_CODE_INTEGRATION_VIDEO_SCREENDISPLAY_SITES_
  // PRO) — même valeur que `tabVisible` déjà utilisée par `SitesPhoneScene`
  // pour piloter `frameloop` ; propagée ici pour mettre la vidéo en pause
  // quand l'onglet est masqué (adaptation minimale, même principe de
  // props déjà en place pour `reducedMotion`).
  tabVisible: boolean;
  interactionRef: RefObject<PhoneInteractionBridge>;
  slotAnchor: PhoneSlotAnchor | null;
}

// Marge de sécurité appliquée à la place mesurée du slot avant de calculer
// l'échelle d'ajustement (évite que le téléphone touche les bords du slot).
const PHONE_FIT_MARGIN = 0.88;
// Garde-fous autour de PHONE_SCALE (valeur validée à 1440/1024) : le calcul
// ci-dessous dérive une échelle RÉELLE depuis la place disponible dans le
// slot (jamais une valeur unique imposée à toutes les résolutions, prompt
// §2), mais reste borné autour de cette référence pour rester proche du
// rendu déjà accepté et interdire toute croissance incontrôlée en 4K/
// ultra-wide.
const PHONE_SCALE_MIN_RATIO = 0.75;
const PHONE_SCALE_MAX_RATIO = 1.15;

/** Boîte englobante LOCALE (espace du rig, avant `scale`) combinée de
 * `PhoneBody` + `ScreenDisplay`, puis pivotée de `PHONE_ROTATION_Y` (seule
 * transformation du rig qui affecte la projection écran hors animation :
 * une rotation autour de Y mélange X/Z mais laisse Y — donc la hauteur
 * écran — inchangée). Sert uniquement à connaître, à `scale=1`, la largeur/
 * hauteur RÉELLES du modèle une fois orienté comme à l'écran, pour calculer
 * l'échelle qui le fait tenir dans le slot mesuré. Calculée une seule fois
 * au chargement du GLB (jamais par frame). */
function computePhoneFootprint(phoneBody: THREE.Mesh, screenDisplay: THREE.Mesh) {
  const box = new THREE.Box3();
  [phoneBody, screenDisplay].forEach((root) => {
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      mesh.geometry.computeBoundingBox();
      if (mesh.geometry.boundingBox) box.union(mesh.geometry.boundingBox);
    });
  });
  if (box.isEmpty()) return null;
  box.applyMatrix4(new THREE.Matrix4().makeRotationY(PHONE_ROTATION_Y));
  const size = new THREE.Vector3();
  box.getSize(size);
  return { width: size.x, height: size.y };
}

function SitesPhoneModel({ reducedMotion, tabVisible, interactionRef, slotAnchor }: SitesPhoneModelProps) {
  // `nodes` ciblés PAR NOM (jamais un index) — inchangé depuis la V1,
  // étendu au 3e node.
  const { nodes } = useGLTF(phoneGlbUrl) as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const phoneBody = nodes.PhoneBody;
  const screenDisplay = nodes.ScreenDisplay;

  // Échelle responsive — dérivée de la vraie place disponible dans le slot
  // DOM (largeur ET hauteur, prompt §2), jamais d'une fraction fixe de
  // l'écran. `viewport`/`size` (R3F) donnent respectivement les dimensions
  // du plan z=0 en unités monde et la taille CSS réelle du canvas (= la
  // fenêtre, Canvas plein écran) : leur ratio convertit des pixels CSS du
  // slot en unités monde, DPR-neutre (`size` n'est jamais en pixels
  // physiques contrairement à `gl.domElement`).
  const { viewport, size } = useThree();
  const phoneFootprint = useMemo(
    () => (phoneBody && screenDisplay ? computePhoneFootprint(phoneBody, screenDisplay) : null),
    [phoneBody, screenDisplay],
  );
  const resolvedScale = useMemo(() => {
    if (!phoneFootprint || !slotAnchor || size.width === 0 || size.height === 0) {
      // Repli — pas encore mesuré (première frame) ou GLB sans geometry
      // exploitable : ancienne valeur fixe validée, jamais 0/NaN.
      return PHONE_SCALE;
    }
    const worldPerPxX = viewport.width / size.width;
    const worldPerPxY = viewport.height / size.height;
    const availableWidth = slotAnchor.pxWidth * worldPerPxX * PHONE_FIT_MARGIN;
    const availableHeight = slotAnchor.pxHeight * worldPerPxY * PHONE_FIT_MARGIN;
    const fitScale = Math.min(availableWidth / phoneFootprint.width, availableHeight / phoneFootprint.height);
    return THREE.MathUtils.clamp(fitScale, PHONE_SCALE * PHONE_SCALE_MIN_RATIO, PHONE_SCALE * PHONE_SCALE_MAX_RATIO);
  }, [phoneFootprint, slotAnchor, viewport.width, viewport.height, size.width, size.height]);

  // Animation d'entrée + idle — tout vit sur CE groupe (ref), jamais sur le
  // groupe parent qui porte la position finale [phoneX, phoneY, 0]
  // (SitesPhoneSceneContent, ancrée sur le slot DOM réel et recalculée
  // automatiquement au resize — ne doit jamais être court-circuitée par
  // l'animation). Ici, seul un décalage LOCAL (X) et la rotation Y sont
  // pilotés image par image ; au repos les deux valent respectivement 0 et
  // PHONE_ROTATION_Y, soit EXACTEMENT la position/rotation finale déjà
  // validée.
  const rigRef = useRef<THREE.Group>(null);
  const entryElapsed = useRef(0);
  const pauseElapsed = useRef(0);
  // Fix "saut entry -> idle" — timer LOCAL à la phase idle, jamais
  // `state.clock.elapsedTime` (global, continue de tourner depuis le
  // montage du Canvas : au moment où l'entrée se termine, `sin(elapsedTime
  // * IDLE_SPEED)` n'a aucune raison de valoir 0, d'où le saut d'angle
  // observé). `idleElapsed` est remis à 0 EXACTEMENT au moment où la
  // phase passe à "idle" (voir plus bas) et n'est incrémenté que pendant
  // cette phase — à idleElapsed=0, sin(0)=0, donc aucune discontinuité
  // avec la rotation finale de l'entrée.
  const idleElapsed = useRef(0);
  // Montée progressive de l'amplitude idle (prompt §7) sur ~0.7s, jamais
  // appliquée d'un coup — smoothstep (ease-in-out standard, Three.js/
  // GLSL), aucune nouvelle dépendance.
  const IDLE_BLEND_DURATION = 0.7;
  function smoothstep(x: number) {
    const t = THREE.MathUtils.clamp(x, 0, 1);
    return t * t * (3 - 2 * t);
  }
  // Fix "entrée invisible" — machine à états explicite (au lieu d'un
  // simple booléen `entryDone`) : `waiting` couvre la toute première frame
  // RÉELLEMENT rendue de ce composant (après résolution du Suspense R3F
  // pour le GLB/la texture, potentiellement plusieurs secondes après le
  // montage du Canvas). Le `delta` de CETTE frame précise peut refléter
  // tout le temps de chargement écoulé pendant que le composant était
  // suspendu (le clock R3F continue de tourner même quand les enfants
  // sont suspendus) — s'il était accumulé dans `entryElapsed`, `t`
  // atteindrait quasi instantanément 1, rendant l'animation invisible
  // (symptôme exact rapporté). Ce `delta` est donc VOLONTAIREMENT ignoré :
  // on se contente de (re)poser le rig à son état de départ et de changer
  // de phase, sans faire progresser aucun minuteur sur cette frame-là.
  const phase = useRef<"waiting" | "pausing" | "entering" | "idle" | "userDrag" | "returning">("waiting");
  // Micro-pause (150-250ms) après cette première frame réelle : laisse la
  // pose de départ se lire clairement avant que l'entrée démarre.
  const READY_PAUSE = 0.2;

  // --- Vidéo écran (PROMPT_CLAUDE_CODE_INTEGRATION_VIDEO_SCREENDISPLAY_
  // SITES_PRO) — refs uniquement (jamais de state React ici, même
  // principe que `phase`/`dragYaw` ci-dessus : la lecture/pause de la
  // vidéo est pilotée depuis un `useFrame` séparé, isolé du phase machine
  // d'animation existant, jamais lu ni modifié par lui — voir plus bas). */
  const posterTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const planeAspectRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);
  // true dès que la vidéo a réellement démarré sa lecture (autoplay
  // accepté) — condition NÉCESSAIRE mais pas suffisante pour l'afficher :
  // il faut aussi que `phase.current === "idle"` (entrée terminée).
  const videoPlaybackStartedRef = useRef(false);
  // true dès que `screenMaterial.map` pointe réellement sur la texture
  // vidéo (bascule définitive, une seule fois par montage sauf si
  // reduced-motion s'active en cours de route et la fait revenir au
  // poster).
  const videoAppliedRef = useRef(false);
  // Dernier état lecture/pause réellement demandé au `<video>` — évite
  // d'appeler `.play()`/`.pause()` à chaque frame quand rien n'a changé.
  const videoShouldPlayRef = useRef(false);

  // Interaction utilisateur — rotation courante pilotée par le drag ou le
  // retour automatique (X = pitch, Y = yaw). Servent de source de vérité
  // UNIQUEMENT pendant USER_DRAG/RETURNING ; WAITING/PAUSING/ENTERING/IDLE
  // continuent d'écrire directement sur `rig.rotation` comme avant (X y
  // reste alors implicitement 0, jamais touché ailleurs).
  const dragPitch = useRef(0);
  const dragYaw = useRef(PHONE_ROTATION_Y);
  // Inactivité mesurée depuis le DERNIER mouvement réel (prompt §8),
  // jamais depuis pointerup — incrémentée uniquement pendant USER_DRAG.
  const inactivityElapsed = useRef(0);

  useFrame((_state, delta) => {
    const rig = rigRef.current;
    if (!rig) return;

    if (reducedMotion) {
      // "Pas d'animation agressive" — ni spin d'entrée, ni oscillation
      // idle : position/rotation finales appliquées directement, sans
      // transition (même principe que HeroSpheres.tsx/PageFilaments.tsx
      // sous prefers-reduced-motion). Choix délibéré et conservateur
      // (prompt §15, "peut rester autorisée" — permissif, pas obligatoire) :
      // le drag reste désactivé sous reduced-motion, cohérent avec le
      // comportement déjà validé de HeroSpheres.tsx/PageFilaments.tsx qui
      // gèlent toute animation continue dans ce mode — "ne pas casser le
      // comportement actuel" prime ici sur l'ajout d'une interaction
      // optionnelle.
      rig.position.x = 0;
      rig.rotation.x = 0;
      rig.rotation.y = PHONE_ROTATION_Y;
      phase.current = "idle";
      return;
    }

    // Prompt §2/§7 : une pression valide n'est prise en compte QUE si la
    // phase actuelle autorise l'interaction (IDLE ou RETURNING — jamais
    // WAITING/PAUSING/ENTERING). Le flag est de toute façon consommé
    // (remis à false) pour ne jamais rester "en attente" indéfiniment.
    const bridge = interactionRef.current;
    if (bridge?.justPressed) {
      bridge.justPressed = false;
      if (phase.current === "idle" || phase.current === "returning") {
        // "Prendre comme point de départ EXACT la rotation actuelle
        // visible... ne pas revenir d'abord à PHONE_ROTATION_Y" — capture
        // directement les valeurs actuelles de `rig.rotation`, qu'elles
        // viennent de l'idle (Y oscillant, X toujours à 0) ou d'un retour
        // en cours (X/Y à mi-chemin).
        dragPitch.current = rig.rotation.x;
        dragYaw.current = rig.rotation.y;
        phase.current = "userDrag";
        inactivityElapsed.current = 0;
      }
    }

    if (phase.current === "userDrag") {
      if (bridge?.moved) {
        dragYaw.current += bridge.deltaX * DRAG_SENSITIVITY;
        dragPitch.current = THREE.MathUtils.clamp(
          dragPitch.current + bridge.deltaY * DRAG_SENSITIVITY,
          -DRAG_PITCH_CLAMP,
          DRAG_PITCH_CLAMP,
        );
        bridge.deltaX = 0;
        bridge.deltaY = 0;
        bridge.moved = false;
        inactivityElapsed.current = 0;
        // Micro-sprint "Indication d'interaction du téléphone 3D" — PREMIÈRE
        // interaction effective (clic maintenu + mouvement réel, jamais un
        // simple clic sans glissement : `bridge.moved` n'est mis à `true`
        // QUE par un vrai `pointermove`, voir `onPointerMove` plus bas dans
        // ce fichier). `classList.remove` est idempotent sur les frames
        // suivantes d'un même drag continu — jamais réajoutée ensuite nulle
        // part ailleurs dans ce fichier, donc masquage permanent pour le
        // reste de cette visite de page.
        interactionRef.current?.hintEl?.classList.remove("sites-hero-layout__phone-hint--visible");
      }
      rig.rotation.x = dragPitch.current;
      rig.rotation.y = dragYaw.current;

      inactivityElapsed.current += delta;
      if (inactivityElapsed.current >= DRAG_RETURN_TIMEOUT) {
        // "Après exactement environ 1 seconde SANS mouvement" — que le
        // pointeur soit encore appuyé (immobile) ou relâché n'a aucune
        // importance ici : seul le temps depuis le dernier mouvement RÉEL
        // compte (prompt §8).
        phase.current = "returning";
      }
      return;
    }

    if (phase.current === "returning") {
      // Reprise immédiate si l'utilisateur recommence à bouger (prompt
      // §8/§12) : le `justPressed`/`userDrag` ci-dessus gère déjà la
      // reprise sur un NOUVEAU pointerdown ; ici on gère la reprise SANS
      // relâcher le pointeur (un `pointermove` peut arriver alors que la
      // capture est toujours active depuis avant le début du retour).
      if (bridge?.moved) {
        dragYaw.current += bridge.deltaX * DRAG_SENSITIVITY;
        dragPitch.current = THREE.MathUtils.clamp(
          dragPitch.current + bridge.deltaY * DRAG_SENSITIVITY,
          -DRAG_PITCH_CLAMP,
          DRAG_PITCH_CLAMP,
        );
        bridge.deltaX = 0;
        bridge.deltaY = 0;
        bridge.moved = false;
        inactivityElapsed.current = 0;
        phase.current = "userDrag";
        rig.rotation.x = dragPitch.current;
        rig.rotation.y = dragYaw.current;
        return;
      }

      // Damp framerate-independent (jamais un lerp/assignment direct) —
      // ramène X vers 0 (neutre) et Y vers PHONE_ROTATION_Y (orientation
      // centrale de repos, prompt §9), Z jamais touché (reste à 0).
      dragPitch.current = THREE.MathUtils.damp(dragPitch.current, 0, RETURN_LAMBDA, delta);
      dragYaw.current = THREE.MathUtils.damp(dragYaw.current, PHONE_ROTATION_Y, RETURN_LAMBDA, delta);
      rig.rotation.x = dragPitch.current;
      rig.rotation.y = dragYaw.current;

      const settled =
        Math.abs(dragPitch.current) < RETURN_SETTLE_THRESHOLD &&
        Math.abs(dragYaw.current - PHONE_ROTATION_Y) < RETURN_SETTLE_THRESHOLD;
      if (settled) {
        // Prompt §10 : clamp propre sur l'orientation de repos exacte,
        // reset idleElapsed à 0 (l'idle reprend en douceur depuis une
        // amplitude nulle, exactement comme à la sortie de ENTERING).
        rig.rotation.x = 0;
        rig.rotation.y = PHONE_ROTATION_Y;
        dragPitch.current = 0;
        dragYaw.current = PHONE_ROTATION_Y;
        phase.current = "idle";
        idleElapsed.current = 0;
      }
      return;
    }

    if (phase.current === "waiting") {
      // Pose de départ (déjà appliquée par les props déclaratives du
      // <group>, réaffirmée ici par sécurité) — delta de cette frame
      // ignoré (voir commentaire plus haut), simple transition de phase.
      rig.position.x = ENTRY_START_X_OFFSET;
      rig.rotation.y = PHONE_ROTATION_Y - ENTRY_SPIN_RADIANS;
      phase.current = "pausing";
      return;
    }

    if (phase.current === "pausing") {
      // À partir d'ici, `delta` reflète un vrai intervalle inter-frame
      // (~16ms à 60fps) : le composant a déjà rendu au moins une frame,
      // l'anomalie du premier `delta` ne peut plus se reproduire.
      pauseElapsed.current += delta;
      if (pauseElapsed.current >= READY_PAUSE) {
        phase.current = "entering";
        entryElapsed.current = 0; // remise à zéro exacte au démarrage réel
      }
      return;
    }

    if (phase.current === "entering") {
      entryElapsed.current += delta;
      const t = Math.min(entryElapsed.current / ENTRY_DURATION, 1);
      // Découplées mais synchronisées sur le MÊME `t` (même phase
      // ENTERING, même durée totale) — la translation garde son impact
      // "rapide puis amorti" (cubique), la rotation suit une courbe plus
      // régulière pour rester lisible pendant que le téléphone entre dans
      // le cadre. Les deux atteignent 1 EXACTEMENT à la même frame (t>=1
      // ci-dessous) : la rotation ne continue jamais après la fin de
      // l'entrée (prompt §6 : "ne pas faire tourner le téléphone après la
      // fin de l'entrée").
      const moveProgress = easeOutCubic(t);
      const spinProgress = easeOutQuadSpin(t);
      // Étape B/D : glisse de droite (+offset local) vers la position
      // finale (0) ; tourne sur l'axe Y depuis (finale - 2.25 tours)
      // jusqu'à la rotation finale exacte — arrive donc TOUJOURS pile à
      // PHONE_ROTATION_Y, jamais un multiple résiduel. Lerp entre 2
      // radians absolus (valeur cumulative explicite, prompt §7) — jamais
      // de normalisation d'angle qui réduirait visuellement les 810° à un
      // petit arc.
      rig.position.x = THREE.MathUtils.lerp(ENTRY_START_X_OFFSET, 0, moveProgress);
      rig.rotation.y = THREE.MathUtils.lerp(PHONE_ROTATION_Y - ENTRY_SPIN_RADIANS, PHONE_ROTATION_Y, spinProgress);
      if (t >= 1) {
        // Passage ENTERING -> IDLE (prompt §8) : clamp position/rotation
        // finales, reset idleElapsed à 0, blend idle à 0 (implicite :
        // smoothstep(0)=0). Cette frame se termine ici avec rotation.y
        // EXACTEMENT PHONE_ROTATION_Y — la phase idle ne s'exécute qu'à
        // partir de la frame SUIVANTE, avec idleElapsed quasi nul.
        rig.position.x = 0;
        rig.rotation.x = 0;
        rig.rotation.y = PHONE_ROTATION_Y;
        phase.current = "idle";
        idleElapsed.current = 0;
        // Interaction disponible à partir d'ici seulement (prompt §12 :
        // "Pendant ENTERING : curseur normal, interaction inactive") — un
        // seul ajout de classe, jamais retiré ensuite (ENTERING ne se
        // reproduit plus après le premier chargement).
        interactionRef.current?.zoneEl?.classList.add("sites-hero-layout__phone-slot--interactive");
        // Micro-sprint "Indication d'interaction du téléphone 3D" — même
        // point exact que la ligne ci-dessus (entrée réellement terminée,
        // jamais un timeout arbitraire) : fondu d'apparition de l'aide.
        // Ajouté une seule fois, jamais retiré ici (seul le premier drag
        // effectif, plus bas, le retire — plus jamais réaffiché ensuite
        // puisque ENTERING ne se reproduit plus après ce premier passage).
        interactionRef.current?.hintEl?.classList.add("sites-hero-layout__phone-hint--visible");
      }
      return;
    }

    // Étape E — idle : timer LOCAL (jamais state.clock.elapsedTime, voir
    // plus haut) + montée progressive de l'amplitude sur IDLE_BLEND_
    // DURATION — à idleElapsed=0, sin(0)*amplitude*smoothstep(0) = 0,
    // continuité parfaite avec la fin de l'entrée. Jamais de mouvement de
    // position (seule la rotation oscille). `rotation.x` réaffirmé à 0 par
    // sécurité (seul USER_DRAG/RETURNING le modifient jamais).
    idleElapsed.current += delta;
    const idleBlend = smoothstep(idleElapsed.current / IDLE_BLEND_DURATION);
    rig.position.x = 0;
    rig.rotation.x = 0;
    rig.rotation.y = PHONE_ROTATION_Y + Math.sin(idleElapsed.current * IDLE_SPEED) * IDLE_AMPLITUDE * idleBlend;
  });

  // Micro-ajustements — "le téléphone paraît trop gris, ne met pas en
  // valeur les matériaux" : les matériaux D'ORIGINE du GLB sont conservés
  // tels quels (aucun remplacement, "vérifier que les matériaux du modèle
  // sont bien respectés"), seule leur `envMapIntensity` est renforcée
  // (propriété standard de MeshStandardMaterial/MeshPhysicalMaterial,
  // celle que GLTFLoader assigne à ces matériaux PBR) pour que les reflets
  // de l'environnement (métal, lentilles) soient nettement plus visibles
  // — même principe que le renforcement d'`envMapIntensity` déjà appliqué
  // sur les sphères de la Home (CS-S6D) pour corriger un rendu plat.
  useEffect(() => {
    if (!phoneBody) return;
    // `PhoneBody` a 10 matériaux (un par primitive glTF) : GLTFLoader crée
    // un Mesh distinct par primitive sous un Group parent, PAS un Mesh
    // unique avec un tableau `.material` — `traverse()` visite chaque
    // Mesh descendant (et fonctionnerait aussi si le node était un Mesh
    // unique, cas couvert par la même boucle).
    phoneBody.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        if (mat && "envMapIntensity" in mat) {
          (mat as THREE.MeshStandardMaterial).envMapIntensity = 2.2;
          mat.needsUpdate = true;
        }
      });
    });
  }, [phoneBody]);

  const screenTexture = useTexture(belkhirScreenUrl);

  // Geometry normalisée + mapping contain — recalculés seulement si la
  // geometry source change (jamais par frame, aucune animation ici).
  //
  // Micro-sprint "ScreenDisplay seul" — le GLB a été nettoyé dans
  // Blender : `WhiteScreen` n'existe plus, `ScreenDisplay` est
  // désormais l'unique support visuel de l'écran. L'ancien offset
  // géométrique (`SCREEN_DISPLAY_EXTRA_OFFSET`) n'avait de sens que pour
  // écarter `ScreenDisplay` de `WhiteScreen` (z-fighting entre 2 surfaces
  // quasi coplanaires) — supprimé, il n'y a plus rien dont s'écarter.
  // La normalisation UV, elle, reste NÉCESSAIRE : vérifiée à nouveau sur
  // ce GLB réexporté, les UV brutes de `ScreenDisplay` ne couvrent
  // toujours que U ∈ [0, 0.537] (mesuré directement dans le fichier),
  // pas l'espace 0..1 complet — sans cette normalisation, l'image serait
  // comprimée sur la largeur ("machine à laver").
  const normalizedGeometry = useMemo(() => {
    if (!screenDisplay) return null;
    return normalizeUv(screenDisplay.geometry);
  }, [screenDisplay]);

  const screenMaterial = useMemo(() => {
    if (!normalizedGeometry) return null;
    normalizedGeometry.computeBoundingBox();
    const bbox = normalizedGeometry.boundingBox!;
    // Repère local confirmé par l'audit (X = épaisseur/normale, Y =
    // hauteur, Z = largeur) — ScreenDisplay est un plan plat sur ce même
    // axe X, donc Y/Z portent bien la hauteur/largeur réelles du plan.
    const planeHeight = bbox.max.y - bbox.min.y;
    const planeWidth = bbox.max.z - bbox.min.z;
    const planeAspect = planeHeight / planeWidth;

    // Fix "haut de l'image manquant" — CONTAIN, jamais cover : l'image est
    // pré-composée entière (jamais déformée) sur un canvas aux dimensions
    // de l'écran, marges éventuelles en noir profond (voir
    // buildContainCanvas ci-dessus). La texture résultante mappe 1:1 sur
    // le plan : AUCUN repeat/offset/center/rotation appliqué en plus
    // (ancien réglage `cover` entièrement supprimé, jamais réappliqué ici).
    const containCanvas = buildContainCanvas(screenTexture.image, planeAspect);
    const containTexture = new THREE.CanvasTexture(containCanvas);
    containTexture.colorSpace = THREE.SRGBColorSpace;
    // Même convention d'orientation que l'ancienne texture image (déjà
    // validée visuellement sur plusieurs sprints) : le canvas est dessiné
    // avec la même origine haut-gauche qu'un HTMLImageElement classique.
    containTexture.flipY = false;
    containTexture.wrapS = THREE.ClampToEdgeWrapping;
    containTexture.wrapT = THREE.ClampToEdgeWrapping;
    containTexture.needsUpdate = true;
    // Vidéo écran — la texture poster est conservée dans une ref pour que
    // le useFrame vidéo plus bas puisse y revenir (reduced-motion activé
    // en cours de session, échec de lecture, etc.) sans reconstruire ce
    // matériau ni recalculer `planeAspect`.
    posterTextureRef.current = containTexture;
    planeAspectRef.current = planeAspect;

    // Micro-sprint "ScreenDisplay seul" — base de test propre demandée :
    // une seule surface écran, totalement opaque (opacity 1.0,
    // transparent:false). L'ancienne opacité 0.90 + les propriétés de
    // sécurité anti-z-fighting (depthWrite:false, polygonOffset)
    // n'avaient de sens que pour cohabiter avec `WhiteScreen` (glow
    // émissif derrière, surfaces quasi coplanaires) — les deux ont
    // disparu avec `WhiteScreen` lui-même. `depthWrite` reste à sa
    // valeur par défaut (`true`), cohérente avec un matériau opaque.
    // Aucun émissif ajouté pour ce test (prompt : "sera retravaillé plus
    // tard, après validation de l'absence de scintillement").
    return new THREE.MeshBasicMaterial({
      map: containTexture,
      color: "#ffffff",
      toneMapped: false,
      opacity: 1,
      transparent: false,
    });
  }, [normalizedGeometry, screenTexture]);

  // --- Vidéo écran : création/chargement (PROMPT_CLAUDE_CODE_INTEGRATION_
  // VIDEO_SCREENDISPLAY_SITES_PRO) -----------------------------------------
  // Élément <video> jamais ajouté au DOM (prompt : "ne doit pas créer de
  // DOM visible par-dessus la page") — un <video> détaché suffit à
  // alimenter une THREE.VideoTexture ; cette page ne monte de toute façon
  // pas la scène 3D sous 900px (prompt §4), donc aucune contrainte mobile
  // n'exige de l'attacher au DOM. Gardée sous `reducedMotion` (prompt :
  // "idéalement, ne pas déclencher de chargement vidéo" dans ce mode) —
  // si `reducedMotion` passe à `true` en cours de session (media query),
  // le cleanup ci-dessous démonte proprement la vidéo créée par CE sprint
  // (jamais le GLB/HDRI partagés).
  useEffect(() => {
    if (reducedMotion) return;

    const video = document.createElement("video");
    video.src = phoneVideoUrl;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    videoRef.current = video;

    // Même traitement colorimétrique/orientation que `containTexture`
    // ci-dessus (prompt : "vérifie l'espace colorimétrique sRGB... évite un
    // écran délavé") — un <video> se comporte comme n'importe quelle
    // source image pour l'upload GPU three.js, la même règle `flipY`
    // s'applique donc à l'identique.
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    videoTextureRef.current = texture;

    // Mapping — AUCUN repeat/offset/canvas de recadrage ajouté ici,
    // contrairement au poster : vérifié avant ce sprint (voir rapport),
    // le ratio hauteur/largeur réel de ScreenDisplay (1,8608) et celui du
    // fichier fourni (1340/720 = 1,8611) ne diffèrent que de ~0,016% —
    // moins d'un pixel d'écart à 720px de large. Un mapping direct
    // (repeat 1/1, offset 0/0) sur la MÊME geometry normalisée (UV 0..1
    // déjà pleine surface) remplit donc l'écran entièrement, sans bande
    // ni rognage perceptible — ce n'est PAS un branchement naïf : une
    // vraie composition façon `buildContainCanvas` a été jugée inutile et
    // plus coûteuse (redessin CPU à chaque frame) pour un écart déjà
    // sous le seuil de perception.
    const onLoadedData = () => {
      // "Premier frame utilisable", jamais l'attente du téléchargement
      // complet (prompt) : `loadeddata` suffit, `.play()` gère lui-même
      // le buffering progressif ensuite.
      video.play().then(
        () => {
          videoPlaybackStartedRef.current = true;
        },
        () => {
          // Autoplay refusé/lecture impossible : reste sur le poster,
          // aucune erreur non gérée (prompt).
        },
      );
    };
    video.addEventListener("loadeddata", onLoadedData);

    // Pause immédiate au masquage d'onglet (en plus du useFrame plus bas,
    // qui gère le cas "hors Hero" au scroll) — jamais de reprise
    // inconditionnelle ici : la reprise réelle dépend AUSSI de la
    // position de scroll, gérée uniquement par le useFrame.
    const onVisibilityChange = () => {
      if (document.hidden) video.pause();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      // Nettoyage — UNIQUEMENT les ressources créées par CE sprint (vidéo/
      // texture vidéo), jamais le GLB/HDRI partagés (prompt).
      document.removeEventListener("visibilitychange", onVisibilityChange);
      video.removeEventListener("loadeddata", onLoadedData);
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
      videoRef.current = null;
      videoTextureRef.current = null;
      videoPlaybackStartedRef.current = false;
      videoAppliedRef.current = false;
      videoShouldPlayRef.current = false;
      // Retour immédiat au poster si un matériau existe déjà (cas
      // reduced-motion activé en cours de session) — jamais d'écran vide.
      if (screenMaterial && posterTextureRef.current && screenMaterial.map !== posterTextureRef.current) {
        screenMaterial.map = posterTextureRef.current;
        screenMaterial.needsUpdate = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, screenMaterial]);

  // --- Vidéo écran : lecture/pause + bascule poster->vidéo -----------------
  // `useFrame` SÉPARÉ du phase machine d'animation ci-dessus (jamais
  // fusionné) : ne LIT que `phase.current` (jamais ne l'écrit), donc
  // aucun risque d'interférer avec l'entrée/idle/drag déjà validés. Court-
  // circuité par sécurité si le matériau n'existe pas encore (tout premier
  // render, avant que le GLB ne soit prêt).
  useFrame(() => {
    if (!screenMaterial) return;

    if (reducedMotion) {
      // Reduced-motion activé en cours de session (media query) : jamais
      // de lecture, retour au poster si nécessaire (le useEffect ci-dessus
      // gère aussi ce cas à la destruction de la vidéo).
      if (videoShouldPlayRef.current) {
        videoShouldPlayRef.current = false;
        videoRef.current?.pause();
      }
      if (posterTextureRef.current && screenMaterial.map !== posterTextureRef.current) {
        screenMaterial.map = posterTextureRef.current;
        screenMaterial.needsUpdate = true;
        videoAppliedRef.current = false;
      }
      return;
    }

    // Visible = même règle que `group.visible` dans `SitesPhoneSceneContent`
    // (limite au Hero) — dupliquée ici à dessein (référence à `slotAnchor`
    // déjà disponible dans ce composant) plutôt que de faire remonter une
    // nouvelle prop depuis le composant parent pour cette seule lecture.
    const heroVisible = slotAnchor ? window.scrollY < slotAnchor.heroBottomRestPx : true;
    const shouldPlay = tabVisible && heroVisible;

    if (shouldPlay !== videoShouldPlayRef.current) {
      videoShouldPlayRef.current = shouldPlay;
      const video = videoRef.current;
      if (video) {
        if (shouldPlay) video.play().catch(() => {});
        else video.pause();
      }
    }

    // Bascule poster -> vidéo, UNE SEULE FOIS : seulement une fois l'entrée
    // terminée (phase "idle", jamais pendant "entering" — prompt : "les
    // visiteurs voient d'abord le mouvement du téléphone") ET la lecture
    // réellement démarrée (autoplay accepté, premier frame utilisable).
    if (
      !videoAppliedRef.current &&
      videoPlaybackStartedRef.current &&
      phase.current === "idle" &&
      videoTextureRef.current
    ) {
      screenMaterial.map = videoTextureRef.current;
      screenMaterial.needsUpdate = true;
      videoAppliedRef.current = true;
    }
  });

  if (!phoneBody || !screenDisplay || !normalizedGeometry || !screenMaterial) {
    // Garde défensive : si l'un des 2 nodes attendus (`PhoneBody`,
    // `ScreenDisplay`) n'existait pas dans le GLB, ne rien rendre plutôt
    // que d'improviser un rendu partiel.
    return null;
  }

  return (
    // Props déclaratives = état de départ EXACT de l'animation (position
    // locale décalée à droite, rotation = finale - 2.25 tours) : évite
    // tout flash de la pose finale avant le premier tick de `useFrame`.
    // `scale` reste STATIQUE pendant l'animation (jamais animé par
    // useFrame, proportions inchangées) — seule sa VALEUR est désormais
    // `resolvedScale` (calculée depuis le slot réel) au lieu de la
    // constante `PHONE_SCALE` fixe.
    <group
      ref={rigRef}
      position={[ENTRY_START_X_OFFSET, 0, 0]}
      rotation={[0, PHONE_ROTATION_Y - ENTRY_SPIN_RADIANS, 0]}
      scale={resolvedScale}
    >
      {/* Corps du téléphone — INCHANGÉ. */}
      <primitive object={phoneBody} />
      {/* ScreenDisplay — UNIQUE support visuel de l'écran (WhiteScreen
          n'existe plus dans le GLB), geometry normalisée, matériau dédié
          opaque ci-dessus. Aucun renderOrder particulier : plus de second
          plan écran avec lequel s'ordonner. */}
      <mesh geometry={normalizedGeometry} material={screenMaterial} />
    </group>
  );
}

/** Environnement de réflexion dédié à cette scène — EXR 1K HDR réel
 * (PROMPT_CLAUDE_CODE_PHONE_ENVIRONMENT_EXR_1K), remplace l'ancien
 * `modern_bathroom_4k.webp` (TextureLoader, image SDR). `EXRLoader`
 * UNIQUEMENT pour ce fichier (jamais TextureLoader : l'EXR est une donnée
 * HDR linéaire, pas une image encodée) — même principe PMREM que
 * l'ancienne version et que `HeroEnvironmentImage.tsx` (chargement
 * IMPÉRATIF pour ne jamais faire disparaître le reste de la scène pendant
 * le téléchargement, cleanup complet). Alimente UNIQUEMENT
 * `scene.environment`/`scene.environmentIntensity`/
 * `scene.environmentRotation`, jamais `scene.background` (le fond noir du
 * site reste inchangé). */
function SitesPhoneEnvironment() {
  const { gl, scene } = useThree();
  const pmremRef = useRef<THREE.PMREMGenerator | null>(null);

  useEffect(() => {
    let disposed = false;
    let renderTarget: THREE.WebGLRenderTarget | null = null;
    const previousEnvironment = scene.environment;
    const previousEnvironmentIntensity = scene.environmentIntensity;
    const previousEnvironmentRotation = scene.environmentRotation.clone();

    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    pmremRef.current = pmremGenerator;

    const loader = new EXRLoader();
    loader.load(phoneEnvironmentExrUrl, (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      // EXR = HDR linéaire : AUCUN colorSpace sRGB appliqué ici (prompt
      // §1 — contrairement à l'ancienne texture .webp, qui en avait
      // besoin).

      renderTarget = pmremGenerator.fromEquirectangular(texture);
      scene.environment = renderTarget.texture;
      scene.environmentIntensity = PHONE_ENVIRONMENT_INTENSITY;
      scene.environmentRotation.set(0, PHONE_ENVIRONMENT_ROTATION_Y, 0);

      texture.dispose();
    });

    return () => {
      disposed = true;
      scene.environment = previousEnvironment;
      scene.environmentIntensity = previousEnvironmentIntensity;
      scene.environmentRotation.copy(previousEnvironmentRotation);
      renderTarget?.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
}

interface SitesPhoneSceneContentProps {
  reducedMotion: boolean;
  tabVisible: boolean;
  interactionRef: RefObject<PhoneInteractionBridge>;
  slotAnchor: PhoneSlotAnchor | null;
}

function SitesPhoneSceneContent({ reducedMotion, tabVisible, interactionRef, slotAnchor }: SitesPhoneSceneContentProps) {
  // Position de REPOS (scroll=0) du groupe téléphone — centre du slot DOM
  // converti en unités monde au plan z=0 (profondeur réelle du rig, jamais
  // touchée par l'entrée/l'idle : voir SitesPhoneModel). `viewport.width`/
  // `height` (R3F) sont déjà les dimensions, en unités monde, du plan z=0
  // pour LA caméra réellement utilisée (fov/aspect/distance) — convertir
  // une fraction (0..1) de fenêtre en unités monde est donc `(frac - 0.5)
  // * viewport.<axe>` (Y inversé : haut d'écran = +Y monde). Repli sur
  // l'ancienne fraction fixe tant que le slot n'a pas encore été mesuré
  // (une poignée de premières frames, jamais après). INCHANGÉ par le FIX
  // "limiter au Hero" ci-dessous : cette position de repos reste la SEULE
  // source de vérité pour scroll=0 (aucune double compensation).
  const { viewport } = useThree();
  const phoneX = slotAnchor ? (slotAnchor.fracX - 0.5) * viewport.width : (viewport.width / 2) * PHONE_RIGHT_FRACTION;
  const phoneY = slotAnchor ? (0.5 - slotAnchor.fracY) * viewport.height : PHONE_Y_OFFSET;

  // FIX "limiter au Hero" (PROMPT_CLAUDE_CODE_FIX_PHONE_LIMITER_AU_HERO) —
  // cause exacte (voir rapport) : le groupe téléphone n'était positionné
  // QU'à partir de l'ancre DE REPOS ci-dessus, jamais recalé pendant le
  // scroll — le Canvas restant fixed, le téléphone restait donc épinglé au
  // même point de l'ÉCRAN au lieu de sortir de cadre avec le Hero, et
  // redevenait visible dès qu'une section suivante au fond translucide
  // (Ember, micro-sprint DA) repassait à cet endroit de l'écran.
  //
  // Couche INDÉPENDANTE de l'entrée/idle/drag (SitesPhoneModel, rig
  // interne NON touché ici) : seul CE groupe extérieur (position globale)
  // reçoit, en plus de la position de repos, une translation verticale
  // égale au déplacement RÉEL du Hero à l'écran pendant le scroll — le
  // téléphone quitte donc le cadre avec sa section, comme un élément qui
  // lui appartiendrait visuellement, sans que le rig d'animation ne le
  // sache ni n'y participe.
  const outerGroupRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  // `frameloop` peut valoir "demand" (reduced-motion ou onglet masqué,
  // voir SitesPhoneScene ci-dessous) : un `useFrame` ne s'exécute alors
  // QUE si une frame est explicitement replanifiée. Un `scroll` DOM ne
  // déclenche pas cela tout seul (R3F ne l'observe pas par défaut) — sans
  // cet appel, le téléphone resterait figé pendant qu'on défile sous ce
  // mode, reproduisant exactement le bug pour les utilisateurs reduced-
  // motion. `invalidate()` seul (jamais de state React) : aucun re-render,
  // conforme à "pas de recalcul React à chaque pixel de scroll".
  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate]);

  useFrame((state) => {
    const group = outerGroupRef.current;
    if (!group) return;
    // Lecture événementielle simple (comme `window.scrollY` déjà lu par
    // HeroSpheres.tsx) — jamais de state/prop React recalculée par pixel.
    const scrollY = window.scrollY;
    // Même conversion DPR-neutre que `resolvedScale` (SitesPhoneModel) :
    // unités monde par pixel CSS vertical, pour CETTE caméra/ce canvas.
    const worldPerPxY = state.viewport.height / state.size.height;
    // Le Hero défile vers le HAUT de l'écran quand `scrollY` augmente
    // (comportement natif du DOM) ; +Y monde = vers le HAUT de l'écran
    // (cf. commentaire `phoneY` ci-dessus) — donc `+ scrollY * worldPerPxY`
    // fait suivre exactement ce même déplacement au téléphone. Seule
    // translation ajoutée : X inchangé (pas de scroll horizontal sur ce
    // site), rotation/scale du rig interne jamais touchés (autre groupe).
    group.position.set(phoneX, phoneY + scrollY * worldPerPxY, 0);
    // Masquage complémentaire déterminé depuis la vraie frontière DOM du
    // Hero (`heroBottomRestPx`, mesuré une fois au repos — voir
    // `measureSlotAnchor`), jamais un seuil de scroll arbitraire : dès que
    // le bord bas du Hero a défilé au-dessus du haut du viewport
    // (`scrollY >= heroBottomRestPx`), le Hero n'est plus visible DU TOUT
    // — le téléphone (qui lui appartient visuellement) ne doit plus
    // l'être non plus, même derrière un fond translucide. Repli `true`
    // (visible) tant que `slotAnchor` n'est pas encore mesuré, cohérent
    // avec le principe déjà appliqué à `phoneX`/`phoneY`. Seul CE groupe
    // est masqué : jamais le Canvas entier, jamais "future-horizontal-
    // waves" (groupe frère, toujours vide pour l'instant).
    group.visible = slotAnchor ? scrollY < slotAnchor.heroBottomRestPx : true;
  });

  return (
    <>
      {/* Éclairage complémentaire (micro-ajustements — "trop gris, ne met
          pas en valeur les matériaux") : intensités relevées + une 2e
          lumière directionnelle (clé + contre-jour léger, toujours 2
          lumières seulement, jamais "10 lights") pour mieux sculpter les
          courbes de coque et distinguer les lentilles ; le panorama salle
          de bain (scene.environment) reste la source principale des
          reflets métalliques. */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3.5, 4, 5]} intensity={1.7} color="#F1EFE8" />
      <directionalLight position={[-3, -1, -3]} intensity={0.7} color="#A5A8AE" />
      <SitesPhoneEnvironment />

      {/* Groupe téléphone — position/visibilité pilotées IMPÉRATIVEMENT
          (ref + useFrame ci-dessus), plus de prop JSX `position` statique :
          évite tout conflit entre une réaffectation déclarative (au
          re-render, ex. resize) et la translation de scroll appliquée
          image par image. `visible` par défaut (non précisé ici) = `true`,
          conforme à la valeur de repli du useFrame tant que `slotAnchor`
          n'est pas mesuré. */}
      <group ref={outerGroupRef}>
        <SitesPhoneModel reducedMotion={reducedMotion} tabVisible={tabVisible} interactionRef={interactionRef} slotAnchor={slotAnchor} />
      </group>

      {/* Emplacement réservé pour les futures vagues horizontales (prompt
          §11) — groupe VIDE intentionnellement : aucune géométrie, aucun
          shader, aucune animation. */}
      <group name="future-horizontal-waves" />
    </>
  );
}

export default function SitesPhoneScene() {
  // Shell IDENTIQUE au principe de PageFilaments.tsx/HeroScene.tsx —
  // INCHANGÉ depuis la V1 (prompt §10 : "ne pas refaire l'architecture").
  const [tabVisible, setTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Ancrage responsive (V2 ANCRAGE) — null jusqu'à la première mesure
  // (useLayoutEffect ci-dessous, avant le premier paint navigateur : pas
  // de flash visible côté Canvas, qui se monte de toute façon de façon
  // asynchrone/après Suspense GLB).
  const [slotAnchor, setSlotAnchor] = useState<PhoneSlotAnchor | null>(null);

  // Pont d'interaction (drag souris) — objet muté directement, jamais de
  // state React dessus (même principe que `pointerRef` dans HeroScene.tsx,
  // lu à chaque frame côté R3F sans jamais déclencher de re-render ici).
  const interactionRef = useRef<PhoneInteractionBridge>({
    zoneEl: null,
    hintEl: null,
    justPressed: false,
    deltaX: 0,
    deltaY: 0,
    moved: false,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    motionQuery.addEventListener("change", onMotionChange);
    return () => motionQuery.removeEventListener("change", onMotionChange);
  }, []);

  // Mesure de l'ancrage — séparée de l'effet d'interaction ci-dessous
  // (autre préoccupation, autre cycle de vie) même s'il cible le même
  // élément DOM. `useLayoutEffect` : mesure avant le premier paint, pas de
  // flash à la position de repli. Se déclenche sur resize/ResizeObserver
  // UNIQUEMENT — jamais sur scroll (voir `measureSlotAnchor` : le Canvas
  // doit rester fixed pendant le scroll, prompt §3, donc l'ancrage ne doit
  // JAMAIS être recalculé pendant un scroll sous peine de faire suivre le
  // téléphone vers le haut comme le DOM). Les 2 événements (resize fenêtre
  // + ResizeObserver du slot) sont coalescés dans une seule frame via
  // requestAnimationFrame pour ne jamais forcer 2 reflows consécutifs.
  useLayoutEffect(() => {
    const slot = document.querySelector<HTMLElement>(".sites-hero-layout__phone-slot");
    if (!slot) return;
    // FIX "limiter au Hero" — vraie section Hero (pas seulement le slot),
    // posée par le micro-sprint DA (`sites-professionnels.astro`) : sert
    // uniquement à mesurer SA frontière basse (`heroBottomRestPx`, voir
    // `measureSlotAnchor`). `null` accepté (repli `Infinity`, jamais
    // masquer par erreur) si cette classe venait à disparaître.
    const heroSection = document.querySelector<HTMLElement>(".sites-hero-section");

    let pendingFrame = 0;
    const measure = () => {
      pendingFrame = 0;
      const anchor = measureSlotAnchor(slot, heroSection);
      if (anchor) setSlotAnchor(anchor);
    };
    const scheduleMeasure = () => {
      if (pendingFrame) return;
      pendingFrame = requestAnimationFrame(measure);
    };

    measure();

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(slot);
    // La frontière basse du Hero peut changer indépendamment de la taille
    // du slot (ex. la colonne de texte change de nombre de lignes sans que
    // le slot lui-même ne soit redimensionné) — observée séparément,
    // toujours coalescée dans le même `scheduleMeasure`.
    if (heroSection) resizeObserver.observe(heroSection);
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
    const onVisibilityChange = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Interaction souris — écouteurs Pointer Events natifs sur la zone DOM
  // déjà réservée au téléphone dans le Hero (`.sites-hero-layout__phone-
  // slot`, sites-professionnels.astro/services.css, NON modifiés par ce
  // sprint côté structure : seule une classe de curseur y est ajoutée en
  // CSS). Ce `<div>` vit HORS du Canvas R3F (colonne DOM normale du Hero,
  // toujours `pointer-events:auto` par défaut) — jamais de changement sur
  // le wrapper Canvas fixed lui-même (`pointer-events:none` INCHANGÉ,
  // prompt §3 : "ne jamais remettre pointer-events:auto sur tout le
  // Canvas full-screen"). Toute la logique de PHASE (IDLE/RETURNING
  // seules autorisent l'interaction) vit côté `useFrame` (SitesPhoneModel)
  // — ces écouteurs se contentent d'alimenter le pont, jamais de décider.
  useEffect(() => {
    const zone = document.querySelector<HTMLElement>(".sites-hero-layout__phone-slot");
    if (!zone) return;
    interactionRef.current.zoneEl = zone;
    // Micro-sprint "Indication d'interaction du téléphone 3D" — même
    // requête ponctuelle que `zoneEl` ci-dessus, jamais par frame. `null`
    // si le balisage est absent (repli silencieux, voir l'interface).
    interactionRef.current.hintEl = document.querySelector<HTMLElement>(".sites-hero-layout__phone-hint");

    let activePointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (event: PointerEvent) => {
      // Un seul pointeur actif à la fois — ignore un second doigt/bouton
      // pendant qu'un drag est déjà en cours.
      if (activePointerId !== null) return;
      activePointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      try {
        zone.setPointerCapture(event.pointerId);
      } catch {
        // Capture non disponible (navigateur/contexte) : le drag reste
        // fonctionnel tant que le pointeur ne quitte pas la zone.
      }
      zone.classList.add("sites-hero-layout__phone-slot--grabbing");
      interactionRef.current.justPressed = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (activePointerId === null || event.pointerId !== activePointerId) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      // "Sans saut lors du premier pixel de drag" (prompt §4) : le tout
      // premier pointermove après pointerdown ne produit qu'un delta
      // minime (dx/dy depuis la position du pointerdown elle-même, jamais
      // depuis 0/0 ou une position arbitraire) — aucun saut possible par
      // construction.
      interactionRef.current.deltaX += dx;
      interactionRef.current.deltaY += dy;
      interactionRef.current.moved = true;
    };

    const endDrag = (event: PointerEvent) => {
      if (activePointerId === null || event.pointerId !== activePointerId) return;
      try {
        zone.releasePointerCapture(activePointerId);
      } catch {
        // Déjà relâchée (ex. pointercancel) : sans effet.
      }
      activePointerId = null;
      zone.classList.remove("sites-hero-layout__phone-slot--grabbing");
      // Prompt §8/§9 : PAS de retour instantané ici — le relâchement ne
      // fait que cesser d'alimenter le pont ; c'est le minuteur
      // d'inactivité (côté useFrame) qui déclenchera RETURNING après le
      // délai complet, qu'il reste écoulé ou non au moment du relâchement.
    };

    zone.addEventListener("pointerdown", onPointerDown);
    zone.addEventListener("pointermove", onPointerMove);
    zone.addEventListener("pointerup", endDrag);
    zone.addEventListener("pointercancel", endDrag);

    return () => {
      zone.removeEventListener("pointerdown", onPointerDown);
      zone.removeEventListener("pointermove", onPointerMove);
      zone.removeEventListener("pointerup", endDrag);
      zone.removeEventListener("pointercancel", endDrag);
      // Cleanup obligatoire (prompt §11/§19) : relâche une capture encore
      // active si le composant démonte pendant un drag en cours.
      if (activePointerId !== null) {
        try {
          zone.releasePointerCapture(activePointerId);
        } catch {
          // Élément déjà retiré du DOM ou capture déjà relâchée.
        }
      }
      zone.classList.remove("sites-hero-layout__phone-slot--grabbing");
    };
  }, []);

  const frameloop = tabVisible && !reducedMotion ? "always" : "demand";

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 34, position: [0, 0, 7] }}
      >
        <SitesPhoneSceneContent
          reducedMotion={reducedMotion}
          tabVisible={tabVisible}
          interactionRef={interactionRef}
          slotAnchor={slotAnchor}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(phoneGlbUrl);
