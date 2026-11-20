import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "info.md"), "utf8");
const sections = {
  aire: { label: "Aire", className: "air", cardClass: "a", titleId: "titulo-a" },
  tierra: { label: "Tierra", className: "earth", cardClass: "t", titleId: "titulo-t" },
  agua: { label: "Agua", className: "water", cardClass: "w", titleId: "titulo-w" },
};

const metadataRows = [
  ["Chamaeleo chamaeleon", "camaleon", "Chamaeleo chamaeleon.jpg", "Reptiles", "Chamaeleonidae"],
  ["Huechys sanguinea", "cigarra-escarlata", "Huechys sanguinea.jpg", "Insectos", "Cicadidae"],
  ["Cicada orni", "cigarra-comun", "Cicada orni.jpg", "Insectos", "Cicadidae"],
  ["Erinaceus europaeus", "erizo-europeo", "erizocomun.jpg", "Mamíferos", "Erinaceidae"],
  ["Medauroidea extradentata", "insecto-palo-vietnam", "insecto.palo.jpg", "Insectos", "Phasmatidae"],
  ["Hymenopus coronatus", "mantis-orquidea", "Hymenopus-coronatus.jpg", "Insectos", "Hymenopodidae"],
  ["Caligo telamonius memnon", "mariposa-caligo", "caligo.jpg", "Insectos", "Nymphalidae"],
  ["Gastropacha quercifolia", "mariposa-hoja-seca", "hojaseca.jpg", "Insectos", "Lasiocampidae"],
  ["Arctia caja", "polilla-tigre", "Arctia caja01.jpg", "Insectos", "Erebidae"],
  ["Thaumoctopus mimicus", "pulpo", "thaumoctopus_mimicus.jpg", "Moluscos", "Octopodidae"],
  ["Chlorobalius leucoviridis", "saltamontes-australiano", "saltamontes.jpg", "Insectos", "Tettigoniidae"],
  ["Pituophis catenifer", "serpiente-toro", "serpiente.toro.jpg", "Reptiles", "Colubridae"],
  ["Vulpes lagopus", "zorro-artico", "zorro-polar.jpg", "Mamíferos", "Canidae"],
  ["Orcinus orca", "orca", "orcinus_orca.jpg", "Mamíferos", "Delphinidae"],
  ["Orectolobus maculatus", "tiburon-alfombra", "tiburon.alfombra01.jpg", "Peces", "Orectolobidae"],
  ["Hemeroplanes triptolemus", "oruga-cabeza-serpiente", "oruga.cabeza.serpiente01.jpg", "Insectos", "Sphingidae"],
  ["Phelsuma madagascariensis", "gecko-madagascar", "gecko de madagascar.jpg", "Reptiles", "Gekkonidae"],
  ["Otospermophilus beecheyi", "ardilla-terrestre-california", "ardilla.jpg", "Mamíferos", "Sciuridae"],
  ["Phycodurus eques", "dragon-de-mar", "dragon.de.mar.jpg", "Peces", "Syngnathidae"],
  ["Bubo virginianus", "buho-cornudo", "buho.cornudo.jpg", "Aves", "Strigidae"],
  ["Euglossa sp.", "abeja-orquideas", "abeja.de.las.orquideas02.jpg", "Insectos", "Apidae"],
  ["Hippocampus bargibanti", "caballito-mar-pigmeo", "Hippocampus bargibanti01.jpg", "Peces", "Syngnathidae"],
  ["Synanceia verrucosa", "pez-piedra", "Synanceia-verrucosa01.jpg", "Peces", "Scorpaenidae"],
  ["Camposcia retusa", "cangrejo-decorador", "cangrejo.decorador.jpg", "Crustáceos", "Epialtidae"],
  ["Nictibio urutaú", "potoo", "Nictibio urutaú.jpg", "Aves", "Nyctibiidae"],
  ["Cuculus canorus", "cuco-comun", "Cuculus canorus.jpg", "Aves", "Cuculidae"],
  ["Danaus plexippus", "mariposa-monarca", "Danaus plexippus.jpg", "Insectos", "Nymphalidae"],
  ["Dendrobates tinctorius", "rana-dardo-venenosa", "dendrobates_tinctorius.jpg", "Anfibios", "Dendrobatidae"],
  ["Vespula vulgaris", "avispa-comun", "vespula_vulgaris.jpg", "Insectos", "Vespidae"],
  ["Hapalochlaena maculosa", "pulpo-anillos-azules", "hapalochlaena_maculosa.jpg", "Moluscos", "Octopodidae"],
  ["Antrozous pallidus", "murcielago-palido", "antrozous_pallidus.jpg", "Mamíferos", "Vespertilionidae"],
  ["Hemaris diffinis", "esfinge-colibri", "hermaris_diffinis02.jpg", "Insectos", "Sphingidae"],
  ["Pterois volitans", "pez-leon", "pterois_volitans.jpg", "Peces", "Scorpaenidae"],
  ["Acanthurus pyroferus", "pez-cirujano-imitador", "acanthurus_pyroferus.jpg", "Peces", "Acanthuridae"],
  ["Bothus mancus", "lenguado-pavo-real", "bothus_mancus.jpg", "Peces", "Bothidae"],
  ["Histrio histrio", "pez-sargazo", "Histrio-histrio.jpg", "Peces", "Antennariidae"],
];
const metadataByScientificName = new Map(
  metadataRows.map(([scientificName, slug, image, group, family]) => [
    scientificName,
    { slug, image, group, family },
  ]),
);
const displayNames = new Map([
  ["Cicada orni", "Cigarra común"],
  ["Erinaceus europaeus", "Erizo común europeo"],
  ["Thaumoctopus mimicus", "Pulpo mimo o imitador"],
  ["Vulpes lagopus", "Zorro polar o ártico"],
]);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function assetPath(filename) {
  return `../img/${encodeURIComponent(filename)}`;
}

