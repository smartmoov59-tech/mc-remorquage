/* =====================================================================
   MC REMORQUAGE — comportement du site
   Site statique, aucun back-end : GSAP + ScrollTrigger + Lenis (hébergés
   dans /assets/js), formulaire → SMS / e-mail / .ics générés côté client.
   ===================================================================== */
(() => {
  'use strict';

  const doc = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  const TEL = '+33628152367';
  const MAIL = 'christophemurcia64@gmail.com';
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  let lenis = null;

  /** Exécute un bloc d'initialisation sans jamais casser les suivants. */
  const safe = (name, fn) => {
    try { fn(); } catch (e) { if (window.console) console.warn('[MC] ' + name, e); }
  };

  /* Filet de sécurité : le contenu ne reste jamais caché. */
  const safetyTimer = setTimeout(() => {
    doc.classList.add('show-all');
    const l = $('#loader');
    if (l) l.style.display = 'none';
  }, 9000);

  /* ------------------------------------------------------------------
     1. Texte découpé (mots / lettres) — révélation par masque
     ------------------------------------------------------------------ */
  const splits = new Map();
  function split(el, mode) {
    if (splits.has(el)) return splits.get(el);
    const items = [];
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 1) { walk(n); return; }
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/([ \t\r\n]+)/).forEach((tok) => {
          if (!tok) return;
          if (/^[ \t\r\n]+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const word = document.createElement('span');
          word.setAttribute('aria-hidden', 'true');
          if (mode === 'chars') {
            word.style.cssText = 'display:inline-block;white-space:nowrap';
            Array.from(tok).forEach((ch) => {
              const w = document.createElement('span'); w.className = 'sp-w';
              const i = document.createElement('span'); i.className = 'sp-i'; i.textContent = ch;
              w.appendChild(i); word.appendChild(w); items.push(i);
            });
          } else {
            word.className = 'sp-w';
            const i = document.createElement('span'); i.className = 'sp-i'; i.textContent = tok;
            word.appendChild(i); items.push(i);
          }
          frag.appendChild(word);
        });
        n.parentNode.replaceChild(frag, n);
      });
    };
    walk(el);
    splits.set(el, items);
    return items;
  }

  /* ------------------------------------------------------------------
     2. Éléments indépendants de GSAP (nav, menu, FAQ, avis, formulaire…)
     ------------------------------------------------------------------ */
  function initNav() {
    const nav = $('#nav');
    const fab = $('#fab');
    const bar = $('.progress i');
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      nav.classList.toggle('is-solid', y > 40);
      if (y > 360 && y > lastY + 6 && !$('#menu').classList.contains('is-open')) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y <= 360) nav.classList.remove('is-hidden');
      lastY = y;
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
      if (fab) fab.classList.toggle('is-on', y > window.innerHeight * 0.7);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function initMenu() {
    const burger = $('#burger');
    const menu = $('#menu');
    if (!burger || !menu) return;
    $$('.menu__inner a').forEach((a, i) => a.style.setProperty('--i', i));
    const set = (open) => {
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      if (open) { $('#nav').classList.remove('is-hidden'); lenis && lenis.stop(); doc.style.overflow = lenis ? '' : 'hidden'; }
      else { lenis && lenis.start(); doc.style.overflow = ''; }
    };
    burger.addEventListener('click', () => set(!menu.classList.contains('is-open')));
    $$('[data-close]', menu).forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); burger.focus(); } });
    window.matchMedia('(min-width: 1000px)').addEventListener('change', (m) => { if (m.matches) set(false); });
    menu.__close = () => set(false);
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const menu = $('#menu');
        if (menu && menu.__close && menu.classList.contains('is-open')) menu.__close();
        if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4) });
        else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  }

  function initAccordion() {
    const items = $$('.acc__item');
    items.forEach((item) => {
      const btn = $('button', item);
      btn.addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        items.forEach((o) => { o.classList.remove('is-open'); $('button', o).setAttribute('aria-expanded', 'false'); });
        if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
        if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 650);
      });
    });
  }

  function initReviews() {
    const track = $('#revTrack');
    if (!track) return;
    const bar = $('#revBar');
    const cards = $$('.rcard', track);
    const stepW = () => (cards[0] ? cards[0].getBoundingClientRect().width + 19 : 360);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 1;
      if (bar) bar.style.transform = 'scaleX(' + (0.18 + 0.82 * p) + ')';
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    const go = (dir) => {
      const max = track.scrollWidth - track.clientWidth;
      if (dir > 0 && track.scrollLeft >= max - 8) track.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' });
      else if (dir < 0 && track.scrollLeft <= 8) track.scrollTo({ left: max, behavior: reduce ? 'auto' : 'smooth' });
      else track.scrollBy({ left: dir * stepW(), behavior: reduce ? 'auto' : 'smooth' });
    };
    $('#revNext').addEventListener('click', () => go(1));
    $('#revPrev').addEventListener('click', () => go(-1));
    window.addEventListener('resize', update);
    update();
    // lecture automatique douce (jamais sous prefers-reduced-motion, pause au survol / focus)
    if (!reduce) {
      let paused = false, visible = false;
      track.addEventListener('pointerenter', () => { paused = true; });
      track.addEventListener('pointerleave', () => { paused = false; });
      track.addEventListener('focusin', () => { paused = true; });
      track.addEventListener('focusout', () => { paused = false; });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.35 }).observe(track);
      }
      setInterval(() => { if (!paused && visible && !document.hidden) go(1); }, 5200);
    }
  }

  function initLightbox() {
    const dlg = $('#lb');
    if (!dlg || !dlg.showModal) return;
    const img = $('#lbImg');
    const cap = $('#lbCap');
    $$('[data-lb]').forEach((b) => b.addEventListener('click', () => {
      const i = $('img', b);
      img.src = i.currentSrc || i.src;
      img.alt = i.alt;
      cap.textContent = ($('.g__cap', b) || {}).textContent || '';
      dlg.showModal();
      lenis && lenis.stop();
    }));
    $('.lb__x', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { lenis && lenis.start(); });

    const legal = $('#legal');
    if (legal && legal.showModal) {
      $('#legalBtn').addEventListener('click', () => { legal.showModal(); lenis && lenis.stop(); });
      $('[data-close-dialog]', legal).addEventListener('click', () => legal.close());
      legal.addEventListener('click', (e) => { if (e.target === legal) legal.close(); });
      legal.addEventListener('close', () => { lenis && lenis.start(); });
    }
  }

  /* ------------------------------------------------------------------
     3. Carte des zones (SVG généré à partir des contours des départements)
     ------------------------------------------------------------------ */
  function initZonesMap() {
    const host = $('#zonesMap');
    const Z = window.MC_ZONES;
    if (!host || !Z) return;
    const ns = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, parent) => {
      const n = document.createElementNS(ns, tag);
      Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
      if (parent) parent.appendChild(n);
      return n;
    };
    const svg = el('svg', { viewBox: '0 0 ' + Z.w + ' ' + Z.h, preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
    const gCtx = el('g', {}, svg);
    const gMain = el('g', {}, svg);
    const gRoutes = el('g', {}, svg);
    const gText = el('g', {}, svg);
    const mains = {};
    Z.depts.filter((d) => !d.main).forEach((d) => el('path', { d: d.d, class: 'zmap-ctx' }, gCtx));
    Z.depts.filter((d) => d.main).forEach((d) => {
      const p = el('path', { d: d.d, class: 'zmap-d', 'data-dept': d.code }, gMain);
      mains[d.code] = { p, d };
      const t = el('text', { x: d.cx, y: d.cy + 8, class: 'zmap-code' }, gText);
      t.textContent = d.code;
    });
    const F = Z.forcalquier;
    const routes = [];
    Object.keys(mains).forEach((code) => {
      if (code === '04') return;
      const d = mains[code].d;
      const mx = (F.x + d.cx) / 2, my = (F.y + d.cy) / 2;
      const dx = d.cx - F.x, dy = d.cy - F.y;
      const cx = mx - dy * 0.22, cy = my + dx * 0.22;
      const path = 'M' + F.x + ' ' + F.y + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + d.cx + ' ' + d.cy;
      const r = el('path', { d: path, class: 'zmap-route' }, gRoutes);
      routes.push(r);
      if (!reduce) {
        const dot = el('circle', { r: '3.6', fill: '#fff' }, gRoutes);
        const am = el('animateMotion', { dur: (3.4 + Math.random() * 1.6).toFixed(1) + 's', repeatCount: 'indefinite', path: path, begin: (Math.random() * 2).toFixed(1) + 's' }, dot);
        am.setAttribute('keyPoints', '0;1'); am.setAttribute('keyTimes', '0;1'); am.setAttribute('calcMode', 'linear');
      }
    });
    el('circle', { cx: F.x, cy: F.y, r: 10, class: 'zmap-pulse' }, gText);
    el('circle', { cx: F.x, cy: F.y, r: 10, class: 'zmap-pulse' }, gText);
    el('circle', { cx: F.x, cy: F.y, r: 7, class: 'zmap-pin' }, gText);
    const lab = el('text', { x: F.x - 14, y: F.y + 34, class: 'zmap-label', 'text-anchor': 'end' }, gText);
    lab.textContent = 'Forcalquier';
    host.appendChild(svg);

    // liaison liste <-> carte
    const lis = $$('.zlist li[data-dept]');
    const hot = (code, on) => {
      if (mains[code]) mains[code].p.classList.toggle('is-hot', on);
      lis.forEach((li) => { if (li.dataset.dept === code) li.classList.toggle('is-hot', on); });
    };
    lis.forEach((li) => {
      li.addEventListener('pointerenter', () => hot(li.dataset.dept, true));
      li.addEventListener('pointerleave', () => hot(li.dataset.dept, false));
    });
    Object.keys(mains).forEach((code) => {
      mains[code].p.addEventListener('pointerenter', () => hot(code, true));
      mains[code].p.addEventListener('pointerleave', () => hot(code, false));
    });

    // tracé animé à l'entrée dans l'écran
    if (hasGsap && !reduce) {
      const paths = Object.keys(mains).map((c) => mains[c].p);
      paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.style.fillOpacity = 0; });
      routes.forEach((r) => { const L = r.getTotalLength(); r.dataset.len = L; r.style.strokeDasharray = L; r.style.strokeDashoffset = L; });
      gsap.set(gText.querySelectorAll('.zmap-code,.zmap-label,.zmap-pin'), { opacity: 0 });
      ScrollTrigger.create({
        trigger: host, start: 'top 78%', once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(paths, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.12 }, 0)
            .to(paths, { fillOpacity: 1, duration: 1, stagger: 0.12 }, 0.8)
            .to(gText.querySelectorAll('.zmap-code,.zmap-label,.zmap-pin'), { opacity: 1, duration: 0.8, stagger: 0.06 }, 1.1)
            .to(routes, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out', stagger: 0.15, onComplete: () => routes.forEach((r) => { r.style.strokeDasharray = '3 7'; r.style.strokeDashoffset = 0; }) }, 1.6);
          paths.forEach((p) => tl.set(p, { clearProps: 'strokeDasharray,strokeDashoffset' }, 2.6));
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     4. Réservation (sans back-end : SMS / e-mail / presse-papier / .ics)
     ------------------------------------------------------------------ */
  function initBooking() {
    const form = $('#bookForm');
    if (!form) return;
    const F = form.elements;
    const status = $('#formStatus');
    const planBox = $('#planBox');
    const icsBtn = $('#icsBtn');
    const stamp = $('#stamp');
    const T = {};
    $$('[data-t]').forEach((n) => { T[n.dataset.t] = n; });
    const val = (n) => (F[n] && F[n].value ? F[n].value.trim() : '');
    const radio = (n) => { const c = form.querySelector('input[name="' + n + '"]:checked'); return c ? c.value : ''; };
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    F.date.min = today.toISOString().slice(0, 10);

    const fmtDate = (iso) => {
      const p = iso.split('-'); const d = new Date(+p[0], +p[1] - 1, +p[2]);
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    };
    const when = () => {
      const q = radio('quand');
      if (q !== 'Planifier') return q;
      const d = val('date'), h = val('heure');
      return d ? 'Le ' + fmtDate(d) + (h ? ' à ' + h.replace(':', 'h') : '') : 'À planifier (date à préciser)';
    };
    // Texte « SMS-friendly » : guillemets droits et tirets simples (les puces et apostrophes
    // typographiques forceraient l'encodage Unicode, donc des SMS plus courts et plus chers).
    const norm = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[•·]/g, '-').replace(/[  ]/g, ' ').replace(/…/g, '...');
    const message = () => {
      const L = [
        "Bonjour, demande d'intervention MC Remorquage :",
        '',
        '- Besoin : ' + radio('besoin'),
        '- Quand : ' + when(),
        '- Lieu du véhicule : ' + (val('lieu') || '?'),
        val('dest') ? '- Destination : ' + val('dest') : null,
        '- Véhicule : ' + (val('veh') || '?') + ' (' + val('roul').toLowerCase() + ')',
        val('msg') ? '- Message : ' + val('msg') : null,
        '',
        'Nom : ' + (val('nom') || '?'),
        'Tél : ' + (val('tel') || '?'),
        F.rappel.checked ? 'Merci de me rappeler pour confirmer.' : null
      ];
      return norm(L.filter((x) => x !== null).join('\n'));
    };
    const smsUri = (msg) => 'sms:' + TEL + (isIOS ? '&' : '?') + 'body=' + encodeURIComponent(msg);

    const setT = (k, v) => {
      const n = T[k]; if (!n) return;
      const nv = v || '—';
      if (n.textContent !== nv) { n.textContent = nv; n.classList.remove('is-new'); void n.offsetWidth; n.classList.add('is-new'); }
    };
    const refresh = () => {
      planBox.hidden = radio('quand') !== 'Planifier';
      icsBtn.hidden = !(radio('quand') === 'Planifier' && val('date'));
      setT('besoin', radio('besoin'));
      setT('quand', when());
      setT('lieu', val('lieu'));
      setT('dest', val('dest'));
      setT('veh', val('veh'));
      setT('roul', val('roul'));
      setT('contact', [val('nom'), val('tel')].filter(Boolean).join(' · '));
      stamp.textContent = 'Brouillon'; stamp.classList.remove('is-ready');
    };
    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    refresh();

    const say = (t) => { status.textContent = t; };
    const bad = (name, msg) => {
      const f = F[name]; if (!f) return false;
      f.closest('.field').classList.add('is-bad'); f.setAttribute('aria-invalid', 'true');
      const e = $('[data-err="' + name + '"]', form); if (e) e.textContent = msg;
      return false;
    };
    const clearErr = () => {
      $$('.field.is-bad', form).forEach((f) => f.classList.remove('is-bad'));
      $$('[aria-invalid]', form).forEach((f) => f.removeAttribute('aria-invalid'));
      $$('.err', form).forEach((e) => { e.textContent = ''; });
    };
    const validate = () => {
      clearErr();
      let ok = true, first = null;
      const fail = (n, m) => { bad(n, m); ok = false; if (!first) first = F[n]; };
      if (!val('nom')) fail('nom', 'Indiquez votre nom.');
      const digits = val('tel').replace(/\D/g, '');
      if (!val('tel')) fail('tel', 'Indiquez un numéro pour qu’on puisse vous rappeler.');
      else if (digits.length < 9) fail('tel', 'Ce numéro semble incomplet.');
      if (!val('lieu')) fail('lieu', 'Où se trouve le véhicule ?');
      if (!val('veh')) fail('veh', 'Choisissez un type de véhicule.');
      if (radio('quand') === 'Planifier' && !val('date')) { ok = false; say('Choisissez la date souhaitée, ou « Dès que possible ».'); if (!first) first = F.date; }
      else if (!ok) say('Il manque quelques informations pour envoyer la demande.');
      if (first) first.focus();
      return ok;
    };
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field'); if (f && f.classList.contains('is-bad')) { f.classList.remove('is-bad'); const er = $('.err', f); if (er) er.textContent = ''; }
    });

    const copy = async (text) => {
      try { await navigator.clipboard.writeText(text); return true; }
      catch (e) {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch (er) { ok = false; }
        ta.remove(); return ok;
      }
    };
    const ready = () => { stamp.textContent = 'Demande prête'; stamp.classList.add('is-ready'); };

    /* --- SMS depuis un ordinateur : QR code à scanner, le SMS s'ouvre déjà rédigé sur le téléphone --- */
    const qr = $('#qr');
    const qrHint = $('#qrHint');
    const closeQr = () => { if (qr && qr.open) qr.close(); };
    if (qr) {
      $('[data-qr-close]', qr).addEventListener('click', closeQr);
      qr.addEventListener('click', (e) => { if (e.target === qr) closeQr(); });
      qr.addEventListener('close', () => { lenis && lenis.start(); });
      $('#qrCopy').addEventListener('click', async () => {
        const ok = await copy($('#qrText').value);
        qrHint.textContent = ok ? 'Texte copié : collez-le dans un SMS au 06 28 15 23 67.' : 'Sélectionnez le texte ci-dessus pour le copier.';
        if (!ok) $('#qrText').select();
      });
    }
    function openQr(msg) {
      if (!qr || !qr.showModal) { say('Copiez la demande puis collez-la dans un SMS au 06 28 15 23 67, ou utilisez « Par e-mail ».'); return; }
      let svg = '';
      try {
        if (window.qrcode) {
          if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
          // format « SMSTO » : reconnu par les appareils photo Android et iPhone, texte non encodé donc QR plus léger
          const q = qrcode(0, 'L');
          q.addData('SMSTO:' + TEL + ':' + msg);
          q.make();
          svg = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
        }
      } catch (e) { svg = ''; }
      $('#qrBox').innerHTML = svg || '<p style="color:#111;padding:1rem;font-weight:600">Impossible de créer le QR code : copiez le texte ci-dessous.</p>';
      $('#qrText').value = msg;
      $('#qrOpen').href = smsUri(msg);
      qrHint.textContent = '';
      qr.showModal();
      lenis && lenis.stop();
    }

    $$('[data-send]').forEach((b) => b.addEventListener('click', () => {
      if (!validate()) return;
      const msg = message();
      ready();
      if (b.dataset.send === 'sms') {
        copy(msg); // en plus : le texte est copié, au cas où l'appli SMS ne reprendrait pas le message
        if (!isMobileUA) {
          say('Scannez le QR code avec votre téléphone : le SMS s’ouvre déjà rédigé, il ne reste qu’à l’envoyer.');
          openQr(msg);
          return;
        }
        say('Votre application SMS s’ouvre avec le message déjà rédigé : touchez simplement « Envoyer ».');
        setTimeout(() => { window.location.href = smsUri(msg); }, 150);
        setTimeout(() => {
          if (!document.hidden) say('Rien ne s’est ouvert ? Le texte est copié : ouvrez vos SMS, collez-le et envoyez-le au 06 28 15 23 67.');
        }, 2200);
      } else {
        const subject = 'Demande d’intervention – ' + radio('besoin') + ' – ' + val('nom');
        say('Votre messagerie s’ouvre avec la demande prête. Appuyez sur « Envoyer » : rien ne part avant.');
        window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg);
      }
    }));

    $('#copyBtn').addEventListener('click', async () => {
      if (!validate()) return;
      const ok = await copy(message());
      ready();
      say(ok ? 'Demande copiée : collez-la dans un SMS ou un message.' : 'Impossible de copier automatiquement : sélectionnez le texte du bon d’intervention.');
    });

    icsBtn.addEventListener('click', () => {
      if (!validate()) return;
      const d = val('date').split('-').map(Number);
      const h = (val('heure') || '09:00').split(':').map(Number);
      const start = new Date(d[0], d[1] - 1, d[2], h[0], h[1] || 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const p = (n) => String(n).padStart(2, '0');
      const loc = (x) => '' + x.getFullYear() + p(x.getMonth() + 1) + p(x.getDate()) + 'T' + p(x.getHours()) + p(x.getMinutes()) + '00';
      const utc = (x) => x.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      const esc = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MC Remorquage//Reservation//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT', 'UID:' + Date.now() + '@mc-remorquage', 'DTSTAMP:' + utc(new Date()),
        'DTSTART:' + loc(start), 'DTEND:' + loc(end),
        'SUMMARY:' + esc('MC Remorquage – ' + radio('besoin') + ' (à confirmer)'),
        'LOCATION:' + esc(val('lieu')),
        'DESCRIPTION:' + esc(message() + '\n\nCréneau souhaité, à confirmer avec MC Remorquage : 06 28 15 23 67'),
        'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Intervention MC Remorquage', 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = 'mc-remorquage-rdv.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      say('Fichier agenda téléchargé. Le créneau reste à confirmer par téléphone.');
    });

    $('#locBtn').addEventListener('click', () => {
      if (!navigator.geolocation) { say('La géolocalisation n’est pas disponible sur cet appareil : indiquez l’adresse à la main.'); return; }
      say('Recherche de votre position…');
      navigator.geolocation.getCurrentPosition((pos) => {
        const la = pos.coords.latitude.toFixed(5), lo = pos.coords.longitude.toFixed(5);
        F.lieu.value = 'Position GPS : https://maps.google.com/?q=' + la + ',' + lo;
        refresh(); say('Position ajoutée. Vous pouvez la compléter (route, repère…).');
      }, () => say('Position non obtenue (autorisation refusée ou signal faible) : indiquez l’adresse à la main.'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
    });

    // « Demander » sur une carte de service → présélectionne le besoin
    $$('[data-pick]').forEach((a) => a.addEventListener('click', () => {
      const r = form.querySelector('input[name="besoin"][value="' + a.dataset.pick + '"]');
      if (r) { r.checked = true; refresh(); }
    }));
  }

  /* ------------------------------------------------------------------
     5. Tout ce qui anime (GSAP / ScrollTrigger / Lenis)
     ------------------------------------------------------------------ */
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // relancé à la fin du préchargeur
  }

  function initSplitHeadings() {
    $$('[data-split]').forEach((el) => {
      const items = split(el, el.dataset.split);
      doc.classList.add('split-ready');
      gsap.set(items, { yPercent: 118 });
      if (el.closest('.hero')) return; // révélé par l'intro du hero
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(items, { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: el.dataset.split === 'chars' ? 0.03 : 0.07 })
      });
    });
    // pied de page : lettres géantes
    $$('.foot__giant span').forEach((s, k) => {
      const items = split(s, 'chars');
      gsap.set(items, { yPercent: 118 });
      ScrollTrigger.create({
        trigger: '.foot__giant', start: 'top 92%', once: true,
        onEnter: () => gsap.to(items, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.045, delay: k * 0.2 })
      });
    });
  }

  function initPinned() {
    const mm = gsap.matchMedia();

    // --- Bureau : sections épinglées (histoire + services horizontaux)
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      doc.classList.add('pin-ok');

      /* Histoire pas à pas */
      const pin = $('.story__pin');
      const steps = $$('.step');
      const D = steps.length;
      const rail = { line: $('.rail__line i'), truck: $('.rail__truck'), labels: $$('.rail li') };
      const railLen = () => Math.max(0, $('.rail__line').offsetWidth - rail.truck.getBoundingClientRect().width);
      gsap.set(steps.slice(1), { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin, start: 'top top', end: () => '+=' + Math.round(window.innerHeight * D * 0.9),
          pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.min(D - 1, Math.floor(self.progress * D + 0.12)))
        }
      });
      tl.to(rail.line, { scaleX: 1, ease: 'none', duration: D }, 0)
        .to(rail.truck, { x: railLen, ease: 'none', duration: D }, 0);
      steps.forEach((s, i) => {
        const kids = $$('.step__text > *', s);
        const media = $('.step__media', s);
        const tin = i - 0.28, tout = i + 1 - 0.34;
        if (i > 0) {
          tl.set(s, { autoAlpha: 1 }, tin)
            .fromTo(media, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power3.out' }, tin)
            .fromTo(kids, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' }, tin + 0.04);
        }
        if (i < D - 1) {
          tl.to(kids, { y: -60, opacity: 0, duration: 0.3, stagger: 0.02, ease: 'power2.in' }, tout)
            .to(media, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.3, ease: 'power2.in' }, tout)
            .set(s, { autoAlpha: 0 }, tout + 0.34);
        }
      });
      const vid = $('.step__media--video video');
      let current = -1;
      function setActive(i) {
        if (i === current) return;
        current = i;
        rail.labels.forEach((l, k) => l.classList.toggle('is-on', k <= i));
        if (vid) { if (i === 1) { loadVideo(vid); vid.play().catch(() => {}); } else vid.pause(); }
      }
      setActive(0);

      /* Services : défilement horizontal piloté par le scroll vertical */
      const sPin = $('.services__pin');
      const track = $('#servicesTrack');
      const head = $('.services__head');
      const dist = () => Math.max(0, track.scrollWidth - (window.innerWidth - head.offsetWidth));
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sPin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true }
      });
      $$('.card__img', track).forEach((img) => {
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: sPin, start: 'top top', end: () => '+=' + dist(), scrub: true } });
      });

      return () => doc.classList.remove('pin-ok');
    });

    // --- Mobile / mouvement réduit : mise en page simple, révélations douces
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      $$('.step').forEach((s) => {
        gsap.from($$('.step__text > *', s), { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 82%', once: true } });
        gsap.fromTo($('.step__media', s), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 72%', once: true } });
      });
      const vid = $('.step__media--video video');
      if (vid && 'IntersectionObserver' in window) {
        new IntersectionObserver((en) => {
          if (en[0].isIntersecting) { loadVideo(vid); vid.play().catch(() => {}); } else vid.pause();
        }, { threshold: 0.35 }).observe(vid);
      }
    });
  }

  function loadVideo(v) {
    if (!v || v.dataset.loaded || !v.dataset.src) return;
    v.src = v.dataset.src; v.dataset.loaded = '1'; v.load();
  }

  function initReveals() {
    const hidden = '.kicker:not(.hero__kicker), .lead, .services__sub, .zlist li, .zones__note, .find__list li, .hours, .acc__item, .rcard, .stat, .rate, .ticket__paper, .form > *, .foot__col, .foot__slogan, .cta__sub, .cta__phone, .find .btn';
    const els = $$(hidden).filter((e) => !e.closest('.hero') && !e.closest('.services__track'));
    gsap.set(els, { opacity: 0, y: 44 });
    ScrollTrigger.batch(els, {
      start: 'top 92%', once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, overwrite: 'auto' })
    });
    // galerie : révélation par masque (cercle qui s'ouvre) + parallaxe interne
    $$('.g').forEach((g) => {
      gsap.fromTo(g, { clipPath: 'circle(0% at 50% 55%)' }, {
        clipPath: 'circle(78% at 50% 55%)', duration: 1.5, ease: 'expo.out',
        scrollTrigger: { trigger: g, start: 'top 90%', once: true },
        onComplete: () => gsap.set(g, { clearProps: 'clipPath' })
      });
      gsap.fromTo($('img', g), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // cartes services (hors épinglage) : apparition douce
    if (!doc.classList.contains('pin-ok')) {
      gsap.from('.services__track .card', { opacity: 0, x: 60, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.services__track', start: 'top 88%', once: true } });
    }
  }

  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const fmt = (v) => v.toFixed(dec).replace('.', ',');
      const o = { v: 0 };
      el.textContent = fmt(0);
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } })
      });
    });
  }

  function initParallax() {
    const hero = $('.hero');
    gsap.to('[data-hero-media]', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('[data-hero-giant]', { yPercent: -34, xPercent: -6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__inner', { yPercent: -10, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 20%', scrub: true } });
    gsap.fromTo('.hero__media > *', { scale: 1.02 }, { scale: 1.13, duration: 22, ease: 'none', repeat: -1, yoyo: true });
    // fond de l'appel final
    const bg = $('[data-parallax-bg]');
    if (bg) gsap.fromTo(bg, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: bg.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    // Ken Burns lent sur la vidéo d'histoire
    const kb = $('.step__media--video video');
    if (kb) gsap.fromTo(kb, { scale: 1.02 }, { scale: 1.14, duration: 16, ease: 'none', repeat: -1, yoyo: true });
    // parallaxe à la souris (bureau)
    if (fine) {
      const gx = gsap.quickTo('[data-hero-giant]', 'x', { duration: 1.4, ease: 'power3' });
      const mx = gsap.quickTo('[data-hero-media]', 'x', { duration: 1.8, ease: 'power3' });
      hero.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        gx(nx * -60); mx(nx * 24);
      });
    }
  }

  function initMarquees() {
    const items = $$('[data-marquee]').map((m) => {
      const track = $('.marquee__track', m);
      const base = track.innerHTML;
      const k = track.children.length;
      const state = { track, dir: Number(m.dataset.marquee) || -1, x: 0, loop: 1, vis: true, set: gsap.quickSetter(track, 'x', 'px') };
      const build = () => {
        track.innerHTML = base;
        const w = track.scrollWidth;
        const n = Math.max(3, Math.ceil((window.innerWidth * 1.4) / w) + 1);
        track.innerHTML = new Array(n + 1).join(base);
        state.loop = track.children[k].offsetLeft - track.children[0].offsetLeft;
      };
      build();
      let rt;
      window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 250); });
      if ('IntersectionObserver' in window) new IntersectionObserver((e) => { state.vis = e[0].isIntersecting; }).observe(m);
      return state;
    });
    let lastY = window.scrollY, vel = 0, sign = 1, mul = 1;
    gsap.ticker.add((time, dtMs) => {
      const dt = Math.min(dtMs, 60) / 1000;
      const y = window.scrollY;
      const v = (y - lastY) / Math.max(dt, 0.001);
      lastY = y;
      vel += (v - vel) * 0.12;
      if (Math.abs(vel) > 40) sign += ((vel > 0 ? 1 : -1) - sign) * 0.08;
      mul += ((1 + Math.min(Math.abs(vel) / 260, 5)) - mul) * 0.1;
      items.forEach((s) => {
        if (!s.vis) return;
        s.x += s.dir * sign * 70 * mul * dt;
        if (s.x <= -s.loop) s.x += s.loop;
        if (s.x >= 0) s.x -= s.loop;
        s.set(s.x);
      });
    });
  }

  function initTilt() {
    if (!fine) return;
    $$('.tilt').forEach((el) => {
      gsap.set(el, { transformPerspective: 1000 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 10); rx(-(py - 0.5) * 10);
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  function initMagnets() {
    if (!fine) return;
    $$('.mag').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: 0.7, ease: 'elastic.out(1,0.55)' });
      const yTo = gsap.quickTo(b, 'y', { duration: 0.7, ease: 'elastic.out(1,0.55)' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.38);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  function initCursor() {
    if (!fine) return;
    const cur = $('.cursor');
    if (!cur) return;
    doc.classList.add('has-cursor');
    const cx = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); cur.style.opacity = '1'; }, { passive: true });
    document.addEventListener('pointerleave', () => { cur.style.opacity = '0'; });
    document.addEventListener('pointerover', (e) => {
      cur.classList.toggle('is-hover', !!e.target.closest('a,button,.card,.g,.rcard,input,select,textarea,label'));
    });
  }

  /* ------------------------------------------------------------------
     6. Préchargeur + intro du hero
     ------------------------------------------------------------------ */
  function startHeroVideo() {
    const v = $('#heroVideo');
    if (!v || reduce) return;
    const c = navigator.connection || {};
    if (c.saveData || /(^|-)(2|3)g$/.test(c.effectiveType || '')) return; // économie de données : image seule
    const hd = window.innerWidth >= 1100 && (!c.effectiveType || c.effectiveType === '4g');
    v.src = hd ? v.dataset.srcHd : v.dataset.srcSd;
    v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
    const p = v.play(); if (p && p.catch) p.catch(() => {});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((e) => { if (e[0].isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.05 }).observe(v);
    }
  }

  function heroIntro() {
    const title = $('.hero__title');
    const items = splits.get(title) || [];
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(items, { yPercent: 0, duration: 1.5, stagger: 0.04 }, 0)
      .to('.hero__kicker', { opacity: 1, y: 0, duration: 1.1 }, 0.25)
      .to('.hero__lead', { opacity: 1, y: 0, duration: 1.1 }, 0.6)
      .to('.hero__ctas', { opacity: 1, y: 0, duration: 1.1 }, 0.72)
      .to('.hero__trust', { opacity: 1, y: 0, duration: 1.1 }, 0.84)
      .to('.hero__rating', { opacity: 1, y: 0, duration: 1.1 }, 0.95)
      .to('.hero__zones', { opacity: 1, y: 0, duration: 1.1 }, 1.0)
      .from('[data-hero-giant]', { xPercent: 14, opacity: 0, duration: 2.2 }, 0);
  }

  function runLoader(done) {
    const loader = $('#loader');
    if (!loader) { done(); return; }
    const count = $('#loaderCount'), bar = $('#loaderBar');
    const slats = $$('.loader__slats i'), core = $('.loader__core');
    const o = { v: 0 };
    const upd = () => { count.textContent = String(Math.round(o.v)).padStart(3, '0'); bar.style.transform = 'scaleX(' + o.v / 100 + ')'; };
    gsap.from(core, { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out' });
    gsap.to(o, { v: 72, duration: 1.1, ease: 'power2.out', onUpdate: upd });
    const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
    const posterReady = new Promise((r) => { const i = $('.hero__poster'); if (!i || i.complete) r(); else { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); } });
    Promise.race([
      Promise.all([fontsReady, posterReady, new Promise((r) => setTimeout(r, 1300))]),
      new Promise((r) => setTimeout(r, 3600))
    ]).then(() => {
      gsap.to(o, {
        v: 100, duration: 0.55, ease: 'power2.inOut', overwrite: true, onUpdate: upd,
        onComplete: () => {
          const ex = gsap.timeline({ onComplete: () => { loader.style.display = 'none'; } });
          ex.to(core, { y: -50, opacity: 0, duration: 0.55, ease: 'power3.in' })
            .to(slats, { scaleY: 0, duration: 1.1, ease: 'expo.inOut', stagger: { each: 0.075, from: 'random' } }, '-=0.15')
            .add(done, '-=0.85');
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Démarrage
     ------------------------------------------------------------------ */
  function boot() {
    safe('nav', initNav);
    safe('menu', initMenu);
    safe('accordion', initAccordion);
    safe('reviews', initReviews);
    safe('lightbox', initLightbox);
    safe('booking', initBooking);

    if (!hasGsap || reduce) {
      // version allégée : tout est visible, aucune animation lourde
      doc.classList.add('show-all');
      $$('.js-hide').forEach((e) => { e.style.opacity = 1; e.style.transform = 'none'; });
      safe('map', initZonesMap);
      safe('anchors', initAnchors);
      const l = $('#loader'); if (l) l.style.display = 'none';
      clearTimeout(safetyTimer);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    safe('lenis', initLenis);
    safe('anchors', initAnchors);
    safe('split', initSplitHeadings);
    safe('pinned', initPinned);
    safe('map', initZonesMap);
    safe('reveals', initReveals);
    safe('counters', initCounters);
    safe('parallax', initParallax);
    safe('marquees', initMarquees);
    safe('tilt', initTilt);
    safe('magnets', initMagnets);
    safe('cursor', initCursor);

    const start = () => {
      clearTimeout(safetyTimer);
      safe('hero', heroIntro);
      safe('herovideo', startHeroVideo);
      lenis && lenis.start();
      ScrollTrigger.refresh();
    };
    safe('loader', () => runLoader(start));
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
