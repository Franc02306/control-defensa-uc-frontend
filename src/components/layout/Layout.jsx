import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SidebarMenu from "./SidebarMenu";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const toggleHandler = () => setSidebarOpen((prev) => !prev);
    const closeHandler = () => setSidebarOpen(false);

    window.addEventListener("toggleSidebar", toggleHandler);
    window.addEventListener("cerrarSidebar", closeHandler);

    return () => {
      window.removeEventListener("toggleSidebar", toggleHandler);
      window.removeEventListener("cerrarSidebar", closeHandler);
    };
  }, []);

  return (
    <div className="app-container">
      <Header />
      <div className="body-container">
        <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