const logoSvg = `<svg viewBox="0 0 61.79 52.96" aria-hidden="true">
          <path fill="currentColor" d="M20.17,52.96C7.16,52.96,0,45.79,0,32.78v-12.61C0,7.17,7.16,0,20.17,0h21.44c13.01,0,20.17,6.05,20.17,17.02,0,4.81-2.76,7.57-7.57,7.57h-13.87c-4.81,0-7.57-2.76-7.57-7.57v-6.94c0-.94-.32-1.26-1.26-1.26h-1.26c-.94,0-1.26.32-1.26,1.26v32.79c0,.94.32,1.26,1.26,1.26h1.26c.94,0,1.26-.32,1.26-1.26v-7.57c0-4.81,2.76-7.57,7.57-7.57h13.87c4.81,0,7.57,2.76,7.57,7.57v3.78c0,8.94-4.93,13.87-13.87,13.87h-27.74Z"></path>
        </svg>`;

function letterTitle(text, id) {
  const letters = Array.from(text)
    .map((letter) => `<span>${escapeHtml(letter)}</span>`)
    .join("\n          ");
  return `<h1 id="${id}">\n          ${letters}\n        </h1>`;
}

function animalCard(animal, fromDetail = false) {
  const category = sections[animal.element];
  const href = fromDetail
    ? `../${animal.element}/${animal.slug}.html`
    : `./${animal.slug}.html`;
  const relatedData = fromDetail
    ? ` data-related-card data-element="${animal.element}" data-adaptations="${animal.adaptations.join(" ")}" data-group="${escapeHtml(animal.group)}" data-family="${escapeHtml(animal.family)}"`
    : "";
  const hidden = fromDetail && animal.hidden ? " hidden" : "";

  return `<a class="animal-card animal-card-${category.cardClass}" href="${href}"${relatedData}${hidden}>
        <img src="${assetPath(animal.image)}" alt="${escapeHtml(animal.alt)}" loading="lazy">
        <h2>${escapeHtml(animal.name)}</h2>
      </a>`;
}

