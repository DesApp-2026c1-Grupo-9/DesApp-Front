# Feature: Usuarios

> Versión: 1.0 | Última actualización: 2026-06-22 | Responsable: DesApp Grupo 9

---

## USR-01 — Admin crea y gestiona usuarios

**Perfil:** Administrador
**Precondiciones / Datos necesarios:**
- Sesión iniciada como administrador
- No existe un usuario con email `carlos@email.com`

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre el panel de administración y ve la pestaña **"Usuarios"** | Muestra "Gestión de Personas (N)" con la tabla de usuarios (ID, Nombre, Email, Rol, Estado, Acciones) |
| 2 | Hace clic en **"Nueva Persona"** | Abre el diálogo **"Crear Nueva Persona"** con campos: Nombre, Apellido, Email, Contraseña (opcional) y Rol |
| 3 | Completa nombre="Carlos", apellido="López", email="carlos@email.com", contraseña="123456", rol="Estudiante" y hace clic en **"Crear"** | Muestra "Usuario creado exitosamente". La fila nueva aparece resaltada en amarillo por 4 segundos |
| 4 | Hace clic en el icono **lápiz** (Editar) de la fila de Carlos | Abre **"Editar Persona"** con los datos precargados |
| 5 | Cambia el nombre a "Carlos Update" y hace clic en **"Guardar"** | Muestra "Usuario actualizado exitosamente". La tabla se refresca con el nuevo nombre |
| 6 | Hace clic en el chip verde **"Activo"** de la fila de Carlos | Abre el diálogo **"Desactivar Usuario"** con la advertencia "El usuario no podrá realizar operaciones en el sistema hasta que sea activado nuevamente." |
| 7 | Hace clic en **"Sí, desactivar"** | Muestra "Usuario desactivado exitosamente". El chip cambia a gris **"Inactivo"** |
| 8 | Hace clic en el chip gris **"Inactivo"** de Carlos | Abre el diálogo **"Activar Usuario"** |
| 9 | Hace clic en **"Sí, activar"** | Muestra "Usuario activado exitosamente". El chip vuelve a verde **"Activo"** |
| 10 | Hace clic en el icono **papelera** (Eliminar) de la fila de Carlos | Abre **"Confirmar Eliminación"**: "¿Estás seguro de que deseas eliminar a Carlos López?" |
| 11 | Hace clic en **"Eliminar"** | Muestra "Usuario eliminado exitosamente". La fila desaparece de la tabla |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: campo obligatorio | En paso 3, deja Nombre vacío | El campo muestra "Requerido" en rojo. No se envía la solicitud |
| Error: password vacío | En paso 3, no completa la contraseña y el backend la rechaza | Muestra "Nombre, apellido, email y password son obligatorios" |
| Error: email duplicado | En paso 3, ingresa un email ya registrado | Muestra 'Ya existe un usuario con el email "carlos@email.com"' |
| Advertencia: eliminar admin | En paso 10, el usuario a eliminar tiene rol "administrador" | El diálogo muestra una advertencia adicional: "Este usuario es administrador. Al eliminarlo perderá acceso al panel de administración." |
| Error: editar/eliminar inexistente | En cualquier paso posterior, otro admin ya eliminó al usuario | Muestra "No se encontró un usuario con id {id}" |

---

## USR-02 — Admin busca y filtra la lista de usuarios

**Perfil:** Administrador
**Precondiciones / Datos necesarios:**
- Existen al menos 12 usuarios en el sistema, de distintos roles y estados

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre el panel de administración y la pestaña Usuarios | Muestra la tabla con los primeros 10 usuarios ordenados por apellido ascendente y la paginación en la parte inferior |
| 2 | Escribe "lopez" en el campo **"Buscar por nombre, apellido o email..."** | La tabla se actualiza mostrando solo los usuarios cuyo nombre, apellido o email contienen "lopez". La página vuelve a 0 |
| 3 | Selecciona **Rol = "Administrador"** en el filtro desplegable | La tabla muestra solo los usuarios con ese rol |
| 4 | Selecciona **Estado = "Inactivo"** en el filtro desplegable | La tabla muestra solo los usuarios inactivos |
| 5 | Hace clic en el encabezado de columna **"Email"** | La tabla se ordena por email A→Z. Al hacer clic de nuevo, ordena Z→A. La página vuelve a 0 |
| 6 | Hace clic en el botón **">"** (siguiente página) de la paginación | Muestra los siguientes usuarios (del 11 en adelante). El contador de página avanza |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Borde: sin resultados | En paso 2, busca un texto que no coincide con ningún usuario | La tabla muestra el mensaje **"No hay usuarios registrados"** en una fila vacía |
| Borde: sin usuarios | En paso 1, no hay usuarios cargados en el sistema | Misma fila vacía: **"No hay usuarios registrados"** |
| Error: error de carga | El servidor no responde o devuelve un error | Muestra "Error al cargar usuarios" en un Snackbar |
| Permisos: acceso denegado | Un usuario con rol "estudiante" intenta acceder a `/admin` | Muestra "Solo los usuarios administradores pueden acceder al panel de administración." |

---

## Notas
- La contraseña es obligatoria para el backend. Si se deja vacía en el formulario, el backend rechaza la creación.
- Al crear un usuario con rol "estudiante", el backend también crea un registro en la tabla `Estudiantes` automáticamente.
- Al eliminar un usuario, se borra físicamente de la base de datos junto con sus registros relacionados (calificaciones, denuncias como denunciante). Los materiales que creó quedan huérfanos (creadorId = NULL).
- La desactivación de un usuario (activo: false) impide que ese usuario realice operaciones POST/PUT/DELETE en el sistema.
