import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ApprovalResult from "../pages/Approval/ApprovalResult";
import Login from "../components/Login/Login";
import RegisterForm from "../pages/Register/RegisterForm";
import RegisterSuccess from "../pages/Register/RegisterSuccess";
import Home from "../pages/Home/Home";
import StudentList from "../pages/Student/StudentList";
import StudentForm from "../pages/Student/StudentForm";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

const AppRouter = () => {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/registro-de-usuario" element={<RegisterForm />} />
            <Route path="/register-de-usuario-completado" element={<RegisterSuccess />} />
            <Route path="/aprobacion-resultado" element={<ApprovalResult />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/estudiantes" element={<StudentList />} />
            <Route path="/estudiantes/crear" element={<StudentForm />} />
            <Route path="/estudiantes/editar/:id" element={<StudentForm />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
