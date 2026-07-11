# Feature: Novedades / Feed

> Versión: 1.0 | Última actualización: 2026-06-24 | Responsable: DesApp Grupo 9

---

## NOV-01 — Estudiante crea publicaciones e interactúa en el feed

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Existen otros estudiantes con conexión aceptada que tienen novedades visibles

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Navega a **Novedades** (`/social/feed`) | Muestra el feed con las novedades de sus contactos ordenadas por fecha descendente y el formulario **"¿Qué estás pensando, {nombre}?"** |
| 2 | Escribe un mensaje en el campo **"Comparte algo con tus compañeros..."** y hace clic en **"Publicar"** | Crea la novedad de tipo posteo y la agrega al inicio del feed |
| 3 | Hace clic en el ícono **Me gusta** de un post ajeno | El contador de likes aumenta y el ícono se destaca. El dueño recibe notificación |
| 4 | Vuelve a hacer clic en el mismo **Me gusta** | El like se quita (toggle off), el contador disminuye |
| 5 | Abre la sección de comentarios, escribe en **"Escribe un comentario..."** y hace clic en **"Enviar"** | El comentario aparece en la lista y el contador de comentarios aumenta. El dueño recibe notificación |
| 6 | Abre el menú **tres puntos** de su propio post, selecciona **"Editar"**, modifica el texto y hace clic en **"Guardar"** | El post se actualiza y se muestra el indicador **"• editado"** junto a la fecha |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: contenido vacío | En paso 2, no escribe nada | El botón **"Publicar"** permanece deshabilitado |
| Permisos: like a propio post | En paso 3, intenta dar like a su propia publicación | El ícono de like está deshabilitado con tooltip *"No puedes dar like a tu propia publicación"* |
| Permisos: editar/eliminar post ajeno | En paso 6, el post pertenece a otro usuario | El menú de tres puntos no aparece. No puede editar ni eliminar |
| Alternativa: eliminar post propio | En paso 6, selecciona **"Eliminar"** en lugar de "Editar" | El post desaparece del feed (soft delete: `visible: false`) |
| Alternativa: responder a comentario | En paso 5, hace clic en **"Responder"** en un comentario existente | El campo cambia a **"Escribe una respuesta..."** con botón **"Responder"**. La respuesta aparece anidada |
| Borde: feed sin novedades | En paso 1, no hay novedades visibles | Muestra **"No hay novedades para mostrar."** |

---

## NOV-02 — Estudiante configura preferencias y visualiza eventos automáticos

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Existen materias con estado cursando/regularizada/aprobada (generan novedades automáticas)
- Existe al menos una sesión de estudio creada (genera novedad automática)

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre el feed de Novedades y encuentra un evento automático | Muestra el post con chip indicador del tipo: **"se inscribió a"** (icono School), **"regularizó"** (icono Edit), **"aprobó"** (icono CheckCircle), **"creó sesión de"** (icono Groups) o **"canceló sesión de"** (icono Event error) |
| 2 | Hace clic en **"Ver sesión"** dentro de una novedad de tipo sesión | Navega al detalle de la sesión en `/sesiones/:id` |
| 3 | Va a **Configuración > Publicaciones automáticas** | Muestra los switches: **"Inscripciones"**, **"Regularizaciones"**, **"Aprobaciones"**, **"Sesiones de estudio"** con sus descripciones |
| 4 | Desactiva el switch **"Inscripciones"** y hace clic en **"Guardar preferencias"** | La preferencia se actualiza. El cambio se persiste |
| 5 | El sistema cambia el estado de una materia a "cursando" | **No** se genera novedad automática (preferencia desactivada) |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Alternativa: reactivar preferencia | En paso 4, vuelve a activar "Inscripciones" | Próximos cambios de estado a "cursando" generan la novedad automática |
| Alternativa: post automático no editable | En paso 1, abre el menú del post automático | Solo muestra **"Eliminar"**. La opción **"Editar"** no aparece |
| Permisos: administrador crea post | En paso 2 de NOV-01, el usuario es administrador | Backend rechaza con *"Los administradores no pueden crear publicaciones en el feed"* |
| Borde: todas las preferencias desactivadas | En paso 4, desactiva los 4 switches | El feed solo muestra posts manuales. Los eventos del sistema no generan novedades |
| Error: eliminar novedad automática ajena | En paso 1, intenta eliminar un post automático de otro usuario | El menú de tres puntos no aparece (solo el dueño puede eliminar) |

---

## Notas

- El feed siempre muestra novedades de los contactos del estudiante (vía `feed=contactos`). No existe selector para ver "todas las novedades" ni filtro por tipo en la UI.
- No hay paginación o infinite scroll en el feed; se cargan todas las novedades disponibles al entrar a la página.
- Las novedades automáticas se generan cuando: el estudiante se inscribe a una materia (`inscripcion`), la regulariza (`regularizacion`), la aprueba (`aprobacion`), crea una sesión (`sesion_creada`) o la cancela (`sesion_cancelada`). **No** se generan al crear materiales.
- Las preferencias de publicación se configuran desde **Configuración > Publicaciones automáticas** o desde **Privacidad > Publicación automática en el Feed**. Los valores por defecto son `true` para todos los tipos.
- Los posts automáticos (`esAutomatica: true`) no pueden editarse (ni desde frontend ni backend), pero sí pueden eliminarse por el dueño.
- El formulario de creación no permite seleccionar materia ni adjuntar imágenes — solo texto.
- Administradores no pueden crear publicaciones en el feed, ni manuales ni automáticas.
