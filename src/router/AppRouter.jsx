import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login/Login";
import Home from "../pages/Home/Home";

const AppRouter = () => {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Navigate to="/home" />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
