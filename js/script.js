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
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {

    if (!isAdminMode) {

      const entered = prompt("Admin password:");

      if (entered === ADMIN_PASSWORD) {
        isAdminMode = true;
        alert("Admin mode ON");
      } else {
        alert("Wrong password");
      }

    } else {

      isAdminMode = false;
      alert("Admin mode OFF");

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

/* =========================
   Calendar modal (A1/A2/A3) — price + busy, saved in localStorage
   ========================= */
(() => {
  const modal = document.getElementById('calendarModal');
  if (!modal) return;

  const openers = document.querySelectorAll('[data-open-calendar]');
  const closers = document.querySelectorAll('[data-close-calendar]');

  const calGrid = document.getElementById('calGrid');
  const calMonthLabel = document.getElementById('calMonthLabel');
  const calAptLabel = document.getElementById('calAptLabel');

  const btnPrev = document.getElementById('calPrev');
  const btnNext = document.getElementById('calNext');
  const btnToday = document.getElementById('calToday');

  // state
  let currentApt = 'a1'; // a1/a2/a3
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth(); // 0-11

  // storage model:
  // key: "aptCalendar:a1"
  // value: { "YYYY-MM-DD": { price: 70, busy: true } }
  const storageKey = (aptId) => `aptCalendar:${aptId}`;

  function loadData(aptId) {
    try {
      return JSON.parse(localStorage.getItem(storageKey(aptId)) || '{}');
    } catch {
      return {};
    }
  }

  function saveData(aptId, data) {
    localStorage.setItem(storageKey(aptId), JSON.stringify(data));
  }

  function pad2(n){ return String(n).padStart(2,'0'); }
  function ymd(y,m,d){ return `${y}-${pad2(m+1)}-${pad2(d)}`; }

  function monthNameHr(m){
    const names = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];
    return names[m] || '';
  }

  function render() {
    if (!calGrid) return;

    const data = loadData(currentApt);

    // header labels
    if (calAptLabel) calAptLabel.textContent = `Apartman ${currentApt.toUpperCase()}`;
    if (calMonthLabel) calMonthLabel.textContent = `${monthNameHr(viewMonth)} ${viewYear}`;

    calGrid.innerHTML = '';

    // calendar grid: start on Monday
    const first = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // JS: Sunday=0 ... Saturday=6
    // We want Monday=0 ... Sunday=6
    let startIndex = (first.getDay() + 6) % 7;

    // create 42 cells (6 weeks) to keep grid stable
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'calCell';

      const dayNum = i - startIndex + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;

      if (!inMonth) {
        cell.classList.add('is-out');
        cell.disabled = true;
        cell.innerHTML = `<div class="calCell__day"></div><div class="calCell__price"></div>`;
        calGrid.appendChild(cell);
        continue;
      }

      const key = ymd(viewYear, viewMonth, dayNum);
      const info = data[key] || { price: null, busy: false };

      if (info.busy) cell.classList.add('is-busy');

      cell.innerHTML = `
        <div class="calCell__day">${dayNum}</div>
        <div class="calCell__price">${info.price != null && info.price !== '' ? `${info.price} €` : ''}</div>
      `;

      if (isAdminMode) {

        // click: toggle busy
        cell.addEventListener('click', () => {
          const fresh = loadData(currentApt);
          const cur = fresh[key] || { price: null, busy: false };
          cur.busy = !cur.busy;
          fresh[key] = cur;
          saveData(currentApt, fresh);
          render();
        });

        // double click: set price
        cell.addEventListener('dblclick', () => {
          const fresh = loadData(currentApt);
          const cur = fresh[key] || { price: null, busy: false };

          const entered = window.prompt(`Cijena za ${key} (EUR):`, cur.price ?? '');
          if (entered === null) return;

          const trimmed = String(entered).trim();
          cur.price = trimmed === '' ? null : Number(trimmed);

          if (cur.price !== null && Number.isNaN(cur.price)) return;

          fresh[key] = cur;
          saveData(currentApt, fresh);
          render();
        });

      }

      calGrid.appendChild(cell);
    }
  }

  function openModal(e) {
    const btn = e?.currentTarget;
    const card = btn?.closest('.apt'); // <article class="apt"... data-gallery="a1">
    const aptId = (card?.getAttribute('data-gallery') || 'a1').toLowerCase();

    currentApt = ['a1','a2','a3'].includes(aptId) ? aptId : 'a1';

    // reset view to current month when opening
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    render();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // nav buttons
  btnPrev?.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  });

  btnNext?.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  });

  btnToday?.addEventListener('click', () => {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    render();
  });

  openers.forEach(btn => btn.addEventListener('click', openModal));
  closers.forEach(btn => btn.addEventListener('click', closeModal));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
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

  // Elements inside modal we update
  const titleEl = modal.querySelector('#detailsTitle');
  const metaEl = modal.querySelector('.detailsHead__meta');
  const heroImg = modal.querySelector('.detailsHero__media img');
  const badgeEl = modal.querySelector('.detailsHero__badge');
  const leadEl = modal.querySelector('.detailsHero__lead');

  // Default (current A1 content) – used as fallback
  const defaultContent = {
    meta: metaEl?.textContent?.trim() || '',
    badge: badgeEl?.textContent?.trim() || '',
    lead: leadEl?.textContent?.trim() || '',
  };

  // Optional per-apartment overrides (you can edit texts later)
  const DETAILS = {
    a1: { ...defaultContent },
    a2: { ...defaultContent },
    a3: { ...defaultContent },
  };

  function setDetailsForApartment(card) {
    const aptId = (card?.getAttribute('data-gallery') || '').toLowerCase(); // a1/a2/a3
    const title = card?.getAttribute('data-gallery-title') || `Apartman ${aptId?.toUpperCase() || ''}`;

    // Title
    if (titleEl) titleEl.textContent = `Detalji — ${title}`;

    // Image (hero)
    if (heroImg && aptId) {
      heroImg.src = `images/apartmani/${aptId}/hero.jpg`;
      heroImg.alt = `${title} - pogled/interijer`;
    }

    // Texts
    const cfg = DETAILS[aptId] || defaultContent;
    if (metaEl && cfg.meta) metaEl.textContent = cfg.meta;
    if (badgeEl && cfg.badge) badgeEl.textContent = cfg.badge;
    if (leadEl && cfg.lead) leadEl.textContent = cfg.lead;

    // Accessibility: keep aria-labelledby pointing to correct heading
    if (titleEl?.id) modal.querySelector('[role="dialog"]')?.setAttribute('aria-labelledby', titleEl.id);
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

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();
