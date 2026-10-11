// CustomCubeScene — Hero « Développement sur mesure » (micro-sprint cube
// modulaire 3x3). Canvas R3F transparent, CONFINÉ au slot droit du Hero
// (`.custom-hero-layout__cube-slot`) : contrairement à SitesPhoneScene
// (Canvas fixed plein viewport + ancrage mesuré), le Canvas vit ici dans le
// flux du Hero — il disparaît donc naturellement avec lui au scroll, sans
// logique d'ancrage, et son cadrage ne dépend que de la taille du slot.
//
// Architecture :
//   ScenePlacementGroup (échelle de cadrage responsive, dérivée du slot)
//   └── GlobalIdleGroup (pose 3/4 + balancement très lent)
//       └── CUBE_RIG (GLB) — 27 cubies + stickers
// Le moteur de tranches (CubeEngine) agit sur CUBE_RIG uniquement et ne
// connaît ni le cadrage ni l'idle.
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject, PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import cubeGlbUrl from "../../assets/3d/cantrelle_cube_master.glb?url";

type Axis = "x" | "y" | "z";
type Layer = -1 | 0 | 1;
type Dir = -1 | 1;
interface Move {
  axis: Axis;
  layer: Layer;
  dir: Dir;
}

const AXES: Axis[] = ["x", "y", "z"];
const NAME_RE = /^Cubie_X([NP0])_Y([NP0])_Z([NP0])/;
const NAME_VALUE: Record<string, number> = { N: -1, "0": 0, P: 1 };

// --- Réglages visuels ------------------------------------------------------
const STICKER_SIZE = 0.72; // cubie ≈ 0.94
const STICKER_DEPTH = 0.018;
const STICKER_GAP = 0.006; // décollement de la surface (anti z-fighting)
const MOVE_DURATION = 0.85; // s, quart de tour
const FIT_FILL = 0.96; // fraction du plus petit côté du slot occupée par la sphère englobante
const POSE_X = 0.52;
const POSE_Y = -0.66;
const CAMERA_Z = 14;

// Séquence de démo : 3 moves sur 3 axes, pause, puis inverse exact (ordre
// inversé) → boucle mathématiquement fermée, aucun saut.
const DEMO_MOVES: Move[] = [
  { axis: "y", layer: 1, dir: 1 },
  { axis: "x", layer: 1, dir: -1 },
  { axis: "z", layer: -1, dir: 1 },
];
const GAP_BETWEEN = 0.45;
const GAP_START = 1.4;
const GAP_BEFORE_INVERSE = 1.8;
const GAP_END = 2.2;

// --- Utilitaires ------------------------------------------------------------
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Rotation entière de 90° d'un vecteur logique autour d'un axe logique. */
function rotateLogical(v: [number, number, number], axis: Axis, dir: Dir): [number, number, number] {
  const [x, y, z] = v;
  // θ = dir·90° : cos = 0, sin = dir
  if (axis === "x") return [x, -dir * z, dir * y];
  if (axis === "y") return [dir * z, y, -dir * x];
  return [-dir * y, dir * x, z];
}

/** Colle un quaternion sur la plus proche des 24 orientations du cube. */
function snapQuaternion(q: THREE.Quaternion) {
  const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
  const e = m.elements;
  for (let i = 0; i < 16; i++) e[i] = Math.abs(e[i]) < 1e-6 ? 0 : Math.round(e[i]);
  q.setFromRotationMatrix(m);
}

