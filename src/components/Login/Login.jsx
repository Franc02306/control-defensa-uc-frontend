import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login: loginContext } = useAuth();
  const navigate = useNavigate();
  const toast = useRef(null);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!username || !password) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Por favor completa todos los campos.",
        life: 3000,
      });
      return;
    }

    try {
      const response = await login({ username, password });
      const token = response.data.data.token;

      // Guardar el token en el localStorage
      loginContext(token);

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Inicio de sesión exitoso.",
        life: 2000,
      });

      setTimeout(() => navigate("/home"), 1500);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Error al iniciar sesión.",
        life: 4000,
      });
    }
  };

  return (
    <div className="login-container">
      <Toast ref={toast} />
      <Card title="Iniciar Sesión" className="login-card">
        <form className="p-fluid" onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
            />
          </div>

          <Button
            label="Ingresar"
            icon="pi pi-sign-in"
            type="submit"
            className="p-mt-3"
          />

          <div className="register-link">
            ¿Eres nuevo? <a href="/registro-de-usuario">Regístrate aquí</a>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
