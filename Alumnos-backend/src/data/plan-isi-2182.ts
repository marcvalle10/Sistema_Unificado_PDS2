import type { Course } from "./Course";

export const PLAN_ISI: Course[] = [
// Tronco común
{ code: "00119", name: "Actividades Culturales y Deportivas", credits: 4, eje: "C" },
{ code: "00120", name: "Estrategias para Aprender a Aprender", credits: 3, eje: "C" },
{ code: "00121", name: "Características de la Sociedad Actual", credits: 3, eje: "C" },
{ code: "00123", name: "Nuevas Tecnologías de la Información y la Comunicación", credits: 3, eje: "C" },
{ code: "00124", name: "Ética y Desarrollo Profesional", credits: 3, eje: "C" },

// Matemáticas y Ciencias
{ code: "06880", name: "Álgebra", credits: 8, eje: "B" },
{ code: "06881", name: "Cálculo Diferencial e Integral I", credits: 8, eje: "B" },
{ code: "06884", name: "Cálculo Diferencial e Integral II", credits: 8, eje: "B", prereq: ["6881"] },
{ code: "06889", name: "Cálculo Diferencial e Integral III", credits: 8, eje: "B", prereq: ["6884"] },
{ code: "06885", name: "Física I con Laboratorio", credits: 10, eje: "B", prereq: ["6881"] },
{ code: "06886", name: "Geometría Analítica", credits: 8, eje: "B", prereq: ["6880"] },
{ code: "06883", name: "Química I", credits: 9, eje: "B" },
{ code: "06890", name: "Probabilidad y Estadística", credits: 8, eje: "B", prereq: ["6884"] },
{ code: "06891", name: "Tópicos de Electricidad y Electrónica", credits: 10, eje: "B", prereq: ["6885"] },
{ code: "06895", name: "Ecuaciones Diferenciales I", credits: 8, eje: "B", prereq: ["6884"] },
{ code: "06893", name: "Sustentabilidad en las Ingenierías", credits: 4, eje: "B", prereq: ["120"] },
{ code: "06906", name: "Cultura Emprendedora", credits: 4, eje: "B", prereq: ["120"] },
{ code: "07974", name: "Comunicación en Ingeniería", credits: 5, eje: "B", prereq: ["4110"] },
{ code: "07980", name: "Análisis de Datos en Ingeniería", credits: 8, eje: "B", prereq: ["6890"] },

// Fundamentos de Computación y Desarrollo de Sistemas
{ code: "04110", name: "Introducción a la Ingeniería en Sistemas de Información", credits: 6, eje: "P" },
{ code: "04111", name: "Fundamentos de Computación I", credits: 8, eje: "B" },
{ code: "04113", name: "Fundamentos de Computación II", credits: 8, eje: "B", prereq: ["4111"] },
{ code: "04118", name: "Fundamentos de Computación III", credits: 7, eje: "B", prereq: ["4113"] },
{ code: "04112", name: "Desarrollo de Sistemas I", credits: 7, eje: "B" },
{ code: "04114", name: "Desarrollo de Sistemas II", credits: 7, eje: "B", prereq: ["4112"] },
{ code: "04117", name: "Desarrollo de Sistemas III", credits: 7, eje: "B", prereq: ["4114"] },
{ code: "04122", name: "Desarrollo de Sistemas IV", credits: 7, eje: "P", prereq: ["4117"] },

// Bases de Datos y Servidores
{ code: "04116", name: "Bases de Datos I", credits: 8, eje: "P", prereq: ["4113"] },
{ code: "04123", name: "Bases de Datos II", credits: 7, eje: "P", prereq: ["4116"] },
{ code: "04115", name: "Servidores I", credits: 6, eje: "P" },
{ code: "04124", name: "Servidores II", credits: 6, eje: "P", prereq: ["4115"] },

// Comunicación de Datos
{ code: "04119", name: "Comunicación de Datos I", credits: 7, eje: "P", prereq: ["4114"] },
{ code: "04120", name: "Comunicación de Datos II", credits: 7, eje: "P", prereq: ["4119"] },

// Ingeniería de Software y Calidad
{ code: "04121", name: "Ingeniería de Sistemas de Información", credits: 6, eje: "P" },
{ code: "04127", name: "Ingeniería de Software I", credits: 6, eje: "P", prereq: ["4121"] },
{ code: "04130", name: "Ingeniería de Software II", credits: 7, eje: "P", prereq: ["4127"] },
{ code: "04136", name: "Ingeniería de Software III", credits: 7, eje: "P", prereq: ["4130"] },
{ code: "04129", name: "Gestión de la Calidad del Software I", credits: 6, eje: "P" },
{ code: "04137", name: "Gestión de la Calidad del Software II", credits: 7, eje: "P", prereq: ["4129"] },

// Administración y Proyectos
{ code: "04126", name: "Sistemas de Costeo para Ingeniería en Sistemas de Información", credits: 7, eje: "P", prereq: ["4121"] },
{ code: "04131", name: "Administración de Proyectos Informáticos I", credits: 7, eje: "P", prereq: ["4126"] },
{ code: "04135", name: "Administración de Proyectos Informáticos II", credits: 7, eje: "P", prereq: ["4131"] },

{ code: "07976", name: "Administración Estratégica", credits: 7, eje: "B", prereq: ["4110"] },
{ code: "08000", name: "Comportamiento Organizacional", credits: 7, eje: "P", prereq: ["140"] },
{ code: "04156", name: "Prácticas Profesionales", credits: 20, eje: "I" },
{ code: "04138", name: "Propiedad Intelectual", credits: 6, eje: "P" },

// Prácticas
{ code: "04132", name: "Práctica de Desarrollo de Sistemas I", credits: 5, eje: "I", prereq: ["4125"] },
{ code: "04134", name: "Práctica de Desarrollo de Sistemas II", credits: 7, eje: "I", prereq: ["4132"] },
{ code: "04139", name: "Práctica de Desarrollo de Sistemas III", credits: 5, eje: "I", prereq: ["4134"] },

// Optativas
{ code: "04140", name: "Diseño de Front-End", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "04141", name: "Diseño de Sistemas Interactivos", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "04142", name: "Estrategia de Negocios Electrónicos", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "04143", name: "Infraestructura Digital", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "04144", name: "Ciberseguridad", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "04145", name: "Introducción al Cómputo Móvil", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "04146", name: "Desarrollo de Aplicaciones Móviles", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "04147", name: "Cómputo en la Nube", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "04148", name: "Minería de Datos", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "04149", name: "Almacén de Datos", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "04150", name: "Inteligencia de Negocios", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "04151", name: "Algoritmos Avanzados", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "04152", name: "Programación Avanzada", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "04153", name: "Gráficas Computacionales", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "04154", name: "Diseño de Videojuegos I", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "04155", name: "Diseño de Videojuegos II", credits: 6, eje: "E", prereq: ["4125"] },
];