function readToken(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// --- Moteur de tranches ------------------------------------------------------
interface Cubie {
  node: THREE.Object3D;
  /** Coordonnée logique COURANTE (pas celle du nom) */
  logical: [number, number, number];
}

class CubeEngine {
  readonly rig: THREE.Object3D;
  readonly cubies: Cubie[];
  readonly pivot = new THREE.Group();
  /** logique → axe Three (index) + signe */
  readonly map: { k: number; sign: 1 | -1 }[];
  readonly spacing: number;
  private current: { move: Move; u: THREE.Vector3; cubies: Cubie[]; t: number } | null = null;
  /** Moves nets appliqués depuis l'état résolu (auto + utilisateur), simplifiés. */
  readonly history: Move[] = [];
  stickers: StickerInfo[] = [];

  constructor(rig: THREE.Object3D, cubies: Cubie[], map: { k: number; sign: 1 | -1 }[], spacing: number) {
    this.rig = rig;
    this.cubies = cubies;
    this.map = map;
    this.spacing = spacing;
    this.pivot.name = "SLICE_PIVOT";
    rig.add(this.pivot);
  }

  get busy() {
    return this.current !== null;
  }

  /** Mémorise un move ; annule les inverses consécutifs et les 4 quarts identiques. */
  private record(m: Move) {
    const h = this.history;
    const last = h[h.length - 1];
    if (last && last.axis === m.axis && last.layer === m.layer && last.dir === -m.dir) {
      h.pop();
      return;
    }
    h.push({ ...m });
    const n = h.length;
    if (n >= 4 && h.slice(-4).every((x) => x.axis === m.axis && x.layer === m.layer && x.dir === m.dir)) h.length = n - 4;
  }

  /**
   * Face extérieure COURANTE d'un sticker : axe logique + signe, déduits de sa
   * normale réelle (repère du rig) et de l'état logique courant du cubie.
   * null si la face n'est plus extérieure (ne devrait pas arriver).
   */
  faceOf(info: StickerInfo): { a: number; s: Layer } | null {
    const q = new THREE.Quaternion();
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(info.mesh.getWorldQuaternion(q));
    n.applyQuaternion(this.rig.getWorldQuaternion(new THREE.Quaternion()).invert());
    const c = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];
    const k = c.indexOf(Math.max(...c));
    const a = this.map.findIndex((m) => m.k === k);
    if (a < 0) return null;
    const s = (Math.sign(n.getComponent(k)) * this.map[a].sign) as Layer;
    return info.cubie.logical[a] === s ? { a, s } : null;
  }

  /** Démarre un quart de tour. Ignoré si un move est déjà en cours. */
  rotateSlice(axis: Axis, layer: Layer, dir: Dir, source: "auto" | "user" | "unwind" = "auto") {
    if (this.current) return false;
    if (source === "unwind") this.history.pop();
    else this.record({ axis, layer, dir });
    const a = AXES.indexOf(axis);
    const members = this.cubies.filter((c) => c.logical[a] === layer);
    const { k, sign } = this.map[a];
    const u = new THREE.Vector3();
    u.setComponent(k, sign);
    this.pivot.quaternion.identity();
    this.pivot.position.set(0, 0, 0);
    for (const c of members) this.pivot.attach(c.node);
    this.current = { move: { axis, layer, dir }, u, cubies: members, t: 0 };
    return true;
  }

  update(dt: number) {
    const cur = this.current;
    if (!cur) return;
    cur.t = Math.min(1, cur.t + dt / MOVE_DURATION);
    const angle = cur.move.dir * (Math.PI / 2) * easeInOut(cur.t);
    this.pivot.quaternion.setFromAxisAngle(cur.u, angle);
    if (cur.t >= 1) this.finish();
  }

  private finish() {
    const cur = this.current;
    if (!cur) return;
    // angle final EXACT, puis réattache au rig en préservant les transforms
    this.pivot.quaternion.setFromAxisAngle(cur.u, cur.move.dir * (Math.PI / 2));
    this.pivot.updateMatrixWorld(true);
    for (const c of cur.cubies) {
      this.rig.attach(c.node);
      c.logical = rotateLogical(c.logical, cur.move.axis, cur.move.dir);
    }
    this.pivot.quaternion.identity();
    this.current = null;
    this.snapAll(cur.cubies);
  }

  /** Position = grille exacte ; orientation = multiple exact de 90°. */
  snapAll(list: Cubie[] = this.cubies) {
    for (const c of list) {
      const p = new THREE.Vector3();
      for (let a = 0; a < 3; a++) {
        const { k, sign } = this.map[a];
        p.setComponent(k, c.logical[a] * sign * this.spacing);
      }
      c.node.position.copy(p);
      snapQuaternion(c.node.quaternion);
      c.node.scale.set(1, 1, 1);
      c.node.updateMatrix();
    }
  }

  /** Vérif : la position réelle correspond-elle à l'état logique ? */
  maxDrift() {
    let worst = 0;
    const p = new THREE.Vector3();
    for (const c of this.cubies) {
      for (let a = 0; a < 3; a++) {
        const { k, sign } = this.map[a];
        p.setComponent(k, c.logical[a] * sign * this.spacing);
      }
      worst = Math.max(worst, p.distanceTo(c.node.position));
    }
    return worst;
  }
}

