import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createStudent,
  updateStudent,
  getStudentById,
} from "../../services/studentService";
import {
  getProvinces,
  getMunicipalitiesByProvince,
} from "../../services/locationService";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: null,
    major: "",
    year: 1,
    teacherAverage: 0,
    address: {
      street: "",
      number: "",
      idProvince: null,
      idMunicipality: null, // Cambiado
    },
  });

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const genders = [
    { label: "Masculino", value: "M" },
    { label: "Femenino", value: "F" },
  ];

  const fetchStudent = async (studentId) => {
    try {
      const response = await getStudentById(studentId);
      setFormData(response.data.data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "No se pudo cargar el estudiante",
        life: 4000,
      });
    }
  };

  useEffect(() => {
    if (id) fetchStudent(id);
  }, [id]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getProvinces();
        const mapped = response.data.map((p) => ({
          label: p.name,
          value: p.id,
        }));
        setProvinces(mapped);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message ||
            "No se pudieron cargar las provincias",
          life: 4000,
        });
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (e) => {
    const selectedProvince = e.value;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        idProvince: selectedProvince,
        idMunicipality: null,
      },
    });

    if (!selectedProvince) {
      setMunicipalities([]);
      return;
    }

    try {
      const response = await getMunicipalitiesByProvince(selectedProvince);
      const mapped = response.data.map((m) => ({ label: m.name, value: m.id }));
      setMunicipalities(mapped);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message ||
          "No se pudieron cargar los municipios",
        life: 4000,
      });
    }
  };

  const handleChange = (e, field) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: e.target.value,
        },
      });
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const finalData = {
        ...formData,
        year: 1,
        teacherAverage: 0,
      };

      if (id) {
        await updateStudent(id, finalData);
        toast.current?.show({
          severity: "success",
          summary: "Actualización",
          detail: "Estudiante actualizado con éxito",
        });
      } else {
        await createStudent(finalData);
        toast.current?.show({
          severity: "success",
          summary: "Registro",
          detail: "Estudiante registrado con éxito",
        });
      }

      navigate("/estudiantes");
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "No se pudo guardar el estudiante",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <h2>{id ? "Editar Estudiante" : "Registrar Estudiante"}</h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        <InputText
          placeholder="Nombres"
          value={formData.firstName}
          onChange={(e) => handleChange(e, "firstName")}
        />
        <InputText
          placeholder="Apellidos"
          value={formData.lastName}
          onChange={(e) => handleChange(e, "lastName")}
        />
        <Dropdown
          value={formData.gender}
          options={genders}
          onChange={(e) => handleChange(e, "gender")}
          placeholder="Género"
        />
        <Calendar
          value={formData.birthDate}
          onChange={(e) => handleChange(e, "birthDate")}
          placeholder="Fecha de Nacimiento"
        />
        <InputText
          placeholder="Carrera"
          value={formData.major}
          onChange={(e) => handleChange(e, "major")}
        />

        {/* Dropdown Provincia y Municipio */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <Dropdown
            value={formData.address.idProvince}
            options={provinces}
            onChange={handleProvinceChange}
            placeholder="Provincia"
            style={{ flex: 1 }}
          />
          <Dropdown
            value={formData.address.idMunicipality}
            options={municipalities}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, idMunicipality: e.value },
              })
            }
            placeholder="Municipio"
            disabled={!formData.address.idProvince}
            style={{ flex: 1 }}
          />
        </div>

        {/* Dirección (Calle y Número) */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <InputText
            placeholder="Calle"
            value={formData.address.street}
            onChange={(e) => handleChange(e, "address.street")}
            style={{ flex: 2 }}
          />
          <InputText
            placeholder="Número"
            value={formData.address.number}
            onChange={(e) => handleChange(e, "address.number")}
            style={{ flex: 1 }}
          />
        </div>

        {/* Botones alineados y centrados */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <Button
            label="Guardar"
            icon="pi pi-save"
            onClick={handleSubmit}
            loading={loading}
            className="p-button-primary"
          />
          <Button
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/estudiantes")}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
