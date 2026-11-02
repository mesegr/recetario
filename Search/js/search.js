(() => {
  const MAX_RESULTS = 3;
  const bar = document.querySelector(".searchBar");
  if (!bar) return;

  const form = bar.querySelector("form");
  const input = bar.querySelector("input");

  input.setAttribute("autocomplete", "off");
  input.setAttribute("aria-autocomplete", "list");

  const filterToggle = document.createElement("button");
  filterToggle.type = "button";
  filterToggle.className = "filterToggle";
  filterToggle.setAttribute("aria-label", "Mostrar filtros de búsqueda");
  filterToggle.setAttribute("title", "Filtrar recetas");
  filterToggle.setAttribute("aria-expanded", "false");
  filterToggle.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M8 14v6" />
    </svg>
  `;

  const filters = document.createElement("div");
  filters.className = "searchFilters";
  filters.hidden = true;
  filters.innerHTML = `
    <label>Categoría
      <select name="categoria"><option value="">Todas</option></select>
    </label>
    <label>Tiempo
      <select name="tiempo">
        <option value="">Cualquier tiempo</option>
        <option value="short">Hasta 15 min</option>
        <option value="medium">De 16 a 30 min</option>
        <option value="long">De 31 a 60 min</option>
        <option value="extended">Más de 60 min</option>
      </select>
    </label>
    <label>Dificultad
      <select name="dificultad"><option value="">Todas</option></select>
    </label>
  `;
  form.insertBefore(filterToggle, input);
  bar.append(filters);

  const categorySelect = filters.querySelector('[name="categoria"]');
  const timeSelect = filters.querySelector('[name="tiempo"]');
  const difficultySelect = filters.querySelector('[name="dificultad"]');

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
  let filterCloseTimer;

  const norm = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const urlDe = (recipe) => `/RecetaIndividual/recetaBlog.html?id=${recipe.id}`;
  const imgDe = (recipe) =>
    recipe.imagen.startsWith("/") ? recipe.imagen : `/${recipe.imagen}`;

  function timeBand(time) {
    const minutes = Number.parseInt(time, 10);
    if (Number.isNaN(minutes)) return "extended";
    if (time.includes("h")) return minutes === 1 && !time.includes("30") ? "long" : "extended";
    if (minutes <= 15) return "short";
    if (minutes <= 30) return "medium";
    if (minutes <= 60) return "long";
    return "extended";
  }

  function wordScore(recipe, word) {
    if (recipe._titulo.startsWith(word)) return 100;
    if (recipe._titulo.split(" ").some((part) => part.startsWith(word))) return 80;
    if (recipe._titulo.includes(word)) return 60;
    if (recipe._categoria.includes(word)) return 40;
    if (recipe._ingredientes.some((ingredient) => ingredient.includes(word))) return 20;
    return 0;
  }

  function score(recipe, query) {
    const words = query.split(/\s+/).filter(Boolean);
    let total = 0;
    for (const word of words) {
      const result = wordScore(recipe, word);
      if (!result) return 0;
      total += result;
    }
    return total;
  }

  function matchesFilters(recipe) {
    return (
      (!categorySelect.value || recipe.categoria === categorySelect.value) &&
      (!difficultySelect.value || recipe.dificultad === difficultySelect.value) &&
      (!timeSelect.value || timeBand(recipe.tiempo) === timeSelect.value)
    );
  }

  function hasFilters() {
    return Boolean(categorySelect.value || difficultySelect.value || timeSelect.value);
  }

  function search(text) {
    const query = norm(text.trim());
    return recetas
      .filter(matchesFilters)
      .map((recipe) => ({ recipe, score: query ? score(recipe, query) : 1 }))
      .filter((item) => item.score > 0)
      .sort((a, b) =>
        query ? b.score - a.score : a.recipe.titulo.localeCompare(b.recipe.titulo, "es"),
      )
      .slice(0, MAX_RESULTS)
      .map((item) => item.recipe);
  }

  function place() {
    bar.style.setProperty("--bar-r", `${form.offsetHeight / 2}px`);
    list.style.left = `${form.offsetLeft}px`;
    list.style.top = `${filters.hidden ? form.offsetTop + form.offsetHeight : filters.offsetTop + filters.offsetHeight}px`;
    list.style.width = `${form.offsetWidth}px`;
  }

  function placeFilters() {
    const barRect = bar.getBoundingClientRect();
    const formRect = form.getBoundingClientRect();
    filters.style.left = `${formRect.left - barRect.left}px`;
    filters.style.top = `${formRect.bottom - barRect.top}px`;
    filters.style.width = `${formRect.width}px`;
  }

  function close() {
    list.hidden = true;
    bar.classList.remove("open");
    active = -1;
    input.setAttribute("aria-expanded", "false");
  }

  function render() {
    if (!input.value.trim() && !hasFilters()) {
      close();
      return;
    }

    list.innerHTML = results.length
      ? results
          .map(
            (recipe, index) => `
              <li role="option" class="${index === active ? "active" : ""}">
                <a href="${urlDe(recipe)}">
                  ${recipe.imagen ? `<img src="${imgDe(recipe)}" alt="">` : ""}
                  <span>
                    <span class="suggestTitle">${recipe.titulo}</span>
                    <span class="suggestCat">${recipe.categoria} · ${recipe.tiempo} · ${recipe.dificultad}</span>
                  </span>
                </a>
              </li>
            `,
          )
          .join("")
      : '<li class="noResults">No hay recetas que coincidan</li>';

    place();
    list.hidden = false;
    bar.classList.add("open");
    input.setAttribute("aria-expanded", "true");
  }

  function updateResults() {
    results = search(input.value);
    active = -1;
    render();
  }

  function openFilters() {
    clearTimeout(filterCloseTimer);
    filters.hidden = false;
    placeFilters();
    bar.classList.add("filterOpen");
    requestAnimationFrame(() => {
      filters.classList.add("expanded");
    });
    filterToggle.setAttribute("aria-expanded", "true");
    filterToggle.classList.add("active");
  }

  function closeFilters() {
    filters.classList.remove("expanded");
    bar.classList.remove("filterOpen");
    filterToggle.setAttribute("aria-expanded", "false");
    filterToggle.classList.remove("active");
    filterCloseTimer = setTimeout(() => {
      if (!filters.classList.contains("expanded")) filters.hidden = true;
    }, 260);
  }

  filterToggle.addEventListener("click", () => {
    if (filters.hidden || !filters.classList.contains("expanded")) openFilters();
    else closeFilters();
  });

  input.addEventListener("input", updateResults);
  input.addEventListener("focus", () => {
    if (input.value.trim() || hasFilters()) updateResults();
  });

  [categorySelect, timeSelect, difficultySelect].forEach((select) => {
    select.addEventListener("change", updateResults);
  });

  input.addEventListener("keydown", (event) => {
    if (list.hidden || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      active = (active + 1) % results.length;
      render();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      active = (active - 1 + results.length) % results.length;
      render();
    } else if (event.key === "Escape") {
      close();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    results = search(input.value);
    if (!results.length) {
      render();
      return;
    }
    window.location.href = urlDe(results[active >= 0 ? active : 0]);
  });

  document.addEventListener("click", (event) => {
    if (!bar.contains(event.target)) close();
  });

  window.addEventListener("resize", () => {
    if (!filters.hidden) placeFilters();
    if (!list.hidden) place();
  });

  fetch("/Data/recetas.json")
    .then((response) => response.json())
    .then((data) => {
      recetas = data.map((recipe) => ({
        ...recipe,
        _titulo: norm(recipe.titulo),
        _categoria: norm(recipe.categoria || ""),
        _ingredientes: (recipe.ingredientes || []).map(norm),
      }));

      [...new Set(recetas.map((recipe) => recipe.categoria))]
        .sort((a, b) => a.localeCompare(b, "es"))
        .forEach((category) => {
          categorySelect.insertAdjacentHTML("beforeend", `<option value="${category}">${category}</option>`);
        });

      [...new Set(recetas.map((recipe) => recipe.dificultad))]
        .sort((a, b) => a.localeCompare(b, "es"))
        .forEach((difficulty) => {
          difficultySelect.insertAdjacentHTML("beforeend", `<option value="${difficulty}">${difficulty}</option>`);
        });
    })
    .catch((error) => console.error("Buscador:", error));
})();
