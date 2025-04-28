import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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
