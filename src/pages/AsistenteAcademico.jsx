import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Alert, Button,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Accordion, AccordionSummary,
  AccordionDetails, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemIcon,
  TextField, FormControlLabel, Checkbox, IconButton, Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore, CheckCircle, Schedule, School, TrendingUp,
  AutoAwesome, UploadFile, ArrowBack, Lock, LockOpen,
  EmojiEvents, Save, DeleteOutline, ArrowUpward, ArrowDownward,
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';
import { PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

const ESTADO_COLOR = {
  aprobada: 'success',
  regularizada: 'warning',
  cursando: 'info',
  no_cursada: 'default',
};

const formatFechaCorta = (fecha) => {
  if (!fecha) return 'Sin fecha';

  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';

  return parsed.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatHoras = (horas) => `${Number(horas || 0)} hs`;

const STORAGE_PLANES_PREFIX = 'desapp-planes-cursada';
const MAX_MATERIAS_POR_PERIODO = 5;

const normalizarTextoExcel = (valor) =>
  String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const mapearEstadoExcel = (estado) => {
  const normalizado = normalizarTextoExcel(estado).replace(/\s+/g, '_');

  const alias = {
    aprobada: 'aprobada',
    aprobado: 'aprobada',
    regularizada: 'regularizada',
    regularizado: 'regularizada',
    cursando: 'cursando',
    cursada: 'cursando',
    cursado: 'cursando',
    no_cursada: 'no_cursada',
    no_cursado: 'no_cursada',
    pendiente: 'no_cursada',
    libre: 'no_cursada',
  };

  return alias[normalizado] || normalizado;
};

const cumpleEstadoCorrelativa = (estado) =>
  estado === 'aprobada' || estado === 'regularizada';

const obtenerDesbloqueosConSeleccion = (materias, regularizarIds) => {
  if (!Array.isArray(materias) || materias.length === 0) return [];

  const estadosHipoteticos = new Map(materias.map((m) => [m.id, m.estado]));

  regularizarIds.forEach((materiaId) => {
    const estadoActual = estadosHipoteticos.get(materiaId);
    if (estadoActual === 'cursando') {
      estadosHipoteticos.set(materiaId, 'regularizada');
    }
  });

  return materias
    .filter((m) => m.estado === 'no_cursada' && !m.disponible)
    .filter((m) => {
      const prerequisitos = m.prerrequisitos || [];
      return prerequisitos.every((preId) => {
        const estado = estadosHipoteticos.get(preId) || 'no_cursada';
        return cumpleEstadoCorrelativa(estado);
      });
    })
    .sort((a, b) => {
      if ((a.anio || 0) !== (b.anio || 0)) return (a.anio || 0) - (b.anio || 0);
      return a.nombre.localeCompare(b.nombre);
    });
};

const generarPlanPorHoras = (materias, horasSemanales) => {
  const horas = Number(horasSemanales || 0);
  if (!Number.isFinite(horas) || horas <= 0) {
    return {
      horasSemanales: 0,
      periodos: [],
      pendientesSinAsignar: [],
      mensaje: 'Ingresá una cantidad de horas semanales mayor a 0 para generar un plan.',
    };
  }

  const materiasMap = new Map((materias || []).map((m) => [m.id, m]));
  const estados = new Map((materias || []).map((m) => [m.id, m.estado]));
  const pendientes = (materias || [])
    .filter((m) => m.estado === 'no_cursada')
    .map((m) => m.id);

  const periodos = [];
  let guard = 0;

  while (pendientes.length > 0 && guard < 40) {
    guard += 1;

    const disponibles = pendientes
      .map((id) => materiasMap.get(id))
      .filter(Boolean)
      .filter((m) => {
        const prerequisitos = m.prerrequisitos || [];
        return prerequisitos.every((preId) =>
          cumpleEstadoCorrelativa(estados.get(preId) || 'no_cursada')
        );
      })
      .sort((a, b) => {
        if ((a.anio || 0) !== (b.anio || 0)) return (a.anio || 0) - (b.anio || 0);
        return a.nombre.localeCompare(b.nombre);
      });

    if (disponibles.length === 0) {
      break;
    }

    let restante = horas;
    const seleccion = [];

    disponibles.forEach((m) => {
      if (seleccion.length >= MAX_MATERIAS_POR_PERIODO) return;

      const carga = Number(m.cargaHoraria || 0);
      if (carga <= 0) return;

      if (carga <= restante) {
        seleccion.push(m);
        restante -= carga;
      }
    });

    if (seleccion.length === 0) {
      seleccion.push(disponibles[0]);
    }

    const idsSeleccion = new Set(seleccion.map((m) => m.id));

    periodos.push({
      numero: periodos.length + 1,
      cargaTotal: seleccion.reduce((acc, m) => acc + Number(m.cargaHoraria || 0), 0),
      materias: seleccion.map((m) => ({
        id: m.id,
        nombre: m.nombre,
        anio: m.anio,
        cargaHoraria: Number(m.cargaHoraria || 0),
      })),
    });

    for (let i = pendientes.length - 1; i >= 0; i -= 1) {
      if (idsSeleccion.has(pendientes[i])) {
        estados.set(pendientes[i], 'regularizada');
        pendientes.splice(i, 1);
      }
    }
  }

  // Si quedaron materias bloqueadas por correlatividades, las distribuimos
  // en períodos tentativos para que el plan siga siendo legible y completo.
  if (pendientes.length > 0) {
    const pendientesMaterias = pendientes
      .map((id) => materiasMap.get(id))
      .filter(Boolean)
      .sort((a, b) => {
        if ((a.anio || 0) !== (b.anio || 0)) return (a.anio || 0) - (b.anio || 0);
        return a.nombre.localeCompare(b.nombre);
      });

    let restantes = [...pendientesMaterias];

    while (restantes.length > 0) {
      let capacidad = horas;
      const seleccion = [];

      for (let i = 0; i < restantes.length; i += 1) {
        if (seleccion.length >= MAX_MATERIAS_POR_PERIODO) break;

        const materia = restantes[i];
        const carga = Number(materia.cargaHoraria || 0);

        if (carga <= 0) continue;

        if (carga <= capacidad) {
          seleccion.push(materia);
          capacidad -= carga;
        }
      }

      if (seleccion.length === 0 && restantes.length > 0) {
        seleccion.push(restantes[0]);
      }

      const idsSeleccion = new Set(seleccion.map((m) => m.id));
      restantes = restantes.filter((m) => !idsSeleccion.has(m.id));

      periodos.push({
        numero: periodos.length + 1,
        bloqueado: true,
        cargaTotal: seleccion.reduce((acc, m) => acc + Number(m.cargaHoraria || 0), 0),
        materias: seleccion.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          anio: m.anio,
          cargaHoraria: Number(m.cargaHoraria || 0),
        })),
      });
    }
  }

  return {
    horasSemanales: horas,
    periodos,
    pendientesSinAsignar: pendientes
      .map((id) => materiasMap.get(id))
      .filter(Boolean)
      .map((m) => ({ id: m.id, nombre: m.nombre, anio: m.anio })),
    mensaje:
      pendientes.length > 0
        ? 'Se agregaron períodos tentativos para materias con correlatividades aún no cumplidas.'
        : 'Plan generado correctamente.',
  };
};

