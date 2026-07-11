# Feature: Estudiantes (Plan de Materias y Perfil)

> Versión: 1.0 | Última actualización: 2026-06-24 | Responsable: DesApp Grupo 9

---

## EST-01 — Estudiante gestiona su plan de materias

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Estudiante tiene al menos una carrera asignada con un plan de estudio vigente
- Existen materias en el plan con distintos estados y relaciones de correlatividad

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre **Mis Materias** (`/academico/mis-materias`) | Muestra el selector de carrera, 6 tarjetas de resumen (Aprobadas, Regularizadas, Cursando, No Cursadas, Disponibles, Total) y la tabla de materias agrupadas por año |
| 2 | Hace clic en la pestaña **"Aprobadas"** | Filtra la tabla mostrando solo las materias en estado aprobado |
| 3 | Selecciona **"Cursando"** en el dropdown de estado de una materia Disponible | Si cumple correlativas, la materia cambia a estado "Cursando". Se genera automáticamente una Novedad en el feed |
| 4 | Selecciona **"Regularizada"** en la misma materia | La materia cambia a "Regularizada". Se genera una Novedad |
| 5 | Selecciona **"Aprobada"** en la misma materia | La materia cambia a "Aprobada". Se genera una Novedad y se notifica a sus contactos |
| 6 | Intenta cambiar a **"Cursando"** una materia que no cumple correlativas | Se abre el diálogo **"Prerrequisitos No Cumplidos"** listando las materias faltantes con el mensaje "Debe estar al menos regularizada" para cada una |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: límite de cursando excedido | En paso 3, ya tiene 5 materias en estado "Cursando" entre todas sus carreras | Backend rechaza con *"No podés cursar más de 5 materias en total entre todas tus carreras."* |
| Alternativa: cambio en cascada | En paso 3 o 6, cambia una materia a "no_cursada" que tiene materias dependientes | Se abre diálogo **"Conflicto de Correlatividades"** con lista de materias afectadas y botón **"Confirmar Cambio en Cascada"**. Al confirmar, las materias hijas también se actualizan |
| Alternativa: importar desde Excel | En paso 1, hace clic en **"Importar Excel"**, selecciona un archivo `.xlsx` con columnas nombre/estado y confirma | Las materias se importan. Muestra resumen de importadas, ignoradas y errores |
| Borde: sin carrera asignada | En paso 1, el estudiante no tiene carreras | Muestra alerta **"No tenés ninguna carrera asignada"** con botón **"Inscribite en una carrera"** |
| Error: archivo Excel inválido | En la importación, el archivo no tiene columnas "nombre" o "estado" | Muestra **"El archivo no tiene filas válidas"** |

---

## EST-02 — Estudiante administra su perfil y preferencias

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Estudiante tiene datos personales cargados y al menos una carrera asignada

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre **Mi Perfil** (`/mi-perfil`) | Muestra la tarjeta de perfil con foto, nombre, email, edad, género, carreras, y el progreso académico por carrera (barra de avance + stats de Aprobadas/Regularizadas/Cursando) |
| 2 | Hace clic en su **avatar** y selecciona una nueva foto | Sube la imagen a Cloudinary y actualiza el avatar. Muestra snackbar **"Avatar actualizado correctamente"** |
| 3 | Va a **Configuración > Datos personales**, modifica el nombre y hace clic en **"Guardar cambios"** | Muestra snackbar **"Datos actualizados correctamente"** |
| 4 | Cambia a la pestaña **"Privacidad"** y desactiva el switch **"Perfil público"** | Guarda la preferencia. Muestra snackbar **"Preferencias guardadas correctamente"** |
| 5 | Navega al perfil de otro estudiante (`/perfil/:id`) | Muestra la tarjeta pública del estudiante. Si el perfil es privado y no son contactos, muestra el mensaje **"Este perfil es privado. Conectate con {nombre} para ver más detalles."** |
| 6 | Hace clic en **"Inscribite en una carrera"** desde la página de Mis Materias | Si cumple elegibilidad, se inscribe y muestra mensaje de éxito. Si no, muestra el motivo |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Borde: sin carrera asignada | En paso 1, el estudiante no tiene carreras | La sección académica muestra **"Sin carrera asignada"** |
| Alert: email duplicado | En paso 3, cambia el email a uno ya registrado | Backend rechaza con *"Ya existe un usuario con el email '{email}'"* |
| Alternative: desactivar publicación automática | En paso 4, desactiva "Inscripciones" en la sección **"Publicaciones automáticas"** | Próximos cambios de estado a "cursando" no generarán Novedad en el feed |
| Permisos: ver perfil propio desde URL externa | En paso 5, ingresa a `/perfil/{su-propio-id}` | Redirige automáticamente a `/mi-perfil` |
| Alternative: inscribirse en segunda carrera | En paso 6, ya tiene una carrera y la segunda requiere >60% de avance | Si cumple, se inscribe. Si no, backend explica el porcentaje necesario |
| Error: dar de baja la única carrera | Intenta eliminar su única carrera activa | Backend rechaza con *"No se puede dar de baja la última carrera activa del estudiante"* |

---

## Notas

- El plan de materias (`/academico/mis-materias`) soporta 6 pestañas de filtro: Todas, Aprobadas, Regularizadas, Cursando, Disponibles, No Disponibles.
- Los estados de materia siguen este orden de prioridad: `aprobada` (3) > `regularizada` (2) > `cursando` (1) > `no_cursada` (0).
- La regularidad vence a los 2 años. Si una materia está "regularizada" y pasó ese plazo, el sistema la muestra como "Disponible" con el texto "La regularidad anterior venció el {fecha}".
- No existe validación que impida retroceder el estado de una materia (ej: de `aprobada` a `cursando`). El backend permite cualquier cambio siempre que no viole correlativas o el límite de 5 cursando.
- La importación desde Excel acepta los estados: `aprobada`, `regularizada`, `cursando`, `no_cursada`. Los nombres de materia se matchean por nombre exacto o código de materia en el plan.
- Las preferencias de privacidad y publicación automática se configuran desde **Configuración > Privacidad**. También hay una sección duplicada en **Privacidad > Publicación automática en el Feed**.
- La carrera se selecciona mediante un botón desplegable en la pantalla de Mis Materias. Si el estudiante tiene múltiples carreras, puede alternar entre ellas para ver el plan correspondiente.
