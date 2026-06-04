# Feature: Usuarios

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Creación de usuarios

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| USR-01 | Admin crea usuario estudiante exitosamente | Usuario logueado como administrador (o acceso al endpoint). | el administrador completa el formulario de nuevo usuario | ingresa nombre, apellido, email y hace clic en "Crear" | el usuario aparece en la lista de usuarios con rol "estudiante" | Backend responde 201 POST /api/usuarios. Se crea también el registro en Estudiante. Se devuelve id, nombre, apellido, email, rol. | nombre: "Carlos", apellido: "López", email: "carlos@email.com" | Administrador | Feliz | — |
| USR-02 | Admin crea usuario administrador | (mismas precondiciones) | el administrador completa el formulario | selecciona rol "administrador" y completa datos | el usuario se crea con rol administrador, sin registro en Estudiante | Backend solo crea Usuario. No crea Estudiante porque rol !== 'estudiante'. | nombre: "Admin2", email: "admin2@email.com", rol: "administrador" | Administrador | Feliz | — |
| USR-03 | Admin crea usuario sin nombre | — | el administrador intenta crear un usuario | completa solo email y apellido, deja nombre vacío | el sistema muestra "Nombre, apellido y email son obligatorios" | Backend responde 400. | nombre: "", apellido: "López", email: "c@e.com" | Administrador | Error | — |
| USR-04 | Admin crea usuario con email duplicado | Ya existe un usuario con ese email. | el administrador completa el formulario | ingresa un email ya registrado | el sistema muestra "Ya existe un usuario con el email X" | Backend responde 409. | email: "existente@email.com" | Administrador | Error | USR-01 |
| USR-05 | Admin crea usuario con rol inválido | — | el administrador envía un rol no válido | envía POST con rol "superadmin" | el sistema asigna rol "estudiante" por defecto | Backend solo acepta "estudiante" o "administrador". Si no coincide, usa default "estudiante". | rol: "superadmin" | Administrador | Borde | — |

### Listado y búsqueda

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| USR-06 | Admin ve lista de usuarios paginada | Existen múltiples usuarios cargados. | el administrador accede a la lista de usuarios | envía GET /api/usuarios | recibe una lista paginada con datos de usuario, preferencias, perfilPublico y visibleEnDescubrir | Backend responde con data, total, page, pages, limit. Cada usuario incluye preferencias. | — | Administrador | Feliz | USR-01 |
| USR-07 | Admin busca usuarios por texto | Existen usuarios con nombres y apellidos variados. | el administrador escribe en el campo de búsqueda | envía GET /api/usuarios?search=lopez | solo se muestran usuarios cuyo nombre, apellido o email contienen "lopez" | Backend filtra con Op.iLike sobre nombre, apellido, email. | search: "lopez" | Administrador | Feliz | USR-06 |
| USR-08 | Admin filtra usuarios por rol | Existen usuarios de distintos roles. | el administrador selecciona un rol | envía GET /api/usuarios?rol=estudiante | solo se muestran usuarios con ese rol | — | rol: estudiante | Administrador | Feliz | USR-06 |
| USR-09 | Admin filtra usuarios activos/inactivos | Existen usuarios activos e inactivos. | el administrador selecciona estado | envía GET /api/usuarios?activo=false | solo se muestran usuarios inactivos | — | activo: false | Administrador | Feliz | USR-06 |

### Ver detalle

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| USR-10 | Usuario ve detalle de usuario existente | Existe un usuario creado. | cualquier usuario consulta un ID específico | envía GET /api/usuarios/:id | recibe los datos completos del usuario | Backend responde 200 con data del usuario. | id: 1 | General | Feliz | USR-01 |
| USR-11 | Usuario consulta usuario inexistente | — | el usuario consulta un ID inválido | envía GET /api/usuarios/99999 | recibe mensaje "No se encontró un usuario con id 99999" | Backend responde 404. | id: 99999 | General | Error | — |

### Edición

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| USR-12 | Admin actualiza datos de usuario | Existe un usuario creado. | el administrador modifica los datos de un usuario | envía PUT /api/usuarios/:id con nombre y apellido nuevos | los datos del usuario se actualizan | Backend responde 200 con los datos actualizados. Solo actualiza campos enviados. | nombre: "Carlos Updated" | Administrador | Feliz | USR-01 |
| USR-13 | Admin actualiza email a uno ya existente | Existe otro usuario con ese email. | el administrador intenta cambiar el email | envía PUT con email de otro usuario | el sistema muestra "Ya existe un usuario con el email X" | Backend responde 409. | email: "existente@email.com" | Administrador | Error | USR-01 |
| USR-14 | Admin desactiva un usuario | Existe un usuario activo. | el administrador desactiva la cuenta de un usuario | envía PUT /api/usuarios/:id con activo: false | el usuario queda inactivo | Backend actualiza activo: false. Este cambio afecta el middleware requireActiveUser: el usuario no puede realizar operaciones POST/PUT/DELETE. | activo: false | Administrador | Feliz | USR-01 |
| USR-15 | Admin actualiza usuario inexistente | — | el administrador intenta actualizar un ID inválido | envía PUT /api/usuarios/99999 | el sistema muestra "No se encontró un usuario con id 99999" | Backend responde 404. | id: 99999 | Administrador | Error | — |

### Eliminación

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| USR-16 | Admin elimina un usuario estudiante | Existe un usuario con rol estudiante. | el administrador elimina un estudiante | envía DELETE /api/usuarios/:id | el usuario se elimina físicamente junto con su registro en Estudiante | Backend elimina primero el registro en Estudiante (si rol es estudiante), luego destroy en Usuario. | — | Administrador | Feliz | USR-01 |
| USR-17 | Admin elimina un usuario administrador | Existe un usuario administrador. | el administrador elimina a otro admin | envía DELETE /api/usuarios/:id | el usuario se elimina (sin Estudiante asociado) | Backend no elimina Estudiante porque rol !== 'estudiante'. | — | Administrador | Feliz | USR-02 |
| USR-18 | Admin elimina usuario inexistente | — | el administrador intenta eliminar un ID inválido | envía DELETE /api/usuarios/99999 | el sistema muestra "No se encontró un usuario con id 99999" | Backend responde 404. | id: 99999 | Administrador | Error | — |

---

## Resumen de variantes

| Variante | Cantidad | IDs |
|---|---|---|
| Feliz | 8 | USR-01, USR-02, USR-06, USR-07, USR-08, USR-09, USR-10, USR-12, USR-14, USR-16, USR-17 |
| Error | 4 | USR-03, USR-04, USR-11, USR-13, USR-15, USR-18 |
| Borde | 1 | USR-05 |

---

## Notas

- Los IDs con prefijo `USR-XX` corresponden al módulo Usuarios.
- La creación de un usuario con rol "estudiante" crea automáticamente un registro en la tabla Estudiantes.
- La desactivación de un usuario (activo: false) afecta al middleware requireActiveUser: las rutas POST/PUT/DELETE devuelven 403.
- Este módulo se relaciona con Conexiones (para contactos) y con el dropdown de selección de usuario en la UI.
