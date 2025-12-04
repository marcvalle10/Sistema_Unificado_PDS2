Aquí tienes el README **limpio, bien estructurado, con formato profesional**, separando correctamente las secciones y dándole estilo visual.

Incluí el apartado que me pediste sobre la **cantidad de alumnos por grupo** con una explicación clara y una sección dedicada a **consultas útiles del sistema**, sin alterar tu contenido original.

---

# 🧾 **README en Formato Profesional**

````markdown
# Sistema de Gestión Académica (SGA) - Módulo Profesores

Sistema web integral desarrollado para la Universidad de Sonora, diseñado para optimizar la gestión académica por parte de los docentes. Permite el control eficiente de asistencias, calificaciones y la generación de reportes académicos mediante una interfaz moderna e intuitiva.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)

---

## 📋 Características Principales

### 👨‍🏫 Módulo de Profesores

- **Dashboard Interactivo:** Vista rápida de grupos asignados y notificaciones importantes.
- **Gestión de Asistencia:**
  - Pase de lista vía web con validación de “una vez al día”.
  - Carga masiva de listas desde Excel/CSV.
  - Descarga de plantillas de asistencia por grupo.
  - Sistema de justificación de faltas.
- **Alertas Tempranas:**
  - Semáforo de riesgo (Normal, Advertencia, Crítico y Sin Derecho).
  - Notificaciones globales para alumnos en riesgo.
- **Calificaciones:**
  - Historial académico por Alumno, Grupo o Semestre.
  - Subida de actas (Ordinario/Extraordinario/Final) vía Excel.
- **Reportes Académicos:**
  - Elegibilidad para Servicio Social y Prácticas Profesionales.
  - Exportación PDF con formato institucional.
- **Seguridad y Accesibilidad:**
  - Autenticación segura con contraseñas encriptadas (bcrypt).
  - Recuperación de contraseña por correo.
  - Diseño responsivo y accesible.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 15 (App Router), React 19  
- **Lenguaje:** TypeScript  
- **Base de Datos:** PostgreSQL 16 (con `pg`)  
- **Estilos:** Tailwind CSS 4.0  
- **Herramientas adicionales:**
  - SheetJS (`xlsx`)
  - jsPDF + jsPDF-Autotable
  - lucide-react
  - bcryptjs

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/saulfer1109/sistema-gestion-academica
cd sistema-gestion-academica
git branch PDS2_1.1
````

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Crear `.env` en la raíz:

```env
# Configuración de Base de Datos (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=tu_nombre_de_bd
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_SSL=false
```

### 4. Ejecutar el servidor

```bash
npm run dev
```

Luego acceder a:
👉 [http://localhost:3000](http://localhost:3000)

---

## 📂 Estructura del Proyecto

### 📁 `public/`

Archivos estáticos (logo, íconos, SVG).

### 📁 `src/`

Código fuente principal.

---

### 📁 `src/app/` – App Router (Frontend)

* `layout.tsx` – Layout general con Navbar y diseño institucional.
* `page.tsx` – Landing del sistema.
* `globals.css` – Estilos globales.

#### Rutas Principales:

* **inicio/** – Dashboard del profesor
* **login/** – Inicio de sesión
* **recuperar-contrasena/** – Flujo de recuperación
* **alertas-faltas/** – Semáforo de riesgo y justificaciones
* **reportes/** – Reportes PDF
* **configuracion-perfil/** – Ajustes de usuario
* **calificaciones/**

  * `consultar-calificaciones/`
  * `subir-calificaciones/`
* **curso/** – Gestión de un grupo

  * `informacion/` – Pase de lista y plantillas
* **alumno/**

  * `[expediente]/` – Expediente individual

---

### 📁 `src/app/api/` – Backend (API Routes)

* **auth/** – Login, recuperación, reset
* **attendance/** – Lógica de asistencia
* **groups/** – Grupos filtrados por profesor
* **students/** – Datos de alumnos
* **periods/** – Catálogo de semestres
* **reports/** – Elegibilidad
* **upload-calificaciones/** – Excel de calificaciones

---

### 📁 `src/components/`

Componentes UI reutilizables (NavBar, Modales, Uploads, Tablas, Cards).

### 📁 `src/lib/`

Conexión a la BD (`db.ts`) y utilidades.

### 📁 `src/services/`

Servicios (Excel, calificaciones, parsers inteligentes).

### 📁 `src/types/`

Interfaces y tipos globales.


---

# 👥 Colaboradores

Proyecto desarrollado para la materia **Prácticas de Desarrollo de Sistemas II** de la Universidad de Sonora.

**Líder del Proyecto:**

* Alvarez Portillo Lilian

**Desarrollo Backend/Frontend**

* **Jefe desarrollo BackEnd:** Espinoza Rivera Saúl Filiberto
* Cervantes Sousa Orlando
* Valencia Loroña María Yamile
* Cubillas Lagarda José Héctor
* Moreno Gonzales Isaac
* Barrera Ruiz Alejandra Patricia

**Tester:**

* Corella Márquez Mario Felipe

---

© 2025 Universidad de Sonora. Todos los derechos reservados.

