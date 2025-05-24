import React, { useEffect, useState, useRef } from "react";
import { approveUser, rejectUser } from "../../services/userService";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import "./ApprovalResult.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ApprovalResult = () => {
  const query = useQuery();
  const action = query.get("type"); // aprobar | rechazar
  const email = query.get("email");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({ success: null, message: "" });
  const toast = useRef(null);
  const navigate = useNavigate();

  const effectCalled = useRef(false);

  useEffect(() => {
    if (effectCalled.current) return; // <-- Evita la segunda ejecución
    effectCalled.current = true;

    const processAction = async () => {
      if (!action || !email) {
        setResult({
          success: false,
          message: "Solicitud inválida. Parámetros faltantes.",
        });
        setLoading(false);
        return;
      }

      try {
        let response;
        if (action === "approve") {
          response = await approveUser(email);
        } else if (action === "reject") {
          response = await rejectUser(email);
        } else {
          setResult({
            success: false,
            message: "Acción no válida.",
          });
          setLoading(false);
          return;
        }

        setResult({
          success: response.data.success,
          message:
            response.data.message ||
            (action === "approve"
              ? "Usuario aprobado con éxito."
              : "Usuario rechazado correctamente."),
        });

        if (!response.data.success) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: response.data.message,
            life: 4000,
          });
        }
      } catch (error) {
        setResult({
          success: false,
          message:
            error.response?.data?.message ||
            "Ocurrió un error inesperado, por favor intente más tarde.",
        });
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message ||
            "Ocurrió un error inesperado, por favor intente más tarde.",
          life: 4000,
        });
      }
      setLoading(false);
    };

    processAction();
  }, [action, email]);

  const title =
    action === "approve"
      ? "Aprobación de Usuario"
      : action === "reject"
      ? "Rechazo de Usuario"
      : "Resultado";

  const iconClass =
    result.success === null
      ? ""
      : result.success
      ? "pi pi-check-circle approval-success approval-icon"
      : "pi pi-times-circle approval-error approval-icon";

  // Color para título y mensaje
  const titleClass =
    result.success === null
      ? "approval-title"
      : result.success
      ? "approval-title approval-success-title"
      : "approval-title";
  const messageClass =
    result.success === null
      ? "approval-message"
      : result.success
      ? "approval-message approval-success-message"
      : "approval-message";

  return (
    <div className="approval-container">
      <Toast ref={toast} />
      <Card className="approval-card">
        <div style={{ marginBottom: 20 }}>
          {result.success === null ? (
            <ProgressSpinner />
          ) : (
            <i className={iconClass} />
          )}
          <h2 className={titleClass}>{title}</h2>
        </div>
        {loading ? (
          <div style={{ margin: "2rem 0" }}>
            <div style={{ marginTop: 12, color: "#888" }}>
              Procesando solicitud...
            </div>
          </div>
        ) : (
          <>
            <div className={messageClass} style={{ fontWeight: "500" }}>
              {result.message}
            </div>
            {result.success &&
              (action === "approve" || action === "reject") && (
                <Button
                  label="Ir al Sistema Web"
                  icon="pi pi-sign-in"
                  className="approval-btn"
                  onClick={() => navigate("/login")}
                />
              )}
            {!result.success && (
              <Button
                label="Ir al Sistema Web"
                icon="pi pi-home"
                className="approval-btn"
                onClick={() => navigate("/")}
              />
            )}
          </>
        )}
      </Card>
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </div>
  );
};

export default ApprovalResult;
