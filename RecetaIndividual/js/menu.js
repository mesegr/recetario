(() => {
  const btn = document.querySelector(".menuBtn");
  const aside = document.getElementById("aside");
  const closeBtn = document.querySelector(".asideClose");
  const header = document.querySelector(".header");
  const searchBar = document.querySelector(".searchBar");

  if (!btn || !aside) return;

  function abrir() {
    aside.classList.add("open");
    document.body.classList.add("menuOpen");
    btn.setAttribute("aria-expanded", "true");
  }

  function cerrar() {
    aside.classList.remove("open");
    document.body.classList.remove("menuOpen");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", () => {
    aside.classList.contains("open") ? cerrar() : abrir();
  });

  if (closeBtn) closeBtn.addEventListener("click", cerrar);

  document.addEventListener("click", (e) => {
    if (
      aside.classList.contains("open") &&
      !aside.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      cerrar();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrar();
  });

  const movil = window.matchMedia("(max-width: 767px)");

  function colocarBuscador() {
    if (!searchBar || !closeBtn) return;
    if (movil.matches) {
      closeBtn.after(searchBar);
    } else {
      header.insertBefore(searchBar, btn);
      cerrar();
    }
  }

  colocarBuscador();
  movil.addEventListener("change", colocarBuscador);
})();
