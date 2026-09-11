export type Plan=5|7;
export const curriculum:Record<Plan,string[][]>={
 5:[
  ['Microeconomía I','Macroeconomía I','Métodos Cuantitativos','Economía Financiera I','Taller de Habilidades II'],
  ['Microeconomía II','Macroeconomía II','Lenguajes de Programación para Economistas','Economía Financiera II','Electivo I'],
  ['Historia Económica','Electivo VII','Econometría I','Electivo XII','Inglés para la Economía VI'],
  ['Práctica Profesional','Econometría II','Electivo XIII'],
  ['Trabajo de Título','Electivo XIV'],
 ],
 7:[
  ['Introducción a la Economía','Estadística para la Economía II','Matemáticas para la Administración y Economía II','Contabilidad General','Taller de Habilidades II'],
  ['Principios de Microeconomía','Principios de Macroeconomía','Matemáticas para la Administración y Economía III','Contabilidad Financiera y Toma de Decisiones','Electivo I'],
  ['Microeconomía I','Macroeconomía I','Métodos Cuantitativos','Economía Financiera I','Comunicación Efectiva'],
  ['Microeconomía II','Macroeconomía II','Lenguajes de Programación para Economistas','Economía Financiera II','Taller de Comunicación para Economistas'],
  ['Historia Económica','Electivo VII','Econometría I','Electivo XII','Inglés para la Economía V'],
  ['Práctica Profesional','Econometría II','Electivo XIII'],
  ['Trabajo de Título','Electivo XIV','Inglés para la Economía VI'],
 ]
};
export const area=(name:string)=>/Título|Práctica/.test(name)?'Cierre profesional':/Electivo/.test(name)?'Electivos':/Inglés|Taller|Comunicación/.test(name)?'Habilidades':/Métodos|Matemáticas|Estadística|Econometría|Programación/.test(name)?'Métodos y datos':/Contabilidad|Financiera/.test(name)?'Finanzas':'Economía';
export const areaColors:Record<string,string>={'Economía':'#efa54c','Métodos y datos':'#76bbb7','Finanzas':'#adb8df','Habilidades':'#c3bfad','Electivos':'#d79f9f','Cierre profesional':'#f2df9b'};
export const curriculumSource={url:'https://faeusach.cl/brochures/2026-ice.pdf',pages:{5:6,7:7},verified:'2026-09-11',note:'Mallas transcritas de las páginas 6 y 7 del PDF del programa. Las asignaturas y la duración individual están sujetas a convalidación por el Comité Académico.'};
