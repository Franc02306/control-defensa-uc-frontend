import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleSidebarToggle = (e) => setSidebarVisible(e.detail);
    const handleResize = () => setSidebarVisible(window.innerWidth > 768);

    window.addEventListener("sidebarToggle", handleSidebarToggle);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    window.dispatchEvent(new Event("cerrarSidebar"));

    Swal.fire({
      icon: "success",
      title: "Sesión cerrada",
      text: "Usted ha cerrado sesión. Será redirigido al login.",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
        logout();
        navigate("/login");
      }
    });
  };

  const headerStyle = {
    backgroundColor: "#004080",
    color: "white",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: sidebarVisible && window.innerWidth > 768 ? "16rem" : "1rem",
    transition: "padding-left 0.3s ease",
  };

  return (
    <header style={headerStyle}>
      {/* Botón menú hamburguesa */}
      <Button
        icon="pi pi-bars"
        className="p-button-rounded p-button-text"
        style={{
          color: "white",
          fontSize: "1.5rem",
          background: "transparent",
          marginRight: "1rem",
        }}
        onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
        aria-label="Abrir menú"
        tooltip="Abrir menú" // Si usas PrimeReact Tooltip
      />
      <h1 style={{ margin: 0 }}>Defensa UC</h1>
      <Button
        label="Cerrar Sesión"
        icon="pi pi-sign-out"
        className="p-button-rounded p-button-text"
        style={{
          backgroundColor: "white",
          color: "#004080",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "5px",
          fontWeight: "bold",
        }}
        onClick={handleLogout}
      />
    </header>
  );
};

export default Header;
