import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchComentarios as fetchComentariosThunk,
  addComentario,
  removeComentario,
  editComentario,
  likeComentario as likeComentarioThunk,
  unlikeComentario as unlikeComentarioThunk,
  clearNovedadComentarios,
} from '../features/feed/comentariosSlice';

export default function useComentarios(post, currentUserId) {
  const dispatch = useDispatch();

  const comentarios = useSelector((state) => state.comentarios.byNovedad[post.id] || []);
  const loadingComentarios = useSelector((state) => state.comentarios.loadingByNovedad[post.id] || false);

  const [showComentarios, setShowComentarios] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [comentarioMenuEl, setComentarioMenuEl] = useState(null);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
  const [editandoComentarioId, setEditandoComentarioId] = useState(null);
  const [editComentarioContent, setEditComentarioContent] = useState('');
  const [replyMenuEl, setReplyMenuEl] = useState(null);
  const [replySeleccionada, setReplySeleccionada] = useState(null);
  const [editandoReplyId, setEditandoReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(clearNovedadComentarios(post.id));
    setShowComentarios(false);
  }, [currentUserId, post.id, dispatch]);

  const comentariosCount = comentarios.length > 0
    ? comentarios.reduce((acc, c) => acc + 1 + (c.respuestas?.length || 0), 0)
    : post.comentariosCount ?? 0;

  const handleFetchComentarios = async () => {
    if (loadingComentarios) return;
    if (showComentarios) {
      setShowComentarios(false);
      return;
    }
    if (comentarios.length > 0) {
      setShowComentarios(true);
      return;
    }
    try {
      await dispatch(fetchComentariosThunk({ novedadId: post.id, estudianteId: currentUserId })).unwrap();
      setShowComentarios(true);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al cargar comentarios');
    }
  };

  const handleAddComentario = async () => {
    if (!nuevoComentario.trim()) return;
    try {
      await dispatch(addComentario({
        novedadId: post.id,
        contenido: nuevoComentario.trim(),
        estudianteId: currentUserId,
      })).unwrap();
      setNuevoComentario('');
      setVisibleCount((prev) => prev + 1);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al crear comentario');
    }
  };

  const handleEditComentario = async () => {
    try {
      await dispatch(editComentario({
        novedadId: post.id,
        comentarioId: editandoComentarioId,
        contenido: editComentarioContent.trim(),
        estudianteId: currentUserId,
      })).unwrap();
      setEditandoComentarioId(null);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al editar comentario');
    }
  };

  const handleEditReply = async () => {
    try {
      await dispatch(editComentario({
        novedadId: post.id,
        comentarioId: editandoReplyId,
        contenido: editReplyContent.trim(),
        estudianteId: currentUserId,
      })).unwrap();
      setEditandoReplyId(null);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al editar respuesta');
    }
  };

  const handleLikeComentario = (comentarioId, liked) => {
    if (liked) {
      dispatch(unlikeComentarioThunk({ novedadId: post.id, comentarioId, estudianteId: currentUserId }));
    } else {
      dispatch(likeComentarioThunk({ novedadId: post.id, comentarioId, estudianteId: currentUserId }));
    }
  };

  const handleReply = async (comentarioPadreId, contenido) => {
    if (!contenido.trim()) return;
    try {
      await dispatch(addComentario({
        novedadId: post.id,
        contenido,
        estudianteId: currentUserId,
        comentarioPadreId,
      })).unwrap();
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al responder');
    }
  };

  const handleDeleteComentario = async () => {
    try {
      await dispatch(removeComentario({
        novedadId: post.id,
        comentarioId: comentarioSeleccionado.id,
        estudianteId: currentUserId,
      })).unwrap();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al eliminar comentario');
    }
    setComentarioMenuEl(null);
  };

  const handleDeleteReply = async () => {
    try {
      await dispatch(removeComentario({
        novedadId: post.id,
        comentarioId: replySeleccionada.id,
        estudianteId: currentUserId,
      })).unwrap();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al eliminar respuesta');
    }
    setReplyMenuEl(null);
  };

  const handleClearError = () => setError(null);

  return {
    comentarios,
    loadingComentarios,
    showComentarios,
    setShowComentarios,
    visibleCount,
    setVisibleCount,
    nuevoComentario,
    setNuevoComentario,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    comentarioMenuEl,
    setComentarioMenuEl,
    comentarioSeleccionado,
    setComentarioSeleccionado,
    editandoComentarioId,
    setEditandoComentarioId,
    editComentarioContent,
    setEditComentarioContent,
    replyMenuEl,
    setReplyMenuEl,
    replySeleccionada,
    setReplySeleccionada,
    editandoReplyId,
    setEditandoReplyId,
    editReplyContent,
    setEditReplyContent,
    error,
    handleFetchComentarios,
    handleAddComentario,
    handleEditComentario,
    handleEditReply,
    handleLikeComentario,
    handleReply,
    handleDeleteComentario,
    handleDeleteReply,
    handleClearError,
    comentariosCount,
  };
}
