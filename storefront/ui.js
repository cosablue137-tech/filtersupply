/* Filter Supply — refined UX layer
   1. Custom cursor (dot + lagged ring)
   2. Page fade transitions
   3. Smart header (auto-white over dark hero)
   4. Cart count morph animation
*/
(function () {
  'use strict';

  /* ── 1. Custom cursor ───────────────────────────────────────── */
  function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.className  = 'cur-dot';
    ring.className = 'cur-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = -100, my = -100;
    var rx = -100, ry = -100;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)';

      /* dark section detection */
      var el = document.elementFromPoint(mx, my);
      var dark = el && el.closest('.hero__pane--dark, .feature, .fbcta, .wband__media--placeholder');
      dot.classList.toggle('is-light',  !!dark);
      ring.classList.toggle('is-light', !!dark);
    });

    document.addEventListener('mouseleave', function () {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity  = '';
      ring.style.opacity = '';
    });

    /* interactive hover */
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, [data-add], .pcard__media')) {
        ring.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, [data-add], .pcard__media')) {
        ring.classList.remove('is-hover');
      }
    });

    /* lagged ring via rAF lerp */
    function lerp(a, b, t) { return a + (b - a) * t; }
    function tick() {
      rx = lerp(rx, mx, 0.10);
      ry = lerp(ry, my, 0.10);
      ring.style.transform = 'translate(' + (rx - 16) + 'px,' + (ry - 16) + 'px)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── 2. Page fade transitions ────────────────────────────────── */
  function initTransitions() {
    var veil = document.createElement('div');
    veil.className = 'page-veil';
    document.body.appendChild(veil);

    /* fade in on arrival */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { veil.classList.add('is-in'); });
    });

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank' ||
          href.startsWith('mailto') || href.startsWith('tel')) return;
      e.preventDefault();
      veil.classList.remove('is-in');
      setTimeout(function () { location.href = href; }, 420);
    });
  }

  /* ── 3. Smart header ─────────────────────────────────────────── */
  function initSmartHeader() {
    var hdr  = document.querySelector('.hdr');
    var hero = document.querySelector('.hero');
    if (!hdr || !hero) return;

    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;bottom:0;left:0;width:1px;height:1px;pointer-events:none;';
    hero.style.position = 'relative';
    hero.appendChild(sentinel);

    var io = new IntersectionObserver(function (entries) {
      hdr.classList.toggle('hdr--light', entries[0].isIntersecting);
    }, { threshold: 0 });
    io.observe(sentinel);
  }

  /* ── 4. Cart count morph ─────────────────────────────────────── */
  function initCartMorph() {
    var els = document.querySelectorAll('[data-cart-count]');
    if (!els.length) return;

    /* patch FS.setCount after it's defined */
    var interval = setInterval(function () {
      if (!window.FS) return;
      clearInterval(interval);
      var _orig = window.FS.setCount;
      window.FS.setCount = function (n) {
        _orig(n);
        els.forEach(function (el) {
          el.classList.remove('cart-pop');
          void el.offsetWidth;
          el.classList.add('cart-pop');
        });
      };
    }, 100);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCursor();
    initTransitions();
    initSmartHeader();
    initCartMorph();
  });
})();
