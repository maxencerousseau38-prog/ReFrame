// ============================================================
//  CASSELIN 3D — Modèles procéduraux de matériel de cuisine
//  Chaque fonction renvoie un THREE.Group construit en
//  géométrie pure (aucun asset externe). Look inox brossé.
// ============================================================

import * as THREE from "three";

// ---- Matériaux réutilisables -------------------------------
function steel(color = 0xc9d2d9, rough = 0.28, metal = 1.0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal,
    envMapIntensity: 1.2,
  });
}
function dark(color = 0x20262b, rough = 0.5) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.6 });
}
function glassMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.02,
    metalness: 0,
    transmission: 0.95,
    transparent: true,
    opacity: 0.35,
    thickness: 0.4,
    ior: 1.45,
    clearcoat: 1,
  });
}
function accentMat(hex) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness: 0.35,
    metalness: 0.4,
    emissive: new THREE.Color(hex),
    emissiveIntensity: 0.25,
  });
}

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// Pieds inox communs à beaucoup d'appareils
function addFeet(group, w, d, y, h = 0.18, r = 0.05) {
  const m = steel(0x8a949c, 0.4);
  const dx = w / 2 - 0.12;
  const dz = d / 2 - 0.12;
  [[-dx, -dz], [dx, -dz], [-dx, dz], [dx, dz]].forEach(([x, z]) => {
    group.add(cyl(r, r * 1.3, h, m, x, y - h / 2, z, 12));
  });
}

// ============================================================
//  FRITEUSE
// ============================================================
export function fryer(accent = "#ff5722") {
  const g = new THREE.Group();
  const body = box(1.6, 1.1, 1.1, steel(), 0, 0.55, 0);
  g.add(body);
  // deux cuves
  const vatMat = dark(0x12161a, 0.3);
  [-0.38, 0.38].forEach((x) => {
    const vat = box(0.6, 0.45, 0.8, vatMat, x, 0.88, 0);
    g.add(vat);
    // huile
    const oil = box(0.5, 0.04, 0.68, accentMat("#e8a33d"), x, 0.99, 0);
    g.add(oil);
    // panier (anse)
    const handle = cyl(0.025, 0.025, 0.5, steel(0x9aa3aa), x, 1.2, 0.45, 10);
    handle.rotation.z = Math.PI / 2;
    g.add(handle);
  });
  // bandeau de commande
  g.add(box(1.6, 0.22, 0.06, dark(0x0d0f12), 0, 0.5, 0.56));
  [-0.5, -0.2, 0.2, 0.5].forEach((x) =>
    g.add(cyl(0.06, 0.06, 0.05, accentMat(accent), x, 0.5, 0.6, 18))
  );
  addFeet(g, 1.6, 1.1, 0.0);
  return g;
}

// ============================================================
//  PLANCHA / GRILL
// ============================================================
export function griddle(accent = "#ff5722") {
  const g = new THREE.Group();
  g.add(box(1.8, 0.45, 1.1, steel(), 0, 0.5, 0));
  // plaque acier
  const plate = box(1.7, 0.08, 1.0, steel(0x3a4046, 0.45, 0.9), 0, 0.76, 0);
  g.add(plate);
  // rebord arrière
  g.add(box(1.7, 0.18, 0.06, steel(0x2c3136), 0, 0.85, -0.5));
  // dosseret commandes
  g.add(box(1.8, 0.3, 0.08, dark(0x0d0f12), 0, 0.62, 0.56));
  [-0.4, 0, 0.4].forEach((x) =>
    g.add(cyl(0.07, 0.07, 0.05, accentMat(accent), x, 0.62, 0.61, 18))
  );
  // bac à graisse
  g.add(box(0.5, 0.1, 0.2, dark(0x15191d), 0, 0.34, 0.5));
  addFeet(g, 1.8, 1.1, 0.27);
  return g;
}

