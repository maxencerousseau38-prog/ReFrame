// ============================================================
//  CASSELIN 3D — Orchestration UI
// ============================================================

import { CATEGORIES, PRODUCTS } from "./products.js";
import { HeroScene, ProductViewer } from "./scene.js";

// ---------- Loader ----------
function hideLoader() {
  const l = document.getElementById("loader");
  l.classList.add("hidden");
  setTimeout(() => (l.style.display = "none"), 800);
}

// ---------- Build category grid ----------
function buildCategories() {
  const grid = document.getElementById("category-grid");
  CATEGORIES.forEach((c, i) => {
    const card = document.createElement("article");
    card.className = "cat-card reveal";
    card.style.setProperty("--accent", c.color);
    card.style.setProperty("--delay", `${i * 60}ms`);
    card.innerHTML = `
      <div class="cat-card__glow"></div>
      <span class="cat-card__index">0${i + 1}</span>
      <h3 class="cat-card__title">${c.name}</h3>
      <p class="cat-card__tagline">${c.tagline}</p>
      <p class="cat-card__desc">${c.description}</p>
      <button class="cat-card__cta" data-model="${c.model}" data-accent="${c.color}" data-name="${c.name}">
        Explorer en 3D <span>→</span>
      </button>`;
    grid.appendChild(card);
  });
}

// ---------- Build product showcase ----------
function buildProducts() {
  const grid = document.getElementById("product-grid");
  PRODUCTS.forEach((p, i) => {
    const cat = CATEGORIES.find((c) => c.id === p.category);
    const accent = cat ? cat.color : "#ff5722";
    const card = document.createElement("article");
    card.className = "prod-card reveal";
    card.style.setProperty("--accent", accent);
    card.style.setProperty("--delay", `${i * 70}ms`);
    card.innerHTML = `
      <div class="prod-card__badge">${cat ? cat.name : ""}</div>
      <h3 class="prod-card__name">${p.name}</h3>
      <p class="prod-card__sub">${p.subtitle}</p>
      <p class="prod-card__desc">${p.description}</p>
      <div class="prod-card__foot">
        <span class="prod-card__price">${p.price}</span>
        <button class="prod-card__view" data-product="${p.id}">Vue 3D</button>
      </div>`;
    grid.appendChild(card);
  });
}

// ---------- Modal / Viewer ----------
let viewer = null;
function openModal(modelName, accent, title, desc, specs) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-desc").textContent = desc || "";
  modal.style.setProperty("--accent", accent);

  const specBox = document.getElementById("modal-specs");
  specBox.innerHTML = "";
  if (specs && specs.length) {
    specs.forEach(([k, v]) => {
      const row = document.createElement("div");
      row.className = "spec-row";
      row.innerHTML = `<span>${k}</span><strong>${v}</strong>`;
      specBox.appendChild(row);
    });
  }

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  if (!viewer) viewer = new ProductViewer(document.getElementById("viewer-canvas"));
  viewer.setActive(true);
  viewer.load(modelName, accent);
}
function closeModal() {
  document.getElementById("modal").classList.remove("open");
  document.body.style.overflow = "";
  if (viewer) viewer.setActive(false);
}

// ---------- Scroll reveal ----------
function setupReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
}

// ---------- Counters ----------
function setupCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      let cur = 0;
      const step = target / 60;
      const tick = () => {
        cur += step;
        if (cur < target) {
          el.textContent = Math.floor(cur).toLocaleString("fr-FR");
          requestAnimationFrame(tick);
        } else {
          el.textContent = target.toLocaleString("fr-FR");
        }
      };
      tick();
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => obs.observe(el));
}

// ---------- Init ----------
window.addEventListener("DOMContentLoaded", () => {
  buildCategories();
  buildProducts();
  setupReveal();
  setupCounters();

  // Hero scene
  const hero = new HeroScene(document.getElementById("hero-canvas"));
  window.addEventListener("scroll", () => {
    const max = innerHeight;
    hero.setScroll(Math.min(scrollY / max, 1.2));
    // progress bar
    const sp = scrollY / (document.body.scrollHeight - innerHeight);
    document.getElementById("progress").style.transform = `scaleX(${sp})`;
  });

  // delegated clicks for "Explorer en 3D" + "Vue 3D"
  document.body.addEventListener("click", (e) => {
    const catBtn = e.target.closest(".cat-card__cta");
    if (catBtn) {
      openModal(catBtn.dataset.model, catBtn.dataset.accent, catBtn.dataset.name, "", null);
      return;
    }
    const prodBtn = e.target.closest(".prod-card__view");
    if (prodBtn) {
      const p = PRODUCTS.find((x) => x.id === prodBtn.dataset.product);
      const cat = CATEGORIES.find((c) => c.id === p.category);
      openModal(p.model, cat ? cat.color : "#ff5722", p.name, p.description, p.specs);
    }
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

  // nav burger
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav-links");
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });

  // smooth anchor
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
      }
    })
  );

  // navbar shrink
  window.addEventListener("scroll", () => {
    document.getElementById("nav").classList.toggle("scrolled", scrollY > 40);
  });

  setTimeout(hideLoader, 1100);
});
