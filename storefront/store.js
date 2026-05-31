/* Filter Supply — storefront preview interactions (no backend).
   Cart count persists in localStorage so it survives page hops. */
window.FS_FMT = function (n) { return "¥" + n.toLocaleString("ja-JP"); };

(function () {
  "use strict";
  var KEY = "fs_cart_count";

  function count() { return parseInt(localStorage.getItem(KEY) || "0", 10); }
  function setCount(n) {
    localStorage.setItem(KEY, String(n));
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = n; });
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add("is-in"); });
    });
    setTimeout(function () {
      t.classList.remove("is-in");
      setTimeout(function () { t.remove(); }, 400);
    }, 1900);
  }

  function addToCart(label) { setCount(count() + 1); toast("Added · " + (label || "Item")); }

  /* ---- product card factory ---- */
  function cardHTML(p) {
    return (
      '<article class="pcard">' +
        '<a href="product.html?id=' + p.id + '" class="pcard__link" aria-label="' + p.jp + 'の詳細">' +
          '<div class="pcard__media">' +
            (p.tag ? '<span class="pcard__tag">' + p.tag + '</span>' : '') +
            '<image-slot id="ps-' + p.id + '" shape="rect" fit="contain"' + (p.img ? ' src="' + p.img + '"' : '') + ' placeholder="' + p.kanji + ' — ' + p.jp + '"></image-slot>' +
          '</div>' +
        '</a>' +
        '<button class="pcard__add" data-add="' + p.jp + '" aria-label="カートに追加">+</button>' +
        '<h3 class="pcard__name"><a href="product.html?id=' + p.id + '">' + p.jp + '</a></h3>' +
        '<p class="eyebrow" style="color:var(--muted);font-size:9px;margin:4px 0 6px;">' + p.en + '</p>' +
        '<p class="pcard__price">' + window.FS_FMT(p.price) + '</p>' +
      '</article>'
    );
  }

  function renderGrid(id, list) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = list.map(cardHTML).join("");
  }

  /* ---- scroll fade ---- */
  function armFades() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".fade").forEach(function (el) { io.observe(el); });
  }

  /* ---- bind add buttons (delegated) ---- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (b) { e.preventDefault(); addToCart(b.getAttribute("data-add")); }
  });

  document.addEventListener("DOMContentLoaded", function () {
    setCount(count());
    var P = window.FS_PRODUCTS || [];
    renderGrid("bestsellers", P.slice(0, 6));
    renderGrid("seasonal", P.slice(3, 9));
    renderGrid("shopgrid", P);

    /* Mobile nav */
    var burger = document.querySelector(".hdr__burger");
    var nav    = document.querySelector(".hdr__nav");
    if (burger && nav) {
      var overlay = document.createElement("div");
      overlay.className = "nav-overlay";
      document.body.appendChild(overlay);
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

    /* Header scroll shadow */
    var hdr = document.querySelector(".hdr");
    if (hdr) {
      window.addEventListener("scroll", function () {
        hdr.classList.toggle("is-scrolled", window.scrollY > 10);
      }, { passive: true });
    }

    /* Scroll progress bar */
    var bar = document.createElement("div");
    bar.id = "scroll-progress";
    document.body.prepend(bar);
    window.addEventListener("scroll", function () {
      var h = document.body.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? window.scrollY / h * 100 : 0) + "%";
    }, { passive: true });

    armFades();
  });

  window.FS = { addToCart: addToCart, setCount: setCount, count: count };
})();
