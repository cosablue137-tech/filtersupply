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

  document.addEventListener("DOMContentLoaded", function () { bindSteppers(); bindVariants(); armFades(); initScrollUI(); });
  document.addEventListener("shopify:section:load", function () { bindSteppers(); bindVariants(); armFades(); });
})();
