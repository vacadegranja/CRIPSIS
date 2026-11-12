# CRIPSIS

Proyecto de Sergio Abraham Alquicira Arroyo y Sofía Moreno Cruz.

Sitio estático construido con Astro, Three.js y shaders GLSL. La escena de
partículas permanece activa durante la navegación y transforma cada imagen en
una nube de puntos interactiva.

## Qué está pasando

- [Astro](https://astro.build/) genera una página HTML estática para cada ruta.
- [Three.js](https://threejs.org/) prepara WebGL, la cámara y la nube de puntos.
- Los shaders [GLSL](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
  deciden la posición y el color de cada partícula en la GPU.
- `src/layouts/BaseLayout.astro` contiene la estructura compartida y mantiene el
  canvas activo entre páginas.
- `src/pages/` define las rutas; las páginas de animales se generan desde
  `src/data/animals.js`.
- `src/lib/particles/` carga las imágenes y controla la escena.
- `src/shaders/` contiene el vertex shader y el fragment shader.
- `src/config/particles.js` expone los parámetros visuales ajustables.
- `public/img/` contiene las imágenes que se copian sin cambios al sitio final.

## Desarrollo

```bash
npm install
npm run dev
```

En local, el sitio se abre desde `http://localhost:4321/`.

## Producción

```bash
npm run build
npm run preview
```

El resultado estático se genera en `dist/` y el workflow de GitHub Actions lo
publica en GitHub Pages. `PUBLIC_BASE_PATH` controla el subdirectorio: local usa
`/`, GitHub Pages usa `/CRIPSIS` y un dominio propio normalmente vuelve a `/`.
Los valores de ejemplo están en `.env.example`.

Referencias: [documentación de Astro](https://docs.astro.build/),
[documentación de Three.js](https://threejs.org/docs/) y
[ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial).