interface StickerInfo {
  mesh: THREE.Mesh;
  cubie: Cubie;
  mat: THREE.MeshStandardMaterial;
  baseColor: THREE.Color;
  baseEnv: number;
  /** niveau de mise en avant courant (0..1), animé par frame */
  h: number;
}

// --- Chargement du GLB + stickers -------------------------------------------
interface CubeBuild {
  engine: CubeEngine;
  root: THREE.Object3D;
  radius: number;
  disposables: { dispose: () => void }[];
}

function buildCube(source: THREE.Object3D): CubeBuild {
  const root = source.clone(true);
  const rig = root.getObjectByName("CUBE_RIG") ?? root;
  const disposables: { dispose: () => void }[] = [];

  const found: { node: THREE.Object3D; l: [number, number, number] }[] = [];
  const names = new Set<string>();
  rig.traverse((o) => {
    const m = NAME_RE.exec(o.name);
    if (!m) return;
    if (names.has(o.name)) console.warn("[CustomCubeScene] nom de cubie dupliqué :", o.name);
    names.add(o.name);
    found.push({ node: o, l: [NAME_VALUE[m[1]], NAME_VALUE[m[2]], NAME_VALUE[m[3]]] });
  });
  if (found.length !== 27) console.warn(`[CustomCubeScene] ${found.length} cubies détectés (27 attendus)`);

  // Mapping axes logiques → axes Three, corrélé aux positions RÉELLES chargées.
  const map: { k: number; sign: 1 | -1 }[] = [];
  const used = new Set<number>();
  let spacing = 1;
  for (let a = 0; a < 3; a++) {
    const score = [0, 0, 0];
    for (const f of found) for (let k = 0; k < 3; k++) score[k] += f.l[a] * f.node.position.getComponent(k);
    let best = 0;
    for (let k = 1; k < 3; k++) if (Math.abs(score[k]) > Math.abs(score[best])) best = k;
    if (used.has(best)) console.warn("[CustomCubeScene] mapping d'axes ambigu");
    used.add(best);
    map.push({ k: best, sign: score[best] >= 0 ? 1 : -1 });
    const count = found.filter((f) => f.l[a] !== 0).length || 1;
    spacing = Math.abs(score[best]) / count;
  }

  // Matériau graphite : copie dédiée, réglée pour lire des reflets sans noir absolu.
  const graphite = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3C4048"),
    metalness: 0.7,
    roughness: 0.36,
    envMapIntensity: 2.0,
  });
  disposables.push(graphite);

  const palette = {
    ivory: readToken("--color-text", "#F1EFE8"),
    yellow: readToken("--color-warning", "#D8A84E"),
    ember: readToken("--color-accent", "#E45F36"),
    red: "#9B3038",
    blue: readToken("--color-info", "#6F94C7"),
    green: readToken("--color-success", "#4FAE79"),
  };
  const mk = (hex: string, desat = 0.0) => {
    const c = new THREE.Color(hex);
    if (desat > 0) {
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      c.setHSL(hsl.h, hsl.s * (1 - desat), hsl.l * 0.92);
    }
    const mat = new THREE.MeshStandardMaterial({ color: c, metalness: 0.1, roughness: 0.38, envMapIntensity: 0.9 });
    disposables.push(mat);
    return mat;
  };
  // Faces opposées par axe logique : +X ivoire / -X jaune, +Y rouge / -Y ember (face avant), +Z bleu / -Z vert.
  const faceMat: Record<string, THREE.Material> = {
    "x1": mk(palette.ivory),
    "x-1": mk(palette.yellow, 0.1),
    "y1": mk(palette.red),
    "y-1": mk(palette.ember),
    "z1": mk(palette.blue, 0.2),
    "z-1": mk(palette.green, 0.25),
  };

  // Plaque : rectangle arrondi extrudé, géométrie PARTAGÉE par les ≤54 stickers.
  const s = STICKER_SIZE / 2;
  const r = 0.09;
  const shape = new THREE.Shape();
  shape.moveTo(-s + r, -s);
  shape.lineTo(s - r, -s);
  shape.quadraticCurveTo(s, -s, s, -s + r);
  shape.lineTo(s, s - r);
  shape.quadraticCurveTo(s, s, s - r, s);
  shape.lineTo(-s + r, s);
  shape.quadraticCurveTo(-s, s, -s, s - r);
  shape.lineTo(-s, -s + r);
  shape.quadraticCurveTo(-s, -s, -s + r, -s);
  const plateGeo = new THREE.ExtrudeGeometry(shape, { depth: STICKER_DEPTH, bevelEnabled: false, curveSegments: 4 });
  disposables.push(plateGeo);

  const cubies: Cubie[] = [];
  const stickerInfos: StickerInfo[] = [];
  const zAxis = new THREE.Vector3(0, 0, 1);
  const box = new THREE.Box3();
  for (const f of found) {
    const node = f.node;
    node.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.material = graphite;
    });
    const cubie: Cubie = { node, logical: [...f.l] as [number, number, number] };
    cubies.push(cubie);

    // Stickers : uniquement sur les faces extérieures (|coord| = 1).
    const invQ = node.quaternion.clone().invert();
    const geomMesh = (node as THREE.Mesh).isMesh ? (node as THREE.Mesh) : (node.getObjectByProperty("isMesh", true) as THREE.Mesh | undefined);
    if (!geomMesh?.geometry) continue;
    geomMesh.geometry.computeBoundingBox();
    box.copy(geomMesh.geometry.boundingBox as THREE.Box3);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    for (let a = 0; a < 3; a++) {
      const v = f.l[a];
      if (v === 0) continue;
      const { k, sign } = map[a];
      const nWorld = new THREE.Vector3();
      nWorld.setComponent(k, sign * v); // direction extérieure, repère rig
      const nLocal = nWorld.clone().applyQuaternion(invQ);
      const li = [Math.abs(nLocal.x), Math.abs(nLocal.y), Math.abs(nLocal.z)].indexOf(1);
      const half = (li >= 0 ? size.getComponent(li) : size.x) / 2;
      // matériau PROPRE à chaque sticker (hover d'une seule face), cloné du matériau de la couleur
      const shared = faceMat[`${AXES[a]}${v}`] as THREE.MeshStandardMaterial;
      const ownMat = shared.clone();
      disposables.push(ownMat);
      const plate = new THREE.Mesh(plateGeo, ownMat);
      stickerInfos.push({ mesh: plate, cubie, mat: ownMat, baseColor: ownMat.color.clone(), baseEnv: ownMat.envMapIntensity, h: 0 });
      plate.quaternion.setFromUnitVectors(zAxis, nLocal);
      plate.position.copy(center).addScaledVector(nLocal, half + STICKER_GAP);
      plate.name = `Sticker_${node.name}_${AXES[a]}${v > 0 ? "P" : "N"}`;
      geomMesh === node ? node.add(plate) : geomMesh.add(plate);
    }
  }

  const engine = new CubeEngine(rig, cubies, map, spacing);
  engine.stickers = stickerInfos;
  engine.snapAll();
  // Rayon englobant réel (pire cas : n'importe quelle rotation de tranche reste dans la sphère).
  rig.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(rig);
  const radius = Math.max(bb.max.length(), bb.min.length());
  return { engine, root, radius, disposables };
}

