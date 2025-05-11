import { useState, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { Menu } from "primereact/menu";
import { useAuth } from "../../context/AuthContext";

const SidebarMenu = () => {
  const { token } = useAuth();
  const [visible, setVisible] = useState(false); // Mostrar por defecto
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleAbrirSidebar = () => {
      setVisible((prev) => {
        const newState = !prev;
        window.dispatchEvent(
          new CustomEvent("sidebarToggle", { detail: newState })
        );
        return newState;
      });
    };

    const handleCerrarSidebar = () => {
      setVisible(false);
      window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: false }));
    };

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    window.addEventListener("toggleSidebar", handleAbrirSidebar);
    window.addEventListener("cerrarSidebar", handleCerrarSidebar);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("toggleSidebar", handleAbrirSidebar);
      window.removeEventListener("cerrarSidebar", handleCerrarSidebar);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setVisible(false);
      window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: false }));
    }
  }, [token]);

  useEffect(() => {
    // Emitimos el estado actual al montar (evita que Header asuma que está abierto al inicio)
    window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: visible }));
  }, []);

  const items = [
    {
      label: "Inicio",
      icon: "pi pi-home",
      command: () => {
        window.location.href = "/home";
      },
    },
    {
      label: "Estudiantes",
      icon: "pi pi-users",
      command: () => {
        window.location.href = "/estudiantes";
      },
    },
    {
      label: "Profesores",
      icon: "pi pi-briefcase",
      command: () => {
        window.location.href = "/settings";
      },
    },
  ];

  if (!token) return null;

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        visible={visible}
        onHide={() => {
          setVisible(false);
          window.dispatchEvent(
            new CustomEvent("sidebarToggle", { detail: false })
          );
        }}
        modal={isMobile}
        showCloseIcon={false}
        style={{ width: isMobile ? "16rem" : "16rem" }}
        dismissable={token && isMobile}
      >
        <h2>Menú</h2>
        <Menu model={items} />
      </Sidebar>
    </>
  );
};

export default SidebarMenu;
