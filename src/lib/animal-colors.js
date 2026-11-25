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
    const palette = await getPalette(image, {
      colorCount: 3,
      quality: 10,
    });

    if (!palette?.length) return null;

    const colors = palette
      .slice(0, 3)
      .map((color) => color.hex());

    paletteCache.set(cover, colors);
    return colors;
  } catch (error) {
    console.warn(`No se pudieron extraer los colores de ${cover}:`, error);
    return null;
  }
}