// --- Interaction utilisateur ---------------------------------------------------
// Même logique que le téléphone de /sites-professionnels/ (SitesPhoneScene.tsx) :
// pointer events natifs sur le conteneur DOM, setPointerCapture, deltas écrits
// dans un pont (ref) consommé par useFrame, sensibilité 0.006 rad/px, pitch
// clampé à ±60°, yaw libre, aucun OrbitControls. Différences : pas de retour
// automatique à la pose (l'orientation atteinte est conservée) et distinction
// clic / drag par seuil de déplacement.
const DRAG_SENSITIVITY = 0.006;
const DRAG_PITCH_CLAMP = THREE.MathUtils.degToRad(60);
const DRAG_THRESHOLD_PX = 6;
const AUTO_RESUME_DELAY = 2; // s après le dernier relâchement / clic
const HOVER_LAMBDA = 12;
const HOVER_BRIGHTNESS = 0.1; // +10 % de luminosité du sticker
const HOVER_ENV_BOOST = 0.2;

interface CubeBridge {
  enabled: boolean;
  el: HTMLElement | null;
  down: boolean;
  dragging: boolean;
  pointerId: number | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  dx: number;
  dy: number;
  ndcX: number;
  ndcY: number;
  inside: boolean;
  clickPending: boolean;
  resumeAt: number; // performance.now()/1000
  wake: () => void;
}

