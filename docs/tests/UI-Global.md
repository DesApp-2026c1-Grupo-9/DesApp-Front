# Feature: UI Global (Selector de Usuario, Layout, Manejo de Errores)

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Selector de usuario (UserSelector)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| UI-01 | Usuario cambia de estudiante usando el dropdown | Existen múltiples estudiantes cargados. | el usuario está en cualquier página del sistema | abre el UserSelector en el TopMenu/AdminAppBar y selecciona otro estudiante | el contexto de la aplicación cambia: el nuevo estudiante se refleja en todas las páginas, el nombre/avatar en el selector se actualiza | dispatch switchStudent(usuarioId). Se llama a cambiarEstudiantePorUsuarioId. La app redirige a "/". | seleccionar "Martín García" → el dashboard muestra sus datos | Estudiante | Feliz | USR-01 |
| UI-02 | Usuario cambia a administrador | Existe al menos un administrador en el sistema. | el usuario está en modo estudiante | selecciona un usuario con rol administrador | la app redirige a "/admin" y el layout cambia a AdminAppBar | navigate('/admin', { replace: true }). El layout pasa de TopMenu a AdminAppBar. | seleccionar "Admin Principal (Administrador)" | Estudiante | Feliz | ADM-01 |
| UI-03 | Usuario cambia de administrador a estudiante | Usuario administrador actual. Existen estudiantes. | el administrador está en el panel /admin | selecciona un estudiante en el UserSelector | la app redirige a "/" y el layout cambia a TopMenu con pestañas de estudiante | navigate('/', { replace: true }). El layout pasa de AdminAppBar a TopMenu. | seleccionar "Lucía Fernández (Estudiante)" | Administrador | Feliz | ADM-01 |
| UI-04 | El dropdown se carga vacío al iniciar | No hay estudiantes en el estado Redux. | el usuario abre la app por primera vez | el UserSelector se monta | se dispara fetchStudents() para cargar la lista y el Select aparece deshabilitado mientras carga | dispatch(fetchStudents()). loadingStudents true → disabled. Al terminar, se habilita y muestra la lista. | — | Todos | Feliz | — |
| UI-05 | Dropdown muestra usuarios inactivos con opacidad reducida | Existe un usuario inactivo. | el usuario abre el UserSelector | ve la lista de usuarios | el usuario inactivo aparece con opacidad 0.5 y texto "(inactivo)" junto a su nombre | sx: { opacity: 0.5 } aplicado al MenuItem si s.activo === false. | usuario activo: false → "Juan Pérez (inactivo)" | Todos | Feliz | ADM-17 |

