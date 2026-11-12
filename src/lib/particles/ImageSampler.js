export class ImageSampler {
  constructor(config) {
    this.config = config;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
  }

  async sample(url, count, viewportAspect = 1) {
    const image = await this.#loadImage(url);
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const width = Math.min(this.config.sampleResolution, image.naturalWidth);
    const height = Math.max(1, Math.round(width / imageAspect));

    this.canvas.width = width;
    this.canvas.height = height;
    this.context.clearRect(0, 0, width, height);
    this.context.drawImage(image, 0, 0, width, height);

    const pixels = this.context.getImageData(0, 0, width, height).data;
    const candidates = [];

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const alpha = pixels[offset + 3] / 255;
        const luminance =
          (pixels[offset] * 0.2126 +
            pixels[offset + 1] * 0.7152 +
            pixels[offset + 2] * 0.0722) /
          255;

        if (
          alpha >= this.config.alphaThreshold &&
          luminance >= this.config.luminanceThreshold
        ) {
          candidates.push({ x, y, offset });
        }
      }
    }

    if (!candidates.length) {
      throw new Error(`La imagen ${url} no contiene píxeles muestreables.`);
    }

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const visibleWidth = this.config.imageScale * Math.min(viewportAspect, imageAspect);
    const visibleHeight = visibleWidth / imageAspect;

    for (let index = 0; index < count; index += 1) {
      const candidate = candidates[Math.floor(Math.random() * candidates.length)];
      const positionOffset = index * 3;
      const jitterX = (Math.random() - 0.5) / width;
      const jitterY = (Math.random() - 0.5) / height;

      positions[positionOffset] =
        ((candidate.x / Math.max(1, width - 1) - 0.5) + jitterX) * visibleWidth * 2;
      positions[positionOffset + 1] =
        ((0.5 - candidate.y / Math.max(1, height - 1)) + jitterY) * visibleHeight * 2;
      positions[positionOffset + 2] = (Math.random() - 0.5) * 0.025;

      colors[positionOffset] = pixels[candidate.offset] / 255;
      colors[positionOffset + 1] = pixels[candidate.offset + 1] / 255;
      colors[positionOffset + 2] = pixels[candidate.offset + 2] / 255;
    }

    return { positions, colors };
  }

  #loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
      image.src = url;
    });
  }
}
