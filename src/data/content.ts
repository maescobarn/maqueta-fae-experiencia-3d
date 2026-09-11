export const sources = {
  program:'https://economia.faeusach.cl/',
  brochure:'https://faeusach.cl/brochures/2026-ice.pdf',
  application:'https://faeusach.cl/postulacion-prosecucion/',
  offer:'https://www.mifuturo.cl/wp-content/uploads/2026/06/Oferta_Academica_2026_SIES_05_06_2026_WEB_E.xlsx',
  employment:'https://mifuturo.cl/wp-content/uploads/2025/12/Buscador_Empleabilidad_ingresos_2025_2026_SIES.xlsx',
  methodology:'https://mifuturo.cl/wp-content/uploads/2025/12/Metodologia-Buscador-Empleabilidad-e-Ingresos_2025-2026.pdf',
};
export const comparisons = [
 {name:'Universidad Arturo Prat',short:'UNAP',tuition:3885000,registration:254000,semesters:'6',code:'I81S7C223J2V3',row:1027,program:'Ingeniería Comercial · Administración de Empresas'},
 {name:'Universidad de Santiago de Chile',short:'USACH',tuition:6782000,registration:212000,semesters:'5 / 7',code:'I71S1C1001J2V1 / V2',row:4155,rows:[4155,4156],program:'Plan especial de Ingeniería Comercial en Economía'},
 {name:'Universidad Técnica Federico Santa María',short:'USM',tuition:7110000,registration:275000,semesters:'6',code:'I88S4C201J2V3',row:6413,program:'Ingeniería Comercial · Continuidad'},
 {name:'Universidad Andrés Bello',short:'UNAB',tuition:7374000,registration:669000,semesters:'6',code:'I20S1C1J2V2',row:585,program:'Ingeniería Comercial · Continuidad'},
];
export const clp = (value:number) => '$'+new Intl.NumberFormat('es-CL',{maximumFractionDigits:0}).format(value);
export const chapters = [
 {id:'inicio',label:'El comienzo'},
 {id:'programa',label:'Tu trayectoria'},
 {id:'perspectivas',label:'Tu horizonte'},
 {id:'inversion',label:'Tu inversión'},
 {id:'orientacion',label:'Tu próximo paso'},
];
