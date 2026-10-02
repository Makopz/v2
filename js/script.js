// ========================================
// PORTAFOLIO - MAXIMILIANO OPAZO
// Menú, aparición suave y parallax multicapa
// ========================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// ---------- Menú móvil ----------
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    })
  );
}

// ---------- Aparición al hacer scroll ----------
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.15 }
  );
  revealItems.forEach((el) => io.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("in"));
}

// ---------- Parallax multicapa ----------
// Solo se animan transform y opacity (GPU), con un único requestAnimationFrame
// y únicamente mientras el elemento es visible.
const windowEl = document.getElementById("window");
const layers = [...document.querySelectorAll(".layer[data-depth]")];
const floaters = [...document.querySelectorAll("[data-speed]")];

let mouseX = 0, mouseY = 0, ticking = false, windowVisible = true;

function update() {
  ticking = false;
  const vh = window.innerHeight;

  // Capas del paisaje: las lejanas se mueven menos que las cercanas
  if (windowEl && windowVisible) {
    const rect = windowEl.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - vh / 2) / vh));
    const scroll = -progress * 120;
    layers.forEach((layer) => {
      const d = parseFloat(layer.dataset.depth);
      const x = mouseX * d * 30;
      const y = scroll * d + mouseY * d * 14;
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }

  // Elementos sueltos (hojas decorativas, tarjetas)
  floaters.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) return;
    const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
    el.style.translate = `0 ${offset.toFixed(1)}px`;
  });
}

function requestTick() {
  if (!ticking) { ticking = true; requestAnimationFrame(update); }
}

function enableParallax() {
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick, { passive: true });
  if (windowEl) {
    new IntersectionObserver(([e]) => { windowVisible = e.isIntersecting; }).observe(windowEl);
    if (window.matchMedia("(hover: hover)").matches) {
      windowEl.addEventListener("pointermove", (ev) => {
        const r = windowEl.getBoundingClientRect();
        mouseX = (ev.clientX - r.left) / r.width - 0.5;
        mouseY = (ev.clientY - r.top) / r.height - 0.5;
        requestTick();
      });
      windowEl.addEventListener("pointerleave", () => { mouseX = mouseY = 0; requestTick(); });
    }
  }
  requestTick();
}

function disableParallax() {
  window.removeEventListener("scroll", requestTick);
  window.removeEventListener("resize", requestTick);
  layers.forEach((l) => (l.style.transform = ""));
  floaters.forEach((f) => (f.style.translate = ""));
}

if (!reduceMotion.matches) enableParallax();
reduceMotion.addEventListener("change", (e) => (e.matches ? disableParallax() : enableParallax()));
