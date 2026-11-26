import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPalette } from "colorthief";

const paletteCache = new Map();

function muteColor(hex, amount = 0.14) {
  const channels = hex.match(/[a-f\d]{2}/gi)?.map((channel) => Number.parseInt(channel, 16));
  if (!channels || channels.length !== 3) return hex;

  const muted = channels.map((channel, index) =>
    Math.round(channel * (1 - amount) + [39, 71, 75][index] * amount),
  );
  return `#${muted.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export async function extractAnimalColors(cover) {
  if (!cover) return null;
  if (paletteCache.has(cover)) return paletteCache.get(cover);

  try {
    const imagePath = path.resolve(process.cwd(), cover);
    const image = await readFile(imagePath);
    const imageName = path.basename(cover).toLowerCase();
    const isCaligo = imageName === "caligo_telamonius_memnon.jpg";
    const isSeaDragon = imageName === "phycodurus_eques.jpg";
    const isWasp = path.basename(cover) === "vespula_vulgaris.jpg";
    const seaDragonBlueRegion = { x: 0.5, y: 0.5, width: 0.45, height: 0.45 };
    const palette = await getPalette(image, {
      colorCount: 20,
      quality: 10,
      region: isCaligo
        ? { x: 0.34, y: 0.18, width: 0.38, height: 0.66 }
        : isSeaDragon
          ? seaDragonBlueRegion
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
    const preferredCandidates = isCaligo || isSeaDragon
      ? candidates.filter(
          ({ color, hue, lightness }) => {
            const hueMatches = isSeaDragon
              ? hue >= 175 && hue <= 215
              : hue >= 15 && hue <= 55;
            return (
            color.population >= maxPopulation * 0.02 &&
            hueMatches &&
            lightness >= 18 &&
            lightness <= 85
            );
          },
        )
      : candidates.filter(
          ({ color, lightness }) =>
            color.population >= maxPopulation * 0.02 &&
            lightness >= 20 &&
            lightness <= 88,
        );
    const minimumPreferredColors = isSeaDragon ? 2 : 3;
    const colors = (
      preferredCandidates.length >= minimumPreferredColors
        ? preferredCandidates
        : candidates
    )
      .sort((a, b) => {
        const score = (candidate) =>
          isCaligo
            ? candidate.saturation *
              Math.sqrt(candidate.color.population / maxPopulation) *
              (0.5 + 0.5 * candidate.lightnessBalance)
            : isSeaDragon
              ? candidate.saturation *
                Math.sqrt(candidate.color.population / maxPopulation) *
                candidate.lightnessBalance
            : candidate.vibrancy;
        return score(b) - score(a) || a.index - b.index;
      })
      .slice(0, 3);

    if (isWasp) {
      const yellow = candidates
        .filter(
          ({ color, hue, saturation, lightness }) =>
            color.population >= maxPopulation * 0.02 &&
            hue >= 45 &&
            hue <= 70 &&
            saturation >= 20 &&
            lightness >= 45 &&
            lightness <= 85,
        )
        .sort(
          (a, b) =>
            b.color.population - a.color.population ||
            b.saturation - a.saturation,
        )[0];

      if (yellow && !colors.some(({ color }) => color.hex() === yellow.color.hex())) {
        colors[colors.length - 1] = yellow;
      }
    }

    const extractedColors = colors.map(({ color }) =>
      isSeaDragon ? muteColor(color.hex()) : color.hex(),
    );

    paletteCache.set(cover, extractedColors);
    return extractedColors;
  } catch (error) {
    console.warn(`No se pudieron extraer los colores de ${cover}:`, error);
    return null;
  }
}