const recalcularCargaPeriodos = (periodos) =>
  (periodos || []).map((p, index) => ({
    ...p,
    numero: index + 1,
    cargaTotal: (p.materias || []).reduce(
      (acc, m) => acc + Number(m.cargaHoraria || 0),
      0
    ),
  }));

const compactarPeriodosVacios = (periodos) =>
  recalcularCargaPeriodos(
    (periodos || []).filter((p) => (p.materias || []).length > 0)
  );

const validarCorrelativasPlan = (periodos, materiasBase = []) => {
  const materiasMap = new Map((materiasBase || []).map((m) => [m.id, m]));
  const estadoBase = new Map((materiasBase || []).map((m) => [m.id, m.estado]));
  const cuatrimestrePorMateria = new Map();

  (periodos || []).forEach((p) => {
    (p.materias || []).forEach((m) => {
      cuatrimestrePorMateria.set(m.id, p.numero);
    });
  });

  const invalidas = [];

  (periodos || []).forEach((p) => {
    if (p.bloqueado) return;

    (p.materias || []).forEach((m) => {
      const detalle = materiasMap.get(m.id);
      const prerequisitos = detalle?.prerrequisitos || [];

      const incumplidas = prerequisitos.filter((preId) => {
        const estadoPre = estadoBase.get(preId) || 'no_cursada';
        if (cumpleEstadoCorrelativa(estadoPre)) {
          return false;
        }

        const cuatrimestrePre = cuatrimestrePorMateria.get(preId);
        return !(Number.isFinite(cuatrimestrePre) && cuatrimestrePre < p.numero);
      });

      if (incumplidas.length > 0) {
        invalidas.push({
          materiaId: m.id,
          materiaNombre: m.nombre,
          cuatrimestre: p.numero,
          prerequisitosNombres: incumplidas
            .map((preId) => materiasMap.get(preId)?.nombre || `ID ${preId}`)
            .sort((a, b) => a.localeCompare(b)),
        });
      }
    });
  });

  return invalidas;
};

const compararPlanConActual = (plan, materias) => {
  if (!plan?.periodos?.length) return null;

  const estadosActuales = new Map((materias || []).map((m) => [m.id, m.estado]));
  const idsPlan = new Set(
    plan.periodos.flatMap((p) => (p.materias || []).map((m) => m.id))
  );

  const cumplidas = [...idsPlan].filter((id) =>
    cumpleEstadoCorrelativa(estadosActuales.get(id) || 'no_cursada')
  ).length;

  const total = idsPlan.size;

  const detallePorPeriodo = (plan.periodos || []).map((p) => {
    const materiasPeriodo = (p.materias || []).map((m) => {
      const estadoActual = estadosActuales.get(m.id) || 'no_cursada';
      return {
        id: m.id,
        nombre: m.nombre,
        anio: m.anio,
        estadoActual,
        cumplida: cumpleEstadoCorrelativa(estadoActual),
      };
    });

    const totalPeriodo = (p.materias || []).length;
    const cumplidasPeriodo = materiasPeriodo.filter((m) => m.cumplida).length;

    return {
      numero: p.numero,
      total: totalPeriodo,
      cumplidas: cumplidasPeriodo,
      porcentaje: totalPeriodo > 0 ? Math.round((cumplidasPeriodo / totalPeriodo) * 100) : 0,
      materias: materiasPeriodo,
    };
  });

  return {
    total,
    cumplidas,
    pendientes: Math.max(total - cumplidas, 0),
    porcentaje: total > 0 ? Math.round((cumplidas / total) * 100) : 0,
    detallePorPeriodo,
  };
};

