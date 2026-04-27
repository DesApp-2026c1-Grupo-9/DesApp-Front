import { Route, Routes } from "react-router-dom";
import { StudentProfilePage } from "./pages/StudentProfilePage";
import { CareerManagementPage } from "./pages/CareerManagementPage";
import { SubjectManagementPage } from "./pages/SubjectManagementPage";
import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";

export function AppRouter() {
  return (
    <Routes>
      {/* Páginas del Sistema Académico */}
      <Route path='/perfil' element={<StudentProfilePage />} />
      <Route path='/carreras' element={<CareerManagementPage />} />
      <Route path='/materias' element={<SubjectManagementPage />} />
      
      <Route path='/' element={
        <Box sx={{ typography: 'h5', color: grey[900], textAlign: 'center', mt: 4 }}>
          <Box sx={{ typography: 'h4', mb: 2 }}>Sistema de Acompañamiento Estudiantil</Box>
          <Box>Bienvenido al sistema académico. Elija una opción del menú superior.</Box>
        </Box>
      } />
    </Routes>
  );
}