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
    var addBtn = form.querySelector("[data-add-to-cart]");
    var buyBtn = form.querySelector("[name=checkout]");

    function active(group) { var a = group.querySelector(".sf-chip.is-active"); return a ? a.getAttribute("data-value") : null; }
    function paint(chip, on) {
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
      chip.style.background = on ? "var(--ink)" : "transparent";
      chip.style.color = on ? "#fff" : "var(--ink)";
      chip.style.borderColor = on ? "var(--ink)" : "var(--line-2)";
    }
    function update() {
      var opts = $all("[data-option-index]", form).map(active);
      var match = variants.find(function (v) { return v.options.every(function (o, i) { return o === opts[i]; }); }) || variants[0];
      if (!match) return;
      idInput.value = match.id;
      // 価格はサーバ整形済み（通貨記号・桁区切りはストア設定に従う）
      if (priceEl && match.price) priceEl.textContent = match.price;
      var mirror = $("[data-price-mirror]"); if (mirror && match.price) mirror.textContent = match.price;
      var sAdd = $("[data-sticky-add]"); if (sAdd) sAdd.disabled = !match.available;
      // 在庫状態をボタンへ反映
      if (addBtn) {
        addBtn.disabled = !match.available;
        addBtn.textContent = match.available
          ? (addBtn.getAttribute("data-label-add") || addBtn.textContent)
          : (addBtn.getAttribute("data-label-sold") || addBtn.textContent);
      }
      if (buyBtn) buyBtn.style.display = match.available ? "" : "none";
      // URL に ?variant= を反映（リロード・共有で選択を保持）
      if (match.url && window.history && history.replaceState) {
        history.replaceState({}, "", match.url);
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

  /* ---- product image lightbox (zoom) ---- */
  function initZoom() {
    var imgs = $all("[data-zoom]");
    if (!imgs.length) return;
    var box = null;
    function open(src, alt) {
      if (!box) {
        box = document.createElement("div");
        box.className = "lightbox";
        box.innerHTML = '<button class="lightbox__close" type="button" aria-label="閉じる">&times;</button><img alt="">';
        document.body.appendChild(box);
        box.addEventListener("click", function (e) {
          if (e.target === box || e.target.classList.contains("lightbox__close")) close();
        });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      }
      box.querySelector("img").src = src;
      box.querySelector("img").alt = alt || "";
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () { box.classList.add("is-open"); });
    }
    function close() { if (box) { box.classList.remove("is-open"); document.body.style.overflow = ""; } }
    imgs.forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () { open(img.getAttribute("data-zoom"), img.alt); });
    });
  }

  /* ---- sticky add-to-cart (mobile) ---- */
  function initStickyBuy() {
    var bar = $("[data-sticky-buy]");
    var form = $("[data-product-form]");
    if (!bar || !form) return;
    var realAdd = form.querySelector("[data-add-to-cart]");
    var anchor = form.querySelector(".fprod__buy") || realAdd;
    if (!anchor) return;
    bar.querySelector("[data-sticky-add]").addEventListener("click", function () {
      if (realAdd) realAdd.click();
    });
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      // 本来の購入ボタンが画面外のときだけ固定バーを出す
      bar.classList.toggle("is-shown", !entries[0].isIntersecting);
    }, { rootMargin: "0px 0px -10% 0px" }).observe(anchor);
  }

  /* ---- cart count morph ---- */
  function initCartMorph() {
    document.addEventListener("click", function (e) {
      if (!e.target.closest("[type=submit]")) return;
      setTimeout(function () {
        $all("[data-cart-count]").forEach(function (el) {
          el.classList.remove("cart-pop");
          void el.offsetWidth;
          el.classList.add("cart-pop");
        });
      }, 300);
    });
  }

  document.addEventListener("DOMContentLoaded", function () { bindSteppers(); bindVariants(); armFades(); initMobileNav(); initScrollUI(); initCartMorph(); initZoom(); initStickyBuy(); });
  document.addEventListener("shopify:section:load", function () { bindSteppers(); bindVariants(); armFades(); });
})();
