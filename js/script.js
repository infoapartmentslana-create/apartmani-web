const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const year = document.getElementById("year");

if (year) year.textContent = new Date().getFullYear();

if (burger && nav) {
  burger.addEventListener("click", () => nav.classList.toggle("is-open"));
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("is-open"));
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
    heroSlider.style.transform = `translateY(${progress * 60}px)`;
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
}

function onScroll() {
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
window.addEventListener("scroll", onScroll, { passive: true });

/* TRANSPARENT HEADER EFFECT */
const header = document.querySelector(".header");

function updateHeader() {
  if (!header) return;

  if (window.scrollY < 40) {
    header.classList.add("header--transparent");
    header.classList.remove("header--solid");
  } else {
    header.classList.remove("header--transparent");
    header.classList.add("header--solid");
  }
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
