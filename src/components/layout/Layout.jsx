import Header from "./Header";
import Footer from "./Footer";
import SidebarMenu from "./SidebarMenu";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="body-container">
        <SidebarMenu />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
