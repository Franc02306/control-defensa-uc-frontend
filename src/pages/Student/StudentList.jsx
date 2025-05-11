import React, { useEffect, useState, useRef } from "react";
import { searchStudents } from "../../services/studentService";
import { getProvinces } from "../../services/locationService";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/Toast";
import { Dropdown } from "primereact/dropdown";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchYear, setSearchYear] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [searchProvince, setSearchProvince] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const yearOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
    { label: "6", value: 6 },
  ];

  const fetchStudents = async (name, year, province) => {
    setLoading(true);
    try {
      const res = await searchStudents(name, year, province);
      setStudents(res.data.data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.res?.data?.message || "Error al cargar los Estudiantes.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents("", "", "");
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await getProvinces();
        const mapped = res.data.map((p) => ({
          label: p.name,
          value: p.name,
        }));
        setProvinces(mapped);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: error.res?.data?.message || "Error al cargar las Provincias.",
          life: 4000,
        });
      }
    };

    fetchProvinces();
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

  const genderTemplate = (row) => (row.gender === "M" ? "Male" : "Female");

  const addressTemplate = (row) =>
    row.address
      ? `${row.address.street} ${row.address.number}, ${row.address.municipality}, ${row.address.province}`
      : "-";

  return (
    <div className="card">
      <Toast ref={toast} />
      <h2>Lista de Estudiantes</h2>
      <div className="p-inputgroup" style={{ marginBottom: "1rem" }}>
        <InputText
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="Buscar por Nombre..."
        />
        <Dropdown
          value={searchYear}
          options={yearOptions}
          onChange={(e) => setSearchYear(e.value)}
          placeholder="Buscar por Año..."
        />
        <Dropdown
          value={searchProvince}
          options={provinces}
          onChange={(e) => setSearchProvince(e.value)}
          placeholder="Buscar por Provincia..."
        />
        <Button label="Search" icon="pi pi-search" onClick={handleSearch} />
        <Button
          label="Limpiar filtros"
          icon="pi pi-times"
          className="p-button-secondary"
          onClick={handleClearFilters}
        />
      </div>

      <DataTable value={students} loading={loading} paginator rows={10}>
        <Column field="firstName" header="First Name" />
        <Column field="lastName" header="Last Name" />
        <Column header="Gender" body={genderTemplate} />
        {/* <Column header="Birth Date" body={birthDateTemplate} /> */}
        <Column field="major" header="Major" />
        <Column field="year" header="Year" />
        {/* <Column header="Average" body={averageTemplate} /> */}
        <Column header="Address" body={addressTemplate} />
      </DataTable>
    </div>
  );
};

export default StudentList;
