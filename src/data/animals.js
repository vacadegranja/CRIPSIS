import catalogSource from "../../info.md?raw";

export const elements = {
  aire: {
    name: "aire",
    theme: "air-theme",
    description: "Animales que habitan en el cielo.",
    texture: "img/Caligo_telamonius_memnon.jpg",
    patternColors: ["#c4a060", "#e6c98a", "#fff0ce"],
    patternVariant: 1,
  },
  tierra: {
    name: "tierra",
    theme: "earth-theme",
    description: "Animales que habitan en la tierra.",
    texture: "img/chamaeleo_chamaeleon.jpg",
    patternColors: ["#868c3f", "#b9c36b", "#e6e7a5"],
    patternVariant: 2,
  },
  agua: {
    name: "agua",
    theme: "water-theme",
    description: "Animales que habitan en el agua.",
    texture: "img/phycodurus_eques.jpg",
    patternColors: ["#6087a9", "#a4c9df", "#dceeff"],
    patternVariant: 0,
  },
};

const metadataRows = [
  ["Chamaeleo chamaeleon", "camaleon", "chamaeleo_chamaeleon.jpg", "Reptiles", "Chamaeleonidae"],
  ["Huechys sanguinea", "cigarra-escarlata", "huechys_sanguinea.jpg", "Insectos", "Cicadidae"],
  ["Cicada orni", "cigarra-comun", "cicada_orni.jpg", "Insectos", "Cicadidae"],
  ["Erinaceus europaeus", "erizo-europeo", "erinaceus_europaeus.jpg", "Mamíferos", "Erinaceidae"],
  ["Medauroidea extradentata", "insecto-palo-vietnam", "medauroidea_extradentata.jpg", "Insectos", "Phasmatidae"],
  ["Hymenopus coronatus", "mantis-orquidea", "hymenopus_coronatus.jpg", "Insectos", "Hymenopodidae"],
  ["Caligo telamonius memnon", "mariposa-caligo", "Caligo_telamonius_memnon.jpg", "Insectos", "Nymphalidae"],
  ["Gastropacha quercifolia", "mariposa-hoja-seca", "gastropacha_quercifolia.jpg", "Insectos", "Lasiocampidae"],
  ["Arctia caja", "polilla-tigre", "arctia_caja.jpg", "Insectos", "Erebidae"],
  ["Thaumoctopus mimicus", "pulpo", "thaumoctopus_mimicus.jpg", "Moluscos", "Octopodidae"],
  ["Chlorobalius leucoviridis", "saltamontes-australiano", "chlorobalius_leucoviridis.jpg", "Insectos", "Tettigoniidae"],
  ["Pituophis catenifer", "serpiente-toro", "pituophis_catenifer.jpg", "Reptiles", "Colubridae"],
  ["Vulpes lagopus", "zorro-artico", "vulpes_lagopus.jpg", "Mamíferos", "Canidae"],
  ["Orcinus orca", "orca", "orcinus_orca.jpg", "Mamíferos", "Delphinidae"],
  ["Orectolobus maculatus", "tiburon-alfombra", "orectolobus_maculatus.jpg", "Peces", "Orectolobidae"],
  ["Hemeroplanes triptolemus", "oruga-cabeza-serpiente", "hemeroplanes_triptolemus.jpg", "Insectos", "Sphingidae"],
  ["Phelsuma madagascariensis", "gecko-madagascar", "phelsuma_madagascariensis.jpg", "Reptiles", "Gekkonidae"],
  ["Otospermophilus beecheyi", "ardilla-terrestre-california", "otospermophilus_beecheyi.jpg", "Mamíferos", "Sciuridae"],
  ["Phycodurus eques", "dragon-de-mar", "phycodurus_eques.jpg", "Peces", "Syngnathidae"],
  ["Bubo virginianus", "buho-cornudo", "bubo_virginianus.jpg", "Aves", "Strigidae"],
  ["Euglossa sp.", "abeja-orquideas", "euglossa_sp_.jpg", "Insectos", "Apidae"],
  ["Hippocampus bargibanti", "caballito-mar-pigmeo", "hippocampus_bargibanti.jpg", "Peces", "Syngnathidae"],
  ["Synanceia verrucosa", "pez-piedra", "synanceia_verrucosa.jpg", "Peces", "Scorpaenidae"],
  ["Camposcia retusa", "cangrejo-decorador", "camposcia_retusa.jpg", "Crustáceos", "Epialtidae"],
  ["Nictibio urutaú", "potoo", "nictibio_urutau.jpg", "Aves", "Nyctibiidae"],
  ["Cuculus canorus", "cuco-comun", "cuculus_canorus.jpg", "Aves", "Cuculidae"],
  ["Danaus plexippus", "mariposa-monarca", "danaus_plexippus.jpg", "Insectos", "Nymphalidae"],
  ["Dendrobates tinctorius", "rana-dardo-venenosa", "dendrobates_tinctorius.jpg", "Anfibios", "Dendrobatidae"],
  ["Vespula vulgaris", "avispa-comun", "vespula_vulgaris.jpg", "Insectos", "Vespidae"],
  ["Hapalochlaena maculosa", "pulpo-anillos-azules", "hapalochlaena_maculosa.jpg", "Moluscos", "Octopodidae"],
  ["Antrozous pallidus", "murcielago-palido", "antrozous_pallidus.jpg", "Mamíferos", "Vespertilionidae"],
  ["Hemaris diffinis", "esfinge-colibri", "hemaris_diffinis.jpg", "Insectos", "Sphingidae"],
  ["Pterois volitans", "pez-leon", "pterois_volitans.jpg", "Peces", "Scorpaenidae"],
  ["Acanthurus pyroferus", "pez-cirujano-imitador", "acanthurus_pyroferus.jpg", "Peces", "Acanthuridae"],
  ["Bothus mancus", "lenguado-pavo-real", "bothus_mancus.jpg", "Peces", "Bothidae"],
  ["Histrio histrio", "pez-sargazo", "histrio_histrio.jpg", "Peces", "Antennariidae"],
  ["Panthera onca", "jaguar", "panthera_onca.jpg", "Mamíferos", "Felidae"],
  ["Equus quagga", "cebra-comun", "equus_quagga.jpg", "Mamíferos", "Equidae"],
  ["Dicrurus paradiseus", "drongo-cola-larga", "dicrurus_paradiseus.jpg", "Aves", "Dicruridae"],
  ["Bombus vestalis", "abejorro-cuco", "bombus_vestalis.jpg", "Insectos", "Apidae"],
  ["Oxymonacanthus longirostris", "pez-lima-arlequin", "oxymonacanthus_longirostris.jpg", "Peces", "Monacanthidae"],
  ["Corvus corax", "cuervo-comun", "corvus_corax.jpg", "Aves", "Corvidae"],
  ["Glaucus atlanticus", "dragon-azul", "glaucus_atlanticus.jpg", "Moluscos", "Glaucidae"],
  ["Metasepia pfefferi", "sepia-extravagante", "metasepia_pfefferi.jpg", "Moluscos", "Sepiidae"],
  ["Caprimulgus europaeus", "chotacabras-europeo", "caprimulgus_europaeus.jpg", "Aves", "Caprimulgidae"],
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

function parseCatalog(source) {
  return source
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .slice(1)
    .map((block) => {
      const fields = block
        .split(/\t|\r?\n/)
        .map((field) => field.trim())
        .filter(Boolean);
      if (fields.length !== 9) return null;

      const [name, scientificName, description, habitat, sense, use, action, elementName, adaptation] = fields;
      const metadata = metadataByScientificName.get(scientificName);
      if (!metadata) return null;

      const element = elementName.toLowerCase();
      if (!elements[element]) return null;

      const normalizedSense = sense
        .replace(/\bvision\b/gi, "visión")
        .replace(/\bolfato\b/gi, "olfato")
        .replace(/\bsonido\b/gi, "sonido")
        .replace(/\s+/g, " ")
        .trim();
      const displayName = displayNames.get(scientificName) ?? name;

      return {
        slug: metadata.slug,
        element,
        name: displayName,
        scientificName,
        cover: metadata.image ? `img/${metadata.image}` : null,
        texture: elements[element].texture,
        alt: `${displayName} (${scientificName})`,
        description,
        habitat,
        sense: normalizedSense[0]?.toLocaleUpperCase("es") + normalizedSense.slice(1),
        use,
        action: action[0]?.toLocaleUpperCase("es") + action.slice(1),
        adaptation,
        group: metadata.group,
        family: metadata.family,
      };
    })
    .filter(Boolean);
}

/**
 * @typedef {object} Animal
 * @property {string} slug
 * @property {"aire" | "tierra" | "agua"} element
 * @property {string} name
 * @property {string} scientificName
 * @property {string | null} cover
 * @property {string} texture
 * @property {string} alt
 * @property {string} description
 * @property {string} habitat
 * @property {string} sense
 * @property {string} use
 * @property {string} action
 * @property {string} adaptation
 * @property {string} group
 * @property {string} family
 */
/** @type {Animal[]} */
export const animals = parseCatalog(catalogSource);

export function animalsByElement(element) {
  return animals.filter((animal) => animal.element === element);
}

export function nextAnimal(current) {
  const group = animalsByElement(current.element);
  const index = group.findIndex((animal) => animal.slug === current.slug);
  return group[(index + 1) % group.length];
}
