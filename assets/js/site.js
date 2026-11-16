/* Akhil Thomas — site behaviour: nav, theme toggle, photo grid, lightbox. */
(function () {
  'use strict';

  /* ---------- Navigation ---------- */
  var nav = document.querySelector('[data-nav]');
  var navToggle = document.querySelector('[data-nav-toggle]');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-solid', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (nav && navToggle) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var root = document.documentElement;
      var current = root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- Photo captions ----------
     Title comes from _data/photos.yml when present, otherwise from the file
     name: "2026-11-misty-morning" -> "Misty morning" + "Nov 2026". */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function describe(shot) {
    var name = shot.getAttribute('data-name') || '';
    var m = name.match(/^(\d{4})(?:[-_.](\d{2}))?(?:[-_.](\d{2}))?(?:[-_.\s]+(.*))?$/);
    var date = '';
    var rest = name;
    if (m) {
      var month = m[2] ? MONTHS[parseInt(m[2], 10) - 1] : '';
      date = (month ? month + ' ' : '') + m[1];
      rest = m[4] || '';
    }
    var auto = rest.replace(/[-_]+/g, ' ').trim();
    /* Camera file names (IMG_1234, DSC01234…) make poor titles — skip them. */
    if (/^(img|dsc|dscf|dscn|pxl|p|mvimg)?\s*\d+$/i.test(auto)) auto = '';
    if (auto) auto = auto.charAt(0).toUpperCase() + auto.slice(1);
    var title = shot.getAttribute('data-title') || auto;
    var sub = [shot.getAttribute('data-location'), date].filter(Boolean).join(' · ');
    return { title: title, sub: sub };
  }
  function fillCaption(el, info) {
    el.textContent = '';
    if (info.title) el.appendChild(document.createTextNode(info.title));
    if (info.sub) {
      var s = document.createElement('small');
      s.textContent = info.sub;
      el.appendChild(s);
    }
  }

  /* ---------- Photo grid ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll('[data-gallery] .shot'));
  document.querySelectorAll('[data-gallery]').forEach(function (grid) {
    if (grid.querySelectorAll('.shot').length < 4) grid.classList.add('is-sparse');
  });
  shots.forEach(function (shot) {
    var img = shot.querySelector('img');
    var info = describe(shot);
    shot._info = info;
    var cap = shot.querySelector('.shot-cap');
    if (cap) { if (info.title || info.sub) fillCaption(cap, info); else cap.remove(); }
    if (img && info.title) img.alt = info.title;
    var setRatio = function () {
      if (img.naturalWidth && img.naturalHeight) {
        shot.style.setProperty('--r', (img.naturalWidth / img.naturalHeight).toFixed(4));
      }
    };
    if (img) {
      if (img.complete) setRatio(); else img.addEventListener('load', setRatio);
    }
  });

  /* ---------- Album filter ---------- */
  var filters = document.querySelector('[data-filters]');
  if (filters) {
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var value = btn.getAttribute('data-filter');
      filters.querySelectorAll('[data-filter]').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      shots.forEach(function (s) {
        s.hidden = !(value === '*' || s.getAttribute('data-album') === value);
      });
    });
  }

  /* ---------- Lightbox ---------- */
  if (!shots.length) return;

  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML =
    '<div class="lb-bar"><span class="lb-count"></span>' +
    '<button type="button" class="lb-btn lb-close" aria-label="Close">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
    '<div class="lb-stage">' +
    '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">' +
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<img class="lb-img" alt="">' +
    '<button type="button" class="lb-btn lb-next" aria-label="Next photo">' +
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>' +
    '</div><div class="lb-cap"></div>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector('.lb-img');
  var lbCap = lb.querySelector('.lb-cap');
  var lbCount = lb.querySelector('.lb-count');
  var lbStage = lb.querySelector('.lb-stage');
  var list = [];
  var index = 0;
  var opener = null;

  function show(i) {
    index = (i + list.length) % list.length;
    var shot = list[index];
    lbImg.src = shot.getAttribute('href');
    lbImg.alt = shot._info.title || 'Photo';
    fillCaption(lbCap, shot._info);
    lbCount.textContent = (index + 1) + ' / ' + list.length;
    var many = list.length > 1;
    lb.querySelector('.lb-prev').hidden = !many;
    lb.querySelector('.lb-next').hidden = !many;
    if (many) { new Image().src = list[(index + 1) % list.length].getAttribute('href'); }
  }
  function open(shot) {
    var grid = shot.closest('[data-gallery]');
    list = shots.filter(function (s) { return !s.hidden && s.closest('[data-gallery]') === grid; });
    opener = shot;
    lb.classList.add('is-open');
    document.body.classList.add('lb-lock');
    show(list.indexOf(shot));
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    lb.classList.remove('is-open');
    document.body.classList.remove('lb-lock');
    lbImg.removeAttribute('src');
    if (opener) opener.focus();
  }

  shots.forEach(function (shot) {
    shot.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(shot);
    });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
  lbStage.addEventListener('click', function (e) { if (e.target === lbStage) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'Tab') {
      var btns = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return !b.hidden; });
      var first = btns[0], last = btns[btns.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Swipe left / right on touch screens */
  var startX = null, startY = null;
  lbStage.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  lbStage.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    startX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
