# 🎓 Carga Archivos Frontend

## 🛠️ Stack de Tecnologias

- **Framework**: [Next.js 15](https://nextjs.org)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Gestión de Estado**: [TanStack Query](https://tanstack.com/query)
- **Fuentes**: [Google Fonts (Bentham)](https://fonts.google.com/)

## 📁 Estructura del Proyecto

```
carga-archivos-frontend/
├── 📱 app/                          # App Router de Next.js
│   ├── globals.css                 # Estilos globales
│   ├── layout.tsx                  # Layout principal
│   └── page.tsx                    # Página de inicio
├── 📦 public/                       # Recursos estáticos
│   └── logo.png                    # Logo (Universidad de Sonora)
├── 🔧 src/                         # Código fuente principal
│   ├── 🎨 components/              # Componentes React
│   │   ├── 🔄 shared/              # Componentes reutilizables
│   │   │   ├── UniversityHeader.tsx # Header
│   │   │   ├── Pagination.tsx      # Paginación
│   │   │   └── index.ts
│   │   ├── 🏗️ features/            # Funcionalidades específicas
│   │   │   └── user-directory/     # Directorio de usuarios
│   │   │       ├── UserDirectory.tsx # Componente principal
│   │   │       ├── components/     # Subcomponentes
│   │   │       │   ├── SearchFilters.tsx
│   │   │       │   ├── UserTable.tsx
│   │   │       │   ├── UserAvatar.tsx
│   │   │       │   └── index.ts
│   │   │       └── index.ts
│   │   ├── 🎭 ui/                  # Componentes de UI
│   │   │   ├── Button.tsx          # Botón reutilizable
│   │   │   ├── Modal.tsx           # Modal base
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── 🪝 hooks/                   # Hooks personalizados
│   │   ├── useUserDirectory.ts     # Lógica del directorio de usuarios
│   │   └── index.ts
│   ├── 📋 types/                   # Definiciones TypeScript
│   │   ├── user.ts                 # Tipos de usuario
│   │   ├── components.ts           # Props de componentes
│   │   └── index.ts
│   └── 🛠️ utils/                  # Utilidades
│       ├── cn.ts                   # Utilidad para clases CSS
│       └── index.ts
├── 📄 Archivos de configuración
│   ├── package.json                # Dependencias y scripts
│   ├── tsconfig.json              # Configuración TypeScript
│   ├── tailwind.config.js         # Configuración Tailwind
│   ├── next.config.ts             # Configuración Next.js
│   ├── eslint.config.mjs          # Configuración ESLint
│   └── postcss.config.js          # Configuración PostCSS
└── README.md                       # Este archivo que estamos leyendo
```

### Organización

1. **Separación por Funcionalidad**: Cada feature tiene su propia carpeta
2. **Tipos Centralizados**: Las interfaces se encuentran en `src/types/`
3. **Hooks Personalizados**: Lógica separada de la UI


## 🚀 Instalación y Desarrollo

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/PDS-Proyecto/carga-archivos-frontend.git
   cd carga-archivos-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar build de producción
- `npm run lint` - Verificar código con ESLint

## 🎨 Guía de Estilo

### Colores Institucionales

- **Azul Principal**: `#16469B` (Universidad de Sonora)
- **Dorado**: `#E6B10F` (Acento institucional)
- **Texto**: `#3B5571` (Texto principal)
- **Fondos**: `#EDE9FF`, `#F3F8FF` (Gradientes suaves)

### Tipografía

- **Fuente Principal**: Bentham (Google Fonts)
- **Peso**: 400 (Regular)
- **Uso**: Títulos institucionales y contenido principal
