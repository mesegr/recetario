(() => {
  const categoria = new URLSearchParams(location.search).get("tipo");
  const title = document.getElementById("categoryTitle");
  const description = document.getElementById("categoryDescription");
  const grid = document.getElementById("categoryGrid");
  const alternativesSection = document.getElementById("alternativesSection");
  const alternativesGrid = document.getElementById("alternativesGrid");
  const notice = document.getElementById("categoryNotice");
  const categoryLinks = document.getElementById("categoryLinks");

  const recipeUrl = (recipe) =>
    `/RecetaIndividual/recetaBlog.html?id=${encodeURIComponent(recipe.id)}`;
  const imageUrl = (path) => (path.startsWith("/") ? path : `/${path}`);
  const categoryUrl = (name) =>
    `/Categoria/categoria.html?tipo=${encodeURIComponent(name)}`;

  function card(recipe) {
    return `
      <a class="categoryCard" href="${recipeUrl(recipe)}">
        <img src="${imageUrl(recipe.imagen)}" alt="${recipe.titulo}">
        <span class="categoryCardBody">
          <h2>${recipe.titulo}</h2>
          <span class="categoryCardMeta">${recipe.tiempo} · ${recipe.dificultad}</span>
          <span class="categoryCardDescription">${recipe.descripcion}</span>
        </span>
      </a>
    `;
  }

  fetch("/Data/recetas.json")
    .then((response) => {
      if (!response.ok) throw new Error("No se pudieron cargar las recetas");
      return response.json();
    })
    .then((recetas) => {
      const categorias = [...new Set(recetas.map((receta) => receta.categoria))].sort(
        (a, b) => a.localeCompare(b, "es"),
      );
      categoryLinks.innerHTML = categorias
        .map(
          (nombre) =>
            `<a href="${categoryUrl(nombre)}"${nombre === categoria ? ' aria-current="page"' : ""}>${nombre}</a>`,
        )
        .join("");

      const recetasCategoria = recetas.filter(
        (receta) => receta.categoria === categoria,
      );

      if (!categoria || recetasCategoria.length === 0) {
        title.textContent = "Categoría no encontrada";
        description.textContent = "No hemos encontrado recetas para esta categoría.";
        grid.innerHTML = '<p class="emptyCategory">Puedes volver al inicio para explorar todas las recetas.</p>';
        return;
      }

      document.title = `${categoria} | Recetario`;
      title.textContent = categoria;
      description.textContent = `${recetasCategoria.length} ${recetasCategoria.length === 1 ? "receta disponible" : "recetas disponibles"} en esta categoría.`;
      grid.classList.toggle("singleRecipe", recetasCategoria.length === 1);
      grid.innerHTML = recetasCategoria.map(card).join("");

      if (recetasCategoria.length === 1) {
        const alternativas = recetas
          .filter((receta) => receta.id !== recetasCategoria[0].id && receta.imagen)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        notice.textContent = `Por ahora solo tenemos una receta de ${categoria}.`;
        alternativesGrid.innerHTML = alternativas.map(card).join("");
        alternativesSection.hidden = false;
      }
    })
    .catch(() => {
      title.textContent = "No se pudieron cargar las recetas";
      description.textContent = "Inténtalo de nuevo más tarde.";
    });
})();
