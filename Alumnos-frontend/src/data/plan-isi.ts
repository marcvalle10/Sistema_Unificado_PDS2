import type { Course } from "@/types/academico";

export const PLAN_ISI: Course[] = [
// Tronco común
{ code: "0119", name: "Actividades Culturales y Deportivas", credits: 4, eje: "C" },
{ code: "0120", name: "Estrategias para Aprender a Aprender", credits: 3, eje: "C" },
{ code: "0121", name: "Características de la Sociedad Actual", credits: 3, eje: "C" },
{ code: "0123", name: "Nuevas Tecnologías de la Información y la Comunicación", credits: 3, eje: "C" },
{ code: "0124", name: "Ética y Desarrollo Profesional", credits: 3, eje: "C" },

// Matemáticas y Ciencias
{ code: "6880", name: "Álgebra", credits: 8, eje: "B" },
{ code: "6881", name: "Cálculo Diferencial e Integral I", credits: 8, eje: "B" },
{ code: "6884", name: "Cálculo Diferencial e Integral II", credits: 8, eje: "B", prereq: ["6881"] },
{ code: "6889", name: "Cálculo Diferencial e Integral III", credits: 8, eje: "B", prereq: ["6884"] },
{ code: "6885", name: "Física I con Laboratorio", credits: 10, eje: "B", prereq: ["6881"] },
{ code: "6886", name: "Geometría Analítica", credits: 8, eje: "B", prereq: ["6880"] },
{ code: "6883", name: "Química I", credits: 9, eje: "B" },
{ code: "6890", name: "Probabilidad y Estadística", credits: 8, eje: "B", prereq: ["6884"] },
{ code: "6891", name: "Tópicos de Electricidad y Electrónica", credits: 10, eje: "B", prereq: ["6885"] },
{ code: "6895", name: "Ecuaciones Diferenciales I", credits: 8, eje: "B", prereq: ["6884"] },
{ code: "6893", name: "Sustentabilidad en las Ingenierías", credits: 4, eje: "B", prereq: ["120"] },
{ code: "6906", name: "Cultura Emprendedora", credits: 4, eje: "B", prereq: ["120"] },
{ code: "7974", name: "Comunicación en Ingeniería", credits: 5, eje: "B", prereq: ["4110"] },
{ code: "7980", name: "Análisis de Datos en Ingeniería", credits: 8, eje: "B", prereq: ["6890"] },

// Fundamentos de Computación y Desarrollo de Sistemas
{ code: "4110", name: "Introducción a la Ingeniería en Sistemas de Información", credits: 6, eje: "P" },
{ code: "4111", name: "Fundamentos de Computación I", credits: 8, eje: "B" },
{ code: "4113", name: "Fundamentos de Computación II", credits: 8, eje: "B", prereq: ["4111"] },
{ code: "4118", name: "Fundamentos de Computación III", credits: 7, eje: "B", prereq: ["4113"] },
{ code: "4112", name: "Desarrollo de Sistemas I", credits: 7, eje: "B" },
{ code: "4114", name: "Desarrollo de Sistemas II", credits: 7, eje: "B", prereq: ["4112"] },
{ code: "4117", name: "Desarrollo de Sistemas III", credits: 7, eje: "B", prereq: ["4114"] },
{ code: "4122", name: "Desarrollo de Sistemas IV", credits: 7, eje: "P", prereq: ["4117"] },

// Bases de Datos y Servidores
{ code: "4116", name: "Bases de Datos I", credits: 8, eje: "P", prereq: ["4113"] },
{ code: "4123", name: "Bases de Datos II", credits: 7, eje: "P", prereq: ["4116"] },
{ code: "4115", name: "Servidores I", credits: 6, eje: "P" },
{ code: "4124", name: "Servidores II", credits: 6, eje: "P", prereq: ["4115"] },

// Comunicación de Datos
{ code: "4119", name: "Comunicación de Datos I", credits: 7, eje: "P", prereq: ["4114"] },
{ code: "4120", name: "Comunicación de Datos II", credits: 7, eje: "P", prereq: ["4119"] },

// Ingeniería de Software y Calidad
{ code: "4121", name: "Ingeniería de Sistemas de Información", credits: 6, eje: "P" },
{ code: "4127", name: "Ingeniería de Software I", credits: 6, eje: "P", prereq: ["4121"] },
{ code: "4130", name: "Ingeniería de Software II", credits: 7, eje: "P", prereq: ["4127"] },
{ code: "4136", name: "Ingeniería de Software III", credits: 7, eje: "P", prereq: ["4130"] },
{ code: "4129", name: "Gestión de la Calidad del Software I", credits: 6, eje: "P" },
{ code: "4137", name: "Gestión de la Calidad del Software II", credits: 7, eje: "P", prereq: ["4129"] },

// Administración y Proyectos
{ code: "4126", name: "Sistemas de Costeo para Ingeniería en Sistemas de Información", credits: 7, eje: "P", prereq: ["4121"] },
{ code: "4131", name: "Administración de Proyectos Informáticos I", credits: 7, eje: "P", prereq: ["4126"] },
{ code: "4135", name: "Administración de Proyectos Informáticos II", credits: 7, eje: "P", prereq: ["4131"] },

{ code: "7976", name: "Administración Estratégica", credits: 7, eje: "B", prereq: ["4110"] },
{ code: "8000", name: "Comportamiento Organizacional", credits: 7, eje: "P", prereq: ["140"] },
{ code: "4156", name: "Prácticas Profesionales", credits: 20, eje: "I" },
{ code: "4138", name: "Propiedad Intelectual", credits: 6, eje: "P" },

// Prácticas
{ code: "4132", name: "Práctica de Desarrollo de Sistemas I", credits: 5, eje: "I", prereq: ["4125"] },
{ code: "4134", name: "Práctica de Desarrollo de Sistemas II", credits: 7, eje: "I", prereq: ["4132"] },
{ code: "4139", name: "Práctica de Desarrollo de Sistemas III", credits: 5, eje: "I", prereq: ["4134"] },

// Optativas
{ code: "4140", name: "Diseño de Front-End", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "4141", name: "Diseño de Sistemas Interactivos", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "4142", name: "Estrategia de Negocios Electrónicos", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "4143", name: "Infraestructura Digital", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "4144", name: "Ciberseguridad", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "4145", name: "Introducción al Cómputo Móvil", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "4146", name: "Desarrollo de Aplicaciones Móviles", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "4147", name: "Cómputo en la Nube", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "4148", name: "Minería de Datos", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "4149", name: "Almacén de Datos", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "4150", name: "Inteligencia de Negocios", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "4151", name: "Algoritmos Avanzados", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "4152", name: "Programación Avanzada", credits: 8, eje: "E", prereq: ["4125"] },
{ code: "4153", name: "Gráficas Computacionales", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "4154", name: "Diseño de Videojuegos I", credits: 6, eje: "E", prereq: ["4125"] },
{ code: "4155", name: "Diseño de Videojuegos II", credits: 6, eje: "E", prereq: ["4125"] },
];
