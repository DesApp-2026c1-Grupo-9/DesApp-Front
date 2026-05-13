# Estándares Técnicos y Habilidades - Frontend

Eres un experto en React y UI/UX. Debes seguir estas directrices para mantener la consistencia en el Sistema de Acompañamiento Estudiantil durante el Sprint 2.

## 1. Stack Tecnológico
* **Framework:** React 18 con Vite (ES Modules).
* **UI:** Material UI (MUI) v5. Usar componentes de `@mui/material` y el sistema de styling de Emotion.
* **Estado Global:** Redux Toolkit (`@reduxjs/toolkit`) para lógica compleja y estados compartidos.
* **Navegación:** React Router Dom v6 para la gestión de rutas.
* **HTTP Client:** Axios para llamadas al Backend (Node.js).
* **Utilidades:** Lodash para manipulación de datos.

## 2. Estructura de Directorios (Arquitectura Sugerida)
Todos los desarrolladores deben seguir esta estructura de carpetas dentro de `/src`:

```text
src/
├── api/             # Configuraciones de Axios y servicios de llamada a API
├── assets/          # Imágenes, logos y archivos estáticos
├── components/      # Componentes reutilizables (Botones, Inputs, Layouts)
│   └── common/      # Componentes comunes/shared (Button, Input, Card wrappers)
├── contexts/        # Context providers (UserContext, ThemeContext)
├── features/        # Lógica por dominio (Auth, Perfil, Sesiones, Feed)
│   ├── slice.js     # Redux Toolkit Slices específicos de la feature
│   └── service.js   # Llamadas específicas de la feature
├── hooks/           # Custom hooks compartidos
├── pages/           # Componentes de página (lo que renderiza React Router)
├── routes/          # Configuración de rutas (AppRouter.jsx)
├── store/           # Configuración central de Redux (store.js)
└── theme/           # Configuración del Theme de Material UI (MUI)
```

## 3. Estándares de Componentes Reutilizables (Sprint 2 Focus)

### Filosofía de Componentización
* **Primeros pasos:** Antes de escribir JSX, identifica patrones repetidos que puedan extraerse.
* **Nombres claros:** Nombre en PascalCase (ej: `UserDropdown`, `ErrorBoundary`).
* **PropTypes:** Definir estructura clara de props, aunque sea JS sin TypeScript.

### Estilos con Theme
* **Nunca hardcodear colores o spacing:** Usar tokens del theme de MUI.
* **Colores del theme:**
  ```javascript
  theme.palette.primary.main    // #1976d2
  theme.palette.background.default // #f4f4f4
  theme.palette.background.paper  // #ffffff
  theme.spacing(2)              // múltiplos de 8px
  ```
* **Componentes de Theme:** Crear objetos reutilizables en `/theme/components.js`.

### Hooks Reutilizables
* **命名规则:** Prefijo `use` (ej: `useUserContext`, `useApiError`).
* **Ubicación:** En `/hooks/` para lógica compartida, o co-localizado con componentes si es específico.
* **Patrones comunes:**
  - `useXxx` para lógica con estado
  - `useXxxCallback` para callbacks memoizados

### Lógica Unificada
* **API calls centralizadas:** Cada feature tiene su `service.js` - no dispersar llamadas.
* **Redux para estado compartido:** Datos que atraviesan componentes van a Redux, no a props drilling.
* **Constantes:** Definir en archivos dedicados, no strings sueltos.

## 4. Admin Panel (Miembro 1)

### Rutas de Admin
* `/admin` - Dashboard principal de admin
* `/admin/carreras` - CRUD Carreras
* `/admin/materias` - CRUD Materias
* `/admin/personas` - CRUD Personas

### Patrón de Componentes
* **Listado:** `Table` de MUI con columnas configurables.
* **Acciones:** Botones de Editar/Eliminar en cada fila.
* **Creación/Edición:** `Dialog` o `Modal` con formulario.
* **UX:** Feedback visual (loading, success, error).

### Integración con Dropdown
* El usuario admin debe aparecer en el selector global de usuarios.
* El dropdown debe permitir cambiar entre usuarios estudiante y admin.

## 5. Global User Context - Dropdown (Miembro 3)

### Implementación
* **Redux Slice:** Extender `auth` slice para incluir:
  ```javascript
  {
    user: { id, nombre, apellido, rol: 'estudiante' | 'admin' },
    usersList: [...],  // lista de todos los usuarios para dropdown
    currentContext: 'estudiante' | 'admin'
  }
  ```
* **Selector global:** `selectCurrentUser`, `selectCurrentRole` del store.
* **Dropdown en TopMenu:** Mostrar nombre del usuario actual + rol. Al hacer click, mostrar lista de usuarios disponibles (estudiantes + admin).

### Cambio de Contexto
* Al seleccionar un usuario distinto, actualizar el estado global.
* Todas las páginas deben reflejar el usuario seleccionado (datos, permisos, vista).
* Persistir selección en localStorage para mantener contexto entre recargas.

## 6. Error Handling & Fallback UI (Miembro 3)

### Axios Interceptor Mejorado
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 - ya manejado
    // 5xx - mostrar fallback de error de servidor
    // Network error (sin respuesta) - mostrar fallback de conexión
    return Promise.reject(error);
  }
);
```

### Componentes de Fallback
* **ConnectionError:** "No se pudo conectar con el servidor. Verifica tu conexión."
* **ServerError:** "Error del servidor (500). Intenta más tarde."
* **ApiErrorBoundary:** Wrapper que detecta errores y muestra fallback apropiado.

### UX
* No dejar la UI colgada o rota.
* Mostrar mensajes claros en español.
* Botón de "Reintentar" cuando aplica.

## 7. Material Repository (Miembro 2)

### Tipos de Materiales
* **Archivos:** Hasta 25MB, formato libre.
* **Links:** YouTube, Google Drive, otros URLs.

### Componentes
* **FileUploader:** Drag & drop o click para subir. Progress bar. Validación de tamaño.
* **LinkInput:** Input con validación de URL. Detectar tipo (YouTube/Drive) automáticamente.
* **MaterialList:** Listado filtrable por tipo, materia, fecha.

### Validaciones (Frontend + Backend)
* Frontend: Mostrar error si archivo > 25MB antes de enviar.
* Backend: Siempre validar tamaño, sin confiar en frontend.

## 8. Estándares de Templating y UI Reutilizable
* **Layout Base:** Todo template de página debe seguir una estructura de composición: `Navbar` (superior), `Main` (contenido central con `Container` de MUI) y `Footer` (opcional).
* **Paleta de Colores:** Los agentes deben basarse en el objeto `theme` de MUI.
    * Primary: #1976d2
    * Background: #f4f4f4 para áreas de trabajo y #ffffff para tarjetas/componentes.
* **Componentización Atómica:** Al generar el HTML/JSX base, identificar secciones candidatas a ser componentes reutilizables (ej: `StudentCard`, `SessionItem`, `NavbarLink`).
* **Navegación:** La barra de navegación debe incluir accesos rápidos a las rutas: Perfil, Sesiones, Conexiones, Feed, Materiales, Admin (si es admin).

## 9. Instrucciones Generales
1. **No Testing:** El agente no debe ejecutar pruebas. El usuario se encarga de verificar y testear la implementación.
2. **Contexto de Archivos:** Antes de escribir código, consulta siempre el archivo de la consigna completa y el archivo de división de tareas para no exceder el alcance del Sprint actual.
3. **Validación:** El backend siempre debe validar las reglas de negocio (ej. tamaño de archivos de 25MB) independientemente de las validaciones del frontend.