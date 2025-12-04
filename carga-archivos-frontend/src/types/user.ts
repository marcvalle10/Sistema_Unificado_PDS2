/**
 * Interfaz que define la estructura de un usuario en el sistema
 */
export interface User {
  id: number;
  profesorId: number;
  usuarioId: number;
  nombre: string;
  email: string;
  numEmpleado: number;
  rol: string;
  rolId: number;
  imagen?: string | null;
}

export interface ProfesorFormValues {
  nombre: string;
  correo: string;
  numEmpleado: string;
  rolId: number | "";
}

/**
 * Tipos de roles disponibles en el sistema
 */
export type UserRole = "Administrador" | "Coordinador" | "Profesor";

/**
 * Interfaz para roles en Supabase
 */
export interface Role {
  id: number;
  nombre: UserRole;
}


/**
 * Datos de usuarios mock para desarrollo
 *//*
export const mockUsers: User[] = [
  {
    id: 1,
    nombre: "John Smith Rodriguez",
    email: "john.smith@unison.mx",
    rol: "Administrador",
    imagen:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 2,
    nombre: "Olivia Bennett Loera",
    email: "olivyben@unison.mx",
    rol: "Coordinador",
    imagen:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 3,
    nombre: "Daniel Warren Carvajal",
    email: "dwarren3@unison.mx",
    rol: "Profesor",
  },
  {
    id: 4,
    nombre: "Chloe Hayes Hernandez",
    email: "chloehaye@unison.mx",
    rol: "Coordinador",
    imagen:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 5,
    nombre: "Marcus Reed Lopez",
    email: "reed777@unison.mx",
    rol: "Administrador",
  },
  {
    id: 6,
    nombre: "Isabelle Clark Oirani",
    email: "belleclark@unison.mx",
    rol: "Profesor",
    imagen:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 7,
    nombre: "Lucas Mitchell Sonora",
    email: "lucamitch@unison.mx",
    rol: "Profesor",
  },
  {
    id: 8,
    nombre: "Mark Wilburg Nuñez",
    email: "markwil32@unison.mx",
    rol: "Profesor",
    imagen:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 9,
    nombre: "Nicholas Ageno Agnesi",
    email: "nicolas009@unison.mx",
    rol: "Profesor",
  },
  {
    id: 10,
    nombre: "Mia Nadim Gomez",
    email: "mianadim@unison.mx",
    rol: "Coordinador",
  },
  {
    id: 11,
    nombre: "Noemi Villan Perez",
    email: "noemivil99@unison.mx",
    rol: "Profesor",
    imagen:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  },
];
*/