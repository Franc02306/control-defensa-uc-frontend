import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { Button } from "primereact/button";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    backgroundColor: "#0061c9",
    color: "white",
    height: "70px",
    display: "grid",
    gridTemplateColumns: "60px 1fr 180px",
    alignItems: "center",
    padding: "0 1.5rem",
    position: "relative",
  };

  return (
    <header style={headerStyle}>
      {/* Col 1: Menú Hamburguesa */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          icon="pi pi-bars"
          className="p-button-rounded p-button-text"
          style={{
            color: "white",
            fontSize: "1.5rem",
            background: "transparent",
            marginRight: "1rem",
            display: window.innerWidth <= 768 ? "inline-flex" : "none",
          }}
          onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
          aria-label="Abrir menú"
          tooltip="Abrir menú"
        />
      </div>
      {/* Col 2: Título CENTRADO */}
      <h1
        style={{
          margin: 0,
          fontSize: "1.6rem",
          textAlign: "center",
          fontWeight: "bold",
          justifySelf: "center",
        }}
      >
        Defensa UC
      </h1>
      {/* Col 3: Botón Cerrar Sesión */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
            fontSize: "1rem",
          }}
          onClick={handleLogout}
        />
      </div>
    </header>
  );
};

export default Header;
