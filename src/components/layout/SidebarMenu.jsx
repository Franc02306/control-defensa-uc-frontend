import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const menuItems = [
  { label: "Inicio", icon: "pi pi-home", path: "/home" },
  { label: "Estudiantes", icon: "pi pi-users", path: "/estudiantes" },
  { label: "Profesores", icon: "pi pi-briefcase", path: "/profesores" },
];

const SidebarMenu = ({ open, onClose }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!token) return null;

  return (
    <aside
      className={`sidebar${open ? " open" : ""}`}
      style={{
        zIndex: 1000,
      }}
    >
      <h2 className="sidebar-title">Menú</h2>
      <ul className="sidebar-list">
        {menuItems.map((item, idx) => (
          <li
            key={idx}
            className={location.pathname === item.path ? "active" : ""}
          >
            <button
              className="sidebar-link"
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                fontSize: "1.05rem",
                color: "#343a40",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <i className={item.icon} />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SidebarMenu;
