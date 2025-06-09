const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#f5f5f5",
        padding: "0.5rem",
        textAlign: "center",
        marginTop: "auto",
        height: "40px",
        fontSize: "0.95rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      © {new Date().getFullYear()} Universidad de Camagüey - Todos los derechos
      reservados
    </footer>
  );
};

export default Footer;
