import React, { useEffect, useState, useRef } from "react";
import {
  searchStudents,
  suggestStudents,
  deleteStudent,
  getAverageAge,
} from "../../services/studentService";
import { getProvinces } from "../../services/locationService";
import { AutoComplete } from "primereact/autocomplete";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useLoading } from "../../context/LoadingContext";
import StudentDetail from "../Student/StudentDetail";
import * as XLSX from "xlsx";
import "./StudentList.css";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [suggestionsName, setSuggestionsName] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchYear, setSearchYear] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [searchProvince, setSearchProvince] = useState(null);

  // Estados para ver el modal
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Calcular el promedio de edad de estudiantes
  const [calculatingAvg, setCalculatingAvg] = useState(false);

  const toast = useRef(null);
  const navigate = useNavigate();

  const { showLoading, hideLoading } = useLoading();

  const yearOptions = [
    { label: "Año 1", value: 1 },
    { label: "Año 2", value: 2 },
    { label: "Año 3", value: 3 },
    { label: "Año 4", value: 4 },
    { label: "Año 5", value: 5 },
    { label: "Año 6", value: 6 },
  ];

  const searchStudentSuggestions = async (event) => {
    if (!event.query) {
      setSuggestionsName([]);
      return;
    }

    try {
      const response = await suggestStudents(event.query);
      setSuggestionsName(
        response.data.result.map((s) => ({
          label: `${s.firstName} ${s.lastName}`,
          value: `${s.firstName} ${s.lastName}`, // el value también es string
          obj: s, // guardamos el objeto si quieres después usarlo
        }))
      );
    } catch {
      setSuggestionsName([]);
    }
  };

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
    fetchStudents(searchName.label, searchYear, searchProvince);
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
          onClick={() => {
            setSelectedStudent(row);
            setShowDetail(true);
          }}
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

  const handleExportExcel = () => {
    if (!students || students.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Sin datos",
        detail: "No hay estudiantes para exportar.",
        life: 3000,
      });
      return;
    }

    const exportData = students.map((student) => ({
      "Nombre Completo": `${student.firstName} ${student.lastName}`,
      "Género": student.gender === "M" ? "Masculino" : "Femenino",
      "Fecha de Nacimiento": formatDate(student.birthDate),
      "Edad": student.age,
      "Carrera": student.major,
      "Año": student.year,
      "Promedio Docente": student.teacherAverage,
      "Provincia": student.address?.province ?? "",
      "Municipio": student.address?.municipality ?? "",
      "Dirección Principal": `${student.address?.street ?? ""} ${student.address?.number ?? ""}`.trim(),
    }));

    // Crea hoja y libro de Excel
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estudiantes");

    // Exporta archivo
    XLSX.writeFile(wb, "Estudiantes.xlsx");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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
            label="Agregar"
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
          <Button
            label="Exportar Excel"
            icon="pi pi-file-excel"
            className="p-button-success"
            style={{
              borderRadius: "8px",
              height: "40px",
              padding: "0.5rem 1rem",
              backgroundColor: "#188038",
              borderColor: "#188038"
            }}
            onClick={handleExportExcel}
          />
        </div>
      </div>

      <div
        className="student-filters-row"
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          width: "100%", // <<--- clave para forzar todo el ancho
          justifyContent: "flex-start", // <<--- clave para alinear a la izquierda
        }}
      >
        <AutoComplete
          value={searchName}
          suggestions={suggestionsName}
          completeMethod={searchStudentSuggestions}
          onChange={(e) => {
            // Siempre guarda un string, sea por tipeo o selección
            setSearchName(e.value);
          }}
          field="label"
          placeholder="Buscar Estudiante..."
          style={{
            borderRadius: "8px",
            height: "40px",
            minWidth: "280px",
            maxWidth: "280px",
            width: "100%",
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
          label="Limpiar filtros"
          icon="pi pi-eraser"
          className="p-button-secondary"
          onClick={handleClearFilters}
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #ddd",
        }}
        className="p-datatable-sm p-datatable-gridlines p-datatable-striped"
        emptyMessage={
          <div style={{ textAlign: "center" }}>
            No se encontraron estudiantes.
          </div>
        }
      >
        <Column
          header="#"
          headerStyle={{ width: "3rem", textAlign: "center" }}
          body={(data, options) => options.rowIndex + 1}
          style={{ textAlign: "center" }}
        />
        <Column field="firstName" header="Nombres" />
        <Column field="lastName" header="Apellidos" />
        <Column body={genderTemplate} header="Género" />
        <Column field="age" header="Edad" />
        <Column field="major" header="Carrera" />
        <Column field="year" header="Año" />
        <Column body={addressTemplate} header="Provincia" />
        <Column body={actionsTemplate} header="Acciones" />
      </DataTable>

      <StudentDetail
        visible={showDetail}
        onHide={() => setShowDetail(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default StudentList;
