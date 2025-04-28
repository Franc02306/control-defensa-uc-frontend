const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#f5f5f5",
        padding: "1rem",
        textAlign: "center",
        marginTop: "auto",
      }}
    >
      © {new Date().getFullYear()} Universidad de Camagüey - Todos los derechos
      reservados
    </footer>
  );
};

export default Footer;
