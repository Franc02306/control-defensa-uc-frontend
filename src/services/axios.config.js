// axios.config.js
import axios from "axios";
import Swal from "sweetalert2";

// Configuración de Axios
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de solicitud para agregar el token
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para manejar expiración del token
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Verifica si es un error de autenticación (401)
    if (
      error.response &&
      error.response.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Su sesión ha expirado. Será redirigido al login.",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          sessionStorage.removeItem("token");
          window.location.href = "/login";
        }
      });
    }
    return Promise.reject(error);
  }
);

export default API;
