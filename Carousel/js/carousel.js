(() => {
  const SLIDE_MAX = 320;
  const DELAY = 2500;
  const ANIM = 500;
  const SWIPE_MIN = 40;
  const MIN_VISIBLE = 2;

  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  const viewport = carousel.querySelector(".carouselViewport");
  const track = carousel.querySelector(".carouselTrack");
  const btnPrev = carousel.querySelector(".carouselBtn.prev");
  const btnNext = carousel.querySelector(".carouselBtn.next");

  let step = 0;
  let animating = false;
  let timer = null;

  function layout() {
    const gap = parseFloat(getComputedStyle(carousel).columnGap) || 0;
    const slideGap = parseFloat(getComputedStyle(track).columnGap) || 0;

    const botonesVisibles = getComputedStyle(btnPrev).display !== "none";
    const lados = botonesVisibles ? 2 * (btnPrev.offsetWidth + gap) : 0;
    const available = Math.max(80, carousel.clientWidth - lados);

    const visible = Math.max(
      MIN_VISIBLE,
      Math.floor((available + slideGap) / (SLIDE_MAX + slideGap)),
    );

    const slideW = (available - (visible - 1) * slideGap) / visible;

    viewport.style.width = `${available}px`;
    carousel.style.setProperty("--slide-w", `${slideW}px`);
    step = slideW + slideGap;

    track.style.transition = "none";
    track.style.transform = "translateX(0)";
  }

  function next() {
    if (animating) return;
    animating = true;
    void track.offsetWidth;
    track.style.transition = `transform ${ANIM}ms ease`;
    track.style.transform = `translateX(-${step}px)`;
    setTimeout(() => {
      track.style.transition = "none";
      track.appendChild(track.firstElementChild);
      track.style.transform = "translateX(0)";
      animating = false;
    }, ANIM);
  }

  function prev() {
    if (animating) return;
    animating = true;
    track.style.transition = "none";
    track.insertBefore(track.lastElementChild, track.firstElementChild);
    track.style.transform = `translateX(-${step}px)`;
    void track.offsetWidth;
    track.style.transition = `transform ${ANIM}ms ease`;
    track.style.transform = "translateX(0)";
    setTimeout(() => {
      animating = false;
    }, ANIM);
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function start() {
    if (reduceMotion) return;
    stop();
    timer = setInterval(next, DELAY);
  }
  function stop() {
    clearInterval(timer);
  }

  btnNext.addEventListener("click", () => {
    next();
    start();
  });
  btnPrev.addEventListener("click", () => {
    prev();
    start();
  });

  carousel.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") stop();
  });
  carousel.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") start();
  });

  let startX = 0;
  let startY = 0;

  viewport.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      stop();
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      }
      start();
    },
    { passive: true },
  );

  fetch("Data/recetas.json")
    .then((r) => r.json())
    .then((recetas) => {
      const conImagen = recetas.filter((r) => r.imagen);
      track.innerHTML = conImagen
        .map(
          (r) => `
        <a class="carouselSlide" href="RecetaIndividual/recetaBlog.html?id=${r.id}" draggable="false">
          <img src="${r.imagen}" alt="${r.titulo}" draggable="false">
          <span>${r.titulo}</span>
        </a>
      `,
        )
        .join("");

      const ro = new ResizeObserver(layout);
      ro.observe(carousel);
      ro.observe(btnPrev);

      layout();
      start();
    })
    .catch((err) => {
      console.error("Carrusel:", err);
      carousel.hidden = true;
    });
})();
