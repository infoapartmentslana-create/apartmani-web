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