const nowSec = () => performance.now() / 1000;

// --- Scène -------------------------------------------------------------------
function CubeModel({ reducedMotion, running, bridgeRef }: { reducedMotion: boolean; running: boolean; bridgeRef: RefObject<CubeBridge> }) {
  const gltf = useGLTF(cubeGlbUrl);
  const build = useMemo(() => buildCube(gltf.scene), [gltf.scene]);
  const placement = useRef<THREE.Group>(null);
  const userRot = useRef<THREE.Group>(null);
  const idle = useRef<THREE.Group>(null);
  const { size, viewport, invalidate } = useThree();

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (bridge) bridge.wake = invalidate;
    invalidate();
    return () => {
      build.engine.pivot.removeFromParent();
      build.disposables.forEach((d) => d.dispose());
    };
  }, [build, invalidate, bridgeRef]);

  // Cadrage : le slot EST le canvas → sphère englobante dans le plus petit côté.
  const fitScale = useMemo(() => {
    if (size.width === 0 || size.height === 0) return 1;
    const minSide = Math.min(viewport.width, viewport.height);
    return (minSide * FIT_FILL) / 2 / build.radius;
  }, [size.width, size.height, viewport.width, viewport.height, build.radius]);

  // Cibles de raycast : stickers + cubies (un cubie devant un sticker l'occulte).
  const targets = useMemo(() => {
    const cubieMeshes = build.engine.cubies.map((c) => c.node).filter((n): n is THREE.Mesh => (n as THREE.Mesh).isMesh);
    const stickerMeshes = build.engine.stickers.map((s) => s.mesh);
    const byMesh = new Map<THREE.Object3D, StickerInfo>(build.engine.stickers.map((s) => [s.mesh, s]));
    return { all: [...stickerMeshes, ...cubieMeshes], byMesh };
  }, [build]);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  // Orientation utilisateur (indépendante de l'état logique du Rubik).
  const user = useRef({ yaw: 0, pitch: 0 });
  const swayWeight = useRef(1);
  const swayPhase = useRef(0);

  // Séquence auto : forward (DEMO_MOVES) puis unwind (rejoue l'inverse de
  // TOUT l'historique, y compris les moves utilisateur) → revient toujours
  // à l'état résolu sans téléportation.
  const auto = useRef({ phase: "forward" as "forward" | "unwind", i: 0, wait: GAP_START });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const bridge = bridgeRef.current;
    const engine = build.engine;
    let needFrame = false;

    const pickFace = () => {
      placement.current?.updateMatrixWorld(true);
      ndc.set(bridge.ndcX, bridge.ndcY);
      raycaster.setFromCamera(ndc, state.camera);
      const hit = raycaster.intersectObjects(targets.all, false)[0];
      return hit ? (targets.byMesh.get(hit.object) ?? null) : null;
    };

    // 1) Drag global — jamais d'effet sur l'état logique ni sur le moteur.
    if (bridge.dx !== 0 || bridge.dy !== 0) {
      user.current.yaw += bridge.dx * DRAG_SENSITIVITY;
      user.current.pitch = THREE.MathUtils.clamp(user.current.pitch + bridge.dy * DRAG_SENSITIVITY, -DRAG_PITCH_CLAMP, DRAG_PITCH_CLAMP);
      bridge.dx = 0;
      bridge.dy = 0;
    }
    if (userRot.current) userRot.current.rotation.set(user.current.pitch, user.current.yaw, 0);

    // 2) Auto autorisé ? (pas en reduced-motion, pas pendant drag/délai de reprise)
    const autoAllowed = running && !reducedMotion && !bridge.down && nowSec() >= bridge.resumeAt;

    // 3) Idle (balancement) : pondération douce, aucune téléportation.
    const g = idle.current;
    if (g) {
      const wTarget = autoAllowed ? 1 : 0;
      swayWeight.current = THREE.MathUtils.damp(swayWeight.current, wTarget, 3, dt);
      if (autoAllowed) swayPhase.current += dt;
      const t = swayPhase.current;
      const w = reducedMotion ? 0 : swayWeight.current;
      g.rotation.set(POSE_X + Math.sin(t * 0.27) * 0.035 * w, POSE_Y + Math.sin(t * 0.33) * 0.1 * w, 0);
      if (!reducedMotion && Math.abs(swayWeight.current - wTarget) > 0.002) needFrame = true;
    }

    // 4) Moteur de tranches
    engine.update(dt);
    if (engine.busy) needFrame = true;

    // 5) Clic face (résolu au pointerup, sans déplacement au-delà du seuil)
    if (bridge.clickPending) {
      bridge.clickPending = false;
      if (!engine.busy) {
        const info = pickFace();
        const face = info ? engine.faceOf(info) : null;
        if (face) {
          // sens canonique : horaire vu depuis l'extérieur de la face
          engine.rotateSlice(AXES[face.a], face.s, (-face.s) as Dir, "user");
          needFrame = true;
        }
      }
    }

    // 6) Séquence automatique
    if (autoAllowed && !engine.busy) {
      const s = auto.current;
      s.wait -= dt;
      if (s.wait <= 0) {
        if (s.phase === "forward") {
          const m = DEMO_MOVES[s.i];
          engine.rotateSlice(m.axis, m.layer, m.dir, "auto");
          s.i++;
          if (s.i >= DEMO_MOVES.length) {
            s.phase = "unwind";
            s.wait = GAP_BEFORE_INVERSE;
          } else s.wait = GAP_BETWEEN;
        } else {
          const last = engine.history[engine.history.length - 1];
          if (!last) {
            s.phase = "forward";
            s.i = 0;
            s.wait = GAP_END;
          } else {
            engine.rotateSlice(last.axis, last.layer, (-last.dir) as Dir, "unwind");
            s.wait = GAP_BETWEEN;
          }
        }
      }
    }

    // 7) Hover face — uniquement hors drag et hors slice en cours.
    let key: string | null = null;
    if (bridge.enabled && bridge.inside && !bridge.down && !engine.busy) {
      const info = pickFace();
      const face = info ? engine.faceOf(info) : null;
      if (face) key = `${face.a}:${face.s}`;
    }
    let animating = false;
    for (const st of engine.stickers) {
      let target = 0;
      if (key) {
        const f = engine.faceOf(st);
        if (f && `${f.a}:${f.s}` === key) target = 1;
      }
      if (st.h !== target) {
        st.h = THREE.MathUtils.damp(st.h, target, HOVER_LAMBDA, dt);
        if (Math.abs(st.h - target) < 0.003) st.h = target;
        st.mat.color.copy(st.baseColor).multiplyScalar(1 + HOVER_BRIGHTNESS * st.h);
        st.mat.envMapIntensity = st.baseEnv * (1 + HOVER_ENV_BOOST * st.h);
        if (st.h !== target) animating = true;
      }
    }
    if (animating) needFrame = true;

    // 8) Curseur
    if (bridge.el && bridge.enabled) {
      bridge.el.style.cursor = bridge.dragging ? "grabbing" : key ? "pointer" : "grab";
    }

    // Mode "demand" (reduced-motion / hors écran) : on ne replanifie que si nécessaire.
    if (needFrame || bridge.dragging) invalidate();
  });

  return (
    <group ref={placement} scale={fitScale}>
      <group ref={userRot}>
        <group ref={idle} rotation={[POSE_X, POSE_Y, 0]}>
          <primitive object={build.root} />
        </group>
      </group>
    </group>
  );
}

