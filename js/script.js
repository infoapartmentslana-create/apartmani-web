const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const menuBackdrop = document.getElementById("menuBackdrop");
const year = document.getElementById("year");
let isMenuOpen = false;
let hideTimer = null;
let isAdminMode = false;

/* ADMIN LOGIN */

const ADMIN_PASSWORD = "1234"; // promijeni u svoju lozinku

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o') {

    if (!isAdminMode) {

      const entered = prompt("Admin password:");

      if (entered === ADMIN_PASSWORD) {
        isAdminMode = true;
        alert("Admin mode ON");
        document.dispatchEvent(new CustomEvent('adminModeChanged'));
      } else {
        alert("Wrong password");
      }

    } else {

      isAdminMode = false;
      alert("Admin mode OFF");
      document.dispatchEvent(new CustomEvent('adminModeChanged'));

    }

  }
});

if (year) year.textContent = new Date().getFullYear();

if (burger && nav) {
  burger.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    isMenuOpen = nav.classList.contains("is-open");

    if (isMenuOpen) {
      clearTimeout(hideTimer);
      showHeader();
      menuBackdrop?.classList.add("is-visible");
    } else {
      resetHideTimer();
      menuBackdrop?.classList.remove("is-visible");
    }
  });

  // klik na link zatvara meni
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      isMenuOpen = false;
      menuBackdrop?.classList.remove("is-visible");
      resetHideTimer();
    });
  });
}

// klik izvan menija (na backdrop) zatvara meni
menuBackdrop?.addEventListener("click", () => {
  nav?.classList.remove("is-open");
  isMenuOpen = false;
  menuBackdrop.classList.remove("is-visible");
  resetHideTimer();
});

/* HERO background slider */
const slides = document.querySelectorAll(".hero__bgslide");
let current = 0;

if (slides.length > 1) {
  setInterval(() => {
    slides[current].classList.remove("is-active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("is-active");
  }, 5000);
}

/* CINEMATIC SCROLL: parallax + fade/slide tekst (NO FREEZE) */
const heroSlider = document.querySelector(".hero__bgslider");
const heroPanel = document.getElementById("heroPanel");
const heroSection = document.querySelector(".hero");

let ticking = false;

function cinematicScroll() {
  if (!heroSection) return;

  const rect = heroSection.getBoundingClientRect();
  const heroHeight = heroSection.offsetHeight || 1;

  const progress = Math.min(Math.max(-rect.top / (heroHeight * 0.9), 0), 1);

  if (heroSlider) {
    // progress ide 0 -> 1 dok scrollaš kroz hero
    const translateY = progress * 60;

    // zoom-out: 1.08 na vrhu, prema 1.00 kako ideš dolje
    const scale = 1.08 - (progress * 0.08);

    heroSlider.style.transform = `translateY(${translateY}px) scale(${scale})`;
  }

  if (heroPanel) {
    const translate = progress * 28;
    const opacity = 1 - progress * 0.85;

    // Blur zna biti GPU-heavy i može trzat/zamrznut na slabijim uređajima,
    // zato ga gasimo (ili stavi na max 1px ako baš želiš):
    heroPanel.style.transform = `translateY(${translate}px)`;
    heroPanel.style.opacity = `${opacity}`;
    heroPanel.style.filter = `blur(0px)`;
  }

  /* DYNAMIC HEADER GLASS */
  const headerEl = document.querySelector(".header");
  if (headerEl) {
    const y = window.scrollY;

    // blur raste kako scrollaš
    const blur = Math.min(22, 10 + y * 0.03);

    // background postaje malo jači
    const bg = Math.min(0.85, 0.68 + y * 0.0006);

    headerEl.style.setProperty("--header-blur", `${blur}px`);
    headerEl.style.setProperty("--header-bg", bg);
  }
}

function onCinematicScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      cinematicScroll();
      ticking = false;
    });
  }
}

// init + 1 scroll listener
cinematicScroll();
window.addEventListener("scroll", onCinematicScroll, { passive: true });


/* HEADER: show only on scroll DOWN, hide on scroll UP or inactivity */

const header = document.querySelector(".header");

