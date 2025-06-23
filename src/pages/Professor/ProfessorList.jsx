import React, { useEffect, useState, useRef } from "react";
import {
  searchProfessors,
  getAverageAgeProfessors,
  getOldestProfessorAddress,
  deleteProfessor,
} from "../../services/professorService";
import {
  getProvinces,
  getMunicipalitiesByProvince,
} from "../../services/locationService";
import { getAreas, getAcademicRanks } from "../../services/complementService";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useLoading } from "../../context/LoadingContext";
import ProfessorDetail from "../Professor/ProfessorDetail";

const FILTERS = [
  {
    key: "a",
    label: "Promedio de Edad",
  },
  {
    key: "b",
    label: "Dirección del profesor más viejo",
  },
  {
    key: "c",
    label: "Categoría docente y viaje al extranjero",
  },
];

const ProfessorList = () => {
  const [professors, setProfessors] = useState([]);
  const [searchProvince, setSearchProvince] = useState(null);
  const [searchMunicipality, setSearchMunicipality] = useState(null);
  const [searchWentAbroad, setSearchWentAbroad] = useState(null);
  const [searchAcademicRank, setSearchAcademicRank] = useState(null);
  const [searchArea, setSearchArea] = useState(null);

  // Almaceno provincias y municipios
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);

  // Almaceno areas y categoria docente
  const [academicRankOptions, setAcademicRankOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);

  // Estados para ver el modal
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  const toast = useRef(null);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [selectedFilter, setSelectedFilter] = useState("c");

  useEffect(() => {
    setSearchProvince(null);
    setSearchMunicipality(null);
    setSearchWentAbroad(null);
    setSearchAcademicRank(null);
    setSearchArea(null);
    setProfessors([]);
  }, [selectedFilter]);

  const fetchProfessors = async ({
    province,
    municipality,
    wentAbroad,
    academicRank,
  }) => {
    showLoading();
    try {
      const response = await searchProfessors(
        province,
        municipality,
        wentAbroad,
        academicRank
      );

      setProfessors(response.data.result);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "Error al cargar los Profesores.",
        life: 4000,
      });
    } finally {
      hideLoading();
    }
  };

  const handleSearchA = async () => {
    if (!searchArea || !searchProvince || searchWentAbroad == null) {
      Swal.fire({
        icon: "warning",
        title: "Parámetros Faltantes",
        text: "Seleccione área, provincia y si salió al extranjero.",
      });
      return;
    }
    showLoading();
    try {
      // Aquí usas tu función para obtener el promedio de edad, según filtros.
      const response = await getAverageAgeProfessors(
        searchArea,
        searchProvince,
        searchWentAbroad
      );
      const avg = response.data.result;
      Swal.fire({
        icon: "info",
        title: "Promedio de Edad",
        html: `Promedio de edad de <b>${searchArea}</b> en la provincia <b>${searchProvince}</b> y ${
          searchWentAbroad
            ? "que <b>SÍ</b> salieron al extranjero"
            : "que <b>NO</b> salieron al extranjero"
        }<br/>Promedio: <b>${avg}</b>`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo calcular el promedio de edad.",
      });
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchProfessors({
      province: "",
      municipality: "",
      wentAbroad: null,
      academicRank: "",
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    (async () => {
      showLoading();
      try {
        const response = await getProvinces();
        setProvinces(
          response.data.map((p) => ({
            label: p.name,
            value: p.name,
          }))
        );
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
    })();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (!searchProvince) {
        setMunicipalities([]);
        setSearchMunicipality(null);
        return;
      }
      showLoading();
      try {
        const response = await getMunicipalitiesByProvince(searchProvince);
        setMunicipalities(
          response.data.map((m) => ({
            label: m.name,
            value: m.name,
          }))
        );
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message || "Error al cargar los Municipios.",
          life: 4000,
        });
      } finally {
        hideLoading();
      }
    };
    fetchMunicipalities();
    // eslint-disable-next-line
  }, [searchProvince]);

  useEffect(() => {
    (async () => {
      showLoading();
      try {
        const response = await getAcademicRanks();
        setAcademicRankOptions(
          response.data.result.map((rank) => ({
            label: rank.name,
            value: rank.name,
          }))
        );
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message ||
            "No se pudo cargar categorías docentes.",
          life: 4000,
        });
      } finally {
        hideLoading();
      }
    })();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    (async () => {
      showLoading();
      try {
        const response = await getAreas();
        setAreaOptions(
          response.data.result.map((area) => ({
            label: area.name,
            value: area.name,
          }))
        );
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: error.response?.data?.message || "No se pudo cargar áreas.",
          life: 4000,
        });
      } finally {
        hideLoading();
      }
    })();
    // eslint-disable-next-line
  }, []);

  const handleSearch = () => {
    fetchProfessors({
      province: searchProvince,
      municipality: searchMunicipality,
      wentAbroad: searchWentAbroad,
      academicRank: searchAcademicRank,
    });
  };

  const handleDeleteProfessor = async (professorId) => {
    const result = await Swal.fire({
      title: "¿Seguro que quieres eliminar este profesor?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteProfessor(professorId);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Profesor eliminado correctamente.",
          life: 3000,
        });
        handleSearch();
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message || "Error al eliminar el profesor.",
          life: 4000,
        });
      }
    }
  };

  const genderTemplate = (row) =>
    row.gender === "M"
      ? "Masculino"
      : row.gender === "F"
      ? "Femenino"
      : row.gender;

  const wentAbroadTemplate = (row) =>
    row.wentAbroad ? (
      <i
        className="pi pi-check-circle"
        style={{ color: "#16a34a", fontSize: 22, fontWeight: "bold" }}
      />
    ) : (
      <i
        className="pi pi-times-circle"
        style={{ color: "#ef4444", fontSize: 22, fontWeight: "bold" }}
      />
    );

  const provinceTemplate = (row) =>
    row.address ? `${row.address.province}` : "-";

  const municipalityTemplate = (row) =>
    row.address ? `${row.address.municipality}` : "-";

  const actionsTemplate = (row) => (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
      <Button
        icon="pi pi-eye"
        className="p-button-text p-button-plain p-button-sm"
        tooltip="Ver Detalles"
        onClick={() => {
          setSelectedProfessor(row);
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
        onClick={() => navigate(`/profesores/editar/${row.id}`)}
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
        onClick={() => handleDeleteProfessor(row.id)}
        style={{
          padding: "0.25rem",
          fontSize: "1rem",
          color: "#dc3545",
        }}
      />
    </div>
  );

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
        <h2 style={{ marginBottom: "0" }}>Lista de Profesores</h2>
        <Button
          label="Agregar Profesor"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => navigate("/profesores/crear")}
          style={{
            borderRadius: "8px",
            height: "40px",
            padding: "0.5rem 1rem",
          }}
        />
      </div>

      {/* FILTROS ORDENADOS EN UNA SOLA FILA */}
      <div
        style={{
          marginBottom: "1.5rem",
          background: "#fff",
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", marginBottom: "0.7rem" }}>
          {FILTERS.map((f) => (
            <div key={f.key} style={{ display: "flex", alignItems: "center" }}>
              <RadioButton
                inputId={`filter-${f.key}`}
                name="filter"
                value={f.key}
                onChange={() => setSelectedFilter(f.key)}
                checked={selectedFilter === f.key}
              />
              <label
                htmlFor={`filter-${f.key}`}
                style={{
                  marginLeft: "0.5rem",
                  cursor: "pointer",
                  fontWeight: selectedFilter === f.key ? 700 : 400,
                }}
              >
                {f.label}
              </label>
            </div>
          ))}
        </div>
        {/* Descripción */}
        <div style={{ marginBottom: "1rem", color: "#888", fontSize: 13 }}>
          {FILTERS.find((f) => f.key === selectedFilter)?.description}
        </div>

        {/* Render dinámico de campos según filtro */}
        {selectedFilter === "a" && (
          <div style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
            <Dropdown
              value={searchArea}
              options={areaOptions}
              onChange={(e) => setSearchArea(e.value)}
              placeholder="Área"
              style={{ borderRadius: 8, height: 40, width: 220 }}
            />
            <Dropdown
              value={searchProvince}
              options={provinces}
              onChange={(e) => setSearchProvince(e.value)}
              placeholder="Provincia"
              style={{ borderRadius: 8, height: 40, width: 180 }}
            />
            <span>¿Salió al extranjero?</span>
            <InputSwitch
              checked={searchWentAbroad === true}
              onChange={(e) =>
                setSearchWentAbroad(
                  e.value === false && searchWentAbroad !== null
                    ? null
                    : e.value
                )
              }
            />
            <Button
              label="Promedio de Edad"
              icon="pi pi-chart-line"
              onClick={handleSearchA}
              className="p-button-help"
              style={{ borderRadius: 8, height: 40, marginLeft: 6 }}
            />
          </div>
        )}

        {selectedFilter === "b" && (
          <div style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
            <Dropdown
              value={searchProvince}
              options={provinces}
              onChange={(e) => setSearchProvince(e.value)}
              placeholder="Provincia"
              style={{ borderRadius: 8, height: 40, width: 180 }}
            />
            <Dropdown
              value={searchMunicipality}
              options={municipalities}
              onChange={(e) => setSearchMunicipality(e.value)}
              placeholder="Municipio"
              style={{ borderRadius: 8, height: 40, width: 180 }}
              disabled={!searchProvince}
            />
            <Button
              label="Buscar Profesor más Viejo"
              icon="pi pi-user"
              // onClick={handleSearchE}
              className="p-button-warning"
              style={{ borderRadius: 8, height: 40, marginLeft: 6 }}
            />
          </div>
        )}

        {selectedFilter === "c" && (
          <div style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
            <Dropdown
              value={searchAcademicRank}
              options={academicRankOptions}
              onChange={(e) => setSearchAcademicRank(e.value)}
              placeholder="Categoría Docente"
              style={{ borderRadius: 8, height: 40, width: 220 }}
            />
            <span>¿Salió al extranjero?</span>
            <InputSwitch
              checked={searchWentAbroad === true}
              onChange={(e) =>
                setSearchWentAbroad(
                  e.value === false && searchWentAbroad !== null
                    ? null
                    : e.value
                )
              }
            />
            <Button
              label="Listar Profesores"
              icon="pi pi-search"
              // onClick={handleSearchF}
              className="p-button-primary"
              style={{ borderRadius: 8, height: 40, marginLeft: 6 }}
            />
          </div>
        )}
      </div>

      {/* TABLA */}
      <DataTable
        value={professors}
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
            No se encontraron profesores.
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
        <Column field="area" header="Departamento" />
        <Column body={wentAbroadTemplate} header="Viaje Ext." />
        <Column field="academicRank" header="Categoría Docente" />
        <Column body={provinceTemplate} header="Provincia" />
        <Column body={municipalityTemplate} header="Municipio" />
        <Column body={actionsTemplate} header="Acciones" />
      </DataTable>

      <ProfessorDetail
        visible={showDetail}
        onHide={() => setShowDetail(false)}
        professor={selectedProfessor}
      />
    </div>
  );
};

export default ProfessorList;
