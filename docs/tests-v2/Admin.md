# Feature: Administración

> Versión: 1.0 | Última actualización: 2026-06-24 | Responsable: DesApp Grupo 9

---

## ADM-01 — Admin gestiona usuarios desde el panel

**Perfil:** Administrador
**Precondiciones / Datos necesarios:**
- Sesión iniciada como administrador
- Existen usuarios registrados de distintos roles y estados

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre el panel de administración y hace clic en **Usuarios** | Muestra **"Gestión de Personas"** con tabla de columnas ID, Nombre, Email, Rol, Estado, Acciones; paginación de 10 por página; campo de búsqueda y filtros desplegables por Rol y Estado |
| 2 | Hace clic en **"Nueva Persona"** | Abre el diálogo **"Crear Nueva Persona"** con campos: Nombre, Apellido, Email, Contraseña (opcional en el formulario), Rol, Fecha de Nacimiento y Género |
| 3 | Completa datos válidos (nombre, apellido, email, contraseña, rol) y hace clic en **"Crear"** | Valida que ningún campo obligatorio esté vacío. Si todo ok: `"Usuario creado exitosamente"`. La fila nueva aparece resaltada en amarillo por 4 segundos |
| 4 | Escribe un apellido en el campo de búsqueda, selecciona un Rol y un Estado | La tabla se actualiza mostrando solo los usuarios que coinciden con todos los filtros. Si no hay resultados: `"No se encontraron usuarios con los filtros actuales."` |
| 5 | Hace clic en el icono **lápiz** de una fila, modifica el nombre y hace clic en **"Guardar"** | `"Usuario actualizado exitosamente"`. La tabla se refresca con los datos modificados |
| 6 | Hace clic en el chip verde **"Activo"** de una fila y luego en **"Sí, desactivar"** | `"Usuario desactivado exitosamente"`. El chip cambia a gris **"Inactivo"**. Si el usuario era el propio admin, muestra advertencia adicional `"¡Te estás desactivando a vos mismo!"` |
| 7 | Hace clic en el icono **papelera** de una fila y confirma **"Eliminar"** | `"Usuario eliminado exitosamente"`. La fila desaparece de la tabla. Si el usuario es admin, el diálogo muestra `"Este usuario es administrador. Al eliminarlo perderá acceso al panel de administración."` |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: campo obligatorio vacío | En paso 3, deja Nombre vacío | El campo muestra `"Requerido"` en rojo. No se envía la solicitud |
| Error: email duplicado | En paso 3, ingresa un email ya registrado | `'Ya existe un usuario con el email "..."'` |
| Error: sin contraseña | En paso 3, no completa la contraseña | Backend rechaza con `"Nombre, apellido, email y password son obligatorios"` |
| Error: auto-eliminarse | En paso 7, intenta eliminarse a sí mismo | El botón Eliminar está deshabilitado. Mensaje: `"No puedes eliminarte a vos mismo."` |
| Error: usuario inexistente | En pasos 5-7, otro admin ya eliminó al usuario entre tanto | `"No se encontró un usuario con id ..."` |
| Error: carga de usuarios | La tabla no puede cargar los datos del servidor | Muestra `"Error al cargar usuarios"` en un Snackbar |
| Borde: sin resultados de búsqueda | En paso 4, ningún usuario coincide con los filtros | `"No se encontraron usuarios con los filtros actuales."` |

---

## ADM-02 — Admin explora el dashboard y los reportes

**Perfil:** Administrador
**Precondiciones / Datos necesarios:**
- Sesión iniciada como administrador
- Existen usuarios, materiales, sesiones, denuncias y conexiones cargadas en el sistema

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre `/admin` (Inicio) | Muestra el dashboard con 5 tarjetas de estadísticas (Usuarios, Materiales, Sesiones, Denuncias Pendientes, Materiales Suspendidos), un subtexto `"{N} registro(s) hoy, {N} esta semana"`, y 3 tablas: **Últimas Denuncias Pendientes**, **Materiales Suspendidos**, **Actividad Reciente** |
| 2 | Hace clic en **Reportes > Uso del Sistema** | Muestra 4 cards de resumen (Total Usuarios, Usuarios activos con %, Estudiantes, Administradores) y tablas de distribución: materias cursadas/aprobadas por alumno y por carrera |
| 3 | Hace clic en **Reportes > Materiales y Sesiones** | Muestra rankings: materias con más materiales compartidos, sesiones por período y materiales mejor valorados (👍 likes, 👎 dislikes, ratio %) |
| 4 | Hace clic en **Reportes > Denuncias** | Muestra distribución de denuncias por estado (Pendiente, Confirmada, Rechazada, Revocada con chips de color) y por motivo |
| 5 | Hace clic en **Reportes > Social** | Muestra distribución de conexiones por estudiante, cards de total de sesiones / sesiones con participantes / promedio de participantes, tabla de participantes por sesión, y ranking de carreras con comunidad más activa (puntaje) |
| 6 | Vuelve a hacer clic en **Inicio** | El dashboard se refresca mostrando los datos actualizados desde la última acción |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: acceso denegado | Un usuario no-admin intenta acceder a `/admin` | Muestra `"Acceso Denegado"` con `"Solo los usuarios administradores pueden acceder al panel de administración."` y botón **"Volver al inicio"** |
| Error: dashboard sin datos | En paso 1, no hay denuncias, materiales suspendidos ni actividad | Las tablas muestran respectivamente `"Sin denuncias pendientes"`, `"Sin materiales suspendidos"` y `"Sin actividad reciente"` |
| Error: reportes sin cargar | En pasos 2-5, el servidor no responde | Muestra `"Error al cargar los reportes"` con botón **"Reintentar"** |
| Borde: tarjetas en cero | En paso 1, el sistema está recién creado sin datos | Todas las tarjetas muestran 0. El subtexto muestra `"0 registro(s) hoy, 0 esta semana"` |
| Alternativa: navegación desde sidebar | En cualquier paso, usa los ítems de la sidebar para cambiar de sección | En desktop la sidebar es permanente (260px); en mobile es un drawer temporal con hamburguesa |
| Alternativa: cerrar sesión | En cualquier paso, hace clic en **"Cerrar sesión"** en el footer de la sidebar | Aparece un diálogo de confirmación: `"¿Estás seguro de que querés cerrar la sesión?"`. Al confirmar, redirige al login |

---

## Notas

- La sidebar tiene 5 ítems: **Inicio** (`/admin`), **Reportes** (`/admin/reportes`), **Usuarios** (`/admin/usuarios`), **Académico** (`/admin/academico`), **Moderación** (`/admin/moderacion`).
- Académico y Moderación se documentan en sus propios archivos (Carreras, Materias-MTR, Denuncias, etc.).
- La contraseña es obligatoria para el backend aunque en el formulario aparezca como opcional.
- Al eliminar un usuario se borra físicamente de la base de datos (hard delete) junto con registros relacionados. Los materiales que creó quedan huérfanos (creadorId = NULL).
- Al desactivar un usuario (activo: false), este no puede realizar operaciones POST/PUT/DELETE hasta que otro admin lo reactive.
- Al crear un usuario con rol "estudiante", el backend también crea un registro en la tabla `Estudiantes` automáticamente.