let lastY = window.scrollY;
let isHoveringHeader = false;

const SHOW_AFTER_Y = 10;     // minimalni scroll da počne raditi
const HIDE_AFTER_MS = 2500;  // nakon koliko mirovanja se sakrije

function showHeader() {
  if (!header) return;
  header.classList.add("header--visible");
}

function hideHeader() {
  if (!header) return;
  if (isHoveringHeader || isMenuOpen) return;
  header.classList.remove("header--visible");
}

function resetHideTimer() {
  clearTimeout(hideTimer);

  // ako je miš na headeru -> ne sakrivaj
  if (isHoveringHeader || isMenuOpen) return;

  hideTimer = setTimeout(() => {
    // provjera još jednom, za svaki slučaj
    if (!isHoveringHeader) hideHeader();
  }, HIDE_AFTER_MS);
}


function onHeaderScroll() {
  if (!header) return;

  const y = window.scrollY;
  const goingDown = y > lastY;
  const goingUp = y < lastY;

  // ako ideš GORE -> pokaži header (da korisnik može navigaciju)
  if (goingUp && y > SHOW_AFTER_Y) {
    showHeader();
    resetHideTimer(); // nakon mirovanja opet nestane
    lastY = y;
    return;
  }

  // ako ideš DOLJE -> pokaži (ali tek nakon malog pomaka)
  if (goingDown && y > SHOW_AFTER_Y) {
    showHeader();
    resetHideTimer(); // kad staneš -> sakrije se
  }

  lastY = y;
}

// na učitavanju neka bude skriven
hideHeader();
// LOCK: dok je miš na headeru, ne skrivaj ga
if (header) {
  header.addEventListener("mouseenter", () => {
    isHoveringHeader = true;
    clearTimeout(hideTimer);
    showHeader(); // da bude sigurno vidljiv dok hoveraš
  });

  header.addEventListener("mouseleave", () => {
    isHoveringHeader = false;
    resetHideTimer(); // kad izađe miš, opet kreni timer
  });
}

window.addEventListener("scroll", onHeaderScroll, { passive: true });

// Reveal on scroll (IntersectionObserver)
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // If user prefers reduced motion, show everything immediately
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => io.observe(el));
})();

// Reviews slider prev/next
(() => {
  const track = document.getElementById('revTrack');
  if (!track) return;
  const btnPrev = document.querySelector('.revSlider__btn--prev');
  const btnNext = document.querySelector('.revSlider__btn--next');
  const scrollBy = 340;
  btnPrev && btnPrev.addEventListener('click', () => {
    track.scrollBy({ left: -scrollBy, behavior: 'smooth' });
  });
  btnNext && btnNext.addEventListener('click', () => {
    track.scrollBy({ left: scrollBy, behavior: 'smooth' });
  });
})();

/* =========================
   Calendar modal (A1/A2/A3) — redesign
   Price + busy days, saved in localStorage
   Constrained to current year only
   ========================= */
