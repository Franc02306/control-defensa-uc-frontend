import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/userService";
import "./RegisterForm.css";

const RegisterForm = () => {
  const toast = useRef(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    idRole: 2,
  });

  // Errores específicos de cada campo
  const [nameError, setNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e, field) => {
    let value = e.target.value;

    if (field === "firstName") {
      const invalidChars = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/;
      if (invalidChars.test(value)) {
        setNameError("El nombre solo debe contener letras.");
      } else {
        setNameError("");
      }
    }

    if (field === "lastName") {
      const invalidChars = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/;
      if (invalidChars.test(value)) {
        setLastNameError("El apellido solo debe contener letras.");
      } else {
        setLastNameError("");
      }
    }

    if (field === "username") {
      const invalidChars = /[^a-zA-Z0-9._]/;
      if (/\s/.test(value)) {
        setUsernameError("El nombre de usuario no puede contener espacios.");
      } else if (invalidChars.test(value)) {
        setUsernameError(
          "El nombre de usuario solo permite letras, números, puntos y guiones bajos."
        );
      } else if (value.length > 20) {
        setUsernameError("El nombre de usuario no debe exceder 20 caracteres.");
      } else {
        setUsernameError("");
      }
    }

    setFormData({ ...formData, [field]: value });
  };

  const passwordRules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      await registerUser({ ...formData, status: false });

      navigate("/register-de-usuario-completado");
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "No se pudo registrar el usuario.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { firstName, lastName, username, email, password } = formData;

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!firstName || !lastName || !username || !email || !password) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Por favor completa todos los campos.",
        life: 4000,
      });
      return false;
    }

    if (!nameRegex.test(firstName)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Nombres solo deben contener letras.",
        life: 4000,
      });
      return false;
    }

    if (!nameRegex.test(lastName)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Apellidos solo deben contener letras.",
        life: 4000,
      });
      return false;
    }

    if (!usernameRegex.test(username)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail:
          "El Nombre de Usuario solo permite letras, números, puntos y guiones bajos.",
        life: 4000,
      });
      return false;
    }

    if (!emailRegex.test(email)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "El correo electrónico no es válido.",
        life: 4000,
      });
      return false;
    }

    if (!passwordRegex.test(password)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail:
          "La contraseña no es fuerte, tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.",
        life: 4000,
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Las contraseñas no coinciden.",
        life: 4000,
      });
      return false;
    }

    return true;
  };

  return (
    <div className="register-container">
      <Toast ref={toast} />

      <Card title="Crear una cuenta" className="auth-card">
        <form
          className="p-fluid"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="field">
            <label htmlFor="firstName">Nombres</label>
            <InputText
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange(e, "firstName")}
              maxLength={100}
              disabled={loading}
            />
            {formData.firstName.length >= 100 && (
              <small className="p-error">
                Máximo 100 carácteres permitidos
              </small>
            )}
            {nameError && <small className="p-error">{nameError}</small>}
          </div>

          <div className="field">
            <label htmlFor="lastName">Apellidos</label>
            <InputText
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange(e, "lastName")}
              maxLength={100}
              disabled={loading}
            />
            {formData.lastName.length >= 100 && (
              <small className="p-error">
                Máximo 100 carácteres permitidos
              </small>
            )}
            {lastNameError && (
              <small className="p-error">{lastNameError}</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="username">Nombre de usuario</label>
            <InputText
              id="username"
              value={formData.username}
              onChange={(e) => handleChange(e, "username")}
              maxLength={50}
              disabled={loading}
            />
            {formData.username.length >= 50 && (
              <small className="p-error">
                Máximo 50 caracteres permitidos.
              </small>
            )}
            {usernameError && (
              <small className="p-error">{usernameError}</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <InputText
              id="email"
              value={formData.email}
              onChange={(e) => handleChange(e, "email")}
              maxLength={100}
              disabled={loading}
            />
            {formData.email.length >= 100 && (
              <small className="p-error">
                Máximo 100 caracteres permitidos.
              </small>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <Password
              id="password"
              value={formData.password}
              onChange={(e) => handleChange(e, "password")}
              toggleMask
              feedback={false}
              maxLength={100}
              onPaste={(e) => {
                e.preventDefault();
                toast.current.show({
                  severity: "info",
                  summary: "Información",
                  detail: "Por seguridad, no se permite pegar en este campo.",
                  life: 3000,
                });
              }}
              disabled={loading}
            />

            {formData.password.length >= 100 && (
              <small className="p-error">
                Máximo 100 caracteres permitidos.
              </small>
            )}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <Password
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleChange(e, "confirmPassword")}
              toggleMask
              feedback={false}
              maxLength={100}
              onPaste={(e) => {
                e.preventDefault();
                toast.current.show({
                  severity: "info",
                  summary: "Información",
                  detail: "Por seguridad, no se permite pegar en este campo.",
                  life: 3000,
                });
              }}
              disabled={loading}
            />
            {formData.confirmPassword.length >= 100 && (
              <small className="p-error">
                Máximo 100 caracteres permitidos.
              </small>
            )}

            {/* Validadores de contraseña en tiempo real */}
            <div className="password-rules">
              <div className={passwordRules.length ? "valid" : "invalid"}>
                <i
                  className={`pi ${
                    passwordRules.length ? "pi-check" : "pi-times"
                  }`}
                ></i>
                <span> Al menos 8 caracteres</span>
              </div>
              <div className={passwordRules.upper ? "valid" : "invalid"}>
                <i
                  className={`pi ${
                    passwordRules.upper ? "pi-check" : "pi-times"
                  }`}
                ></i>
                <span> Una letra mayúscula</span>
              </div>
              <div className={passwordRules.lower ? "valid" : "invalid"}>
                <i
                  className={`pi ${
                    passwordRules.lower ? "pi-check" : "pi-times"
                  }`}
                ></i>
                <span> Una letra minúscula</span>
              </div>
              <div className={passwordRules.number ? "valid" : "invalid"}>
                <i
                  className={`pi ${
                    passwordRules.number ? "pi-check" : "pi-times"
                  }`}
                ></i>
                <span> Un número</span>
              </div>
              <div className={passwordRules.symbol ? "valid" : "invalid"}>
                <i
                  className={`pi ${
                    passwordRules.symbol ? "pi-check" : "pi-times"
                  }`}
                ></i>
                <span> Un símbolo</span>
              </div>
              <div
                className={
                  formData.confirmPassword &&
                  formData.password === formData.confirmPassword
                    ? "valid"
                    : "invalid"
                }
              >
                <i
                  className={`pi ${
                    formData.confirmPassword &&
                    formData.password === formData.confirmPassword
                      ? "pi-check"
                      : "pi-times"
                  }`}
                ></i>
                <span> Las contraseñas deben coincidir</span>
              </div>
            </div>
          </div>

          <Button
            label="Registrarse"
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
            type="submit"
            className="p-mt-3"
            disabled={loading}
          />

          <div
            className="register-link"
            style={{ marginTop: "1rem", textAlign: "center" }}
          >
            ¿Ya tienes una cuenta? Puedes iniciar sesión{" "}
            <a href="/login">aquí</a>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;