function CubeLighting() {
  // Environnement procédural (même principe que le rig CS-S6C/D des sphères) :
  // bake unique, jamais affiché en fond (background={false}).
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 6]} intensity={1.3} color="#F1EFE8" />
      <directionalLight position={[-5, -2, -3]} intensity={0.5} color="#A5A8AE" />
      <Environment resolution={128} frames={1} background={false}>
        <Lightformer form="rect" color="#F1EFE8" intensity={5} position={[4, 4, 3]} scale={[4, 2, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" color="#A5A8AE" intensity={2.6} position={[-4, 0.5, 3]} scale={[2.4, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="circle" color="#E45F36" intensity={2.2} position={[2, -3, 3.5]} scale={1.4} target={[0, 0, 0]} />
        <Lightformer form="rect" color="#F1EFE8" intensity={1.0} position={[0, -4, -3]} scale={[5, 2, 1]} />
      </Environment>
    </>
  );
}

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[CustomCubeScene] rendu 3D indisponible :", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function CustomCubeScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [inView, setInView] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(q.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    q.addEventListener("change", onChange);
    return () => q.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Le Hero n'est plus visible → on arrête de dessiner.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = tabVisible && inView && !reducedMotion;

  // Interactions réservées aux pointeurs précis (souris) : sur tablette/tactile,
  // le Canvas reste décoratif et ne capte ni geste ni défilement.
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(q.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    q.addEventListener("change", onChange);
    return () => q.removeEventListener("change", onChange);
  }, []);

  const bridgeRef = useRef<CubeBridge>({
    enabled: false,
    el: null,
    down: false,
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    dx: 0,
    dy: 0,
    ndcX: 0,
    ndcY: 0,
    inside: false,
    clickPending: false,
    resumeAt: 0,
    wake: () => {},
  });
  bridgeRef.current.enabled = fine;
  useEffect(() => {
    bridgeRef.current.el = wrapRef.current;
  }, []);

  const updateNdc = (e: ReactPointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const b = bridgeRef.current;
    b.ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
    b.ndcY = -(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const endPress = (e: ReactPointerEvent, asClick: boolean) => {
    const b = bridgeRef.current;
    if (!b.down || e.pointerId !== b.pointerId) return;
    try {
      wrapRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* capture déjà relâchée */
    }
    // pointerup SANS dépassement du seuil = clic ; sinon fin de drag, aucun move de face
    if (asClick && !b.dragging) b.clickPending = true;
    b.down = false;
    b.dragging = false;
    b.pointerId = null;
    b.resumeAt = nowSec() + AUTO_RESUME_DELAY;
    b.wake();
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    const b = bridgeRef.current;
    if (!b.enabled || e.button !== 0 || b.down) return;
    updateNdc(e);
    b.down = true;
    b.dragging = false;
    b.pointerId = e.pointerId;
    b.startX = b.lastX = e.clientX;
    b.startY = b.lastY = e.clientY;
    b.inside = true;
    try {
      wrapRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* capture indisponible : le drag reste fonctionnel dans la zone */
    }
    b.wake();
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const b = bridgeRef.current;
    if (!b.enabled) return;
    updateNdc(e);
    b.inside = true;
    if (b.down && e.pointerId === b.pointerId) {
      if (!b.dragging && Math.hypot(e.clientX - b.startX, e.clientY - b.startY) > DRAG_THRESHOLD_PX) {
        b.dragging = true;
        b.lastX = b.startX; // pas de saut : le déplacement depuis le pointerdown est appliqué
        b.lastY = b.startY;
      }
      if (b.dragging) {
        b.dx += e.clientX - b.lastX;
        b.dy += e.clientY - b.lastY;
        b.lastX = e.clientX;
        b.lastY = e.clientY;
      }
    }
    b.wake();
  };

  const onPointerLeave = () => {
    const b = bridgeRef.current;
    if (b.down) return; // capture active : le drag continue hors zone
    b.inside = false;
    b.wake();
  };

  // Nettoyage au démontage : aucune capture/état résiduel.
  useEffect(() => {
    const b = bridgeRef.current;
    return () => {
      b.down = false;
      b.dragging = false;
      b.inside = false;
      b.clickPending = false;
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e, true)}
      onPointerCancel={(e) => endPress(e, false)}
      onLostPointerCapture={(e) => endPress(e, false)}
      onPointerLeave={onPointerLeave}
      onDragStart={(e) => e.preventDefault()}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: fine ? "auto" : "none",
        touchAction: fine ? "none" : undefined,
        userSelect: "none",
        WebkitUserSelect: "none",
        cursor: fine ? "grab" : undefined,
      }}
    >
      <CanvasBoundary>
        <Canvas
          dpr={[1, 1.5]}
          frameloop={running ? "always" : "demand"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 30, position: [0, 0, CAMERA_Z] }}
          onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
          style={{ background: "transparent" }}
        >
          <CubeLighting />
          <Suspense fallback={null}>
            <CubeModel reducedMotion={reducedMotion} running={running} bridgeRef={bridgeRef} />
          </Suspense>
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}

useGLTF.preload(cubeGlbUrl);