const reacomodarCorrelativasHaciaAbajo = (periodos, materiasBase = []) => {
  const periodosMutables = (periodos || []).map((p) => ({
    ...p,
    materias: [...(p.materias || [])],
  }));
  const materiasMap = new Map((materiasBase || []).map((m) => [m.id, m]));
  const estadosBase = new Map((materiasBase || []).map((m) => [m.id, m.estado]));

  const buscarIndicePeriodo = (materiaId) =>
    periodosMutables.findIndex((p) => (p.materias || []).some((m) => m.id === materiaId));

  const obtenerDestino = (materiaId) => {
    const detalle = materiasMap.get(materiaId);
    if (!detalle) return 0;

    let destino = 0;
    (detalle.prerrequisitos || []).forEach((preId) => {
      const estadoPre = estadosBase.get(preId) || 'no_cursada';
      if (cumpleEstadoCorrelativa(estadoPre)) return;

      const indicePre = buscarIndicePeriodo(preId);
      if (indicePre >= 0) {
        destino = Math.max(destino, indicePre + 1);
      }
    });

    return destino;
  };

  let guard = 0;
  while (guard < 100) {
    guard += 1;
    let reubicada = false;

    for (let periodoIndex = 0; periodoIndex < periodosMutables.length; periodoIndex += 1) {
      const materiasPeriodo = periodosMutables[periodoIndex].materias || [];

      for (let materiaIndex = 0; materiaIndex < materiasPeriodo.length; materiaIndex += 1) {
        const materia = materiasPeriodo[materiaIndex];
        const destino = obtenerDestino(materia.id);

        if (destino > periodoIndex) {
          const [movida] = materiasPeriodo.splice(materiaIndex, 1);

          while (periodosMutables.length <= destino) {
            periodosMutables.push({
              numero: periodosMutables.length + 1,
              materias: [],
            });
          }

          periodosMutables[destino].materias.push(movida);
          reubicada = true;
          break;
        }
      }

      if (reubicada) {
        break;
      }
    }

    if (!reubicada) {
      break;
    }
  }

  return compactarPeriodosVacios(periodosMutables);
};

