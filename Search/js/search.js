(() => {
  const MAX_RESULTS = 3;
  const bar = document.querySelector(".searchBar");
  if (!bar) return;

  const form = bar.querySelector("form");
  const input = bar.querySelector("input");

  input.setAttribute("autocomplete", "off");
  input.setAttribute("aria-autocomplete", "list");

  const list = document.createElement("ul");
  list.className = "searchSuggestions";
  list.id = "searchSuggestions";
  list.setAttribute("role", "listbox");
  list.hidden = true;
  bar.appendChild(list);
  input.setAttribute("aria-controls", list.id);

  let recetas = [];
  let results = [];
  let active = -1;

  const norm = (s) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const urlDe = (r) => `/RecetaIndividual/recetaBlog.html?id=${r.id}`;
  const imgDe = (r) => (r.imagen.startsWith("/") ? r.imagen : `/${r.imagen}`);

  function wordScore(r, w) {
    if (r._titulo.startsWith(w)) return 100;
    if (r._titulo.split(" ").some((p) => p.startsWith(w))) return 80;
    if (r._titulo.includes(w)) return 60;
    if (r._categoria.includes(w)) return 40;
    if (r._ingredientes.some((i) => i.includes(w))) return 20;
    return 0;
  }

  function score(r, query) {
    const words = query.split(/\s+/).filter(Boolean);
    let total = 0;
    for (const w of words) {
      const s = wordScore(r, w);
      if (!s) return 0;
      total += s;
    }
    return total;
  }

  function search(text) {
    const q = norm(text.trim());
    if (!q) return [];
    return recetas
      .map((r) => ({ r, s: score(r, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_RESULTS)
      .map((x) => x.r);
  }

  function place() {
    bar.style.setProperty("--bar-r", `${form.offsetHeight / 2}px`);

    list.style.left = `${form.offsetLeft}px`;
    const bordeInf = parseFloat(getComputedStyle(form).borderBottomWidth) || 0;
    list.style.top = `${form.offsetTop + form.offsetHeight - bordeInf}px`;
    list.style.width = `${form.offsetWidth}px`;
  }

  function close() {
    list.hidden = true;
    bar.classList.remove("open");
    active = -1;
    input.setAttribute("aria-expanded", "false");
  }

  function render() {
    if (!input.value.trim()) {
      close();
      return;
    }

    if (results.length === 0) {
      list.innerHTML =
        '<li class="noResults">No hay recetas que coincidan</li>';
    } else {
      list.innerHTML = results
        .map(
          (r, i) => `
        <li role="option" class="${i === active ? "active" : ""}">
          <a href="${urlDe(r)}">
            ${r.imagen ? `<img src="${imgDe(r)}" alt="">` : ""}
            <span>
              <span class="suggestTitle">${r.titulo}</span>
              <span class="suggestCat">${r.categoria}</span>
            </span>
          </a>
        </li>
      `,
        )
        .join("");
    }
    place();
    list.hidden = false;
    bar.classList.add("open");
    input.setAttribute("aria-expanded", "true");
  }

  input.addEventListener("input", () => {
    results = search(input.value);
    active = -1;
    render();
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) {
      results = search(input.value);
      render();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (list.hidden || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = (active + 1) % results.length;
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = (active - 1 + results.length) % results.length;
      render();
    } else if (e.key === "Escape") {
      close();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    results = search(input.value);
    if (results.length === 0) {
      render();
      return;
    }
    const destino = results[active >= 0 ? active : 0];
    window.location.href = urlDe(destino);
  });

  document.addEventListener("click", (e) => {
    if (!bar.contains(e.target)) close();
  });

  window.addEventListener("resize", () => {
    if (!list.hidden) place();
  });

  fetch("/Data/recetas.json")
    .then((r) => r.json())
    .then((data) => {
      recetas = data.map((r) => ({
        ...r,
        _titulo: norm(r.titulo),
        _categoria: norm(r.categoria || ""),
        _ingredientes: (r.ingredientes || []).map(norm),
      }));
    })
    .catch((err) => console.error("Buscador:", err));
})();