### Layouts (PublicLayout / AdminLayout)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|
| UI-06 | Estudiante ve TopMenu con todas las pestañas | Usuario logueado como estudiante. | el estudiante navega por la app | está en cualquier página de PublicLayout | se muestra el TopMenu con pestañas: Inicio, Mi Perfil, Mis Materias, Carreras, Feed, Conexiones, Sesiones, Materiales. Si es admin, también Admin. | El TopMenu se renderiza. Cada pestaña tiene su ruta asociada. | — | Estudiante | Feliz | — |
| UI-07 | Administrador ve AdminAppBar con pestañas de admin | Usuario administrador. | el administrador navega por /admin/* | está en AdminLayout | se muestra AdminAppBar con pestañas: Usuarios, Academico, Moderacion, Mi Perfil | AdminAppBar con tabs específicos de admin. | — | Administrador | Feliz | ADM-01 |
| UI-08 | Administrador en ruta pública es redirigido a /admin | Usuario administrador. | el administrador navega a "/" o cualquier ruta de PublicLayout que no sea "/mi-perfil" | la app carga PublicLayout | PublicLayout detecta rol admin y redirige a "/admin" automáticamente | `<Navigate to="/admin" replace />` | ruta: "/feed" → redirige a "/admin" | Administrador | Feliz | UI-07 |
| UI-09 | Administrador puede ver "/mi-perfil" aunque sea admin | Usuario administrador. | el administrador navega a "/mi-perfil" | PublicLayout carga | NO es redirigido, ve su perfil personal | La excepción en PublicLayout permite /mi-perfil para admins. Renderiza AdminAppBar + Outlet. | — | Administrador | Feliz | UI-08 |
| UI-10 | Estudiante con cuenta desactivada ve advertencia en AdminLayout | Usuario con activo:false, rol admin (o siendo gestionado). | un administrador ve el perfil de un usuario inactivo | AdminLayout detecta estudianteActual.usuario.activo === false | se muestra un Alert de warning "Cuenta desactivada" en la parte superior | Alert con icono Block, severity warning, borderRadius 0, ancho completo. | — | Administrador | Feliz | ADM-17 |
| UI-11 | Transición de página animada entre rutas | Usuario logueado. | el usuario navega entre páginas | hace clic en una pestaña del menú | el contenido de la página tiene una transición animada (PageTransition) | PageTransition key={location.pathname} envuelve el Outlet. Animación suave al cambiar de ruta. | — | Todos | Feliz | — |

### AppErrorBoundary (captura de errores de render)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|
| UI-12 | Error de renderizado es capturado por ErrorBoundary | Un componente lanza una excepción durante el render. | el usuario navega a una página con un bug de render | React lanza el error | AppErrorBoundary captura con componentDidCatch, guarda en sessionStorage y redirige a "/error" | getDerivedStateFromError → hasError: true. Se guarda {type: 'render_error', message, stack, timestamp}. window.location.assign('/error'). | error: "Cannot read property of undefined" | Todos | Feliz | UI-15 |
| UI-13 | ErrorBoundary no interfiere con páginas sin error | No hay errores de render. | el usuario navega normalmente | páginas cargan sin problemas | ErrorBoundary renderiza this.props.children sin alterar nada | No se guarda nada en sessionStorage. No hay redirección. | — | Todos | Feliz | — |
| UI-14 | ErrorBoundary evita bucle infinito en /error | El error ocurre y se redirige a /error. | el usuario está en /error | ErrorBoundary detecta hasError y pathname /error | no vuelve a redirigir, permite que la página de error se muestre | `if (this.state.hasError && window.location.pathname !== '/error') { return null }` | — | Todos | Borde | UI-12 |

### AppErrorPage (páginas de error 404/403/429/500)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|
| UI-15 | Usuario navega a ruta inexistente (404) | Ruta no definida en el router. | el usuario ingresa una URL inválida | React Router hace match con catch-all `*` | se muestra "No encontramos esa página" con descripción y botones "Volver al inicio" e "Ir al inicio" | AppErrorPage renderiza viewType='not-found'. Descripción: "La ruta que intentaste abrir no existe o ya no está disponible." | ruta: "/ruta-inventada" | Todos | Feliz | — |
| UI-16 | API responde con error 403 | Backend devuelve 403. El interceptor guarda en sessionStorage y redirige a /error. | el usuario intenta acceder a un recurso sin permiso | el backend responde 403 | se muestra "No tenés permiso para ver esto" con descripción y botones | ErrorBoundary/Interceptor guarda {status: 403} en sessionStorage. AppErrorPage detecta status 403 y muestra mensaje específico. | GET /api/sesiones/999 sin permisos | Todos | Feliz | — |
| UI-17 | API responde con error 404 | Backend devuelve 404. | el usuario intenta acceder a un recurso inexistente | el backend responde 404 | se muestra "No pudimos encontrar el recurso" con descripción | AppErrorPage detecta status 404 y muestra descripción: "El elemento que pedimos al servidor ya no existe o fue movido." | GET /api/usuarios/99999 | Todos | Feliz | — |
| UI-18 | API responde con error 429 (rate limit) | Backend devuelve 429. | el usuario hace demasiadas solicitudes | el backend responde 429 | se muestra "Demasiadas solicitudes" con botón "Reintentar" | AppErrorPage detecta status 429. Descripción: "La app recibió más pedidos de los que puede procesar ahora." | — | Todos | Feliz | — |
| UI-19 | API responde con error 500 o de red | Backend devuelve 500+ o hay error de red. | ocurre un error del lado del servidor o de conexión | el interceptor de Axios captura | se muestra "No pudimos completar la operación" con botón "Reintentar" | AppErrorPage detecta status >= 500 o kind 'server'/'network'. Muestra detalles: código HTTP, tipo, endpoint. Botón hace window.location.reload(). | Servidor caído, GET /api/materiales | Todos | Feliz | — |
| UI-20 | Usuario hace clic en "Reintentar" en página de error | Usuario en /error con error recuperable (429, 500, red). | el usuario ve la página de error | hace clic en el botón "Reintentar" | la página se recarga | handleReintentar → window.location.reload(). Si el error era transitorio, la app funciona de nuevo. | — | Todos | Feliz | UI-18, UI-19 |
| UI-21 | Usuario hace clic en "Volver al inicio" en página de error | Usuario en /error. | el usuario ve la página de error | hace clic en "Ir al inicio" o "Volver al inicio" | la app navega a "/" | handleVolverInicio → navigate('/'). | — | Todos | Feliz | UI-15 |
| UI-22 | Página de error muestra detalles técnicos del error | Existe un error guardado en sessionStorage con status, kind y endpoint. | el usuario ve /error con datos de error | la página carga | se muestra un Alert de error con código HTTP, tipo y endpoint afectado | El Alert solo se renderiza si errorData existe y viewType es 'api-error'. | {status: 500, kind: 'server', endpoint: '/api/materiales'} | Todos | Feliz | UI-19 |
| UI-23 | Página de error sin datos en sessionStorage | No hay error previo, usuario navega directo a /error. | el usuario ingresa manualmente a "/error" | la página carga | se muestra "Ocurrió un error inesperado" sin detalles adicionales | errorData es null, el Alert de detalles no se renderiza. | — | Todos | Borde | — |

---

## Notas

- Los IDs con prefijo `UI-XX` corresponden al módulo de UI Global.
- El UserSelector está presente tanto en TopMenu (estudiantes) como en AdminAppBar (administradores).
- El manejo de errores HTTP se realiza mediante interceptores de Axios que guardan los datos del error en sessionStorage bajo la clave `app_unexpected_error` y redirigen a `/error`.
- AppErrorBoundary captura errores de renderizado de React (componentDidCatch) y redirige a `/error`.
- No hay backend específico para estos casos; son puramente de frontend.
