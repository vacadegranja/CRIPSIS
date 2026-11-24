# CRIPSIS

Proyecto de Sergio Abraham Alquicira Arroyo y Sofía Moreno Cruz.

Sitio estático construido con Astro y Three.js. Las texturas visuales se generan
con patrones orgánicos GLSL que reaccionan al cursor y al desplazamiento.

## Qué está pasando

- [Astro](https://astro.build/) genera una página HTML estática para cada ruta.
- [Three.js](https://threejs.org/) prepara los canvas WebGL y las cámaras.
- Los shaders [GLSL](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
  generan contornos, escalas, ondas y texturas inspiradas en el camuflaje.
- `src/layouts/BaseLayout.astro` contiene la estructura compartida.
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

## Patrón orgánico por sección

Las páginas de elementos (`/aire/`, `/tierra/`, `/agua/`) y las fichas de
animales existentes incorporan `src/components/OrganicPattern.astro`. Este
componente es independiente de `ParticleCanvas`: conserva el sistema de
partículas global y añade un shader WebGL transparente en la sección donde se
incluye.

- La aparición comienza al cargar la página y continúa revelándose al avanzar
  por la sección.
- El cursor deforma localmente el campo de líneas.
- La paleta se define por elemento en `src/data/animals.js` (`patternColors`).
- Para añadir el efecto a otra sección, importa `OrganicPattern.astro` y
  colócalo como primer hijo de un contenedor con `position: relative` y
  `isolation: isolate`; pasa tres colores CSS en la propiedad `colors`.

El proyecto usa la versión de Astro declarada en `package.json`. Comprueba la
versión de Node requerida por esa versión de Astro antes de ejecutar `npm run
build` (Astro 7.4.11 requiere Node >=22.23.4).