// ============================================================
//  TRANCHEUSE
// ============================================================
export function slicer(accent = "#00bcd4") {
  const g = new THREE.Group();
  // socle
  const base = box(1.0, 0.25, 1.2, steel(0xb9c2c9, 0.3), 0, 0.55, 0);
  g.add(base);
  // corps moteur
  const motor = box(0.6, 0.7, 0.7, steel(0xc9d2d9), -0.35, 0.95, 0);
  g.add(motor);
  // lame circulaire
  const blade = cyl(0.55, 0.55, 0.03, steel(0xe8edf1, 0.08, 1.0), 0.15, 0.95, 0, 48);
  blade.rotation.x = Math.PI / 2;
  g.add(blade);
  // protège-lame
  const guard = cyl(0.6, 0.6, 0.05, accentMat(accent), 0.15, 0.95, -0.12, 48);
  guard.rotation.x = Math.PI / 2;
  g.add(guard);
  // chariot
  const carriage = box(0.7, 0.05, 0.7, steel(0xaab3ba), 0.55, 0.85, 0.25);
  carriage.rotation.z = 0.18;
  g.add(carriage);
  // poignée
  const knob = cyl(0.12, 0.12, 0.12, accentMat(accent), 0.85, 1.05, 0.4, 20);
  g.add(knob);
  addFeet(g, 1.0, 1.2, 0.42, 0.1, 0.06);
  return g;
}

// ============================================================
//  VITRINE RÉFRIGÉRÉE (verre bombé)
// ============================================================
export function fridge(accent = "#03a9f4") {
  const g = new THREE.Group();
  // base réfrigérée
  g.add(box(1.8, 1.0, 1.0, steel(0xc9d2d9), 0, 0.5, 0));
  g.add(box(1.8, 0.2, 0.04, dark(0x0d0f12), 0, 0.35, 0.52));
  g.add(cyl(0.05, 0.05, 0.04, accentMat(accent), 0.7, 0.35, 0.55, 16));
  // caisson vitré
  const glass = glassMat();
  g.add(box(1.7, 0.9, 0.9, glass, 0, 1.45, 0));
  // montants
  const frame = steel(0x9aa3aa, 0.3);
  [-0.85, 0.85].forEach((x) => g.add(box(0.04, 0.9, 0.04, frame, x, 1.45, 0.45)));
  // clayettes
  [1.15, 1.45, 1.75].forEach((y) =>
    g.add(box(1.6, 0.03, 0.7, steel(0xe8edf1, 0.15), 0, y, 0))
  );
  // halo LED froid
  const led = new THREE.PointLight(new THREE.Color(accent), 1.2, 4);
  led.position.set(0, 1.85, 0.3);
  g.add(led);
  addFeet(g, 1.8, 1.0, 0.0);
  return g;
}

// ============================================================
//  LAVE-VAISSELLE / LAVE-VERRES (à capot)
// ============================================================
export function dishwasher(accent = "#4caf50") {
  const g = new THREE.Group();
  g.add(box(1.2, 0.9, 1.1, steel(), 0, 0.45, 0));
  // capot
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.7, 1.0),
    steel(0xbcc5cc, 0.25)
  );
  hood.position.set(0, 1.25, 0);
  hood.castShadow = true;
  g.add(hood);
  // poignée capot
  const bar = cyl(0.035, 0.035, 1.0, steel(0x8a949c), 0, 1.0, 0.52, 12);
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  // hublot
  g.add(box(0.7, 0.4, 0.02, glassMat(), 0, 1.3, 0.5));
  // bandeau
  g.add(box(1.2, 0.2, 0.05, dark(0x0d0f12), 0, 0.35, 0.56));
  [-0.35, 0, 0.35].forEach((x) =>
    g.add(cyl(0.05, 0.05, 0.04, accentMat(accent), x, 0.35, 0.6, 16))
  );
  addFeet(g, 1.2, 1.1, 0.0);
  return g;
}

// ============================================================
//  STATION HYGIÈNE (distributeur + poubelle)
// ============================================================
export function hygiene(accent = "#9c27b0") {
  const g = new THREE.Group();
  // poubelle à pédale
  const bin = cyl(0.5, 0.45, 1.2, steel(0xc9d2d9), -0.5, 0.6, 0, 40);
  g.add(bin);
  g.add(cyl(0.52, 0.52, 0.08, dark(0x20262b), -0.5, 1.24, 0, 40)); // couvercle
  g.add(box(0.3, 0.05, 0.15, accentMat(accent), -0.5, 0.06, 0.4)); // pédale
  // colonne distributeur
  const col = box(0.5, 1.7, 0.4, steel(0xbcc5cc), 0.6, 0.85, 0);
  g.add(col);
  g.add(box(0.45, 0.35, 0.05, glassMat(), 0.6, 1.3, 0.22)); // savon
  g.add(box(0.45, 0.35, 0.05, glassMat(), 0.6, 0.85, 0.22)); // gel
  g.add(box(0.3, 0.06, 0.18, accentMat(accent), 0.6, 1.1, 0.28)); // bec
  g.add(box(0.3, 0.06, 0.18, accentMat(accent), 0.6, 0.65, 0.28));
  return g;
}

