import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      alert("Por favor completa todos los campos.");
      return;
    }
    console.log("Iniciando sesión con:", username, password);
    // Aquí luego llamaremos a tu API de login
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
