(() => {
  const nutricionPorReceta = {
    "tortilla-de-patatas": {
      Calorías: "320 kcal",
      Proteínas: "15 g",
      Hidratos: "24 g",
      Grasas: "19 g",
    },
    gazpacho: {
      Calorías: "150 kcal",
      Proteínas: "3 g",
      Hidratos: "12 g",
      Grasas: "10 g",
    },
    "paella-valenciana": {
      Calorías: "510 kcal",
      Proteínas: "27 g",
      Hidratos: "62 g",
      Grasas: "16 g",
    },
    "lentejas-estofadas": {
      Calorías: "390 kcal",
      Proteínas: "22 g",
      Hidratos: "48 g",
      Grasas: "12 g",
    },
    "croquetas-de-jamon": {
      Calorías: "285 kcal",
      Proteínas: "11 g",
      Hidratos: "25 g",
      Grasas: "15 g",
    },
    "ensalada-cesar": {
      Calorías: "430 kcal",
      Proteínas: "25 g",
      Hidratos: "18 g",
      Grasas: "28 g",
    },
    "macarrones-bolonesa": {
      Calorías: "560 kcal",
      Proteínas: "29 g",
      Hidratos: "72 g",
      Grasas: "17 g",
    },
    "pizza-margarita": {
      Calorías: "620 kcal",
      Proteínas: "25 g",
      Hidratos: "78 g",
      Grasas: "23 g",
    },
    "hamburguesa-casera": {
      Calorías: "650 kcal",
      Proteínas: "35 g",
      Hidratos: "48 g",
      Grasas: "32 g",
    },
    "salmon-al-horno": {
      Calorías: "360 kcal",
      Proteínas: "31 g",
      Hidratos: "18 g",
      Grasas: "18 g",
    },
    "pollo-al-curry": {
      Calorías: "540 kcal",
      Proteínas: "32 g",
      Hidratos: "55 g",
      Grasas: "20 g",
    },
    tiramisu: {
      Calorías: "410 kcal",
      Proteínas: "8 g",
      Hidratos: "39 g",
      Grasas: "25 g",
    },
    "brownie-de-chocolate": {
      Calorías: "360 kcal",
      Proteínas: "5 g",
      Hidratos: "42 g",
      Grasas: "20 g",
    },
    "tarta-de-queso": {
      Calorías: "390 kcal",
      Proteínas: "8 g",
      Hidratos: "29 g",
      Grasas: "27 g",
    },
    "tortitas-americanas": {
      Calorías: "330 kcal",
      Proteínas: "9 g",
      Hidratos: "45 g",
      Grasas: "13 g",
    },
    "tostada-de-aguacate": {
      Calorías: "370 kcal",
      Proteínas: "14 g",
      Hidratos: "35 g",
      Grasas: "20 g",
    },
    "crema-de-calabaza": {
      Calorías: "180 kcal",
      Proteínas: "4 g",
      Hidratos: "25 g",
      Grasas: "7 g",
    },
    "huevos-rotos": {
      Calorías: "590 kcal",
      Proteínas: "29 g",
      Hidratos: "42 g",
      Grasas: "35 g",
    },
    guacamole: {
      Calorías: "190 kcal",
      Proteínas: "3 g",
      Hidratos: "10 g",
      Grasas: "16 g",
    },
    "ensalada-de-pasta": {
      Calorías: "410 kcal",
      Proteínas: "18 g",
      Hidratos: "54 g",
      Grasas: "14 g",
    },
  };

  const id = new URLSearchParams(location.search).get("id");
  const ruta = (p) => (p.startsWith("/") ? p : `/${p}`);
  const texto = (idHueco, valor) => {
    const el = document.getElementById(idHueco);
    if (el) el.textContent = valor;
  };
  const html = (idHueco, valor) => {
    const el = document.getElementById(idHueco);
    if (el) el.innerHTML = valor;
  };
  const urlDe = (x) => `/RecetaIndividual/recetaBlog.html?id=${x.id}`;

  function tarjetas(idHueco, lista, mensajeVacio) {
    const el = document.getElementById(idHueco);
    if (!el) return;

    if (lista.length === 0) {
      el.innerHTML = `<p class="cardsVacio">${mensajeVacio}</p>`;
      return;
    }

    el.innerHTML = lista
      .map(
        (x) => `
    <a class="miniCard" href="${urlDe(x)}">
      <img src="${ruta(x.imagen)}" alt="${x.titulo}">
      <span>${x.titulo}</span>
    </a>
  `,
      )
      .join("");
  }
  fetch("/Data/recetas.json")
    .then((res) => res.json())
    .then((recetas) => {
      const r = recetas.find((x) => x.id === id);

      if (!r) {
        texto("titulo", "Receta no encontrada");
        return;
      }

      const conFoto = recetas.filter((x) => x.imagen && x.id !== r.id);
      let relacionadas = conFoto
        .filter((x) => x.categoria === r.categoria)
        .slice(0, 3);
      let tituloRel = `Más ${r.categoria}`;

      if (relacionadas.length === 0) {
        tituloRel = "Otras recetas";
        relacionadas = [...conFoto].sort(() => Math.random() - 0.5).slice(0, 3);
      }
      texto("relacionadasTitle", tituloRel);
      tarjetas("relacionadas", relacionadas, "");

      let vistos = [];
      try {
        vistos = JSON.parse(localStorage.getItem("recientes")) || [];
      } catch (e) {}

      const recientes = vistos
        .filter((id) => id !== r.id)
        .map((id) => recetas.find((x) => x.id === id))
        .filter((x) => x && x.imagen)
        .slice(0, 3);
      tarjetas("recientes", recientes, "Todavía no has visto otras recetas.");

      try {
        localStorage.setItem(
          "recientes",
          JSON.stringify(
            [r.id, ...vistos.filter((id) => id !== r.id)].slice(0, 10),
          ),
        );
      } catch (e) {}

      document.title = `${r.titulo} | Recetario`;

      texto("titulo", r.titulo);
      texto("descripcion", r.descripcion);
      texto("raciones", r.raciones);
      texto("tiempo", r.tiempo);
      texto("dificultad", r.dificultad);
      texto("categoria", r.categoria);
      texto("categoriaAside", r.categoria);
      texto(
        "ingredientesTitle",
        `Ingredientes para ${r.raciones} ${r.raciones === 1 ? "ración" : "raciones"}`,
      );

      const nutricion = r.nutricion || nutricionPorReceta[r.id];
      const nutritionTable = document.getElementById("nutrition");
      if (nutritionTable && nutricion) {
        nutritionTable.innerHTML = Object.entries(nutricion)
          .map(
            ([nombre, valor]) =>
              `<tr><th scope="row">${nombre}</th><td>${valor}</td></tr>`,
          )
          .join("");
      }

      const img = document.getElementById("imagen");
      if (img) {
        if (r.imagen) {
          img.src = ruta(r.imagen);
          img.alt = r.titulo;
        } else {
          img.remove();
        }
      }

      html(
        "meta",
        `
        <li>⏱ ${r.tiempo}</li>
        <li>📊 ${r.dificultad}</li>
        <li>🍽 ${r.raciones} raciones</li>
        <li>🏷 ${r.categoria}</li>
      `,
      );
      html("ingredientes", r.ingredientes.map((i) => `<li>${i}</li>`).join(""));
      html("pasos", r.pasos.map((p) => `<li>${p}</li>`).join(""));
    })
    .catch((err) => {
      console.error("Receta:", err);
      texto("titulo", "No se pudo cargar la receta");
    });
})();
