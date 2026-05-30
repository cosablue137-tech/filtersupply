/* Filter Supply — storefront preview interactions (no backend).
   Cart count persists in localStorage so it survives page hops. */
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
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;bottom:34px;transform:translateX(-50%);background:#1a1a18;color:#fff;font-family:Jost,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:14px 26px;z-index:200;opacity:0;transition:opacity .35s ease;";
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = "1"; });
    setTimeout(function () { t.style.opacity = "0"; setTimeout(function () { t.remove(); }, 400); }, 1700);
  }

  function addToCart(label) { setCount(count() + 1); toast("Added · " + (label || "Item")); }

  /* ---- product card factory ---- */
  function cardHTML(p) {
    return (
      '<article class="pcard">' +
        '<div class="pcard__media">' +
          (p.tag ? '<span class="pcard__tag">' + p.tag + '</span>' : '') +
          '<image-slot id="ps-' + p.id + '" shape="rect" fit="contain" placeholder="' + p.kanji + ' — ' + p.name + '"></image-slot>' +
        '</div>' +
        '<button class="pcard__add" data-add="' + p.name + '" aria-label="Add">+</button>' +
        '<h3 class="pcard__name">' + p.name + '</h3>' +
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
    renderGrid("shopgrid", P);          // shop.html
    armFades();
  });

  window.FS = { addToCart: addToCart, setCount: setCount, count: count };
})();
