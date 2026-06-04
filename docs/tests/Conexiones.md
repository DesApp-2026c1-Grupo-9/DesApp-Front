# Feature: Conexiones / Red de Contactos

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Invitaciones

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CON-01 | Usuario envía invitación a otro usuario por email | Usuario logueado. Existe otro usuario registrado con ese email. | el estudiante quiere conectar con un compañero | ingresa el email del compañero y hace clic en "Enviar invitación" | la invitación se envía con estado "pendiente" | Backend POST /api/conexiones/invite responde 201. Se crea Conexion con estado "pendiente", usuarioId: emisor, contactoId: receptor. | email: "compañero@email.com" | Estudiante | Feliz | USR-01 |
| CON-02 | Usuario envía invitación a email no registrado | — | el estudiante ingresa un email que no pertenece a ningún usuario | envía la invitación | el sistema muestra "El email no corresponde a un usuario registrado" | Backend responde 404. | email: "noexiste@email.com" | Estudiante | Error | — |
| CON-03 | Usuario envía invitación a sí mismo | — | el estudiante ingresa su propio email | envía la invitación | el sistema muestra "No puedes enviarte una invitación a ti mismo" | Backend responde 400. | email: "propio@email.com" | Estudiante | Error | — |
| CON-04 | Usuario envía invitación a usuario inactivo | Existe un usuario inactivo (activo: false). | el estudiante ingresa el email de un usuario inactivo | envía la invitación | el sistema muestra "No puedes enviar una invitación a un usuario inactivo" | Backend responde 400. | email: "inactivo@email.com" | Estudiante | Error | USR-14 |
| CON-05 | Usuario envía invitación duplicada | Ya existe una conexión o solicitud previa entre ambos usuarios. | el estudiante intenta enviar otra invitación al mismo usuario | envía la invitación | el sistema muestra "Ya existe una conexión o solicitud con este usuario" | Backend responde 400. | — | Estudiante | Límite | CON-01 |
| CON-06 | Usuario envía invitación sin proporcionar email | — | el estudiante intenta enviar invitación | envía POST sin email | el sistema muestra "Debe proporcionar un email para enviar la invitación" | Backend responde 400. | email: "" | Estudiante | Error | — |
| CON-07 | Usuario no autenticado intenta enviar invitación | No hay usuario seleccionado. | el usuario intenta enviar una invitación | la solicitud llega al backend | el sistema muestra "Debe proporcionar un usuarioId" | Backend responde 400. | — | No logueado | Seguridad | — |

### Responder invitaciones

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CON-08 | Usuario acepta invitación pendiente | Existe una invitación pendiente dirigida a él (contactoId). | el usuario ve la solicitud de conexión | hace clic en "Aceptar" | la conexión pasa a estado "aceptada" | Backend PUT /api/conexiones/respond/:id con estado "aceptada". El emisor y receptor ahora son contactos. | estado: "aceptada" | Estudiante | Feliz | CON-01 |
| CON-09 | Usuario rechaza invitación pendiente | Existe una invitación pendiente dirigida a él. | el usuario ve la solicitud | hace clic en "Rechazar" | la conexión pasa a estado "rechazada" | Backend responde 200 con estado "rechazada". | estado: "rechazada" | Estudiante | Feliz | CON-01 |
| CON-10 | Usuario responde invitación que no le pertenece | Existe una invitación donde contactoId no es él. | el usuario intenta responder una invitación de otro | envía PUT /api/conexiones/respond/:id | el sistema muestra "No tienes permiso para responder esta invitación" | Backend responde 403 verificando contactoId. | — | Estudiante | Permisos | CON-01 |
| CON-11 | Usuario responde invitación ya respondida | La invitación ya fue aceptada o rechazada. | el usuario intenta responder nuevamente | envía PUT con estado | el sistema muestra "Esta invitación ya fue respondida" | Backend verifica estado !== 'pendiente' y responde 400. | — | Estudiante | Límite | CON-08 |
| CON-12 | Usuario responde con estado inválido | — | el usuario envía un estado no válido | envía PUT con estado "cancelada" | el sistema muestra "El estado debe ser aceptada o rechazada" | Backend responde 400. | estado: "cancelada" | Estudiante | Error | — |

### Ver conexiones

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CON-13 | Usuario ve lista de conexiones aceptadas | Existen conexiones aceptadas con otros usuarios. | el usuario accede a su red de contactos | envía GET /api/conexiones | recibe la lista de contactos con datos y fecha de conexión | Backend devuelve conexiones transformadas: id, estado, contacto (usuario o contacto según corresponda), fechaConexion. | — | Estudiante | Feliz | CON-08 |
| CON-14 | Usuario ve lista vacía de conexiones | No existen conexiones aceptadas. | el usuario accede a su red | envía GET /api/conexiones | recibe una lista vacía | Backend devuelve { data: [] }. | — | Estudiante | Borde | — |
| CON-15 | Usuario ve solicitudes pendientes recibidas | Existen invitaciones donde él es el contactoId y estado es pendiente. | el usuario revisa sus solicitudes | envía GET /api/conexiones/pendientes | recibe la lista de solicitudes pendientes con datos del solicitante | Backend filtra por contactoId y estado "pendiente". | — | Estudiante | Feliz | CON-01 |

### Eliminar conexión

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CON-16 | Usuario elimina conexión (desconecta) | Existe una conexión aceptada donde el usuario es parte (usuarioId o contactoId). | el usuario ya no quiere tener a alguien en su red | hace clic en "Eliminar conexión" | la conexión se elimina físicamente | Backend DELETE /api/conexiones/:id. Verifica que usuarioId o contactoId coincida. | — | Estudiante | Feliz | CON-08 |
| CON-17 | Usuario elimina conexión que no le pertenece | Existe una conexión donde no es ni usuarioId ni contactoId. | el usuario intenta eliminar una conexión ajena | envía DELETE | el sistema muestra "No tienes permiso para eliminar esta conexión" | Backend responde 403. | — | Estudiante | Permisos | CON-08 |
| CON-18 | Usuario elimina conexión inexistente | — | el usuario intenta eliminar un ID inválido | envía DELETE /api/conexiones/99999 | el sistema muestra "Conexión no encontrada" | Backend responde 404. | id: 99999 | Estudiante | Error | — |

---

## Resumen de variantes

| Variante | Cantidad | IDs |
|---|---|---|
| Feliz | 7 | CON-01, CON-08, CON-09, CON-13, CON-15, CON-16 |
| Error | 5 | CON-02, CON-03, CON-04, CON-06, CON-12, CON-18 |
| Permisos | 2 | CON-10, CON-17 |
| Límite | 2 | CON-05, CON-11 |
| Seguridad | 1 | CON-07 |
| Borde | 1 | CON-14 |

---

## Notas

- Los IDs con prefijo `CON-XX` corresponden al módulo Conexiones.
- Una conexión aceptada entre dos usuarios afecta la visibilidad de sesiones (ver SES-16) y el feed de novedades (ver NOV-07).
- La eliminación de una conexión es física (destroy), no soft delete.
- No se puede enviar invitación a uno mismo ni a usuarios inactivos.
