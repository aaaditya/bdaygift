/**
 * Farewell site — Payal Sharma
 *
 * Arc: these days → no contact → final days → peace
 *
 * Drop office/lab shots in assets/these-days/
 * Drop final-day shots in assets/final/ (or assets/today/)
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

const FINAL_DAYS = [
  {
    src: "assets/final/01-coffee.jpg",
    alt: "Selfie at Oaks and Moks Coffee Roasters",
    caption: "Oaks and Moks",
  },
  {
    src: "assets/final/02-movies.jpg",
    alt: "Selfie at the movies",
    caption: "At the movies",
  },
  {
    src: "assets/final/03-night-out.jpg",
    alt: "Night out with friends",
    caption: "A night out",
  },
  // Fallbacks if files were dropped with simple names
  { src: "assets/final/01.jpg", alt: "Final day memory", caption: "" },
  { src: "assets/final/02.jpg", alt: "Final day memory", caption: "" },
  { src: "assets/final/03.jpg", alt: "Final day memory", caption: "" },
  { src: "assets/today/01.jpg", alt: "Final day memory", caption: "" },
  { src: "assets/today/02.jpg", alt: "Final day memory", caption: "" },
  { src: "assets/today/03.jpg", alt: "Final day memory", caption: "" },
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

async function loadFinalExisting(entries) {
  const results = await Promise.all(
    entries.map(async (entry) => {
      const r = await tryLoad(entry.src);
      return r.ok ? entry : null;
    })
  );
  // de-dupe by basename preference (named files first)
  const seen = new Set();
  const out = [];
  for (const entry of results) {
    if (!entry) continue;
    const key = entry.alt + entry.caption;
    // Prefer unique captions; skip untitled duplicates if we already have 3
    if (entry.caption && [...out].some((e) => e.caption === entry.caption)) {
      continue;
    }
    if (!entry.caption && out.length >= 3) continue;
    const fileKey = entry.src.split("/").pop();
    if (seen.has(fileKey)) continue;
    seen.add(fileKey);
    out.push(entry);
  }
  return out.slice(0, 6);
}

function mountHero(src) {
  const hero = document.querySelector(".hero");
  const photo = document.querySelector(".hero__photo");
  if (!photo || !src) return;

  photo.src = src;
  photo.alt = "A memory from these days";
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
    for (let i = 0; i < 3; i += 1) {
      const frame = document.createElement("figure");
      frame.className = "memory is-empty";
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
    img.alt = `From these days — ${i + 1}`;
    img.loading = i < 2 ? "eager" : "lazy";
    figure.appendChild(img);
    container.appendChild(figure);
  });
}

function mountFinalGallery(container, entries) {
  if (!container) return;

  const empty = container.querySelector("[data-final-empty]");
  if (!entries.length) {
    if (empty) empty.hidden = false;
    return;
  }

  container.innerHTML = "";
  container.classList.add("has-photos");

  entries.forEach((entry) => {
    const figure = document.createElement("figure");
    figure.className = "memory memory--captioned";
    const img = document.createElement("img");
    img.src = entry.src;
    img.alt = entry.alt;
    img.loading = "lazy";
    figure.appendChild(img);
    if (entry.caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = entry.caption;
      figure.appendChild(cap);
    }
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
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
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

  const finals = await loadFinalExisting(FINAL_DAYS);
  mountFinalGallery(document.getElementById("final-gallery"), finals);

  requestAnimationFrame(() => {
    document.querySelectorAll(".hero .reveal").forEach((el) => {
      el.classList.add("is-in");
    });
  });

  observeReveals();
}

init();
