/* Turismo — interactions */
(function () {
  "use strict";

  // ---- Mobile nav ----
  var toggle = document.querySelector(".nav__toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("nav--open");
    });
  }

  // ---- FAQ accordion ----
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var q = item.querySelector(".faq__q");
    var a = item.querySelector(".faq__a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq__item.open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq__a").style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        a.style.maxHeight = null;
      } else {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  // ---- Newsletter (demo) ----
  document.querySelectorAll(".newsletter").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      form.innerHTML = '<p style="margin:auto;font-weight:600;">Merci ! Vous êtes inscrit·e à la newsletter Turismo.</p>';
    });
  });

  // ---- Configurator (car detail pages) ----
  var config = document.querySelector("[data-config]");
  if (config) {
    var base = parseInt(config.getAttribute("data-base"), 10) || 0;
    var state = { duration: 0, km: 0, buyout: 0 };

    function format(n) {
      return n.toLocaleString("fr-FR");
    }

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

    // colour swatches (purely visual)
    config.querySelectorAll(".swatch button").forEach(function (sw) {
      sw.addEventListener("click", function () {
        config.querySelectorAll(".swatch button").forEach(function (b) { b.classList.remove("active"); });
        sw.classList.add("active");
      });
    });

    recalc();
  }

  // ---- Reveal on scroll ----
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = 1;
          en.target.style.transform = "none";
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity .6s ease, transform .6s ease";
      io.observe(el);
    });
  }
})();
