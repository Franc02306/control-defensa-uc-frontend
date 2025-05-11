import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login/Login";
import Register from "../pages/Register/Register";
import Home from "../pages/Home/Home";
import StudentList from "../pages/Student/StudentList";
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
            <Route path="/registro-de-usuario" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/estudiantes" element={<StudentList />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