(() => {
  const modal    = document.getElementById('calendarModal');
  if (!modal) return;

  const panel        = document.getElementById('cmPanel');
  const cmAptSpan    = document.getElementById('cmAptSpan');
  const cmMonthLabel = document.getElementById('cmMonthLabel');
  const cmGrid       = document.getElementById('cmGrid');
  const btnPrev      = document.getElementById('cmPrev');
  const btnNext      = document.getElementById('cmNext');
  const cmAdminBar   = document.getElementById('cmAdminBar');
  const cmHint       = document.getElementById('cmHint');
  const btnBlock     = document.getElementById('cmBlockMonth');

  // Price popup elements
  const pricePopup   = document.getElementById('cmPricePopup');
  const priceDayEl   = document.getElementById('cmPriceDay');
  const priceInput   = document.getElementById('cmPriceVal');
  const btnPriceSave = document.getElementById('cmPriceSave');
  const btnPriceCancel = document.getElementById('cmPriceCancel');

  const openers = document.querySelectorAll('[data-open-calendar]');
  const closers = document.querySelectorAll('[data-close-calendar]');

  // ── State ──────────────────────────────────
  const YEAR = new Date().getFullYear(); // locked to current year
  let currentApt = 'a1';
  let viewMonth  = new Date().getMonth(); // 0-11
  let priceKey   = null; // key being edited in price popup

  const aptMeta = {
    a1: { span: 'Sunrise' },
    a2: { span: 'Olive'   },
    a3: { span: 'Sky'     },
  };

  const monthNames = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj',
                      'Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];
  const dayNames   = ['1.','2.','3.','4.','5.','6.','7.','8.','9.','10.',
                      '11.','12.','13.','14.','15.','16.','17.','18.','19.','20.',
                      '21.','22.','23.','24.','25.','26.','27.','28.','29.','30.','31.'];

  // ── Storage ────────────────────────────────
  const storageKey = (id) => `aptCalendar:${id}`;
  function loadData(id) {
    try { return JSON.parse(localStorage.getItem(storageKey(id)) || '{}'); }
    catch { return {}; }
  }
  function saveData(id, data) {
    localStorage.setItem(storageKey(id), JSON.stringify(data));
  }

  function pad2(n) { return String(n).padStart(2,'0'); }
  function ymd(m, d) { return `${YEAR}-${pad2(m+1)}-${pad2(d)}`; }

  // ── Block entire month ─────────────────────
  function isMonthFullyBlocked() {
    const data = loadData(currentApt);
    const days = new Date(YEAR, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      if (!data[ymd(viewMonth, d)]?.busy) return false;
    }
    return true;
  }

  function updateBlockBtn() {
    if (!btnBlock) return;
    btnBlock.textContent = isMonthFullyBlocked()
      ? 'Odblokiraj cijeli mjesec'
      : 'Blokiraj cijeli mjesec';
  }

  function toggleBlockMonth() {
    const data = loadData(currentApt);
    const days = new Date(YEAR, viewMonth + 1, 0).getDate();
    const shouldBlock = !isMonthFullyBlocked();
    for (let d = 1; d <= days; d++) {
      const key = ymd(viewMonth, d);
      const cur = data[key] || { price: null, busy: false };
      cur.busy = shouldBlock;
      data[key] = cur;
    }
    saveData(currentApt, data);
    render();
  }

  // ── Price popup ────────────────────────────
  function openPricePopup(key, dayNum) {
    if (!pricePopup) return;
    const data = loadData(currentApt);
    const cur  = data[key] || { price: null, busy: false };
    priceKey = key;
    if (priceDayEl) priceDayEl.textContent = `${dayNum}. ${monthNames[viewMonth].toLowerCase()} ${YEAR}`;
    if (priceInput) { priceInput.value = cur.price ?? ''; }
    pricePopup.hidden = false;
    priceInput?.focus();
  }

  function closePricePopup() {
    if (pricePopup) pricePopup.hidden = true;
    priceKey = null;
  }

  function savePricePopup() {
    if (!priceKey) { closePricePopup(); return; }
    const data = loadData(currentApt);
    const cur  = data[priceKey] || { price: null, busy: false };
    const val  = String(priceInput?.value ?? '').trim();
    cur.price  = val === '' ? null : Number(val);
    if (cur.price !== null && Number.isNaN(cur.price)) { closePricePopup(); return; }
    data[priceKey] = cur;
    saveData(currentApt, data);
    closePricePopup();
    render();
  }

  btnPriceSave?.addEventListener('click', savePricePopup);
  btnPriceCancel?.addEventListener('click', closePricePopup);
  priceInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') savePricePopup();
    if (e.key === 'Escape') closePricePopup();
  });

  // ── Render ─────────────────────────────────
  function render() {
    if (!cmGrid) return;
    closePricePopup();

    const data       = loadData(currentApt);
    const today      = new Date();
    const isThisYear = today.getFullYear() === YEAR;
    const todayKey   = isThisYear ? ymd(today.getMonth(), today.getDate()) : null;

    // Month label
    if (cmMonthLabel) cmMonthLabel.textContent = `${monthNames[viewMonth]} ${YEAR}`;

    // Disable nav at year boundaries
    if (btnPrev) btnPrev.disabled = (viewMonth === 0);
    if (btnNext) btnNext.disabled = (viewMonth === 11);

    // Admin controls
    if (cmAdminBar) cmAdminBar.hidden = !isAdminMode;
    if (cmHint)     cmHint.style.display = isAdminMode ? '' : 'none';
    updateBlockBtn();

    // Build grid
    cmGrid.innerHTML = '';
    const first      = new Date(YEAR, viewMonth, 1);
    const daysInMonth = new Date(YEAR, viewMonth + 1, 0).getDate();
    const startIndex  = (first.getDay() + 6) % 7; // Mon=0
    const totalCells  = Math.ceil((startIndex + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNum  = i - startIndex + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;

      const cell = document.createElement('div');
      cell.className = 'cmCell';

      if (!inMonth) {
        cell.classList.add('cmCell--out');
        cmGrid.appendChild(cell);
        continue;
      }

      const key  = ymd(viewMonth, dayNum);
      const info = data[key] || { price: null, busy: false };
      const isToday = (key === todayKey);

      if (info.busy)  cell.classList.add('cmCell--busy');
      if (isToday)    cell.classList.add('cmCell--today');
      // Weekend (Saturday=col6, Sunday=col7)
      const colPos = (startIndex + dayNum - 1) % 7; // 0=Mon … 6=Sun
      if (colPos === 5 || colPos === 6) cell.classList.add('cmCell--weekend');

      // Price only shown when day is NOT busy
      const priceText = (!info.busy && info.price != null && info.price !== '') ? `${info.price}€` : '';

      cell.innerHTML = `
        <span class="cmCell__num">${dayNum}</span>
        ${priceText ? `<span class="cmCell__price">${priceText}</span>` : ''}
        ${info.busy ? '<span class="cmCell__status">Zauzeto</span>' : ''}
      `;

      if (isAdminMode) {
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.title = 'Desni klik: zauzeto/slobodno · 2× klik: postavi cijenu';

        // Right click: toggle busy (clears price when marking busy)
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          const fresh = loadData(currentApt);
          const cur   = fresh[key] || { price: null, busy: false };
          cur.busy    = !cur.busy;
          if (cur.busy) cur.price = null;
          fresh[key]  = cur;
          saveData(currentApt, fresh);
          render();
        });

        // Double click: open price popup
        cell.addEventListener('dblclick', () => {
          openPricePopup(key, dayNum);
        });

        // Keyboard: Enter/Space toggles busy
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const fresh = loadData(currentApt);
            const cur   = fresh[key] || { price: null, busy: false };
            cur.busy    = !cur.busy;
            if (cur.busy) cur.price = null;
            fresh[key]  = cur;
            saveData(currentApt, fresh);
            render();
          }
        });
      }

      cmGrid.appendChild(cell);
    }
  }

  // ── Open / Close ───────────────────────────
  function openModal(e) {
    const card  = e?.currentTarget?.closest('.apt');
    const aptId = (card?.getAttribute('data-gallery') || 'a1').toLowerCase();
    currentApt  = ['a1','a2','a3'].includes(aptId) ? aptId : 'a1';

    // Apply apartment accent class
    if (panel) {
      panel.classList.remove('cm--a1','cm--a2','cm--a3');
      panel.classList.add(`cm--${currentApt}`);
    }

    // Apartment name span
    if (cmAptSpan) cmAptSpan.textContent = aptMeta[currentApt]?.span || '';

    // Start at current month
    viewMonth = new Date().getMonth();

    render();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    closePricePopup();
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btnPrev?.addEventListener('click', () => { if (viewMonth > 0)  { viewMonth--; render(); } });
  btnNext?.addEventListener('click', () => { if (viewMonth < 11) { viewMonth++; render(); } });
  btnBlock?.addEventListener('click', toggleBlockMonth);

  document.addEventListener('adminModeChanged', () => {
    if (modal.classList.contains('is-open')) render();
  });

  openers.forEach(btn => btn.addEventListener('click', openModal));
  closers.forEach(btn => btn.addEventListener('click', closeModal));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Otvaranje iz detalja modala (zna koji apartman)
  document.addEventListener('openCalendarFor', (e) => {
    const aptId = e.detail?.aptId || 'a1';
    currentApt = ['a1','a2','a3'].includes(aptId) ? aptId : 'a1';
    if (panel) {
      panel.classList.remove('cm--a1','cm--a2','cm--a3');
      panel.classList.add(`cm--${currentApt}`);
    }
    if (cmAptSpan) cmAptSpan.textContent = aptMeta[currentApt]?.span || '';
    viewMonth = new Date().getMonth();
    render();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
})();

/* =========================
   Generic gallery modal (all apartments)
   ========================= */
(() => {
  const modal = document.getElementById('galleryModal');
  if (!modal) return;

  const imgEl = document.getElementById('galleryImg');
  const metaEl = document.getElementById('galleryMeta');
  const titleEl = modal.querySelector('#galleryTitle');

  const closeEls = modal.querySelectorAll('[data-close-gallery]');
  const prevBtn = modal.querySelector('[data-gallery-prev]');
  const nextBtn = modal.querySelector('[data-gallery-next]');

  // Svi apartmani koji imaju galeriju
  const cards = Array.from(document.querySelectorAll('[data-gallery]'));

  // Trenutno otvorena galerija
  let sources = [];
  let index = 0;

  function render() {
    if (!sources.length) return;
    imgEl.src = sources[index];
    imgEl.alt = `${titleEl?.textContent || 'Galerija'} — slika ${index + 1} od ${sources.length}`;
    if (metaEl) metaEl.textContent = `${index + 1} / ${sources.length}`;
  }

  function openGallery(opts) {
    sources = opts.sources || [];
    index = Math.max(0, Math.min(opts.index ?? 0, sources.length - 1));
    if (titleEl && opts.title) titleEl.textContent = opts.title;

    render();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeGallery() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    imgEl.src = '';
    sources = [];
    index = 0;
  }

  function prev() {
    if (!sources.length) return;
    index = (index - 1 + sources.length) % sources.length;
    render();
  }

  function next() {
    if (!sources.length) return;
    index = (index + 1) % sources.length;
    render();
  }

  // Bind close/prev/next
  closeEls.forEach(el => el.addEventListener('click', closeGallery));
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  // Tipkovnica
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

   // Klik na sliku -> next (zgodno na mobu)
  imgEl?.addEventListener('click', next);

  /* =========================
     Pinch-zoom disable (iOS) + Drag swipe (inertia feel)
     ========================= */
  const stage = modal.querySelector('.galleryModal__stage');
  if (stage) {
    // iOS Safari gesture events (pinch)
    stage.addEventListener('gesturestart', (e) => e.preventDefault());
    stage.addEventListener('gesturechange', (e) => e.preventDefault());
    stage.addEventListener('gestureend', (e) => e.preventDefault());

    // drag state
    let isDown = false;
    let startX = 0;
    let lastX = 0;
    let dx = 0;

    const THRESHOLD = 60; // px koliko treba povući da prebaci sliku

    function setTranslate(x) {
      imgEl.style.transform = `translateX(${x}px)`;
    }

    function animateBack() {
      imgEl.style.transition = 'transform 180ms ease';
      setTranslate(0);
      window.setTimeout(() => {
        imgEl.style.transition = '';
      }, 190);
    }

    function animateOut(dir, cb) {
      // dir: -1 = lijevo (next), +1 = desno (prev)
      const outX = dir * 180;
      imgEl.style.transition = 'transform 140ms ease';
      setTranslate(outX);
      window.setTimeout(() => {
        imgEl.style.transition = '';
        setTranslate(0);
        cb?.();
      }, 150);
    }

    stage.addEventListener('pointerdown', (e) => {
      // ✅ AKO SI KLIKNUO NA STRELICU ILI X (close) -> NE KREĆI DRAG, PUSTI KLIK
      if (e.target.closest('[data-gallery-prev],[data-gallery-next],[data-close-gallery]')) return;

      if (!modal.classList.contains('is-open')) return;
      isDown = true;
      startX = e.clientX;
      lastX = startX;
      dx = 0;

      // “capture” pointer da drag radi i ako prst malo izađe van elementa
      stage.setPointerCapture?.(e.pointerId);
    });

    stage.addEventListener('pointermove', (e) => {
      if (e.target.closest('[data-gallery-prev],[data-gallery-next],[data-close-gallery]')) return; // ✅ ovo dodaj
      if (!isDown) return;
      lastX = e.clientX;
      dx = lastX - startX;

      const damped = dx * 0.9;
      setTranslate(damped);
    });

    function endDrag() {
      if (!isDown) return;
      isDown = false;

      if (Math.abs(dx) >= THRESHOLD) {
        if (dx < 0) {
          // povukao lijevo -> sljedeća
          animateOut(-1, next);
        } else {
          // povukao desno -> prethodna
          animateOut(1, prev);
        }
      } else {
        animateBack();
      }
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    // dodatno: blokiraj ctrl+wheel zoom dok je modal otvoren (desktop trackpad)
    stage.addEventListener('wheel', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.ctrlKey) e.preventDefault();
    }, { passive: false });
  }

  // Za svaki apartman: hero + thumbs otvaraju isti modal
  cards.forEach(card => {
    const title = card.getAttribute('data-gallery-title') || 'Galerija';
    const hero = card.querySelector('.apt__media > img');
    const thumbs = Array.from(card.querySelectorAll('.apt__thumbs img'));

    const aptId = card.getAttribute('data-gallery'); // "a1" / "a2" / "a3"
    const count = parseInt(card.getAttribute('data-gallery-count') || '0', 10);

    const generated = [];
    if (aptId) {
      generated.push(`images/apartmani/${aptId}/hero.jpg`);
      for (let i = 1; i <= count; i++) {
        generated.push(`images/apartmani/${aptId}/${i}.jpg`);
      }
    }

    const fallback = [
      hero?.getAttribute('src'),
      ...thumbs.map(t => t.getAttribute('src')),
    ].filter(Boolean);

    const cardSources = (generated.length > 1 ? generated : fallback).filter(Boolean);

    if (!cardSources.length) return;

    // Hero klik (otvori na 0)
    if (hero) {
      hero.style.cursor = 'pointer';
      hero.addEventListener('click', () => openGallery({ title, sources: cardSources, index: 0 }));
    }

    // Thumb klik (otvori na thumb indexu: +1 jer je hero 0)
    thumbs.forEach((t, i) => {
      t.style.cursor = 'pointer';
      t.addEventListener('click', () => openGallery({ title, sources: cardSources, index: i + 1 }));
    });
  });
})();

