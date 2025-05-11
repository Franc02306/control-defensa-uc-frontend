import Header from "./Header";
import Footer from "./Footer";
import SidebarMenu from "./SidebarMenu";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />
      <SidebarMenu />
      <main style={{ flex: "1", padding: "1rem" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
