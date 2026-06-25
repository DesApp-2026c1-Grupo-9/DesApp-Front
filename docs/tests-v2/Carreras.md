# Feature: Carreras y Planes de Estudio

> Versión: 1.0 | Última actualización: 2026-06-22 | Responsable: DesApp Grupo 9

---

## CAR-01 — Admin gestiona carreras

**Perfil:** Administrador
**Precondiciones / Datos necesarios:**
- Sesión iniciada como administrador
- No existe una carrera con el nombre "Lic. en Matemática"

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre el panel de administración, va a la pestaña **"Académico"** y hace clic en **"Carreras"** | Muestra **"Gestión de Carreras"** con la tabla de carreras (Nombre, Título, Instituto, Duración, Planes, Materias) |
| 2 | Hace clic en **"Nueva Carrera"**, completa nombre="Lic. en Matemática", título="Licenciado en Matemática", instituto="Ciencias", duración=5 y hace clic en **"Crear"** | Muestra "Carrera creada". La nueva fila aparece resaltada por 4 segundos |
| 3 | Hace clic en el icono **lápiz** (Editar) de la carrera creada, cambia el nombre a "Lic. en Matemática (Actualizado)" y hace clic en **"Guardar"** | Muestra "Carrera actualizada". La tabla se refresca |
| 4 | Hace clic en el icono **libro** (Materias), selecciona algunas materias disponibles y hace clic en **"Guardar"** | Muestra un diálogo de confirmación con las materias a agregar/quitar. Al confirmar, muestra "Materias actualizadas" |
| 5 | Hace clic en el icono **papelera** (Eliminar) y confirma en el diálogo | Muestra "Carrera eliminada". La fila desaparece de la tabla |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: campo obligatorio | En paso 2, deja el nombre vacío | Muestra "El nombre y el título son obligatorios" |
| Error: nombre duplicado | En paso 2, ingresa un nombre ya registrado | Muestra 'Ya existe una carrera con el nombre "Lic. en Matemática"' |
| Error: eliminar con planes | En paso 5, la carrera tiene planes de estudio asociados | Muestra "No se puede eliminar la carrera porque tiene planes de estudio asociados. Elimine primero los planes." |
| Borde: sin resultados | El admin busca un texto que no coincide | La tabla muestra "No hay carreras registradas" |
| Error: carrera inexistente | Edita o elimina una carrera que otro admin ya borró | Muestra "No se encontró una carrera con id {id}" |

---

## CAR-02 — Admin gestiona planes de estudio

**Perfil:** Administrador
**Precondiciones / Datos necesarios:**
- Existe una carrera creada (ej: "Lic. en Matemática")
- Existen materias asignadas a esa carrera

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | En la pestaña **"Planes"**, selecciona la carrera "Lic. en Matemática" en el Autocomplete | Muestra los planes existentes de esa carrera. Si no hay, muestra "No hay planes de estudio para esta carrera" |
| 2 | Completa "Nombre del plan" = "Plan 2026", selecciona estado **"Vigente"** y hace clic en **"Agregar Plan"** | Muestra "Plan creado". El plan aparece en la tabla resaltado. Si había otro plan vigente, pasa automáticamente a "transición" |
| 3 | Hace clic en el chip de estado del plan (ej: "Vigente"), selecciona **"Discontinuado"** y hace clic en **"Guardar"** | Muestra "Estado del plan actualizado". El chip cambia al nuevo estado |
| 4 | Hace clic en el icono **libro** (Materias), selecciona un año, elige una materia y hace clic en **"Asignar"** | Muestra "Materia asignada al plan". La materia aparece en la tabla de materias del plan |
| 5 | Hace clic en **"Eliminar"** del plan y confirma en el diálogo | Muestra "Plan eliminado". El plan desaparece de la tabla |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: crear sin nombre | En paso 2, deja el nombre del plan vacío | Muestra "El nombre del plan es obligatorio" |
| Borde: sin carrera seleccionada | En paso 1, no hay ninguna carrera elegida | Los campos de plan están deshabilitados. Muestra "Seleccioná una carrera arriba para ver sus planes" |
| Borde: todas las materias asignadas | En paso 4, todas las materias de la carrera ya están en el plan | El Autocomplete muestra "Todas las materias ya están asignadas" |
| Error: materia no asignada a la carrera | En paso 4, intenta asignar una materia que no pertenece a la carrera | Muestra "La materia no está asignada a esta carrera. Asignala primero desde el panel de carreras." |
| Alternativa: remover materia | En paso 4, en vez de asignar, hace clic en el icono **papelera** de una materia ya asignada y confirma | Muestra "Materia removida del plan". La materia desaparece de la tabla |
| Error: materia duplicada | En paso 4, intenta asignar una materia que ya está en el plan | Muestra "La materia ya está en el plan" |

---

## Notas
- Las carreras se gestionan desde la pestaña **"Académico"** del panel de administración, que tiene 3 sub-tabs: Carreras, Materias y Planes.
- Cada carrera puede tener múltiples planes de estudio. Solo puede haber **un plan vigente por carrera** a la vez.
- Al crear un plan como "vigente", el sistema automáticamente pasa el plan vigente anterior a "transición" y el de transición a "discontinuado". También copia las materias del plan vigente anterior al nuevo.
- Las materias deben estar asignadas a la carrera antes de poder agregarlas a un plan de estudio.
- Al eliminar un plan, también se eliminan las materias asociadas a ese plan (cascade).
