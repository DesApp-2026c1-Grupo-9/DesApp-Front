import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import EstudianteService from '../services/EstudianteService';

export function useImportarMaterias({ estudianteId, onImportComplete }) {
  const [dialogImport, setDialogImport] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResultado, setImportResultado] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleArchivoExcel = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportError(null);
    setImportResultado(null);

    try {
      const fileName = file.name.toLowerCase();
      const isCSV = fileName.endsWith('.csv');
      let rows;

      if (isCSV) {
        const text = await file.text();
        const workbook = XLSX.read(text, { type: 'string' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      } else {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      }

      const materias = rows.map((row) => {
        const rawId = row['id'] || row['Id'] || row['ID'];
        const id = rawId ? parseInt(String(rawId).trim(), 10) : null;
        const nombre = row['nombre'] || row['Nombre'] || row['NOMBRE'] || '';
        const estado = row['estado'] || row['Estado'] || row['ESTADO'] || '';
        return {
          ...(id && !Number.isNaN(id) ? { id } : {}),
          nombre: String(nombre).trim(),
          estado: String(estado).trim().toLowerCase(),
        };
      });

      const validas = materias.filter((r) => r.id || r.nombre);
      if (validas.length === 0) {
        setImportError('El archivo no tiene filas válidas. Asegurate de que tenga columnas "id" (o "nombre") y "estado".');
        setImportLoading(false);
        return;
      }

      const result = await EstudianteService.importarMateriasDesdeExcel(
        estudianteId,
        validas
      );
      setImportResultado(result);

      if (onImportComplete) {
        await onImportComplete();
      }
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
      if (e.target) e.target.value = '';
    }
  }, [estudianteId, onImportComplete]);

  const handleDescargarTemplate = useCallback((materiasEditables) => {
    if (!materiasEditables || materiasEditables.length === 0) return;

    const header = 'id,nombre,estado';
    const rows = materiasEditables.map((m) => `${m.id},"${m.nombre}",`);
    const csv = '\uFEFF' + [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-importar-materias.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleCloseImportDialog = useCallback(() => {
    setDialogImport(false);
    setImportResultado(null);
    setImportError(null);
  }, []);

  return {
    dialogImport,
    setDialogImport,
    importLoading,
    importResultado,
    importError,
    handleArchivoExcel,
    handleDescargarTemplate,
    handleCloseImportDialog,
  };
}
