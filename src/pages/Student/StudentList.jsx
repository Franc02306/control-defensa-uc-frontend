import React, { useEffect, useState, useRef } from "react";
import {
  searchStudents,
  deleteStudent,
  getAverageAge,
} from "../../services/studentService";
import { getProvinces } from "../../services/locationService";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useLoading } from "../../context/LoadingContext";
import "./StudentList.css";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchYear, setSearchYear] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [searchProvince, setSearchProvince] = useState(null);

  // Calcular el promedio de edad de estudiantes
  const [calculatingAvg, setCalculatingAvg] = useState(false);

  const toast = useRef(null);
  const navigate = useNavigate();

  const { showLoading, hideLoading } = useLoading();

  const yearOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
    { label: "6", value: 6 },
  ];

  const handleAverageAge = async () => {
    if (!searchYear || !searchProvince) {
      Swal.fire({
        icon: "warning",
        title: "Parámetros Faltantes",
        text: "Escoja un año y provincia.",
      });
      return;
    }
    setCalculatingAvg(true);
    try {
      const response = await getAverageAge(searchYear, searchProvince);
      const avg = response.data.result;
      Swal.fire({
        icon: "info",
        title: "Información",
        html: `Se calculó el promedio de edades en la provincia: <b>${searchProvince}</b> <br/>Promedio: <b>${avg}</b>`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo obtener el promedio de edades.",
      });
    } finally {
      setCalculatingAvg(false);
    }
  };

  const fetchStudents = async (name, year, province) => {
    showLoading();
    try {
      const response = await searchStudents(name, year, province);
      setStudents(response.data.result);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "Error al cargar los Estudiantes.",
        life: 4000,
      });
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchStudents("", "", "");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      showLoading();
      try {
        const response = await getProvinces();
        const mapped = response.data.map((p) => ({
          label: p.name,
          value: p.name,
        }));
        setProvinces(mapped);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message || "Error al cargar las Provincias.",
          life: 4000,
        });
      } finally {
        hideLoading();
      }
    };

    fetchProvinces();
    // eslint-disable-next-line
  }, []);

  const handleSearch = () => {
    fetchStudents(searchName, searchYear, searchProvince);
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchYear(null);
    setSearchProvince(null);
    fetchStudents("", "", "");
  };

  const genderTemplate = (row) =>
    row.gender === "M" ? "Masculino" : "Femenino";

  const addressTemplate = (row) =>
    row.address ? `${row.address.province}` : "-";

  const actionsTemplate = (row) => {
    return (
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-plain p-button-sm"
          tooltip="Ver Detalles"
          onClick={() => navigate(`/students/details/${row.id}`)}
          style={{
            padding: "0.25rem",
            fontSize: "1rem",
            color: "#007bff",
          }}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-button-plain p-button-sm"
          tooltip="Editar"
          onClick={() => navigate(`/estudiantes/editar/${row.id}`)}
          style={{
            padding: "0.25rem",
            fontSize: "1rem",
            color: "#28a745",
          }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-plain p-button-sm"
          tooltip="Eliminar"
          onClick={() => handleDeleteStudent(row.id)}
          style={{
            padding: "0.25rem",
            fontSize: "1rem",
            color: "#dc3545",
          }}
        />
      </div>
    );
  };

  const handleDeleteStudent = async (studentId) => {
    const result = await Swal.fire({
      title: "¿Seguro que quieres eliminar este estudiante?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Rojo para "Sí, eliminar"
      cancelButtonColor: "#6c757d", // Gris para "Cancelar"
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteStudent(studentId);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Estudiante eliminado correctamente.",
          life: 3000,
        });
        fetchStudents(searchName, searchYear, searchProvince);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message || "Error al eliminar el estudiante.",
          life: 4000,
        });
      }
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "1rem",
        borderRadius: "12px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Toast ref={toast} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ marginBottom: "0" }}>Lista de Estudiantes</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            label="Agregar Estudiante"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => navigate("/estudiantes/crear")}
            style={{
              borderRadius: "8px",
              height: "40px",
              padding: "0.5rem 1rem",
            }}
          />
          <Button
            label="Promedio Edad"
            icon="pi pi-chart-line"
            className="p-button-help"
            onClick={handleAverageAge}
            disabled={!searchProvince || !searchYear || calculatingAvg}
            loading={calculatingAvg}
            style={{
              borderRadius: "8px",
              height: "40px",
              padding: "0.5rem 1rem",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <InputText
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="Buscar por Nombre..."
          style={{
            borderRadius: "8px",
            height: "40px",
            flex: "0.5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 1rem", // Espaciado interno para mejor visualización
          }}
        />
        <Dropdown
          value={searchYear}
          options={yearOptions}
          onChange={(e) => setSearchYear(e.value)}
          placeholder="Buscar por Año..."
          style={{
            borderRadius: "8px",
            height: "40px",
            flex: "0.5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 1rem", // Espaciado interno para mejor visualización
          }}
        />
        <Dropdown
          value={searchProvince}
          options={provinces}
          onChange={(e) => setSearchProvince(e.value)}
          placeholder="Buscar por Provincia..."
          style={{
            borderRadius: "8px",
            height: "40px",
            flex: "0.5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 1rem", // Espaciado interno para mejor visualización
          }}
        />
        <Button
          label="Buscar"
          icon="pi pi-search"
          onClick={handleSearch}
          className="p-button-primary"
          style={{
            borderRadius: "8px",
            height: "40px",
            padding: "0.5rem 1rem",
          }}
        />
        <Button
          icon="pi pi-eraser"
          className="p-button-secondary"
          onClick={handleClearFilters}
          tooltip="Limpiar filtros"
          tooltipOptions={{ position: "top" }}
          style={{
            borderRadius: "8px",
            height: "40px",
            padding: "0.5rem 1rem",
          }}
        />
      </div>

      <DataTable
        value={students}
        paginator
        rows={5}
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #ddd",
        }}
        className="p-datatable-sm p-datatable-gridlines p-datatable-striped"
        id="my-student-table"
        emptyMessage={
          <div style={{ textAlign: "center" }}>
            No se encontraron estudiantes.
          </div>
        }
      >
        <Column field="firstName" header="Nombres" />
        <Column field="lastName" header="Apellidos" />
        <Column header="Género" body={genderTemplate} />
        <Column field="major" header="Carrera" />
        <Column field="year" header="Año" />
        <Column header="Provincia" body={addressTemplate} />
        <Column header="Acciones" body={actionsTemplate} />
      </DataTable>
    </div>
  );
};

export default StudentList;
