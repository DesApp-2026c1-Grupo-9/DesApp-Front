# Feature: Conexiones / Red de Contactos

> Versión: 1.0 | Última actualización: 2026-06-22 | Responsable: DesApp Grupo 9

---

## CON-01 — Descubrir estudiantes y enviar invitaciones

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Dos estudiantes registrados y activos (A y B)
- Ambos tienen `visibleEnDescubrir: true`
- A y B **no** son contactos aún

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | A va a la sección Conexiones y hace clic en la pestaña **"Descubrir"** | Muestra el campo "Buscar por nombre o apellido..." y la lista de estudiantes disponibles para conectar |
| 2 | A escribe el nombre de B en el buscador | Filtra la lista mostrando solo los estudiantes que coinciden |
| 3 | A hace clic en **"Agregar"** en la tarjeta de B | Muestra "Invitación enviada exitosamente". El botón cambia a **"Pendiente"** en ese estudiante |
| 4 | B va a Conexiones y ve la pestaña **"Pendientes (1)"** | Ve la solicitud de A con los botones **"Aceptar"** y **"Rechazar"** |
| 5 | B hace clic en **"Aceptar"** | Muestra "Solicitud aceptada exitosamente" |
| 6 | A vuelve a Conexiones y ve la pestaña **"Mis Conexiones"** | B aparece en la lista con el chip **"Conectado"** |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: destinatario inactivo | En paso 3, B está desactivado (activo: false) | B no aparece en la lista de Descubrir. No se puede invitar |
| Alternativa: desde el perfil | En paso 1, A va al perfil de B (`/perfil/:id`) y hace clic en **"Agregar contacto"** | Misma invitación. Muestra "Invitación enviada exitosamente" |
| Borde: sin resultados | En paso 2, A busca un nombre que no existe | Muestra **"Sin resultados"** / "No se encontraron estudiantes con ese nombre" |
| Error: ya conectado | A intenta agregar a alguien que ya es su contacto | Ese usuario ya no aparece en Descubrir |
| Alternativa: B rechaza | En paso 5, B hace clic en **"Rechazar"** en vez de "Aceptar" | Muestra "Solicitud rechazada exitosamente". No se crea la conexión |

---

## CON-02 — Gestionar solicitudes y contactos existentes

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- El estudiante tiene al menos 2 contactos aceptados
- No tiene solicitudes pendientes

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre la sección Conexiones con la pestaña **"Mis Conexiones"** activa | Muestra la lista de todos sus contactos con nombre, apellido, email y chip **"Conectado"** |
| 2 | Hace clic en la pestaña **"Pendientes"** | Muestra "Sin solicitudes pendientes" / "No tienes solicitudes de conexión pendientes." |
| 3 | Vuelve a "Mis Conexiones" y hace clic en el icono de **papelera** junto a un contacto | Abre un diálogo: "¿Estás seguro de que querés eliminar tu conexión con {nombre} {apellido}?" |
| 4 | Hace clic en **"Eliminar"** en el diálogo | Muestra "Conexión eliminada exitosamente". El contacto desaparece de la lista |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Borde: sin contactos | En paso 1, el estudiante no tiene conexiones aceptadas | Muestra **"Sin conexiones"** / "Aún no tienes conexiones. ¡Invita a otros estudiantes!" |
| Borde: sin solicitudes | En paso 2, no hay solicitudes pendientes | Muestra **"Sin solicitudes pendientes"** / "No tienes solicitudes de conexión pendientes." |
| Error: conexión inexistente | En paso 3, elimina una conexión que ya fue borrada | Muestra "Conexión no encontrada" |

---

## Notas
- Una conexión aceptada entre dos estudiantes afecta qué sesiones de estudio y novedades del feed puede ver cada uno.
- Los estudiantes solo aparecen en "Descubrir" si tienen `visibleEnDescubrir: true` en su configuración de privacidad.
- Los usuarios inactivos y administradores no aparecen en "Descubrir".
- La eliminación de una conexión es permanente (no se puede recuperar).
