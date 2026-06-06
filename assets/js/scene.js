// ============================================================
//  CASSELIN 3D — Moteur de scènes Three.js
//  - Scène HERO : appareil vedette en lévitation + particules
//  - Scène VIEWER : configurateur produit interactif (OrbitControls)
//  Environnement studio généré à la volée (pas d'asset HDR).
// ============================================================

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildModel } from "./models.js";

// ---------- Environnement studio partagé ----------
function makeEnv(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  return env;
}

function studioLights(scene, accent = 0xe11d1d) {
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.0004;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x88aaff, 0.6);
  fill.position.set(-5, 3, -4);
  scene.add(fill);

  const rim = new THREE.SpotLight(accent, 3.0, 25, Math.PI / 5, 0.4);
  rim.position.set(-3, 5, -6);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  return rim;
}

// ============================================================
//  HERO SCENE
// ============================================================
export class HeroScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.environment = makeEnv(this.renderer);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(0, 1.6, 6.2);

    this.rim = studioLights(this.scene);

    // sol réfléchissant léger
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(14, 64),
      new THREE.MeshStandardMaterial({ color: 0x0a0c0f, roughness: 0.5, metalness: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // appareil vedette
    this.hero = buildModel("range", "#e11d1d");
    this.hero.position.y = 0.2;
    this.scene.add(this.hero);

    // satellites en orbite
    this.satellites = [];
    const sats = [
      ["fryer", "#e11d1d"], ["slicer", "#00bcd4"], ["fridge", "#03a9f4"],
      ["dishwasher", "#4caf50"], ["buffet", "#ffc107"], ["griddle", "#ff4d4d"],
    ];
    sats.forEach(([m, c], i) => {
      const grp = buildModel(m, c);
      grp.scale.setScalar(0.42);
      const a = (i / sats.length) * Math.PI * 2;
      grp.userData = { a, r: 4.6, speed: 0.12 + i * 0.01, bob: Math.random() * 6 };
      this.scene.add(grp);
      this.satellites.push(grp);
    });

    // particules / poussière studio
    const pcount = 380;
    const pg = new THREE.BufferGeometry();
    const pos = new Float32Array(pcount * 3);
    for (let i = 0; i < pcount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.particles = new THREE.Points(
      pg,
      new THREE.PointsMaterial({ color: 0xff4d4d, size: 0.04, transparent: true, opacity: 0.55 })
    );
    this.scene.add(this.particles);

    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0 };
    this.scroll = 0;
    window.addEventListener("pointermove", (e) => {
      this.mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      this.mouse.y = (e.clientY / innerHeight - 0.5) * 2;
    });
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.animate = this.animate.bind(this);
    this.renderer.setAnimationLoop(this.animate);
  }

  setScroll(v) { this.scroll = v; }

  resize() {
    const w = this.canvas.clientWidth || innerWidth;
    const h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    const t = this.clock.getElapsedTime();
    // appareil vedette
    this.hero.rotation.y = t * 0.3;
    this.hero.position.y = 0.2 + Math.sin(t * 1.2) * 0.08;
    // satellites en orbite
    this.satellites.forEach((s) => {
      const a = s.userData.a + t * s.userData.speed;
      s.position.set(
        Math.cos(a) * s.userData.r,
        1.2 + Math.sin(t + s.userData.bob) * 0.25,
        Math.sin(a) * s.userData.r
      );
      s.rotation.y = t * 0.5;
    });
    // particules
    this.particles.rotation.y = t * 0.02;
    // caméra parallaxe + scroll dezoom
    const tz = 6.2 + this.scroll * 2.0;
    this.camera.position.x += (this.mouse.x * 0.8 - this.camera.position.x) * 0.04;
    this.camera.position.y += (1.6 - this.mouse.y * 0.5 - this.camera.position.y) * 0.04;
    this.camera.position.z += (tz - this.camera.position.z) * 0.05;
    this.camera.lookAt(0, 0.7, 0);
    // teinte du rim au scroll
    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================================
//  PRODUCT VIEWER (modal interactif)
// ============================================================
export class ProductViewer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.scene = new THREE.Scene();
    this.scene.environment = makeEnv(this.renderer);
    this.rim = studioLights(this.scene);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(2.4, 1.8, 3.6);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 7;
    this.controls.maxPolarAngle = Math.PI / 1.9;
    this.controls.target.set(0, 0.8, 0);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.4;

    // socle
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.4, 0.1, 64),
      new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.4, metalness: 0.5 })
    );
    disc.position.y = -0.05;
    disc.receiveShadow = true;
    this.scene.add(disc);

    this.current = null;
    this.active = false;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.renderer.setAnimationLoop(() => this.render());
  }

  load(modelName, accent) {
    if (this.current) this.scene.remove(this.current);
    this.current = buildModel(modelName, accent);
    this.scene.add(this.current);
    if (this.rim) this.rim.color.set(accent);
  }

  setActive(v) { this.active = v; if (v) this.resize(); }

  resize() {
    const w = this.canvas.clientWidth || 600;
    const h = this.canvas.clientHeight || 500;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render() {
    if (!this.active) return;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
