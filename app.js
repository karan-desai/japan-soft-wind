/**
 * Ghibli-styled Japan trip story — frames, scroll reveals, lightbox, nav.
 */
(function () {
  "use strict";

  const wideHints = /05-29-02/; // Kawaguchiko lake prefers 4:3

  function renderFlow(container, images) {
    container.innerHTML = "";
    if (!images || !images.length) {
      const empty = document.createElement("div");
      empty.className = "photo-flow__empty";
      empty.textContent = "Frames for this day will appear here once generated.";
      container.appendChild(empty);
      return;
    }

    images.forEach((src, i) => {
      const fig = document.createElement("figure");
      fig.className = "photo-flow__item";
      if (wideHints.test(src)) fig.classList.add("photo-flow__item--wide");
      fig.style.transitionDelay = i * 0.12 + "s";

      const img = document.createElement("img");
      img.src = src;
      img.alt = "Trip frame";
      img.loading = "lazy";
      img.decoding = "async";

      fig.appendChild(img);
      fig.addEventListener("click", () => openLightbox(src));
      container.appendChild(fig);
    });

    observePhotos(container);
  }

  /* Lightbox */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target === lightboxClose) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* Journey path highlight by region / section */

  function setupMusic() {
    const btn = document.getElementById("music-toggle");
    const audio = document.getElementById("bg-music");
    const credit = document.getElementById("music-credit");
    if (!btn || !audio) return;

    fetch("audio/ATTRIBUTION.txt")
      .then((r) => (r.ok ? r.text() : ""))
      .then((txt) => {
        if (credit && txt) {
          const line = txt.split("\n").find((l) => l.trim()) || txt.trim();
          credit.textContent = "Music: " + line.replace(/^Title:\s*/i, "").slice(0, 120);
        }
      })
      .catch(() => {});

    audio.volume = 0.4;
    let started = false;

    function setPlayingUI(playing) {
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      const label = btn.querySelector(".music-toggle__text");
      if (label) label.textContent = playing ? "Playing…" : "Play music";
    }

    async function startMusic() {
      if (started && !audio.paused) {
        setPlayingUI(true);
        return true;
      }
      try {
        await audio.play();
        started = true;
        setPlayingUI(true);
        return true;
      } catch (err) {
        setPlayingUI(false);
        return false;
      }
    }

    function onFirstScroll() {
      if (started) return;
      startMusic().then((ok) => {
        if (ok) {
          window.removeEventListener("scroll", onFirstScroll);
        }
      });
    }

    window.addEventListener("scroll", onFirstScroll, { passive: true });

    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        if (audio.paused) {
          await startMusic();
          window.removeEventListener("scroll", onFirstScroll);
        } else {
          audio.pause();
          setPlayingUI(false);
        }
      } catch (err) {
        setPlayingUI(false);
      }
    });
  }

  function setupNavHighlight() {
    const placeLinks = document.querySelectorAll(".journey-nav__path a[data-place]");
    const brand = document.querySelector(".journey-nav__brand");
    const end = document.querySelector(".journey-nav__end");
    const chapters = document.querySelectorAll("main .chapter[data-region], #intro, #closing");
    if (!placeLinks.length || !("IntersectionObserver" in window)) return;

    function setActive(place, special) {
      placeLinks.forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("data-place") === place);
      });
      if (brand) brand.classList.toggle("is-active", special === "intro");
      if (end) end.classList.toggle("is-active", special === "closing");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.id === "intro") {
            setActive(null, "intro");
            return;
          }
          if (el.id === "closing") {
            setActive(null, "closing");
            return;
          }
          const place = el.getAttribute("data-region");
          if (place) setActive(place, null);
        });
      },
      { rootMargin: "-32% 0px -48% 0px", threshold: 0 }
    );

    document.querySelectorAll("#intro, main .chapter, #closing").forEach((el) => observer.observe(el));
  }

  /* Chapter + photo reveals */
  function setupReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal, .photo-flow__item").forEach((el) => {
        el.classList.add("is-visible");
        el.classList.add("is-in");
      });
      return;
    }

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));
  }

  function observePhotos(container) {
    if (!("IntersectionObserver" in window)) {
      container.querySelectorAll(".photo-flow__item").forEach((el) => el.classList.add("is-in"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.15 }
    );
    container.querySelectorAll(".photo-flow__item").forEach((el) => obs.observe(el));
  }

  /* Soft parallax on hero clouds */
  function setupParallax() {
    const clouds = document.querySelectorAll(".cloud");
    if (!clouds.length) return;
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          clouds.forEach((c, i) => {
            const factor = 0.04 + i * 0.02;
            c.style.translate = `0 ${y * factor}px`;
          });
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  async function loadPhotos() {
    let manifest;
    try {
      const res = await fetch("manifest.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      manifest = await res.json();
    } catch (err) {
      console.warn("manifest.json unavailable:", err);
      document.querySelectorAll("[data-day] .photo-flow").forEach((flow) => renderFlow(flow, []));
      return;
    }

    const byId = new Map((manifest.chapters || []).map((c) => [c.id, c.images || []]));
    document.querySelectorAll("[data-day]").forEach((section) => {
      const day = section.getAttribute("data-day");
      const flow = section.querySelector(".photo-flow");
      if (!flow) return;
      renderFlow(flow, byId.get(day) || []);
    });
  }

  setupNavHighlight();
  setupMusic();
  setupReveals();
  setupParallax();
  loadPhotos();
})();
