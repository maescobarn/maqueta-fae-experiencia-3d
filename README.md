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
