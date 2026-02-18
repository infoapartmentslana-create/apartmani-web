const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
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
    } else {
      resetHideTimer();
    }
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      isMenuOpen = false;
      resetHideTimer();
    });
  });
}

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

  /* PREMIUM HERO PARALLAX (SAFE VERSION) */
  if (heroSlider) {
    const y = window.scrollY;

    // lagani zoom-out dok scrollaš
    const scale = Math.max(1, 1.08 - y * 0.0003);

    heroSlider.style.transform =
      `translateY(${y * 0.15}px) scale(${scale})`;
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
