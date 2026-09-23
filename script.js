/**
 * Farewell site — Payal Sharma
 * Drop JPGs into assets/these-days/ and assets/today/.
 * Rename one strong shot to hero.jpg for the full-bleed opening.
 */

const THESE_DAYS = [
  "assets/these-days/hero.jpg",
  "assets/these-days/01.jpg",
  "assets/these-days/02.jpg",
  "assets/these-days/03.jpg",
  "assets/these-days/04.jpg",
  "assets/these-days/05.jpg",
  "assets/these-days/06.jpg",
];

const TODAY = [
  "assets/today/01.jpg",
  "assets/today/02.jpg",
  "assets/today/03.jpg",
  "assets/today/04.jpg",
];

function tryLoad(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ src, ok: true });
    img.onerror = () => resolve({ src, ok: false });
    img.src = src;
  });
}

async function loadExisting(paths) {
  const results = await Promise.all(paths.map(tryLoad));
  return results.filter((r) => r.ok).map((r) => r.src);
}

function mountHero(src) {
  const hero = document.querySelector(".hero");
  const photo = document.querySelector(".hero__photo");
  if (!photo || !src) return;

  photo.src = src;
  photo.alt = "A memory with Payal";
  photo.addEventListener(
    "load",
    () => {
      photo.classList.add("is-loaded");
      hero.classList.add("has-photo");
    },
    { once: true }
  );
}

function mountGallery(container, sources, emptyLabel) {
  if (!container) return;
  container.innerHTML = "";

  if (!sources.length) {
    for (let i = 0; i < 4; i += 1) {
      const frame = document.createElement("figure");
      frame.className = "memory is-empty is-visible";
      frame.dataset.label = emptyLabel || "Memory";
      container.appendChild(frame);
    }
    return;
  }

  sources.forEach((src, i) => {
    const figure = document.createElement("figure");
    figure.className = "memory";
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Memory ${i + 1}`;
    img.loading = i < 2 ? "eager" : "lazy";
    figure.appendChild(img);
    container.appendChild(figure);
  });
}

function observeReveals() {
  const nodes = document.querySelectorAll(".reveal, .memory");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => {
      n.classList.add("is-in");
      n.classList.add("is-visible");
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );

  nodes.forEach((n) => io.observe(n));
}

async function init() {
  const theseDays = await loadExisting(THESE_DAYS);
  const heroSrc = theseDays.find((s) => s.includes("hero.jpg")) || theseDays[0];
  const gallerySrcs = theseDays.filter((s) => s !== heroSrc).slice(0, 6);

  if (heroSrc) mountHero(heroSrc);

  mountGallery(
    document.getElementById("these-days-gallery"),
    gallerySrcs.length ? gallerySrcs : theseDays.slice(0, 6),
    "From these days"
  );

  const todaySrcs = await loadExisting(TODAY);
  const todayWrap = document.getElementById("today-gallery");
  if (todaySrcs.length && todayWrap) {
    todayWrap.classList.add("has-photos");
    mountGallery(todayWrap, todaySrcs, "Today");
  }

  // Hero copy reveals on load
  requestAnimationFrame(() => {
    document.querySelectorAll(".hero .reveal").forEach((el) => {
      el.classList.add("is-in");
    });
  });

  observeReveals();
}

init();
