import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

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
      showConfirmButton: false,
      allowOutsideClick: false,
      willClose: () => {
        logout();
        navigate("/login");
      },
    });
  };

  return (
    <header
      style={{
        backgroundColor: "#004080",
        color: "white",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1>Defensa UC</h1>
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "white",
          color: "#004080",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "5px",
        }}
      >
        Cerrar Sesión
      </button>
    </header>
  );
};

export default Header;
