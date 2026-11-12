export const elements = {
  aire: {
    name: "aire",
    theme: "air-theme",
    description: "conoce a los animales que habitan en el cielo.",
    texture: "img/caligo.png",
  },
  tierra: {
    name: "tierra",
    theme: "earth-theme",
    description: "conoce a los animales que habitan en la tierra.",
    texture: "img/camaleon.png",
  },
  agua: {
    name: "agua",
    theme: "water-theme",
    description: "conoce a los animales que habitan en el agua.",
    texture: "img/orca.png",
  },
};

export const animals = [
  {
    slug: "orca",
    element: "agua",
    name: "Orca",
    scientificName: "Orcinus orca",
    texture: "img/orca.png",
    cover: "img/orcinus_orca.jpg",
    alt: "Orca nadando en el océano",
    description:
      "La orca combina el contraste de su cuerpo con la luz y la profundidad del océano.",
  },
  {
    slug: "pulpo",
    element: "agua",
    name: "Pulpo",
    scientificName: "Thaumoctopus mimicus",
    texture: "img/thaumoctopus_mimicus.jpg",
    cover: "img/thaumoctopus_mimicus.jpg",
    alt: "Pulpo mimo sobre el fondo marino",
    description:
      "El pulpo mimo transforma su color, su silueta y su movimiento para confundirse con otras especies.",
  },
];

export function animalsByElement(element) {
  return animals.filter((animal) => animal.element === element);
}

export function nextAnimal(current) {
  const group = animalsByElement(current.element);
  const index = group.findIndex((animal) => animal.slug === current.slug);
  return group[(index + 1) % group.length];
}
