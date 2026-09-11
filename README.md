# Maqueta · Experiencia universitaria 3D

Demostración de una landing inmersiva con contenido FAE USACH, preparada para revisión y presentación. No es el sitio oficial de admisión.

[Abrir la maqueta online](https://maescobarn.github.io/maqueta-fae-experiencia-3d/)

## Alcance

- Recorrido por el exterior, hall, escaleras y auditorio, ligado al scroll.
- Giros de cámara, audiencia y transición hacia el contenido del programa.
- Planes de 7 y 5 semestres, mallas, comparación y respaldo universitario.
- Alternativa sin movimiento y adaptación móvil.
- **mIA es una demostración visual: no está conectada a IA ni a un servidor. No envía preguntas ni registra conversaciones.**
- No hay formularios de captación ni conexión a CRM. Los enlaces institucionales externos conservan sus destinos reales.

## Ejecución

Node.js 22.13 o posterior.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

La base de navegación está configurada para `/maqueta-fae-experiencia-3d/`.
El workflow de GitHub Pages construye y publica la versión estática desde `main`.

## Activos y atribución

La identidad y el contenido académico pertenecen a las instituciones citadas. Se utilizan en esta maqueta de presentación; no implican un lanzamiento oficial.

Fotografía del aula: [FAE USACH, actividad de Política Económica](https://fae.usach.cl/fae/index.php/noticias-fae/7871-fae-usach-curso-de-politica-economica-culmina-con-presentaciones-sobre-inflacion-desigualdad-y-crecimiento-en-chile).

Malla y perfiles: [brochure oficial](https://faeusach.cl/brochures/2026-ice.pdf). Aranceles, acreditación y rankings mantienen sus referencias en la interfaz.

Sora y Source Sans 3 son fuentes distribuidas bajo SIL Open Font License. El proyecto no otorga una licencia abierta sobre marcas, fotografías ni otros recursos de terceros.

Personajes 3D: Renderpeople. Recursos sujetos a licencia; este repositorio no concede derechos de reutilización o redistribución sobre ellos. Véase `public/people-v4/LICENCIA.txt`.

## Recorrido en móviles

La calidad se adapta a pantallas estrechas y dispositivos táctiles, también en horizontal. Se conserva la geometría V4 y la distribución de 243 personas (144 sentadas); el perfil móvil usa texturas de hasta 1024 px, iluminación con una sombra de 1024 px y una sola pasada de renderizado. Los reflejos planos, las capturas cúbicas y la refracción se reservan al escritorio.

El edificio se descarga comprimido sin pérdida (19,2 MB → 3,0 MB). Se presenta antes de cargar las personas, que llegan en lotes. Los modelos y texturas móviles suman 14,8 MB, frente a los 37,1 MB anteriores; esto no incluye JavaScript, fuentes ni fotografías editoriales. Los originales permanecen en el repositorio.

«Comenzar recorrido» reproduce la ruta completa en unos 75 segundos. El scroll, el control de avance y las etapas permiten recorrerla manualmente. La preferencia de movimiento reducido se respeta hasta una activación explícita. Si la carga falla o excede el tiempo de espera, se ofrece reintento y acceso al programa.

Para regenerar los recursos de transporte y las variantes de resolución en macOS:

```sh
python3 scripts/prepare-mobile-assets.py
```

Validación: compilación TypeScript/Vite, integridad binaria del modelo descomprimido, inventario de personajes, vista vertical 393 × 852, orientación horizontal y recuperación de una descarga HTTP 503 en navegador Chromium. Esta comprobación no equivale a una prueba en un iPhone físico o Safari iOS.