// ============================================================
//  FOURNEAU MODULAIRE (Ligne 600 / 700)
// ============================================================
export function range(accent = "#607d8b") {
  const g = new THREE.Group();
  g.add(box(1.8, 1.0, 1.1, steel(), 0, 0.5, 0));
  // plan de cuisson
  g.add(box(1.7, 0.06, 1.0, steel(0x2c3136, 0.5), 0, 1.03, 0));
  // 4 brûleurs
  [[-0.45, -0.22], [0.45, -0.22], [-0.45, 0.22], [0.45, 0.22]].forEach(
    ([x, z]) => {
      g.add(cyl(0.22, 0.22, 0.04, dark(0x15191d), x, 1.07, z, 24));
      g.add(cyl(0.14, 0.16, 0.06, accentMat(accent), x, 1.1, z, 24));
      // flammes (cône émissif)
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.18, 16),
        new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          emissive: 0x3b82f6,
          emissiveIntensity: 1.4,
          transparent: true,
          opacity: 0.8,
        })
      );
      flame.position.set(x, 1.18, z);
      g.add(flame);
    }
  );
  // portes four
  g.add(box(0.85, 0.7, 0.04, dark(0x1a1f24), -0.42, 0.5, 0.56));
  g.add(box(0.85, 0.7, 0.04, dark(0x1a1f24), 0.42, 0.5, 0.56));
  [-0.42, 0.42].forEach((x) =>
    g.add(cyl(0.03, 0.03, 0.6, steel(0x9aa3aa), x, 0.65, 0.6, 10))
  );
  addFeet(g, 1.8, 1.1, 0.0);
  return g;
}

// ============================================================
//  BUFFET / CHAFING DISH (couvercle roll-top)
// ============================================================
export function buffet(accent = "#ffc107") {
  const g = new THREE.Group();
  // support
  g.add(box(1.4, 0.5, 0.9, steel(0xb9c2c9), 0, 0.4, 0));
  // bac GN
  g.add(box(1.2, 0.3, 0.7, dark(0x2c3136, 0.3), 0, 0.75, 0));
  // mets (surface dorée)
  g.add(box(1.1, 0.05, 0.6, accentMat(accent), 0, 0.88, 0));
  // couvercle roll-top (demi-cylindre)
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32, 1, false, 0, Math.PI),
    steel(0xdfe6ea, 0.2)
  );
  lid.rotation.z = Math.PI / 2;
  lid.position.set(0, 0.92, -0.12);
  lid.castShadow = true;
  g.add(lid);
  // poignée
  g.add(cyl(0.04, 0.04, 0.5, steel(0x8a949c), 0, 1.18, -0.12, 12));
  addFeet(g, 1.4, 0.9, 0.15, 0.12, 0.04);
  return g;
}

// ============================================================
//  APPAREIL FAMILIAL (grill / raclette)
// ============================================================
export function family(accent = "#e91e63") {
  const g = new THREE.Group();
  g.add(box(1.4, 0.3, 0.9, dark(0x20262b, 0.4), 0, 0.35, 0));
  // plaque de cuisson
  g.add(box(1.3, 0.06, 0.8, steel(0x3a4046, 0.4), 0, 0.53, 0));
  // arche supérieure (grill)
  g.add(box(1.3, 0.12, 0.8, dark(0x15191d), 0, 0.95, 0));
  [-0.6, 0.6].forEach((x) => g.add(box(0.1, 0.45, 0.1, dark(0x20262b), x, 0.73, 0)));
  // résistance (rougeoyante)
  g.add(
    box(1.1, 0.04, 0.6, new THREE.MeshStandardMaterial({
      color: 0xff5722, emissive: 0xff5722, emissiveIntensity: 1.2,
    }), 0, 0.89, 0)
  );
  // molette
  g.add(cyl(0.1, 0.1, 0.08, accentMat(accent), 0.55, 0.4, 0.46, 20));
  addFeet(g, 1.4, 0.9, 0.2, 0.08, 0.04);
  return g;
}

// ---- Dispatcher --------------------------------------------
export const BUILDERS = {
  fryer, griddle, slicer, fridge, dishwasher,
  hygiene, range, buffet, family,
};

export function buildModel(name, accent) {
  const fn = BUILDERS[name] || fryer;
  return fn(accent);
}
