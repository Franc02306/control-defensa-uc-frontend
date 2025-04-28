import { useState, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";

const SidebarMenu = () => {
  const [visible, setVisible] = useState(true); // Mostrar por defecto
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setVisible(false);
        setIsMobile(true);
      } else {
        setVisible(true);
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Ejecutar al cargar

    return () => window.removeEventListener("resize", handleResize);
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
        window.location.href = "/profile";
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

  return (
    <>
      {/* Botón para abrir/cerrar */}
      <Button
        icon="pi pi-bars"
        onClick={() => setVisible(!visible)}
        className="p-button-text p-button-plain"
        style={{
          position: "fixed",
          top: "1rem",
          left: isMobile ? "1rem" : "16rem",
          zIndex: "1001",
        }}
      />

      {/* Sidebar */}
      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        modal={isMobile} // Solo bloquea la pantalla en móviles
        showCloseIcon={false}
        style={{ width: isMobile ? "16rem" : "16rem" }}
        dismissable={isMobile}
      >
        <h2>Menú</h2>
        <Menu model={items} />
      </Sidebar>
    </>
  );
};

export default SidebarMenu;
