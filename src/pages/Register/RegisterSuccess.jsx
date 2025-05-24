import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "./RegisterSuccess.css";

const RegisterSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="register-success-container">
      <Card className="success-card">
        <div className="icon-container">
          <i className="pi pi-check-circle icon-success" />
        </div>
        <h2 className="success-title">¡Usuario creado correctamente!</h2>
        <p>
          <strong>Tu usuario fue registrado con éxito.</strong> Enviamos un
          correo a los administradores para que verifiquen y validen tu cuenta.
        </p>
        <p>
          Recibirás una notificación cuando tu cuenta sea{" "}
          <strong>activada.</strong>
        </p>
        <Button
          label="Ir a Iniciar Sesión"
          icon="pi pi-sign-in"
          onClick={() => navigate("/login")}
          className=""
        />
      </Card>
    </div>
  );
};

export default RegisterSuccess;
