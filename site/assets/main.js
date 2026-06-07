/* Turismo — interactions */
(function () {
  "use strict";

  // ---- Mobile topbar ----
  var toggle = document.querySelector(".topbar__toggle");
  var topbar = document.querySelector(".topbar");
  if (toggle && topbar) {
    toggle.addEventListener("click", function () { topbar.classList.toggle("topbar--open"); });
    topbar.querySelectorAll(".topbar__nav a").forEach(function (a) {
      a.addEventListener("click", function () { topbar.classList.remove("topbar--open"); });
    });
  }

  // ---- Category filter ----
  var filters = document.getElementById("filters");
  var fleet = document.getElementById("fleet");
  if (filters && fleet) {
    var cards = fleet.querySelectorAll(".car-card");
    var noresult = document.getElementById("noresult");
    filters.querySelectorAll(".filt").forEach(function (f) {
      f.addEventListener("click", function () {
        filters.querySelectorAll(".filt").forEach(function (o) { o.classList.remove("active"); });
        f.classList.add("active");
        var cat = f.getAttribute("data-filter");
        var visible = 0;
        cards.forEach(function (c) {
          var match = cat === "all" || (" " + c.getAttribute("data-cat") + " ").indexOf(" " + cat + " ") !== -1;
          c.style.display = match ? "" : "none";
          if (match) visible++;
        });
        if (noresult) noresult.style.display = visible ? "none" : "block";
      });
    });
  }

  // ---- Favorites (heart) ----
  var FAV_KEY = "turismo_favs";
  function getFavs() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || {}; } catch (e) { return {}; } }
  var favs = getFavs();
  document.querySelectorAll(".fav[data-fav]").forEach(function (btn) {
    var id = btn.getAttribute("data-fav");
    if (favs[id]) btn.classList.add("on");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      btn.classList.toggle("on");
      favs[id] = btn.classList.contains("on");
      try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (err) {}
    });
  });

  // ---- FAQ accordion ----
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var q = item.querySelector(".faq__q");
    var a = item.querySelector(".faq__a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq__item.open").forEach(function (other) {
        if (other !== item) { other.classList.remove("open"); other.querySelector(".faq__a").style.maxHeight = null; }
      });
      if (isOpen) { item.classList.remove("open"); a.style.maxHeight = null; }
      else { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  // ---- Newsletter (demo) ----
  document.querySelectorAll(".newsletter").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.innerHTML = '<p style="margin:auto;font-weight:600;">Merci ! Vous êtes inscrit·e à la newsletter Turismo.</p>';
    });
  });

  // ---- Configurator ----
  var config = document.querySelector("[data-config]");
  if (config) {
    var base = parseInt(config.getAttribute("data-base"), 10) || 0;
    var state = { duration: 0, km: 0, buyout: 0 };
    function format(n) { return n.toLocaleString("fr-FR"); }
    function recalc() {
      var total = base + state.duration + state.km + state.buyout;
      var totalEl = config.querySelector("[data-total]");
      if (totalEl) totalEl.textContent = format(total) + " €";
    }
    config.querySelectorAll(".opts").forEach(function (group) {
      var key = group.getAttribute("data-key");
      group.querySelectorAll(".opt").forEach(function (opt) {
        opt.addEventListener("click", function () {
          group.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("active"); });
          opt.classList.add("active");
          state[key] = parseInt(opt.getAttribute("data-delta"), 10) || 0;
          recalc();
        });
      });
    });
    config.querySelectorAll(".swatch button").forEach(function (sw) {
      sw.addEventListener("click", function () {
        config.querySelectorAll(".swatch button").forEach(function (b) { b.classList.remove("active"); });
        sw.classList.add("active");
      });
    });
    recalc();
  }

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = Math.min(i * 60, 180) + "ms";
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
