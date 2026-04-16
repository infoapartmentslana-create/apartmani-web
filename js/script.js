/* =========================
   Inicijalizacija kalendara 2026 — sezona i cjenik
   Postavlja sve dane kao zauzete osim slobodnog perioda 13.6. – 13.9.2026.
   Unutar slobodnog perioda automatski su postavljene cijene po noći.
   Izvršava se samo jednom (flag u localStorage); admin može ručno
   mijenjati dostupnost i cijene u admin modu kao i obično.
   ========================= */
(() => {
  const INIT_FLAG = 'aptCalendarInit:2026v1';
  if (localStorage.getItem(INIT_FLAG)) return;

  function pad2(n) { return String(n).padStart(2, '0'); }
  function toKey(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  }

  // Slobodan period: 13.6. – 13.9.2026. (oba datuma uključena)
  const seasonStart = new Date(2026, 5, 13);
  const seasonEnd   = new Date(2026, 8, 13);

  // Cjenik po rasponima datuma
  const bands = [
    { from: new Date(2026, 5, 13), to: new Date(2026, 5, 20), price: 60 },
    { from: new Date(2026, 5, 21), to: new Date(2026, 5, 30), price: 70 },
    { from: new Date(2026, 6,  1), to: new Date(2026, 6, 11), price: 75 },
    { from: new Date(2026, 6, 12), to: new Date(2026, 6, 18), price: 80 },
    { from: new Date(2026, 6, 19), to: new Date(2026, 7, 15), price: 90 },
    { from: new Date(2026, 7, 16), to: new Date(2026, 7, 22), price: 80 },
    { from: new Date(2026, 7, 23), to: new Date(2026, 7, 31), price: 75 },
    { from: new Date(2026, 8,  1), to: new Date(2026, 8, 13), price: 65 },
  ];

  function getPrice(date) {
    for (const b of bands) {
      if (date >= b.from && date <= b.to) return b.price;
    }
    return null;
  }

  // Generiraj sve dane 2026. godine
  const data = {};
  const cursor = new Date(2026, 0, 1);
  const yearEnd = new Date(2026, 11, 31);
  while (cursor <= yearEnd) {
    const inSeason = cursor >= seasonStart && cursor <= seasonEnd;
    data[toKey(cursor)] = {
      busy:  !inSeason,
      price: inSeason ? getPrice(new Date(cursor)) : null,
    };
    cursor.setDate(cursor.getDate() + 1);
  }

  const payload = JSON.stringify(data);
  ['a1', 'a2', 'a3'].forEach(id => {
    localStorage.setItem(`aptCalendar:${id}`, payload);
  });

  localStorage.setItem(INIT_FLAG, '1');
})();

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

