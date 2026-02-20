const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const menuBackdrop = document.getElementById("menuBackdrop");
const year = document.getElementById("year");
let isMenuOpen = false;
let hideTimer = null;

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
   Calendar modal (placeholder)
   ========================= */
(() => {
  const modal = document.getElementById('calendarModal');
  if (!modal) return;

  const openers = document.querySelectorAll('[data-open-calendar]');
  const closers = document.querySelectorAll('[data-close-calendar]');

  function openModal(){
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

  // ESC zatvara
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
