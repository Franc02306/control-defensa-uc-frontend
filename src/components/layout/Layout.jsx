import Header from "./Header";
import Footer from "./Footer";
import SidebarMenu from "./SidebarMenu";

const Layout = ({ children }) => {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />
      <SidebarMenu />
      <main style={{ flex: "1", marginLeft: "16rem", padding: "1rem" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