// Reviews slider — infinite loop
(() => {
  const track = document.getElementById('revTrack');
  if (!track) return;
  const btnPrev = document.querySelector('.revSlider__btn--prev');
  const btnNext = document.querySelector('.revSlider__btn--next');
  const scrollStep = 340;

  btnNext && btnNext.addEventListener('click', () => {
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    if (atEnd) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: scrollStep, behavior: 'smooth' });
    }
  });

  btnPrev && btnPrev.addEventListener('click', () => {
    const atStart = track.scrollLeft <= 8;
    if (atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    }
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

/* =========================
   Kontakt section — inline date-range picker
   Reads availability from same localStorage as the main calendar modal.
   Phase 1 = pick check-in, Phase 2 = pick check-out (must be >= check-in + 1 day).
   Dates after the first busy day following check-in are blocked for check-out.
   ========================= */
(() => {
  const aptSelect  = document.getElementById('ktAptSelect');
  const calLock    = document.getElementById('ktCalLock');
  const calInner   = document.getElementById('ktCalInner');
  const calGrid    = document.getElementById('ktCalGrid');
  const calLabel   = document.getElementById('ktCalLabel');
  const calPhase   = document.getElementById('ktCalPhase');
  const btnPrev    = document.getElementById('ktCalPrev');
  const btnNext    = document.getElementById('ktCalNext');
  const dateFromEl = document.getElementById('ktDateFrom');
  const dateToEl   = document.getElementById('ktDateTo');
  const summaryEl  = document.getElementById('ktSummary');
  const sumDatesEl = document.getElementById('ktSumDates');
  const sumNightsEl= document.getElementById('ktSumNights');
  const sumTotalEl = document.getElementById('ktSumTotal');
  const submitBtn  = document.getElementById('ktSubmitBtn');
  const successMsg = document.getElementById('ktSuccess');

  if (!aptSelect || !calGrid) return;

  // Default price per night per apartment (fallback when no custom price is set)
  const defaultPrices = { a1: 60, a2: 60, a3: 70 };

  const monthNames    = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj',
                         'Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];
  const monthGenitive = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja',
                         'srpnja','kolovoza','rujna','listopada','studenog','prosinca'];

  let currentApt  = null;
  let viewYear    = new Date().getFullYear();
  let viewMonth   = new Date().getMonth();
  let checkIn     = null;   // Date at midnight
  let checkOut    = null;   // Date at midnight
  let phase       = 1;      // 1 = picking check-in, 2 = picking check-out
  let hoverDate   = null;   // Date for range preview
  let maxCOut     = null;   // first busy day after checkIn (inclusive = valid check-out)

  // ── Helpers ──
  function storageKey(id) { return `aptCalendar:${id}`; }
  function loadData(id) {
    try { return JSON.parse(localStorage.getItem(storageKey(id)) || '{}'); }
    catch { return {}; }
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function toYmd(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  }
  function mkDate(y, m, d) {
    const dt = new Date(y, m, d);
    dt.setHours(0,0,0,0);
    return dt;
  }
  function today0() {
    const t = new Date();
    t.setHours(0,0,0,0);
    return t;
  }
  function fmtDate(date) {
    if (!date) return '';
    return `${date.getDate()}. ${monthGenitive[date.getMonth()]} ${date.getFullYear()}.`;
  }
  function isBusy(date) {
    if (!currentApt) return false;
    return loadData(currentApt)[toYmd(date)]?.busy === true;
  }

  // Find the first busy day strictly after `from`.
  // Returns that Date (it IS a valid check-out — guest leaves that morning).
  // Returns null if no busy day found in the next year.
  function findMaxCheckOut(from) {
    const data = loadData(currentApt);
    const d = new Date(from);
    d.setDate(d.getDate() + 1);
    const limit = new Date(from);
    limit.setFullYear(limit.getFullYear() + 1);
    while (d <= limit) {
      if (data[toYmd(d)]?.busy) return new Date(d);
      d.setDate(d.getDate() + 1);
    }
    return null;
  }

  // ── Phase label ──
  function updatePhase() {
    if (!calPhase) return;
    if (phase === 1 && !checkIn)  calPhase.textContent = 'Odaberite datum dolaska';
    else if (phase === 2)         calPhase.textContent = 'Odaberite datum odlaska';
    else                          calPhase.textContent = '';
  }

  // ── Calculate total price for selected range ──
  // Sums prices for nights: checkIn, checkIn+1, ..., checkOut-1
  function calcTotal() {
    if (!checkIn || !checkOut || !currentApt) return null;
    const data = loadData(currentApt);
    const defPrice = defaultPrices[currentApt] || 60;
    let total = 0;
    let nights = 0;
    const d = new Date(checkIn);
    while (d < checkOut) {
      const entry = data[toYmd(d)];
      const price = (entry?.price != null) ? Number(entry.price) : defPrice;
      total += price;
      nights++;
      d.setDate(d.getDate() + 1);
    }
    return { total, nights };
  }

  // ── Update summary row ──
  function updateSummary() {
    if (!summaryEl) return;
    if (!checkIn || !checkOut) {
      summaryEl.hidden = true;
      return;
    }
    const result = calcTotal();
    if (!result) { summaryEl.hidden = true; return; }

    const fmtShort = (date) => `${date.getDate()}. ${monthGenitive[date.getMonth()]}`;
    if (sumDatesEl)  sumDatesEl.textContent  = `${fmtShort(checkIn)} → ${fmtShort(checkOut)} ${checkOut.getFullYear()}.`;
    if (sumNightsEl) sumNightsEl.textContent = `${result.nights} ${result.nights === 1 ? 'noć' : result.nights < 5 ? 'noći' : 'noći'}`;
    if (sumTotalEl)  sumTotalEl.textContent  = `Ukupno: ${result.total}€`;
    summaryEl.hidden = false;
  }

  // ── Render ──
  function render() {
    if (!calGrid || !currentApt) return;

    const data   = loadData(currentApt);
    const todayD = today0();

    calLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    if (btnPrev) btnPrev.disabled = (viewYear === todayD.getFullYear() && viewMonth <= todayD.getMonth());
    if (btnNext) btnNext.disabled = false;
    updatePhase();

    calGrid.innerHTML = '';

    const first       = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startIdx    = (first.getDay() + 6) % 7;   // Mon = 0
    const totalCells  = Math.ceil((startIdx + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startIdx + 1;
      const cell   = document.createElement('div');
      cell.className = 'ktCell';

      if (dayNum < 1 || dayNum > daysInMonth) {
        cell.classList.add('ktCell--out');
        calGrid.appendChild(cell);
        continue;
      }

      const d      = mkDate(viewYear, viewMonth, dayNum);
      const key    = toYmd(d);
      const busy   = data[key]?.busy === true;
      const isPast = d < todayD;
      const isToday = d.getTime() === todayD.getTime();

      cell.dataset.date = key;

      if (isToday) cell.classList.add('ktCell--today');

      // Phase 2: block dates after first busy day following check-in
      const isBlocked = phase === 2 && checkIn && maxCOut && d > maxCOut;

      if (busy)      cell.classList.add('ktCell--busy');
      else if (isPast)    cell.classList.add('ktCell--past');
      else if (isBlocked) cell.classList.add('ktCell--blocked');

      // Selected / range
      const isCIn  = checkIn  && d.getTime() === checkIn.getTime();
      const isCOut = checkOut && d.getTime() === checkOut.getTime();
      const inRange = checkIn && checkOut && d > checkIn && d < checkOut;
      if (isCIn)   cell.classList.add('ktCell--selStart');
      if (isCOut)  cell.classList.add('ktCell--selEnd');
      if (inRange) cell.classList.add('ktCell--inRange');

      // Hover range preview (phase 2 only)
      if (phase === 2 && checkIn && hoverDate && !checkOut) {
        const validHover = hoverDate > checkIn && (!maxCOut || hoverDate <= maxCOut);
        if (validHover) {
          if (!isCIn && d.getTime() === hoverDate.getTime()) cell.classList.add('ktCell--previewEnd');
          if (d > checkIn && d < hoverDate)                  cell.classList.add('ktCell--inPreview');
        }
      }

      // Price display (free days only)
      const defPrice = defaultPrices[currentApt] || 60;
      const entry = data[key];
      const priceVal = (!busy && !isPast) ? ((entry?.price != null) ? Number(entry.price) : defPrice) : null;
      const priceHtml = priceVal != null ? `<span class="ktCell__pr">${priceVal}€</span>` : '';

      cell.innerHTML = `<span class="ktCell__num">${dayNum}</span>${priceHtml}`;
      calGrid.appendChild(cell);
    }

    updateSummary();
  }

  // ── Day click handler ──
  function handleClick(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setHours(0,0,0,0);

    if (isBusy(d) || d < today0()) return;

    if (phase === 1) {
      // Set check-in, move to phase 2
      checkIn  = d;
      checkOut = null;
      phase    = 2;
      maxCOut  = findMaxCheckOut(d);
      hoverDate = null;
      if (dateFromEl) { dateFromEl.value = fmtDate(d); dateFromEl.classList.add('is-set'); }
      if (dateToEl)   { dateToEl.value = '';            dateToEl.classList.remove('is-set'); }
    } else {
      // Phase 2 — picking check-out
      if (d <= checkIn) {
        // Clicked earlier than check-in → restart with this as new check-in
        checkIn  = d;
        checkOut = null;
        maxCOut  = findMaxCheckOut(d);
        hoverDate = null;
        if (dateFromEl) { dateFromEl.value = fmtDate(d); dateFromEl.classList.add('is-set'); }
        if (dateToEl)   { dateToEl.value = '';            dateToEl.classList.remove('is-set'); }
        render();
        return;
      }
      // Blocked: after first busy day
      if (maxCOut && d > maxCOut) return;

      checkOut  = d;
      phase     = 1;
      hoverDate = null;
      if (dateToEl) { dateToEl.value = fmtDate(d); dateToEl.classList.add('is-set'); }
    }
    render();
  }

  // ── Event delegation ──
  calGrid.addEventListener('click', (e) => {
    const cell = e.target.closest('.ktCell[data-date]');
    if (!cell || cell.classList.contains('ktCell--busy') ||
        cell.classList.contains('ktCell--past') ||
        cell.classList.contains('ktCell--blocked')) return;
    handleClick(cell.dataset.date);
  });

  calGrid.addEventListener('mouseover', (e) => {
    if (phase !== 2 || !checkIn || checkOut) return;
    const cell = e.target.closest('.ktCell[data-date]');
    if (!cell || cell.classList.contains('ktCell--busy') ||
        cell.classList.contains('ktCell--past') ||
        cell.classList.contains('ktCell--blocked')) {
      if (hoverDate) { hoverDate = null; render(); }
      return;
    }
    const d = new Date(cell.dataset.date + 'T00:00:00');
    d.setHours(0,0,0,0);
    if (!hoverDate || d.getTime() !== hoverDate.getTime()) {
      hoverDate = d;
      render();
    }
  });

  calGrid.addEventListener('mouseleave', () => {
    if (hoverDate) { hoverDate = null; render(); }
  });

  // ── Apartment select ──
  aptSelect.addEventListener('change', () => {
    const val = aptSelect.value;
    if (val) {
      currentApt = val;
      // Use style.display as a reliable override for display:flex/block CSS
      if (calLock)  { calLock.setAttribute('hidden', ''); calLock.style.display = ''; }
      if (calInner) { calInner.removeAttribute('hidden'); calInner.style.display = ''; }
      checkIn = checkOut = hoverDate = maxCOut = null;
      phase = 1;
      viewYear  = new Date().getFullYear();
      viewMonth = new Date().getMonth();
      if (dateFromEl) { dateFromEl.value = ''; dateFromEl.classList.remove('is-set'); }
      if (dateToEl)   { dateToEl.value   = ''; dateToEl.classList.remove('is-set');   }
      if (summaryEl)  summaryEl.hidden = true;
      render();
    } else {
      currentApt = null;
      if (calLock)  { calLock.removeAttribute('hidden'); calLock.style.display = ''; }
      if (calInner) { calInner.setAttribute('hidden', ''); calInner.style.display = ''; }
      if (summaryEl) summaryEl.hidden = true;
    }
  });

  // ── Month navigation ──
  btnPrev?.addEventListener('click', () => {
    if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--;
    hoverDate = null;
    render();
  });
  btnNext?.addEventListener('click', () => {
    if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++;
    hoverDate = null;
    render();
  });

  // Submit — validation handled by the separate IIFE below
})();

/* =========================
   Kontakt forma — gosti i validacija
   ========================= */
(() => {
  // ── Limiti po apartmanu ──
  const aptLimits = {
    a1: { adults: 2, children: 2 }, // Sunrise
    a2: { adults: 2, children: 2 }, // Olive
    a3: { adults: 2, children: 3 }, // Sky
  };

  const aptSelect   = document.getElementById('ktAptSelect');
  const adultsEl    = document.getElementById('ktAdults');
  const childrenEl  = document.getElementById('ktChildren');
  const submitBtn   = document.getElementById('ktSubmitBtn');
  const successMsg  = document.getElementById('ktSuccess');

  if (!aptSelect || !adultsEl || !childrenEl || !submitBtn) return;

  // ── Ažuriraj opcije padajućih izbornika ──
  function updateGuestOptions(aptId) {
    const lim = aptLimits[aptId] || { adults: 2, children: 2 };

    // Odrasli: 1 do max
    adultsEl.innerHTML = '<option value="">— odaberite —</option>';
    for (let i = 1; i <= lim.adults; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i === 1 ? '1 odrasla osoba' : `${i} odrasle osobe`;
      adultsEl.appendChild(opt);
    }
    adultsEl.disabled = false;

    // Djeca: 0 do max
    childrenEl.innerHTML = '';
    for (let i = 0; i <= lim.children; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i === 0 ? '0 djece' : i === 1 ? '1 dijete' : `${i} djece`;
      childrenEl.appendChild(opt);
    }
    childrenEl.value = '0';
    childrenEl.disabled = false;
  }

  function resetGuestOptions() {
    adultsEl.innerHTML = '<option value="">— odaberite apartman —</option>';
    adultsEl.disabled = true;
    childrenEl.innerHTML = '<option value="0">0 djece</option>';
    childrenEl.disabled = true;
  }

  const calNote = document.getElementById('ktCalNote');

  // Slušaj promjenu apartmana (dodaje se uz postojeći listener u calendar bloku)
  aptSelect.addEventListener('change', () => {
    const val = aptSelect.value;
    if (val) {
      updateGuestOptions(val);
      if (calNote) calNote.removeAttribute('hidden');
    } else {
      resetGuestOptions();
      if (calNote) calNote.setAttribute('hidden', '');
    }
    // Očisti error na apartmanu i gostima
    clearErr(aptSelect, 'ktAptErr');
    clearErr(adultsEl,  'ktAdultsErr');
  });

  adultsEl.addEventListener('change', () => clearErr(adultsEl, 'ktAdultsErr'));

  // ── Pomoćne funkcije za error/clear ──
  function setErr(el, msgId, msg) {
    el.classList.add('is-error');
    const span = document.getElementById(msgId);
    if (span) span.textContent = msg;
  }
  function clearErr(el, msgId) {
    el.classList.remove('is-error');
    const span = document.getElementById(msgId);
    if (span) span.textContent = '';
  }

  // Briši errore live kad korisnik tipka / mijenja polje
  document.getElementById('ktFullName')?.addEventListener('input', () => clearErr(document.getElementById('ktFullName'), 'ktNameErr'));
  document.getElementById('ktEmail')?.addEventListener('input',    () => clearErr(document.getElementById('ktEmail'), 'ktEmailErr'));

  // ── Validacija forme ──
  function validateForm() {
    let valid = true;

    // Ime
    const nameEl = document.getElementById('ktFullName');
    if (!nameEl?.value.trim()) {
      setErr(nameEl, 'ktNameErr', 'Unesite ime i prezime');
      valid = false;
    } else {
      clearErr(nameEl, 'ktNameErr');
    }

    // Email
    const emailEl = document.getElementById('ktEmail');
    const emailVal = emailEl?.value.trim() || '';
    const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailVal) {
      setErr(emailEl, 'ktEmailErr', 'Unesite email adresu');
      valid = false;
    } else if (!emailOk) {
      setErr(emailEl, 'ktEmailErr', 'Unesite ispravnu email adresu');
      valid = false;
    } else {
      clearErr(emailEl, 'ktEmailErr');
    }

    // Apartman
    if (!aptSelect.value) {
      setErr(aptSelect, 'ktAptErr', 'Odaberite apartman');
      valid = false;
    } else {
      clearErr(aptSelect, 'ktAptErr');
    }

    // Odrasli (min. 1)
    if (!adultsEl.value) {
      setErr(adultsEl, 'ktAdultsErr', 'Odaberite broj odraslih osoba');
      valid = false;
    } else {
      clearErr(adultsEl, 'ktAdultsErr');
    }

    // Datum dolaska
    const fromEl = document.getElementById('ktDateFrom');
    if (!fromEl?.value) {
      setErr(fromEl, 'ktDateFromErr', 'Odaberite datum dolaska u kalendaru');
      valid = false;
    } else {
      clearErr(fromEl, 'ktDateFromErr');
    }

    // Datum odlaska
    const toEl = document.getElementById('ktDateTo');
    if (!toEl?.value) {
      setErr(toEl, 'ktDateToErr', 'Odaberite datum odlaska u kalendaru');
      valid = false;
    } else {
      clearErr(toEl, 'ktDateToErr');
    }

    // Skrolaj do prvog errora
    if (!valid) {
      const firstErr = document.querySelector('#ktForm .is-error');
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  // ── EmailJS konfiguracija — popuni nakon postavljanja EmailJS accounta ──
  const EJS_PUBLIC_KEY  = 'fmcojn4q2cFuXOBxB';
  const EJS_SERVICE_ID  = 'service_0y6b249';
  const EJS_TEMPLATE_ID = 'template_ue3hcho';

  // Inicijaliziraj EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EJS_PUBLIC_KEY });
  }

  // ── Submit — šalje mail putem EmailJS ──
  submitBtn.addEventListener('click', () => {
    if (!validateForm()) return;

    const nameEl    = document.getElementById('ktFullName');
    const emailEl   = document.getElementById('ktEmail');
    const fromEl    = document.getElementById('ktDateFrom');
    const toEl      = document.getElementById('ktDateTo');
    const msgEl     = document.querySelector('#ktForm [name="message"]');
    const sendErrEl = document.getElementById('ktSendErr');

    const aptNames  = { a1: 'Apartman Sunrise', a2: 'Apartman Olive', a3: 'Apartman Sky' };
    const aptName   = aptNames[aptSelect.value] || aptSelect.value;
    const adultsLbl = adultsEl.options[adultsEl.selectedIndex]?.text || adultsEl.value;
    const childLbl  = childrenEl.options[childrenEl.selectedIndex]?.text || childrenEl.value;
    const sumTotalTxt  = document.getElementById('ktSumTotal')?.textContent || '';
    const sumNightsTxt = document.getElementById('ktSumNights')?.textContent || '';
    const ukupna_cijena = sumTotalTxt
      ? `${sumTotalTxt.replace('Ukupno: ', '')} (${sumNightsTxt})`
      : '/';

    if (successMsg) successMsg.hidden = true;
    if (sendErrEl)  sendErrEl.hidden  = true;
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Slanje…';

    if (typeof emailjs === 'undefined') {
      if (sendErrEl) sendErrEl.hidden = false;
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Pošalji upit';
      return;
    }

    emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, {
      from_name:      nameEl.value.trim(),
      reply_to:       emailEl.value.trim(),
      apartman:       aptName,
      odrasli:        adultsLbl,
      djeca:          childLbl,
      datum_dolaska:   fromEl.value,
      datum_odlaska:   toEl.value,
      ukupna_cijena:   ukupna_cijena,
      poruka:          msgEl?.value.trim() || '/',
    })
    .then(() => {
      if (successMsg) successMsg.hidden = false;
      submitBtn.textContent = 'Poslano ✓';
    })
    .catch(() => {
      if (sendErrEl) sendErrEl.hidden = false;
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Pošalji upit';
    });
  });
})();
