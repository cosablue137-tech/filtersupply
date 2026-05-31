/* ============================================================
   FILTER SUPPLY — theme.js
   Product page: quantity steppers + variant option chips.
   Cart page uses native Shopify change links (no JS needed).
   ============================================================ */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- quantity steppers ---- */
  function bindSteppers() {
    $all("[data-stepper]").forEach(function (wrap) {
      if (wrap.__b) return; wrap.__b = true;
      var input = wrap.querySelector("input");
      $all("[data-step]", wrap).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var d = parseInt(btn.getAttribute("data-step"), 10);
          input.value = Math.max(1, (parseInt(input.value, 10) || 1) + d);
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
    });
  }

  /* ---- variant option chips ---- */
  function bindVariants() {
    var form = $("[data-product-form]");
    var tag = $("#fs-variants-json");
    if (!form || !tag) return;
    var variants = JSON.parse(tag.textContent);
    var idInput = form.querySelector("input[name=id]");
    var priceEl = $("[data-price]");

    function active(group) { var a = group.querySelector(".sf-chip.is-active"); return a ? a.getAttribute("data-value") : null; }
    function paint(chip, on) {
      chip.classList.toggle("is-active", on);
      chip.style.background = on ? "var(--ink)" : "transparent";
      chip.style.color = on ? "#fff" : "var(--ink)";
      chip.style.borderColor = on ? "var(--ink)" : "var(--line-2)";
    }
    function update() {
      var opts = $all("[data-option-index]", form).map(active);
      var match = variants.find(function (v) { return v.options.every(function (o, i) { return o === opts[i]; }); }) || variants[0];
      if (!match) return;
      idInput.value = match.id;
      if (priceEl && match.price != null) {
        priceEl.textContent = "¥" + Math.round(match.price / 100).toLocaleString("ja-JP");
      }
    }
    $all("[data-option-index]", form).forEach(function (group) {
      $all(".sf-chip", group).forEach(function (chip) {
        chip.addEventListener("click", function () {
          $all(".sf-chip", group).forEach(function (c) { paint(c, false); });
          paint(chip, true); update();
        });
      });
    });
    update();
  }

  /* ---- scroll fade ---- */
  function armFades() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".fade").forEach(function (el) { io.observe(el); });
  }

  function initMobileNav() {
    var burger = document.querySelector(".hdr__burger");
    var nav    = document.querySelector(".hdr__nav");
    if (!burger || !nav) return;
    var overlay = document.getElementById("nav-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "nav-overlay";
      overlay.className = "nav-overlay";
      document.body.appendChild(overlay);
    }
    function toggleMenu(open) {
      nav.classList.toggle("is-open", open);
      overlay.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      burger.setAttribute("aria-expanded", String(open));
    }
    burger.addEventListener("click", function () {
      toggleMenu(!nav.classList.contains("is-open"));
    });
    overlay.addEventListener("click", function () { toggleMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggleMenu(false);
    });
  }

  function initScrollUI() {
    var hdr = document.querySelector(".hdr");
    if (hdr) {
      window.addEventListener("scroll", function () {
        hdr.classList.toggle("is-scrolled", window.scrollY > 10);
      }, { passive: true });
    }
    if (!document.getElementById("scroll-progress")) {
      var bar = document.createElement("div");
      bar.id = "scroll-progress";
      document.body.prepend(bar);
      window.addEventListener("scroll", function () {
        var h = document.body.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? window.scrollY / h * 100 : 0) + "%";
      }, { passive: true });
    }
  }

  /* ---- custom cursor ---- */
  function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    var dot = document.createElement("div"); dot.className = "cur-dot";
    var ring = document.createElement("div"); ring.className = "cur-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + (mx - 3) + "px," + (my - 3) + "px)";
      var el = document.elementFromPoint(mx, my);
      var dark = el && el.closest(".hero__pane--dark, .feature, .fbcta");
      dot.classList.toggle("is-light", !!dark);
      ring.classList.toggle("is-light", !!dark);
    });
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button")) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button")) ring.classList.remove("is-hover");
    });
    function lerp(a, b, t) { return a + (b - a) * t; }
    (function tick() {
      rx = lerp(rx, mx, 0.10); ry = lerp(ry, my, 0.10);
      ring.style.transform = "translate(" + (rx - 16) + "px," + (ry - 16) + "px)";
      requestAnimationFrame(tick);
    })();
  }

  /* ---- page fade transitions ---- */
  function initTransitions() {
    var veil = document.createElement("div"); veil.className = "page-veil";
    document.body.appendChild(veil);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { veil.classList.add("is-in"); });
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank" ||
          href.startsWith("mailto") || href.startsWith("tel") ||
          href.startsWith("javascript")) return;
      e.preventDefault();
      veil.classList.remove("is-in");
      setTimeout(function () { location.href = href; }, 420);
    });
  }

  /* ---- smart header (white over dark hero) ---- */
  function initSmartHeader() {
    var hdr = document.querySelector(".hdr");
    var hero = document.querySelector(".hero");
    if (!hdr || !hero) return;
    var sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;bottom:0;left:0;width:1px;height:1px;pointer-events:none;";
    hero.style.position = "relative";
    hero.appendChild(sentinel);
    new IntersectionObserver(function (entries) {
      hdr.classList.toggle("hdr--light", entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ---- cart count morph ---- */
  function initCartMorph() {
    var interval = setInterval(function () {
      var cartForm = document.querySelector("form[action*='/cart']");
      if (!cartForm && !document.querySelector("[data-cart-count]")) return;
      clearInterval(interval);
      document.addEventListener("click", function (e) {
        if (!e.target.closest("[type=submit]")) return;
        setTimeout(function () {
          document.querySelectorAll("[data-cart-count]").forEach(function (el) {
            el.classList.remove("cart-pop");
            void el.offsetWidth;
            el.classList.add("cart-pop");
          });
        }, 300);
      });
    }, 200);
  }

  document.addEventListener("DOMContentLoaded", function () { bindSteppers(); bindVariants(); armFades(); initMobileNav(); initScrollUI(); initCursor(); initTransitions(); initSmartHeader(); initCartMorph(); });
  document.addEventListener("shopify:section:load", function () { bindSteppers(); bindVariants(); armFades(); });
})();
