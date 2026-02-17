const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const year = document.getElementById("year");

if (year) year.textContent = new Date().getFullYear();

if (burger && nav) {
  burger.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });

  // zatvori meni kad klikneš link (mobile)
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("is-open"));
  });
}

// HERO background slider
const slides = document.querySelectorAll(".hero__bgslide");
let current = 0;

if (slides.length > 1) {
  setInterval(() => {
    slides[current].classList.remove("is-active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("is-active");
  }, 5000); // 5 sekundi
}

// CINEMATIC SCROLL: parallax + fade/slide tekst
const heroSlider = document.querySelector(".hero__bgslider");
const heroPanel = document.getElementById("heroPanel");
const heroSection = document.querySelector(".hero");

function cinematicScroll() {
  if (!heroSection) return;

  const rect = heroSection.getBoundingClientRect();
  const heroHeight = heroSection.offsetHeight;

  // progres 0 -> 1 dok skrolaš kroz hero
  const progress = Math.min(Math.max(-rect.top / (heroHeight * 0.9), 0), 1);

  if (heroSlider) {
    // parallax (suptilno)
    heroSlider.style.transform = `translateY(${progress * 60}px)`;
  }

  if (heroPanel) {
    // tekst se lagano spušta + nestaje
    const translate = progress * 28;     // px
    const opacity = 1 - progress * 0.85; // do ~15% vidljivo na kraju
    const blur = progress * 2;           // mali blur (premium)

    heroPanel.style.transform = `translateY(${translate}px)`;
    heroPanel.style.opacity = `${opacity}`;
    heroPanel.style.filter = `blur(${blur}px)`;
  }

  window.addEventListener("scroll", () => {
    requestAnimationFrame(cinematicScroll);
  });

}

// start
requestAnimationFrame(cinematicScroll);

