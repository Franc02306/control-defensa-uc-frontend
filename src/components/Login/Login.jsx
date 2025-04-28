import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const response = await login({ username, password });

      console.log("exito: ", response);

      const token = response.data.data.token;

      // Guardar el token en el localStorage
      localStorage.setItem('token', token);

      navigate('/home');

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert(error.response?.data?.message || "Error al iniciar sesión.");
    }
  };

  return (
    <div className="login-container">
      <Card title="Iniciar Sesión" className="login-card">
        <div className="p-fluid">
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
            onClick={handleLogin}
            className="p-mt-3"
          />

          <div className="register-link">
            ¿Eres nuevo? <a href="#">Regístrate aquí</a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