function categoryPage(element, entries) {
  const category = sections[element];
  const cards = entries.map((animal) => animalCard(animal)).join("\n      ");
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Animales de ${category.label.toLowerCase()} y sus adaptaciones.">
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/script.js" defer></script>
    <title>Animales de ${category.label} - CRIPSIS</title>
</head>
<body class="${element === "agua" ? "agua" : element === "aire" ? "air" : "earth"}-theme">
    <header class="home-header">
      <nav class="top-nav" aria-label="Navegación principal">
        <a class="home-link" href="../index.html" aria-label="Volver al inicio">
          ${logoSvg}
        </a>
      </nav>
      <div class="${category.className}">
        ${letterTitle(category.label.toLowerCase(), category.titleId)}
        <p>Animales del elemento ${category.label.toLowerCase()}</p>
      </div>
    </header>
    <main class="animal-grid" aria-label="Animales de ${category.label.toLowerCase()}">
      ${cards}
    </main>
</body>
</html>
`;
}

function relatedSection(current, allAnimals) {
  const relatedCards = allAnimals
    .filter((animal) => animal.slug !== current.slug)
    .map((animal) => animalCard({ ...animal, hidden: animal.element !== current.element }, true))
    .join("\n      ");

  return `<section class="related-section" aria-labelledby="related-title" data-related
      data-current-element="${current.element}"
      data-current-group="${escapeHtml(current.group)}"
      data-current-family="${escapeHtml(current.family)}"
      data-current-adaptations="${current.adaptations.join(" ")}">
      <h2 id="related-title">Animales relacionados</h2>
      <p>Elige un criterio para ver todos los animales relacionados.</p>
      <div class="related-controls">
        <div class="related-modes" role="group" aria-label="Tipo de relación">
          <button type="button" data-related-mode="element" aria-pressed="true">Elemento</button>
          <button type="button" data-related-mode="adaptation" aria-pressed="false">Adaptación</button>
          <button type="button" data-related-mode="taxonomy" aria-pressed="false">Grupo o familia</button>
        </div>
      </div>
      <p class="related-status" data-related-status aria-live="polite"></p>
      <div class="animal-grid related-grid" data-related-grid>
      ${relatedCards}
      </div>
      <p class="related-empty" data-related-empty hidden>No hay otros animales con esta característica.</p>
    </section>`;
}

function animalPage(animal, allAnimals) {
  const category = sections[animal.element];
  const adaptations = animal.adaptations
    .map((adaptation) => adaptation[0].toUpperCase() + adaptation.slice(1))
    .join(" y ");

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(animal.description)}">
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/script.js" defer></script>
    <script src="../js/related-animals.js" defer></script>
    <title>${escapeHtml(animal.name)} - CRIPSIS</title>
</head>
<body class="${animal.element === "agua" ? "agua" : animal.element === "aire" ? "air" : "earth"}-theme">
    <header class="home-header">
      <nav class="top-nav" aria-label="Navegación principal">
        <a class="home-link" href="../index.html" aria-label="Volver al inicio">
          ${logoSvg}
        </a>
      </nav>
      <div class="${category.className}">
        <a class="element-label" href="./index.html">${category.label}</a>
        ${letterTitle(animal.name.toLowerCase(), category.titleId)}
        <p><em>${escapeHtml(animal.scientificName)}</em></p>
        <img class="animal-hero-image" src="${assetPath(animal.image)}" alt="${escapeHtml(animal.alt)}">
      </div>
    </header>
    <main>
      <article class="animal-details">
        <section>
          <h2>¿Qué hace?</h2>
          <p>${escapeHtml(animal.description)}</p>
        </section>
        <section>
          <h2>¿Dónde habita?</h2>
          <p>${escapeHtml(animal.habitat)}</p>
        </section>
        <dl class="animal-facts">
          <div><dt>Sentido</dt><dd>${escapeHtml(animal.sense)}</dd></div>
          <div><dt>Uso</dt><dd>${escapeHtml(animal.use)}</dd></div>
          <div><dt>Acción</dt><dd>${escapeHtml(animal.action)}</dd></div>
          <div><dt>Elemento</dt><dd>${category.label}</dd></div>
          <div><dt>Tipo de adaptación</dt><dd>${escapeHtml(adaptations)}</dd></div>
        </dl>
      </article>
      ${relatedSection(animal, allAnimals)}
    </main>
</body>
</html>
`;
}

const blocks = source
  .split(/\r?\n\s*\r?\n/)
  .map((block) => block.trim())
  .filter(Boolean)
  .slice(1);
const animals = blocks.map((block, index) => {
  const fields = block
    .split(/\t|\r?\n/)
    .map((field) => field.trim())
    .filter(Boolean);
  if (fields.length !== 9) {
    throw new Error(`La ficha ${index + 1} tiene ${fields.length} campos, se esperaban 9.`);
  }

  const [name, scientificName, description, habitat, sense, use, action, rawElement, rawAdaptations] =
    fields;
  const metadata = metadataByScientificName.get(scientificName);
  if (!metadata) {
    throw new Error(`Falta metadata para ${scientificName}.`);
  }

  const element = rawElement.toLowerCase();
  if (!sections[element]) {
    throw new Error(`Elemento no reconocido para ${scientificName}: ${rawElement}.`);
  }
  if (!existsSync(join(root, "img", metadata.image))) {
    throw new Error(`No existe la imagen de ${scientificName}: ${metadata.image}.`);
  }

  const adaptations = rawAdaptations
    .toLowerCase()
    .split(/\s+y\s+/)
    .map((value) => value.trim());
  const displayName = displayNames.get(scientificName) ?? name;
  const normalizedSense = sense
    .replace(/\bvision\b/gi, "visión")
    .replace(/\bolfato\b/gi, "olfato")
    .replace(/\bsonido\b/gi, "sonido")
    .replace(/\s+/g, " ")
    .trim();

  return {
    ...metadata,
    name: displayName,
    scientificName,
    description,
    habitat,
    sense:
      normalizedSense[0].toLocaleUpperCase("es") + normalizedSense.slice(1),
    use,
    action: action[0].toLocaleUpperCase("es") + action.slice(1),
    element,
    adaptations,
    alt: `${displayName} (${scientificName})`,
  };
});

if (animals.length !== metadataRows.length) {
  throw new Error(
    `info.md contiene ${animals.length} animales y se definieron ${metadataRows.length} imágenes y clasificaciones.`,
  );
}

for (const [element, category] of Object.entries(sections)) {
  const entries = animals.filter((animal) => animal.element === element);
  writeFileSync(join(root, element, "index.html"), categoryPage(element, entries));
  for (const animal of entries) {
    writeFileSync(
      join(root, element, `${animal.slug}.html`),
      animalPage(animal, animals),
    );
  }
  console.log(`${category.label}: ${entries.length} animales`);
}

console.log(`Se generaron ${animals.length} fichas HTML.`);