/* =========================
   Details modal (A1/A2/A3)
   ========================= */
(() => {
  const modal = document.getElementById('detailsModal');
  if (!modal) return;

  const openers = document.querySelectorAll('[data-open-details]');
  const closers = modal.querySelectorAll('[data-close-details]');

  // Panel element (gets dm--a1/a2/a3 class for theming)
  const panel = document.getElementById('dmPanel');

  // Elements inside modal we update
  const titleSpanEl  = modal.querySelector('#dmTitleSpan');
  const metaEl       = modal.querySelector('#dmMeta');
  const heroImg      = modal.querySelector('#dmHeroImg');
  const badgeEl      = modal.querySelector('#dmBadge');
  const leadEl       = modal.querySelector('#dmLead');
  const summaryEl    = modal.querySelector('#dmSummary');
  const equipmentEl  = modal.querySelector('#dmEquipment');
  const calBtn       = modal.querySelector('#dmCalBtn');

  let currentDetailsApt = 'a1';

  // Per-apartment content
  const DETAILS = {
    a1: {
      nameSpan: 'Sunrise',
      meta:    '40 m² · 1. kat · Bračni krevet + kauč na razvlačenje',
      badge:   'Otvoren horizont · terasa · tople boje zalaska',
      lead:    'Apartman Sunrise naglašava najljepši dio dana uz more — pogled, terasu i tople boje zalaska. Terasa je idealna za jutarnju kavu, večernje opuštanje i pogled koji ostaje u sjećanju.',
      summary: ['40 m² · 1. kat (7 stepenica)', 'Bračni krevet + kauč na razvlačenje', 'Terasa s pogledom na more'],
      equipment: [
        'Kuhinja s pećnicom, pločom i kuhalnom',
        'Kompletno posuđe i pribor',
        'Smart TV + klima uređaj',
        'Wi-Fi',
        'Kupaonica s tušem i ručnicima',
        'Terasa: stol i stolice',
        'Zajednički roštilj u dvorištu',
      ],
    },
    a2: {
      nameSpan: 'Olive',
      meta:    '40 m² · 1. kat · Bračni krevet + kauč na razvlačenje',
      badge:   'Mediteranski mir · udoban interijer · blizina plaže',
      lead:    'Apartman Olive donosi miran, prirodan ugođaj i udoban prostor za lagan odmor. Idealan je za goste koji žele jednostavnost, privatnost i sve potrebno nadohvat ruke.',
      summary: ['40 m² · 1. kat', 'Bračni krevet + kauč na razvlačenje', 'Vrtni prostor i pogled na maslinike'],
      equipment: [
        'Kuhinja s pećnicom, pločom i kuhalnom',
        'Kompletno posuđe i pribor',
        'Smart TV + klima uređaj',
        'Wi-Fi',
        'Kupaonica s tušem i ručnicima',
        'Terasa: stol i stolice',
        'Zajednički roštilj u dvorištu',
      ],
    },
    a3: {
      nameSpan: 'Sky',
      meta:    '40 m² · 2. kat · Bračni krevet · kauč na razvlačenje · krevet 90×200',
      badge:   'Prostran boravak · obiteljski odmor · morska svježina',
      lead:    'Apartman Sky pruža najviše prostora za obiteljski odmor uz more. Komotan raspored, dodatni ležajevi i prostrana terasa stvaraju svjež, opušten ritam ljetnih dana.',
      summary: ['40 m² · 2. kat', 'Bračni krevet + kauč na razvlačenje', 'Krevet 90×200', 'Terasa s pogledom na more'],
      equipment: [
        'Kuhinja s pločom i kuhalnom',
        'Kompletno posuđe i pribor',
        'TV + klima uređaj',
        'Wi-Fi',
        'Kupaonica s tušem i ručnicima',
        'Terasa: stol i stolice',
        'Zajednički roštilj u dvorištu',
      ],
    },
  };

  function setDetailsForApartment(card) {
    const aptId = (card?.getAttribute('data-gallery') || 'a1').toLowerCase();
    const cfg = DETAILS[aptId] || DETAILS.a1;
    currentDetailsApt = aptId;

    // Apartment accent class on panel
    if (panel) {
      panel.classList.remove('dm--a1', 'dm--a2', 'dm--a3');
      panel.classList.add(`dm--${aptId}`);
    }

    // Update calendar button text
    if (calBtn) calBtn.textContent = `Slobodni termini — ${cfg.nameSpan}`;

    // Title colored span
    if (titleSpanEl) titleSpanEl.textContent = cfg.nameSpan;

    // Hero image
    if (heroImg) {
      heroImg.src = `images/apartmani/${aptId}/hero.jpg`;
      heroImg.alt = `Apartman ${cfg.nameSpan}`;
    }

    // Texts
    if (metaEl)  metaEl.textContent  = cfg.meta;
    if (badgeEl) badgeEl.textContent = cfg.badge;
    if (leadEl)  leadEl.textContent  = cfg.lead;

    // Summary bullets
    if (summaryEl) {
      summaryEl.innerHTML = cfg.summary.map(s => `<li>${s}</li>`).join('');
    }

    // Equipment list
    if (equipmentEl) {
      equipmentEl.innerHTML = cfg.equipment.map(s => `<li>${s}</li>`).join('');
    }
  }

  function openModal(e){
    const btn = e?.currentTarget;
    const card = btn?.closest('.apt');
    if (card) setDetailsForApartment(card);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openers.forEach(btn => btn.addEventListener('click', openModal));
  closers.forEach(btn => btn.addEventListener('click', closeModal));

  calBtn?.addEventListener('click', () => {
    closeModal();
    document.dispatchEvent(new CustomEvent('openCalendarFor', { detail: { aptId: currentDetailsApt } }));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();