export default function AsistenteAcademico() {
  const navigate = useNavigate();
  const { estudianteActual } = useAuth();
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Import Excel
  const [dialogImport, setDialogImport] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResultado, setImportResultado] = useState(null);
  const [importError, setImportError] = useState(null);
  const [materiasProyeccionSeleccionadas, setMateriasProyeccionSeleccionadas] = useState([]);
  const [horasPlanificador, setHorasPlanificador] = useState(12);
  const [planSugerido, setPlanSugerido] = useState(null);
  const [nombrePlan, setNombrePlan] = useState('');
  const [planesGuardados, setPlanesGuardados] = useState([]);
  const [planActivoId, setPlanActivoId] = useState(null);
  const [planificadorFeedback, setPlanificadorFeedback] = useState(null);
  const [planActionLoadingId, setPlanActionLoadingId] = useState(null);
  const [planActionFeedback, setPlanActionFeedback] = useState(null);

  const cargarAnalisis = useCallback(async () => {
    if (!estudianteActual?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await EstudianteService.obtenerAsistenteAcademico(estudianteActual.id);
      setAnalisis(response.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [estudianteActual?.id]);

  useEffect(() => {
    cargarAnalisis();
  }, [cargarAnalisis]);

  // --- Excel import ---
  const handleArchivoExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportError(null);
    setImportResultado(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      // Esperar columnas: "nombre" y "estado" (case-insensitive)
      const materias = rows
        .map((row) => {
          const entries = Object.entries(row);
          const nombreEntry = entries.find(([key]) => normalizarTextoExcel(key) === 'nombre');
          const estadoEntry = entries.find(([key]) => normalizarTextoExcel(key) === 'estado');

          const nombre = nombreEntry?.[1] || '';
          const estado = estadoEntry?.[1] || '';

          return {
            nombre: String(nombre).trim(),
            estado: mapearEstadoExcel(estado),
          };
        })
        .filter((r) => r.nombre);

      if (materias.length === 0) {
        setImportError('El archivo no tiene filas válidas. Asegurate de que tenga columnas "nombre" y "estado".');
        setImportLoading(false);
        return;
      }

      const result = await EstudianteService.importarMateriasDesdeExcel(
        estudianteActual.id,
        materias
      );
      setImportResultado(result);
      await cargarAnalisis();
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  const materiasAnalisis = analisis?.materias || [];
  const materiasCursando = materiasAnalisis.filter((m) => m.estado === 'cursando');
  const storageKey = `${STORAGE_PLANES_PREFIX}-${estudianteActual?.id || 'anon'}`;

  useEffect(() => {
    const idsCursando = materiasCursando.map((m) => m.id);
    setMateriasProyeccionSeleccionadas(idsCursando);
  }, [analisis?.estudiante?.id, materiasCursando.length]);

  useEffect(() => {
    if (!estudianteActual?.id) {
      setPlanesGuardados([]);
      setPlanActivoId(null);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setPlanesGuardados(Array.isArray(parsed) ? parsed : []);
    } catch {
      setPlanesGuardados([]);
    }
  }, [estudianteActual?.id, storageKey]);

  if (loading) return <PageContainer centered padding={3}><LoadingSpinner message="Analizando situación académica..." /></PageContainer>;
  if (error) return <PageContainer padding={3}><EmptyState title="Error" message={error} icon="error" actionLabel="Reintentar" onAction={cargarAnalisis} /></PageContainer>;
  if (!analisis) return <PageContainer padding={3}><EmptyState title="Sin datos" message="No se encontró información académica" icon="inbox" /></PageContainer>;

  const {
    estudiante,
    resumen,
    materias = [],
    puedeCursar,
    finalesPendientes,
    analisisPorAnio,
    proyeccion,
    paraRecibirse = {},
  } = analisis;

  const finalesOrdenados = [...finalesPendientes].sort((a, b) => {
    if ((a.anio || 0) !== (b.anio || 0)) return (a.anio || 0) - (b.anio || 0);
    return a.nombre.localeCompare(b.nombre);
  });

  const materiasPendientes = paraRecibirse.materiasPendientes || [];
  const desbloqueosSeleccionados = obtenerDesbloqueosConSeleccion(
    materias,
    materiasProyeccionSeleccionadas
  );
  const planActivo = planesGuardados.find((p) => p.id === planActivoId) || null;
  const comparacionPlanActivo = compararPlanConActual(planActivo, materias);
  const totalHoras = resumen.cargaHorariaTotal || 0;
  const horasAprobadas = resumen.cargaHorariaAprobada || 0;
  const horasRegularizadas = resumen.cargaHorariaRegularizada || 0;
  const horasCursando = resumen.cargaHorariaCursando || 0;
  const horasPendientes = resumen.cargaHorariaPendiente || 0;
  const analisisPorAnioEntries = Object.entries(analisisPorAnio).sort(
    ([anioA], [anioB]) => {
      const numA = Number.parseInt(anioA, 10);
      const numB = Number.parseInt(anioB, 10);

      if (Number.isNaN(numA) && Number.isNaN(numB)) return anioA.localeCompare(anioB);
      if (Number.isNaN(numA)) return 1;
      if (Number.isNaN(numB)) return -1;
      return numA - numB;
    }
  );

  const guardarPlanesEnStorage = (planes) => {
    setPlanesGuardados(planes);
    localStorage.setItem(storageKey, JSON.stringify(planes));
  };

  const generarPlanificador = () => {
    setPlanificadorFeedback(null);
    const plan = generarPlanPorHoras(materias, horasPlanificador);
    setPlanSugerido(plan);
  };

  const moverMateriaPlan = (materiaId, direccion) => {
    setPlanSugerido((prev) => {
      if (!prev?.periodos?.length) return prev;

      const periodos = prev.periodos.map((p) => ({ ...p, materias: [...(p.materias || [])] }));
      let origen = -1;
      let materia = null;

      periodos.forEach((p, idx) => {
        const encontrada = p.materias.find((m) => m.id === materiaId);
        if (encontrada) {
          origen = idx;
          materia = encontrada;
        }
      });

      if (!materia || origen < 0) return prev;

      const destino = origen + direccion;
      if (destino < 0 || destino >= periodos.length) return prev;

      if (periodos[destino].materias.length >= MAX_MATERIAS_POR_PERIODO) {
        setPlanificadorFeedback({
          severity: 'warning',
          message: `No se puede mover: el cuatrimestre ${periodos[destino].numero} ya tiene ${MAX_MATERIAS_POR_PERIODO} materias.`,
        });
        return prev;
      }

      periodos[origen].materias = periodos[origen].materias.filter((m) => m.id !== materiaId);
      periodos[destino].materias.push(materia);

      const periodosReacomodados = reacomodarCorrelativasHaciaAbajo(periodos, materias);
      const invalidas = validarCorrelativasPlan(periodosReacomodados, materias);
      if (invalidas.length > 0) {
        const primera = invalidas[0];
        setPlanificadorFeedback({
          severity: 'warning',
          message: `Movimiento no permitido: ${primera.materiaNombre} en cuatrimestre ${primera.cuatrimestre} no cumple correlativas (${primera.prerequisitosNombres.join(', ')}). Las correlativas deben estar aprobadas/regularizadas o ubicadas en un cuatrimestre anterior.`,
        });
        return prev;
      }

      setPlanificadorFeedback(null);

      return {
        ...prev,
        periodos: periodosReacomodados,
      };
    });
  };

  const moverMateriaDentroPeriodo = (periodoNumero, materiaId, delta) => {
    setPlanSugerido((prev) => {
      if (!prev?.periodos?.length) return prev;

      const periodos = prev.periodos.map((p) => ({ ...p, materias: [...(p.materias || [])] }));
      const idxPeriodo = periodos.findIndex((p) => p.numero === periodoNumero);
      if (idxPeriodo < 0) return prev;

      const materiasPeriodo = periodos[idxPeriodo].materias;
      const idxMateria = materiasPeriodo.findIndex((m) => m.id === materiaId);
      if (idxMateria < 0) return prev;

      const destino = idxMateria + delta;
      if (destino < 0 || destino >= materiasPeriodo.length) return prev;

      const [materia] = materiasPeriodo.splice(idxMateria, 1);
      materiasPeriodo.splice(destino, 0, materia);

      const invalidas = validarCorrelativasPlan(periodos, materias);
      if (invalidas.length > 0) {
        const primera = invalidas[0];
        setPlanificadorFeedback({
          severity: 'warning',
          message: `Orden no permitido: ${primera.materiaNombre} en cuatrimestre ${primera.cuatrimestre} no cumple correlativas (${primera.prerequisitosNombres.join(', ')}). Las correlativas deben estar aprobadas/regularizadas o ubicadas en un cuatrimestre anterior.`,
        });
        return prev;
      }

      setPlanificadorFeedback(null);

      return {
        ...prev,
        periodos: recalcularCargaPeriodos(periodos),
      };
    });
  };

  const eliminarMateriaDelPlan = (periodoNumero, materiaId) => {
    setPlanSugerido((prev) => {
      if (!prev?.periodos?.length) return prev;

      const periodos = prev.periodos.map((p) => ({ ...p, materias: [...(p.materias || [])] }));
      const idxPeriodo = periodos.findIndex((p) => p.numero === periodoNumero);
      if (idxPeriodo < 0) return prev;

      const materiasPeriodo = periodos[idxPeriodo].materias;
      const idxMateria = materiasPeriodo.findIndex((m) => m.id === materiaId);
      if (idxMateria < 0) return prev;

      const [eliminada] = materiasPeriodo.splice(idxMateria, 1);
      const pendientes = [...(prev.pendientesSinAsignar || [])];

      if (eliminada && !pendientes.some((m) => m.id === eliminada.id)) {
        pendientes.push({ id: eliminada.id, nombre: eliminada.nombre, anio: eliminada.anio });
      }

      return {
        ...prev,
        periodos: compactarPeriodosVacios(periodos),
        pendientesSinAsignar: pendientes.sort((a, b) => {
          if ((a.anio || 0) !== (b.anio || 0)) return (a.anio || 0) - (b.anio || 0);
          return a.nombre.localeCompare(b.nombre);
        }),
      };
    });
  };

  const guardarPlanActual = () => {
    if (!planSugerido?.periodos?.length) return;

    const nuevoPlan = {
      id: Date.now(),
      nombre: nombrePlan?.trim() || `Plan ${new Date().toLocaleDateString('es-AR')}`,
      horasSemanales: planSugerido.horasSemanales,
      periodos: planSugerido.periodos,
      createdAt: new Date().toISOString(),
    };

    const actualizados = [nuevoPlan, ...planesGuardados];
    guardarPlanesEnStorage(actualizados);
    setPlanActivoId(nuevoPlan.id);
    setNombrePlan('');
  };

  const eliminarPlan = (planId) => {
    const actualizados = planesGuardados.filter((p) => p.id !== planId);
    guardarPlanesEnStorage(actualizados);
    if (planActivoId === planId) {
      setPlanActivoId(actualizados[0]?.id || null);
    }
  };

  const marcarMateriaAprobadaDesdePlan = async (materiaId) => {
    if (!estudianteActual?.id || !materiaId) return;

    try {
      setPlanActionLoadingId(materiaId);
      setPlanActionFeedback(null);

      await EstudianteService.actualizarEstadoMateria(
        estudianteActual.id,
        materiaId,
        'aprobada'
      );

      await cargarAnalisis();

      setPlanActionFeedback({
        severity: 'success',
        message: 'Materia marcada como aprobada correctamente.',
      });
    } catch (e) {
      const msg = e?.data?.message || e?.message || 'No se pudo marcar la materia como aprobada.';
      setPlanActionFeedback({
        severity: 'error',
        message: msg,
      });
    } finally {
      setPlanActionLoadingId(null);
    }
  };

  return (
    <PageContainer padding={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/mis-materias')}>
          Mis Materias
        </Button>
        <Box flexGrow={1}>
          <Typography variant="h4" display="flex" alignItems="center" gap={1}>
            <AutoAwesome color="primary" />
            Asistente Académico
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {estudiante?.nombre} {estudiante?.apellido} — {analisis?.carrera?.nombre}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<UploadFile />}
          onClick={() => setDialogImport(true)}
        >
          Importar desde Excel
        </Button>
      </Box>

      {/* Progreso general */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <TrendingUp color="primary" /> Avance en la carrera
            </Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {resumen.porcentajeAvance}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={resumen.porcentajeAvance}
            sx={{ height: 12, borderRadius: 6, mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {`Horas aprobadas: ${formatHoras(horasAprobadas)} de ${formatHoras(totalHoras)} · Regularizadas: ${formatHoras(horasRegularizadas)} · Cursando: ${formatHoras(horasCursando)} · Pendientes: ${formatHoras(horasPendientes)}`}
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Aprobadas', value: resumen.aprobadas, color: 'success.main' },
              { label: 'Regularizadas', value: resumen.regularizadas, color: 'warning.main' },
              { label: 'Cursando', value: resumen.cursando, color: 'info.main' },
              { label: 'Faltantes', value: resumen.noCursadas, color: 'text.secondary' },
              { label: 'Total', value: resumen.total, color: 'text.primary' },
            ].map((stat) => (
              <Grid item xs={6} sm={4} md key={stat.label}>
                <Box textAlign="center">
                  <Typography variant="h5" color={stat.color} fontWeight="bold">{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <School color="secondary" /> Planificador de cursada
              </Typography>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Horas semanales disponibles"
                    type="number"
                    value={horasPlanificador}
                    onChange={(e) => setHorasPlanificador(Number(e.target.value || 0))}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Button variant="contained" onClick={generarPlanificador}>
                    Generar plan
                  </Button>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mb: 2 }}>
                Límite aplicado: máximo {MAX_MATERIAS_POR_PERIODO} materias por cuatrimestre.
              </Alert>

              {planificadorFeedback && (
                <Alert severity={planificadorFeedback.severity} sx={{ mb: 2 }}>
                  {planificadorFeedback.message}
                </Alert>
              )}

              {!planSugerido ? (
                <Alert severity="info">Generá un plan para ver la secuencia de cuatrimestres hasta recibirte.</Alert>
              ) : (
                <>
                  <Alert severity={planSugerido.pendientesSinAsignar.length > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                    {planSugerido.mensaje}
                  </Alert>

                  {planSugerido.periodos.map((periodo, idx) => (
                    <Accordion key={`plan-periodo-${idx}`} disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box display="flex" width="100%" alignItems="center" gap={2}>
                          <Typography fontWeight={700}>Cuatrimestre {periodo.numero}</Typography>

                          <Chip size="small" label={`${periodo.materias.length} materias`} />
                          <Box flexGrow={1} />
                          <Typography variant="caption" color="text.secondary">
                            {formatHoras(periodo.cargaTotal)}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {periodo.materias.length === 0 ? (
                          <Alert severity="info">Este cuatrimestre quedó vacío.</Alert>
                        ) : (
                          <List dense disablePadding>
                            {periodo.materias.map((m, materiaIdx) => (
                              <ListItem
                                key={`plan-${periodo.numero}-${m.id}`}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  mb: 1,
                                }}
                                secondaryAction={(
                                  <Box display="flex" gap={0.5}>
                                    <IconButton
                                      size="small"
                                      onClick={() => moverMateriaDentroPeriodo(periodo.numero, m.id, -1)}
                                      disabled={materiaIdx === 0}
                                      title="Subir en la lista"
                                    >
                                      <ArrowUpward fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => moverMateriaDentroPeriodo(periodo.numero, m.id, 1)}
                                      disabled={materiaIdx === periodo.materias.length - 1}
                                      title="Bajar en la lista"
                                    >
                                      <ArrowDownward fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => moverMateriaPlan(m.id, -1)}
                                      disabled={idx === 0}
                                      title="Mover al cuatrimestre anterior"
                                    >
                                      <ArrowBack fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => moverMateriaPlan(m.id, 1)}
                                      disabled={idx === planSugerido.periodos.length - 1}
                                      title="Mover al cuatrimestre siguiente"
                                    >
                                      <ArrowBack sx={{ transform: 'rotate(180deg)' }} fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => eliminarMateriaDelPlan(periodo.numero, m.id)}
                                      title="Eliminar del plan"
                                    >
                                      <DeleteOutline fontSize="small" />
                                    </IconButton>
                                  </Box>
                                )}
                              >
                                <ListItemText
                                  primary={m.nombre}
                                  secondary={`Carga estimada: ${formatHoras(m.cargaHoraria)}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  {planSugerido.pendientesSinAsignar.length > 0 && !planSugerido.periodos.some((p) => p.bloqueado) && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Quedaron sin ubicar: {planSugerido.pendientesSinAsignar.map((m) => m.nombre).join(', ')}.
                    </Alert>
                  )}

                  <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={7}>
                      <TextField
                        fullWidth
                        label="Nombre del plan"
                        value={nombrePlan}
                        onChange={(e) => setNombrePlan(e.target.value)}
                        placeholder="Ej: Plan intensivo 2026"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Button fullWidth variant="outlined" startIcon={<Save />} onClick={guardarPlanActual}>
                        Guardar plan
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUp color="secondary" /> Planes guardados y comparación
              </Typography>

              {planesGuardados.length === 0 ? (
                <Alert severity="info">Todavía no guardaste planes.</Alert>
              ) : (
                <>
                  <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    {planesGuardados.map((plan) => (
                      <Chip
                        key={plan.id}
                        label={`${plan.nombre} (${plan.horasSemanales} hs/sem)`}
                        color={planActivoId === plan.id ? 'primary' : 'default'}
                        variant={planActivoId === plan.id ? 'filled' : 'outlined'}
                        onClick={() => setPlanActivoId(plan.id)}
                        onDelete={() => eliminarPlan(plan.id)}
                        deleteIcon={<DeleteOutline />}
                      />
                    ))}
                  </Box>

                  {comparacionPlanActivo && (
                    <>
                      {planActionFeedback && (
                        <Alert severity={planActionFeedback.severity} sx={{ mb: 2 }}>
                          {planActionFeedback.message}
                        </Alert>
                      )}

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Cumplimiento del plan activo: <strong>{comparacionPlanActivo.porcentaje}%</strong> ({comparacionPlanActivo.cumplidas}/{comparacionPlanActivo.total} materias del plan)
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={comparacionPlanActivo.porcentaje}
                        sx={{ height: 8, borderRadius: 4, mb: 2 }}
                      />

                      {comparacionPlanActivo.detallePorPeriodo.map((p) => (
                        <Accordion key={`cmp-${p.numero}`} disableGutters sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box display="flex" width="100%" alignItems="center" gap={1}>
                              <Typography fontWeight={600}>
                                {`Cuatrimestre ${p.numero}: ${p.cumplidas}/${p.total} (${p.porcentaje}%)`}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            {p.materias.length === 0 ? (
                              <Alert severity="info">Sin materias en este cuatrimestre.</Alert>
                            ) : (
                              <List dense disablePadding>
                                {p.materias.map((m) => (
                                  <ListItem
                                    key={`cmp-mat-${p.numero}-${m.id}`}
                                    sx={{
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <ListItemText
                                      primary={m.nombre}
                                      secondary="Planificada en cuatrimestres"
                                    />
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Chip
                                        size="small"
                                        color={m.cumplida ? 'success' : 'default'}
                                        label={m.cumplida ? 'Cumplida' : `Pendiente (${m.estadoActual})`}
                                      />
                                      {!m.cumplida && (
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() => marcarMateriaAprobadaDesdePlan(m.id)}
                                          disabled={planActionLoadingId === m.id}
                                        >
                                          {planActionLoadingId === m.id ? 'Guardando...' : 'Marcar aprobada'}
                                        </Button>
                                      )}
                                    </Box>
                                  </ListItem>
                                ))}
                              </List>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Columna izquierda */}
        <Grid item xs={12} md={6}>
          {/* Puede cursar */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <LockOpen color="success" /> Podés inscribirte ({puedeCursar.length})
              </Typography>
              {puedeCursar.length === 0 ? (
                <Alert severity="info">Todas las materias disponibles ya están cursadas o aprobadas.</Alert>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {puedeCursar.map((m) => (
                    <Chip key={m.id} label={`${m.nombre} (${m.anio}°, ${formatHoras(m.cargaHoraria)})`} color="success" variant="outlined" size="small" icon={<LockOpen />} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Finales pendientes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <Schedule color="warning" /> Finales pendientes ({finalesPendientes.length})
              </Typography>
              {finalesOrdenados.length === 0 ? (
                <Alert severity="success">No tenés finales pendientes.</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Materia</TableCell>
                        <TableCell>Año</TableCell>
                        <TableCell>Horas</TableCell>
                        <TableCell>Fecha regularidad</TableCell>
                        <TableCell>Vence estimado</TableCell>
                        <TableCell>Intentos previos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {finalesOrdenados.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.nombre}</TableCell>
                          <TableCell>{m.anio}°</TableCell>
                          <TableCell>{formatHoras(m.cargaHoraria)}</TableCell>
                          <TableCell>{formatFechaCorta(m.fechaRegularidad)}</TableCell>
                          <TableCell>{formatFechaCorta(m.fechaVencimientoRegularidad)}</TableCell>
                          <TableCell>{m.intentosPrevios ?? 'Sin datos'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha */}
        <Grid item xs={12} md={6}>
          {/* Proyección "¿Qué pasa si...?" */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={1}>
                <AutoAwesome color="secondary" /> Proyección
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {proyeccion.descripcion}
              </Typography>

              {materiasCursando.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Elegí qué materias cursando querés simular como regularizadas:
                  </Typography>
                  <Grid container spacing={1}>
                    {materiasCursando.map((m) => (
                      <Grid item xs={12} sm={6} key={m.id}>
                        <FormControlLabel
                          control={(
                            <Checkbox
                              size="small"
                              checked={materiasProyeccionSeleccionadas.includes(m.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMateriasProyeccionSeleccionadas((prev) => [...new Set([...prev, m.id])]);
                                } else {
                                  setMateriasProyeccionSeleccionadas((prev) => prev.filter((id) => id !== m.id));
                                }
                              }}
                            />
                          )}
                          label={`${m.nombre} (${formatHoras(m.cargaHoraria)})`}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Con esta selección se desbloquearían:
              </Typography>

              {desbloqueosSeleccionados.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No se desbloquean materias nuevas con la selección actual.
                </Alert>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                  {desbloqueosSeleccionados.map((m) => (
                    <Chip key={`sel-${m.id}`} label={`${m.nombre} (${m.anio}°)`} color="secondary" variant="outlined" size="small" icon={<Lock />} />
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Escenario base (regularizando todo lo que cursás):
              </Typography>
              {proyeccion.seDesbloquearian.length === 0 ? (
                <Alert severity="info">
                  {resumen.cursando === 0
                    ? 'No estás cursando ninguna materia actualmente.'
                    : 'No se desbloquearían materias nuevas con lo que estás cursando.'}
                </Alert>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {proyeccion.seDesbloquearian.map((m) => (
                    <Chip key={m.id} label={`${m.nombre} (${m.anio}°)`} color="secondary" variant="outlined" size="small" icon={<Lock />} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Análisis por año */}
          <Card>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <EmojiEvents color="primary" /> Análisis por año
              </Typography>
              {analisisPorAnioEntries.map(([anio, datos]) => (
                  <Accordion key={anio} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" flexDirection="column" width="100%" gap={1}>
                        <Box display="flex" alignItems="center" gap={2} width="100%">
                          <Typography fontWeight="bold">{anio}° año</Typography>
                          {datos.completo ? (
                            <Chip label="Completo" color="success" size="small" icon={<CheckCircle />} />
                          ) : (
                            <Chip label={`${datos.faltantes} faltantes`} color="default" size="small" />
                          )}
                          <Box flexGrow={1} />
                          <Typography variant="caption" color="text.secondary">
                            {formatHoras(datos.cargaHorariaAprobada + datos.cargaHorariaRegularizada)} de {formatHoras(datos.cargaHorariaTotal)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={datos.total > 0 ? Math.round(((datos.aprobadas + datos.regularizadas) / datos.total) * 100) : 0}
                          sx={{ width: '100%', height: 6, borderRadius: 3 }}
                          color="success"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        {[
                          { label: 'Aprobadas', value: datos.aprobadas, color: 'success' },
                          { label: 'Regularizadas', value: datos.regularizadas, color: 'warning' },
                          { label: 'Cursando', value: datos.cursando, color: 'info' },
                          { label: 'Faltantes', value: datos.faltantes, color: 'default' },
                        ].map((s) => (
                          <Grid item xs={6} key={s.label}>
                            <Chip label={`${s.value} ${s.label}`} color={s.color} size="small" sx={{ width: '100%' }} />
                          </Grid>
                        ))}
                      </Grid>
                      <Grid container spacing={1}>
                        {[
                          { label: 'Horas aprobadas', value: datos.cargaHorariaAprobada },
                          { label: 'Horas regularizadas', value: datos.cargaHorariaRegularizada },
                          { label: 'Horas cursando', value: datos.cargaHorariaCursando },
                          { label: 'Horas pendientes', value: datos.cargaHorariaPendiente },
                        ].map((s) => (
                          <Grid item xs={6} key={s.label}>
                            <Chip label={`${s.label}: ${formatHoras(s.value)}`} size="small" variant="outlined" sx={{ width: '100%' }} />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Qué falta para recibirse */}
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
            <School color="primary" /> Qué te falta para recibirse
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {[
              { label: 'Materias por cursar', value: materiasPendientes.length, color: 'primary.main' },
              { label: 'Materias disponibles', value: puedeCursar.length, color: 'success.main' },
              { label: 'Finales pendientes', value: finalesPendientes.length, color: 'warning.main' },
              { label: 'Horas pendientes', value: formatHoras(horasPendientes), color: 'text.primary' },
            ].map((stat) => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Box textAlign="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h5" color={stat.color} fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {materiasPendientes.length === 0 ? (
            <Alert severity="success">No te quedan materias por cursar para completar el plan.</Alert>
          ) : (
            <TableContainer sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Materia</TableCell>
                    <TableCell>Año</TableCell>
                    <TableCell>Horas</TableCell>
                    <TableCell>Disponible ahora</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materiasPendientes.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.nombre}</TableCell>
                      <TableCell>{m.anio ? `${m.anio}°` : 'Sin año'}</TableCell>
                      <TableCell>{formatHoras(m.cargaHoraria)}</TableCell>
                      <TableCell>
                        <Chip
                          label={m.disponible ? 'Sí' : 'No'}
                          size="small"
                          color={m.disponible ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {finalesPendientes.length > 0 && (
            <Alert severity="info">
              Te quedan {finalesPendientes.length} final{finalesPendientes.length > 1 ? 'es' : ''} por rendir sobre materias ya regularizadas.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={Boolean(planificadorFeedback)}
        autoHideDuration={5500}
        onClose={() => setPlanificadorFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={planificadorFeedback?.severity || 'info'}
          onClose={() => setPlanificadorFeedback(null)}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {planificadorFeedback?.message || ''}
        </Alert>
      </Snackbar>

      {/* Dialog de importación */}
      <Dialog open={dialogImport} onClose={() => { setDialogImport(false); setImportResultado(null); setImportError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle display="flex" alignItems="center" gap={1}>
          <UploadFile /> Importar materias desde Excel
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            El archivo Excel debe tener dos columnas: <strong>nombre</strong> (nombre exacto de la materia) y <strong>estado</strong> (aprobada, regularizada o cursando).
          </Typography>
          <Button variant="outlined" component="label" startIcon={importLoading ? <CircularProgress size={16} /> : <UploadFile />} disabled={importLoading} fullWidth>
            {importLoading ? 'Importando...' : 'Seleccionar archivo .xlsx'}
            <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleArchivoExcel} />
          </Button>
          {importError && <Alert severity="error" sx={{ mt: 2 }}>{importError}</Alert>}
          {importResultado && (
            <Box mt={2}>
              <Alert
                severity={
                  (importResultado.data?.resumen?.importadas || 0) > 0
                    ? (importResultado.data?.resumen?.errores || 0) > 0 ||
                      (importResultado.data?.resumen?.ignoradas || 0) > 0
                      ? 'warning'
                      : 'success'
                    : 'error'
                }
                sx={{ mb: 1 }}
              >
                {importResultado.message}
              </Alert>
              {importResultado.data?.ignoradas?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  {importResultado.data.ignoradas.length} filas ignoradas (estado inválido o nombre vacío)
                </Alert>
              )}
              {importResultado.data?.errores?.length > 0 && (
                <Alert severity="error">
                  {importResultado.data.errores.length} materias no encontradas en el sistema:
                  <List dense>
                    {importResultado.data.errores.map((e, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemIcon><School fontSize="small" /></ListItemIcon>
                        <ListItemText primary={`"${e.fila.nombre}" — ${e.razon}`} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogImport(false); setImportResultado(null); setImportError(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
