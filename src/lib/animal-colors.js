import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPalette } from "colorthief";

const paletteCache = new Map();

export async function extractAnimalColors(cover) {
  if (!cover) return null;
  if (paletteCache.has(cover)) return paletteCache.get(cover);

  try {
    const imagePath = path.resolve(process.cwd(), cover);
    const image = await readFile(imagePath);
    const isCaligo = path.basename(cover) === "caligo_telamonius_memnon.jpg";
    const palette = await getPalette(image, {
      colorCount: 20,
      quality: 10,
      region: isCaligo
        ? { x: 0.34, y: 0.18, width: 0.38, height: 0.66 }
        : { x: 0.15, y: 0.1, width: 0.7, height: 0.8 },
    });

    if (!palette?.length) return null;

    const maxPopulation = Math.max(...palette.map((color) => color.population));
    const candidates = palette.map((color, index) => {
      const { h: hue, s: saturation, l: lightness } = color.hsl();
      const lightnessBalance = Math.max(0, 1 - Math.abs(lightness - 55) / 55);
      return {
        color,
        index,
        hue,
        saturation,
        lightness,
        lightnessBalance,
        vibrancy: saturation * (0.6 + 0.4 * lightnessBalance),
      };
    });
    const preferredCandidates = isCaligo
      ? candidates.filter(
          ({ color, hue, lightness }) =>
            color.population >= maxPopulation * 0.02 &&
            hue >= 15 &&
            hue <= 55 &&
            lightness >= 18 &&
            lightness <= 85,
        )
      : candidates.filter(
          ({ color, lightness }) =>
            color.population >= maxPopulation * 0.02 &&
            lightness >= 20 &&
            lightness <= 88,
        );
    const colors = (preferredCandidates.length >= 3 ? preferredCandidates : candidates)
      .sort((a, b) => {
        const score = (candidate) =>
          isCaligo
            ? candidate.saturation *
              Math.sqrt(candidate.color.population / maxPopulation) *
              (0.5 + 0.5 * candidate.lightnessBalance)
            : candidate.vibrancy;
        return score(b) - score(a) || a.index - b.index;
      })
      .slice(0, 3)
      .map(({ color }) => color.hex());

    paletteCache.set(cover, colors);
    return colors;
  } catch (error) {
    console.warn(`No se pudieron extraer los colores de ${cover}:`, error);
    return null;
  }
}
