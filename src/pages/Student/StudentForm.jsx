import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createStudent,
  updateStudent,
  getStudentById,
} from "../../services/studentService";
import { getMajors } from "../../services/complementService";
import {
  getProvinces,
  getMunicipalitiesByProvince,
} from "../../services/locationService";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import "./StudentForm.css";

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

  // Errores específicos de cada campo
  const [nameError, setNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [streetError, setStreetError] = useState("");

  const [majors, setMajors] = useState([]);
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
      const data = response.data.result;

      if (data.address && data.address.idProvince) {
        const muniResponse = await getMunicipalitiesByProvince(
          data.address.idProvince
        );
        const mapped = muniResponse.data.map((m) => ({
          label: m.name,
          value: m.id,
        }));
        setMunicipalities(mapped);
      }

      setFormData((prev) => ({
        ...prev,
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
      }));
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

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await getMajors();
        const mapped = response.data.result.map((m) => ({
          label: m.name, // Lo que verá el usuario
          value: m.name, // Guardamos el nombre, no el id, para cumplir el requerimiento
        }));
        setMajors(mapped);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message ||
            "No se pudieron cargar las carreras.",
          life: 4000,
        });
      }
    };
    fetchMajors();
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
    let value = e.target.value;

    if (field === "firstName") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        setNameError("El nombre solo debe contener letras.");
      } else {
        setNameError("");
      }
      setFormData({ ...formData, firstName: value });
    } else if (field === "lastName") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        setLastNameError("El apellido solo debe contener letras.");
      } else {
        setLastNameError("");
      }
      setFormData({ ...formData, lastName: value });
    } else if (field === "address.street") {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]/.test(value)) {
        setStreetError(
          "La calle solo permite letras, espacios, puntos y guiones."
        );
      } else if (value.length > 150)
        setStreetError("Máximo 150 caracteres permitidos.");
      else setStreetError("");
      setFormData({
        ...formData,
        address: { ...formData.address, street: value },
      });
    } else if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      gender,
      birthDate,
      major,
      address: { street, number, idProvince, idMunicipality },
    } = formData;

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const streetRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/;

    if (
      !firstName ||
      !lastName ||
      !gender ||
      !birthDate ||
      !major ||
      !street ||
      !number ||
      !idProvince ||
      !idMunicipality
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Por favor completa todos los campos.",
        life: 4000,
      });
      return false;
    }

    if (!nameRegex.test(firstName)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Nombres solo debe contener letras.",
        life: 4000,
      });
      return false;
    }

    if (!nameRegex.test(lastName)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Apellidos solo debe contener letras.",
        life: 4000,
      });
      return false;
    }

    if (!streetRegex.test(street)) {
      toast.current.show({
        severity: "warn",
        summary: "Alerta",
        detail: "Calle solo debe contener letras, espacios, puntos y guiones.",
        life: 4000,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const finalData = {
      ...formData,
      year: 1,
      teacherAverage: 0,
    };

    try {
      if (id) {
        await updateStudent(id, finalData);
        toast.current?.show({
          severity: "success",
          summary: "Actualización",
          detail: "Estudiante actualizado(a) con éxito",
        });
      } else {
        await createStudent(finalData);
        toast.current?.show({
          severity: "success",
          summary: "Registro",
          detail: "Estudiante registrado(a) con éxito",
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
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="firstName">Nombres</label>
          <InputText
            value={formData.firstName}
            onChange={(e) => handleChange(e, "firstName")}
            maxLength={100}
          />
          {formData.firstName.length >= 100 && (
            <small className="p-error">Máximo 100 carácteres permitidos</small>
          )}
          {nameError && <small className="p-error">{nameError}</small>}
        </div>

        <div className="field">
          <label htmlFor="lastName">Apellidos</label>
          <InputText
            value={formData.lastName}
            onChange={(e) => handleChange(e, "lastName")}
            maxLength={100}
          />
          {formData.lastName.length >= 100 && (
            <small className="p-error">Máximo 100 carácteres permitidos</small>
          )}
          {lastNameError && <small className="p-error">{lastNameError}</small>}
        </div>

        <div className="field">
          <label htmlFor="gender">Género</label>
          <Dropdown
            value={formData.gender}
            options={genders}
            onChange={(e) => handleChange(e, "gender")}
          />
        </div>

        <div className="field">
          <label htmlFor="birthDate">Fecha de Nacimiento</label>
          <Calendar
            value={formData.birthDate}
            onChange={(e) => handleChange(e, "birthDate")}
            showIcon
            dateFormat="dd/mm/yy"
            placeholder="Selecciona la fecha"
          />
        </div>

        <div className="field">
          <label htmlFor="major">Carrera</label>
          <Dropdown
            value={formData.major}
            options={majors}
            onChange={(e) => handleChange(e, "major")}
            placeholder="Seleccione una carrera"
          />
        </div>

        {/* Dropdown Provincia y Municipio */}
        <div className="field">
          <label>Provincia y Municipio</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Dropdown
              value={formData.address.idProvince}
              options={provinces}
              onChange={handleProvinceChange}
              placeholder="Seleccione una Provincia"
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
              placeholder="Seleccione un Municipio"
              disabled={!formData.address.idProvince}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Dirección (Calle y Número) */}
        <div className="field">
          <label>Calle y Número</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 2 }}>
              <InputText
                placeholder="Calle"
                value={formData.address.street}
                onChange={(e) => handleChange(e, "address.street")}
                style={{ flex: 2 }}
                maxLength={150}
              />
              {formData.address.street.length >= 150 && (
                <small className="p-error">
                  Máximo 150 carácteres permitidos
                </small>
              )}
              {streetError && <small className="p-error">{streetError}</small>}
            </div>
            <div style={{ flex: 1 }}>
              <InputText
                placeholder="Número"
                value={formData.address.number}
                onChange={(e) => handleChange(e, "address.number")}
                onBeforeInput={(e) => {
                  // Solo permite números (bloquea letras y otros símbolos)
                  if (!/^[0-9]$/.test(e.data)) {
                    e.preventDefault();
                  }
                }}
                style={{ flex: 1 }}
                maxLength={10}
              />
              {formData.address.number.length >= 10 && (
                <small className="p-error">Máximo 10 dígitos permitidos</small>
              )}
            </div>
          </div>
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
